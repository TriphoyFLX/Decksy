import express from "express";
import crypto from "crypto";
import path from "path";
import { createServer as createViteServer } from "vite";
import "dotenv/config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./src/lib/prisma";
import {
  generateLocalDeck,
  normalizeDeck,
  isDeckComplete,
  SLIDE_TYPES,
} from "./src/lib/deckBuilder";
import { GoogleGenAI, Type } from "@google/genai";

const isProduction = process.env.NODE_ENV === "production";

function getConfiguredEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  if (!value || value === "MY_GEMINI_API_KEY" || value.startsWith("CHANGE_ME")) {
    return undefined;
  }
  return value;
}

function validateProductionEnv() {
  if (!isProduction) return;

  const required = [
    "APP_URL",
    "DATABASE_URL",
    "JWT_SECRET",
    "YOOKASSA_SHOP_ID",
    "YOOKASSA_SECRET_KEY",
  ];
  const missing = required.filter((name) => !getConfiguredEnv(name));

  if (!getConfiguredEnv("GEMINI_API_KEY") && !getConfiguredEnv("GEN_API_KEY")) {
    missing.push("GEMINI_API_KEY or GEN_API_KEY");
  }

  if (missing.length > 0) {
    throw new Error(`Missing required production environment variables: ${missing.join(", ")}`);
  }
}

validateProductionEnv();

const app = express();
const PORT = 3000;

// Initialize native Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = getConfiguredEnv("GEMINI_API_KEY");
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log every API request for real-time traffic statistics
app.use(async (req, res, next) => {
  if (req.path.startsWith("/api") && !req.path.includes("/api/admin/metrics")) {
    try {
      await prisma.requestLog.create({
        data: {
          path: req.path,
          method: req.method,
        }
      });
    } catch (e) {
      console.error("Metric logging error", e);
    }
  }
  next();
});

// GenAPI — DeepSeek V4 (https://gen-api.ru)
const GEN_API_KEY = getConfiguredEnv("GEN_API_KEY");
const GEN_API_URL = "https://api.gen-api.ru/api/v1/networks/deepseek-v4";
const GEN_API_MODEL = process.env.GEN_API_MODEL || "deepseek-v4-flash";

function parseJsonResponse(content: string): any {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(jsonText);
}

function extractMessageContent(result: any): string {
  const fromProxy = result?.choices?.[0]?.message?.content;
  if (fromProxy) return fromProxy;

  const fromGenApi = result?.response?.[0]?.choices?.[0]?.message?.content;
  if (fromGenApi) return fromGenApi;

  if (typeof result?.output === "string") return result.output;
  if (typeof result?.output?.content === "string") return result.output.content;

  throw new Error("No content received from GenAPI.");
}

// DeepSeek V4 via GenAPI (sync mode) or Native Gemini
async function callLLM(systemInstruction: string, prompt: string, maxTokens: number = 2000) {
  const gemini = getGeminiClient();
  if (gemini) {
    try {
      console.log("Calling native Gemini API (gemini-3.5-flash)...");
      const cleanSystemInstruction = systemInstruction + "\nYou MUST return a JSON object ONLY conforming to requested schema. Make sure the output is valid JSON in Russian language.";
      const response = await gemini.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: cleanSystemInstruction,
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });
      const text = response.text;
      if (text) {
        return parseJsonResponse(text);
      }
    } catch (geminiErr: any) {
      console.error("Gemini API call failed, falling back to GenAPI:", geminiErr);
    }
  }

  if (!GEN_API_KEY) {
    throw new Error("Neither GEMINI_API_KEY nor GEN_API_KEY is configured.");
  }

  const response = await fetch(GEN_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${GEN_API_KEY}`,
    },
    body: JSON.stringify({
      is_sync: true,
      model: GEN_API_MODEL,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: maxTokens,
      stream: false,
      reasoning_effort: "none",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GenAPI error ${response.status}: ${errorText}`);
  }

  const result = await response.json() as any;

  if (result.status === "failed" || result.error) {
    throw new Error(`GenAPI task failed: ${JSON.stringify(result.error || result)}`);
  }

  return parseJsonResponse(extractMessageContent(result));
}

const DECK_SLIDE_SCHEMA = `{
  "title": "Slide title in Russian",
  "subtitle": "Optional subtitle in Russian",
  "content": ["bullet 1 with specific numbers", "bullet 2", "bullet 3", "bullet 4"],
  "type": "SLIDE_TYPE",
  "speechScript": "3-5 sentences in Russian for the speaker",
  "image": "Optional exact matched image ID from the uploaded list, or empty if none",
  "imageDescription": "Optional exact matched image description, or empty if none"
}`;

async function generateDeckWithAI(
  idea: string,
  mode: string,
  messages: any[],
  canvas: any,
  isFastGeneration: boolean,
  sessionImages: any[] = []
): Promise<any | null> {
  const slideTypeList = SLIDE_TYPES.map((t, i) => `${i + 1}. type="${t}"`).join("\n");

  let imageContext = "";
  if (sessionImages && sessionImages.length > 0) {
    imageContext = `
The user has uploaded the following images/screenshots/graphs to incorporate into this project:
${sessionImages.map((img: any) => `- ID: "${img.id}" (Description: "${img.description || "Project illustration"}")`).join("\n")}

CRITICAL BINDING RULE:
For any slides where these uploaded images fit perfectly, set the slide's "image" property to the exact ID (e.g. "${sessionImages[0].id}") and "imageDescription" to its description.
Examples of logical mapping:
- Logos (лого, бренд) go on the 'title' slide (and sometimes as a watermark)
- App UI screenshots/mockups go on 'solution' or 'moat' slides
- Market size graphs, trends, TAM/SAM/SOM go on 'target_market' slide
- Table screenshots, revenue plan tables go on 'business_model' slide
- Competitor matrices, diagrams go on 'competitors' slide
- QR-codes, founder photos, contacts go on the 'ask' slide

If an image is assigned to a slide, you MUST write "speechScript" addressing or referencing this image naturally in Russian (e.g. 'На схеме показано...', 'Как видно на скриншоте...').
`;
  }

  const baseContext = `
Startup Idea: ${idea}
Interview Mode: ${mode}
${isFastGeneration ? "FAST GENERATION: Create a complete detailed pitch deck from the idea alone." : ""}
${!isFastGeneration ? `Conversation:\n${messages.map((m: any) => `${m.sender}: ${m.text}`).join("\n")}\n\nCanvas:\n${JSON.stringify(canvas, null, 2)}` : ""}
${imageContext}
`;

  // Strategy 1: full deck in one call (when credits allow)
  try {
    const full = await callLLM(
      `You are Pitch Deck AI Synthesizer. Return JSON with exactly 10 slides in order.
Slide types by index:
${slideTypeList}

Schema:
{
  "id": "unique_id",
  "title": "Startup name",
  "subtitle": "Tagline in Russian",
  "idea": "${idea}",
  "mode": "${mode}",
  "slides": [ ${DECK_SLIDE_SCHEMA} x10 ],
  "roast": { "score": 75, "verdict": "...", "roastText": "...", "weakSpots": [], "recommendations": [] }
}

Rules:
- ALL text in Russian (startup name can be English)
- Each slide MUST have 4-5 specific bullets with numbers, $ amounts, percentages
- Use format "Label: Value" for market/pricing bullets (e.g. "TAM: $4.2 млрд")
- speechScript required for every slide
- СТРОГОЕ ПРАВИЛО: НЕ выдумывайте новые функции, фичи, интеграции или продукты, о которых не писал пользователь! Опирайтесь ТОЛЬКО на реальное описание идеи пользователя и его ответы в интервью/канвасе. Не фантазируйте лишнено во благо "обогащения" — пишите строго по делу!`,
      `${baseContext}\nGenerate the complete 10-slide pitch deck.`,
      8000
    );
    if (isDeckComplete(full)) return full;
  } catch (err: any) {
    console.warn("Full deck AI generation failed, trying batches:", err.message?.slice(0, 120));
  }

  // Strategy 2: two batches of 5 slides (fits low credit limits)
  const batches = [
    { from: 0, to: 5, label: "slides 1-5 (title through pricing)" },
    { from: 5, to: 10, label: "slides 6-10 (tech through ask)" },
  ];

  const mergedSlides: any[] = [];

  for (const batch of batches) {
    try {
      const typesForBatch = SLIDE_TYPES.slice(batch.from, batch.to)
        .map((t, i) => `${batch.from + i + 1}. type="${t}"`)
        .join("\n");

      const batchResult = await callLLM(
        `Return JSON: { "slides": [ ${DECK_SLIDE_SCHEMA} x5 ] }
Generate exactly 5 slides for a pitch deck. Types in order:
${typesForBatch}
All text in Russian. 4-5 bullets per slide with specific metrics.
СТРОГОЕ ПРАВИЛО: НЕ выдумывайте новые фичи, функции и интеграции, которых нет в описании пользователя и его ответах. Ссылайтесь только на реальные факты и ценности проекта.`,
        `${baseContext}\nGenerate ${batch.label}.`,
        1200
      );

      if (Array.isArray(batchResult.slides)) {
        mergedSlides.push(...batchResult.slides);
      }
    } catch (batchErr: any) {
      console.warn(`Batch ${batch.label} failed:`, batchErr.message?.slice(0, 120));
    }
  }

  if (mergedSlides.length >= 5) {
    const local = generateLocalDeck(idea, mode, canvas);
    return {
      ...local,
      slides: mergedSlides.slice(0, 10),
    };
  }

  // Strategy 3: one slide per call (works with minimal API credits ~200 tokens)
  const perSlide: any[] = [];
  for (let i = 0; i < SLIDE_TYPES.length; i++) {
    try {
      const slideResult = await callLLM(
        `Return JSON: { "slide": ${DECK_SLIDE_SCHEMA.replace("SLIDE_TYPE", SLIDE_TYPES[i])} }
One slide only. type="${SLIDE_TYPES[i]}". Russian. 4 bullets with numbers/metrics.
СТРОГОЕ ПРАВИЛО: НЕ выдумывайте новые функции или продукты, о которых не заявлял пользователь! Опирайтесь на реальное описание.`,
        `${baseContext}\nGenerate slide ${i + 1} (${SLIDE_TYPES[i]}).`,
        350
      );
      if (slideResult.slide) {
        perSlide.push({ ...slideResult.slide, type: SLIDE_TYPES[i] });
      }
    } catch {
      break;
    }
  }

  if (perSlide.length >= 5) {
    const local = generateLocalDeck(idea, mode, canvas);
    return { ...local, slides: perSlide.slice(0, 10) };
  }

  return null;
}

// --- Native Auth & Prisma DB Persistence API ---

const JWT_SECRET = getConfiguredEnv("JWT_SECRET") || "decksy-dev-secret-default-key";

// JWT Authentication Middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Для этого действия требуется авторизация." });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Сессия истекла или недействительна. Войдите заново." });
    }
    req.user = user;
    next();
  });
}

// 0.1 API: Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email и пароль обязательны для заполнения." });
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    });

    if (existingUser) {
      return res.status(400).json({ error: "Пользователь с таким email уже зарегистрирован." });
    }

    // Secure password hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Auto-promote roomop86@gmail.com to admin/pro by default
    const isRoomop = trimmedEmail === "roomop86@gmail.com";
    const userRole = isRoomop ? "admin" : "user";
    const userIsPro = isRoomop ? true : false;
    const userPlan = isRoomop ? "Pro" : "Free";

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: trimmedEmail,
        password: hashedPassword,
        name: name ? name.trim() : null,
        role: userRole,
        isPro: userIsPro,
        plan: userPlan,
      }
    });

    // Create session token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, role: user.role, isPro: user.isPro, plan: user.plan },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isPro: user.isPro,
        plan: user.plan
      }
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Ошибка при регистрации. Пожалуйста, попробуйте позже." });
  }
});

// 0.2 API: Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Пожалуйста, введите email и пароль." });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Find user
    let user = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    });

    if (!user) {
      return res.status(400).json({ error: "Неверный email или пароль." });
    }

    // Validate password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ error: "Неверный email или пароль." });
    }

    // Auto-escalate roomop86@gmail.com to Admin/PRO status if not already set
    if (trimmedEmail === "roomop86@gmail.com" && (user.role !== "admin" || !user.isPro || user.plan !== "Pro")) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: "admin", isPro: true, plan: "Pro" }
      });
    }

    // Create session token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, role: user.role, isPro: user.isPro, plan: user.plan },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isPro: user.isPro,
        plan: user.plan
      }
    });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Внутренняя ошибка сервера при входе." });
  }
});

// 0.3 API: Validate currently logged-in user profile
app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
  try {
    let user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден." });
    }

    // Auto-escalate roomop86@gmail.com to Admin/PRO status
    if (user.email === "roomop86@gmail.com" && (user.role !== "admin" || !user.isPro || user.plan !== "Pro")) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: "admin", isPro: true, plan: "Pro" }
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isPro: user.isPro,
        plan: user.plan
      }
    });
  } catch (err: any) {
    console.error("Get user context error:", err);
    res.status(500).json({ error: "Не удалось получить сессию пользователя." });
  }
});

// 0.4 API: Subscribe or change subscription plan (only downgrade to Free is allowed without payment)
app.post("/api/auth/subscribe", authenticateToken, async (req: any, res) => {
  try {
    const { plan } = req.body;
    const allowedPlans = ["Free", "Base", "Middle", "Pro"];
    if (!allowedPlans.includes(plan)) {
      return res.status(400).json({ error: "Неверный тарифный план." });
    }

    if (plan !== "Free") {
      return res.status(403).json({ error: "Для активации тарифов Base, Middle или Pro требуется выполнить оплату через ЮMoney." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        plan: "Free",
        isPro: false
      }
    });

    res.json({
      message: `Тариф успешно изменен на «Free».`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        isPro: updatedUser.isPro,
        plan: updatedUser.plan
      }
    });
  } catch (err: any) {
    console.error("Subscription update error:", err);
    res.status(500).json({ error: "Не удалось обновить тарифный план." });
  }
});


// --- YOOKASSA INTEGRATION CONTROLLERS ---

const APP_URL = getConfiguredEnv("APP_URL");
const YOOKASSA_SHOP_ID = getConfiguredEnv("YOOKASSA_SHOP_ID") || "1386669";
const YOOKASSA_SECRET_KEY = getConfiguredEnv("YOOKASSA_SECRET_KEY") || "";

// Helper to construct YooKassa Basic Auth headers
const getYooKassaHeaders = () => {
  const credentials = `${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`;
  const base64Credentials = Buffer.from(credentials).toString("base64");
  return {
    "Authorization": `Basic ${base64Credentials}`,
    "Content-Type": "application/json",
    "Idempotence-Key": crypto.randomUUID()
  };
};

// 1. GET YooKassa Integration Status and Credentials Info
app.get("/api/yookassa/status", authenticateToken, async (req: any, res) => {
  try {
    res.json({
      shopId: YOOKASSA_SHOP_ID,
      isTest: YOOKASSA_SECRET_KEY.startsWith("test_")
    });
  } catch (err: any) {
    console.error("YooKassa status error:", err);
    res.status(500).json({ error: "Failed to get payment gateway status." });
  }
});

// 2. POST Initiate payment in YooKassa
app.post("/api/yookassa/create-payment", authenticateToken, async (req: any, res) => {
  try {
    const { tariffId } = req.body;
    const allowedPlans = ["Base", "Middle", "Pro"];
    if (!allowedPlans.includes(tariffId)) {
      return res.status(400).json({ error: "Неверный тарифный план." });
    }

    const tariffPrices: Record<string, number> = {
      "Base": 2,
      "Middle": 2,
      "Pro": 2
    };
    const amount = tariffPrices[tariffId];

    const appUrl = APP_URL || `${req.protocol}://${req.get("host")}`;
    const returnUrl = `${appUrl}/?tab=tariffs&payment_check=1`;

    console.log(`Initiating YooKassa payment for user ${req.user.userId}, tariff: ${tariffId}, price: ${amount} RUB`);

    const headers = getYooKassaHeaders();
    const payload = {
      amount: {
        value: amount.toFixed(2),
        currency: "RUB"
      },
      capture: true,
      confirmation: {
        type: "redirect",
        return_url: returnUrl
      },
      description: `Оплата тарифа "${tariffId}" в Decksy Ai`,
      metadata: {
        userId: req.user.userId.toString(),
        tariffId: tariffId
      }
    };

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    const bodyText = await response.text();
    let paymentData: any;
    try {
      paymentData = JSON.parse(bodyText);
    } catch (e) {
      console.error("Failed to parse YooKassa payload:", bodyText);
      return res.status(502).json({ error: "Ошибка при получении ответа от платежного шлюза ЮKassa." });
    }

    if (!response.ok) {
      console.error("YooKassa payment request failed with status:", response.status, paymentData);
      return res.status(400).json({
        error: paymentData.description || "Платежный шлюз отклонил создание транзакции.",
        code: paymentData.code
      });
    }

    // Capture payment record in database
    await prisma.payment.create({
      data: {
        id: paymentData.id,
        userId: req.user.userId,
        amount: amount,
        tariffId: tariffId,
        status: paymentData.status || "pending"
      }
    });

    res.json({
      success: true,
      paymentId: paymentData.id,
      confirmationUrl: paymentData.confirmation?.confirmation_url,
      status: paymentData.status
    });
  } catch (err: any) {
    console.error("YooKassa payment creation error:", err);
    res.status(500).json({ error: "Не удалось инициализировать оплату. Попробуйте позже." });
  }
});

// 3. GET Check payment status actively (via polling/callback verification)
app.get("/api/yookassa/check-payment/:id", authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!payment) {
      return res.status(404).json({ error: "Запись о платеже не найдена в базе." });
    }

    // Verify it belongs to currently logged-in user (unless admin)
    if (payment.userId !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ error: "Доступ деактивирован: это чужой платеж." });
    }

    console.log(`Checking status of payment ${id} in YooKassa API...`);

    // Fetch live status from YooKassa
    const credentials = `${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`;
    const base64Credentials = Buffer.from(credentials).toString("base64");
    
    const response = await fetch(`https://api.yookassa.ru/v3/payments/${id}`, {
      headers: {
        "Authorization": `Basic ${base64Credentials}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to query YooKassa payment status:", response.status, errorText);
      return res.status(400).json({ error: "Не удалось получить статус платежа у ЮKassa." });
    }

    const paymentData = await response.json() as any;
    console.log(`Live payment status for ${id} is: ${paymentData.status}`);

    if (paymentData.status === "succeeded") {
      // Complete transaction and upgrade user
      await prisma.payment.update({
        where: { id },
        data: { status: "succeeded" }
      });

      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          plan: payment.tariffId,
          isPro: true
        }
      });

      console.log(`Activated plan ${payment.tariffId} for user ${payment.userId} following succeeded payment check.`);
    } else if (paymentData.status === "canceled") {
      await prisma.payment.update({
        where: { id },
        data: { status: "canceled" }
      });
    }

    res.json({
      paymentId: id,
      status: paymentData.status,
      tariffId: payment.tariffId,
      amount: payment.amount,
      paid: paymentData.paid
    });
  } catch (err: any) {
    console.error("YooKassa check-payment handler error:", err);
    res.status(500).json({ error: "Ошибка при проверке статуса платежа." });
  }
});

// Helper for verifying YooKassa Webhooks / notifications
async function processYooKassaWebhook(body: any) {
  if (body.type === "notification" && body.event === "payment.succeeded") {
    const paymentObj = body.object;
    if (!paymentObj) return false;

    const paymentId = paymentObj.id;
    const status = paymentObj.status;
    const metadata = paymentObj.metadata || {};
    const userId = metadata.userId ? parseInt(metadata.userId, 10) : null;
    const tariffId = metadata.tariffId;

    if (status === "succeeded" && userId && tariffId) {
      // Match with database payment record
      const existingPayment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });

      if (!existingPayment) {
        // Create retroactively if payment wasn't in DB yet
        const valueNum = parseFloat(paymentObj.amount?.value || "0");
        await prisma.payment.create({
          data: {
            id: paymentId,
            userId: userId,
            amount: valueNum,
            tariffId: tariffId,
            status: "succeeded"
          }
        });
      } else {
        await prisma.payment.update({
          where: { id: paymentId },
          data: { status: "succeeded" }
        });
      }

      // Upgrade our user account
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: tariffId,
          isPro: true
        }
      });

      console.log(`[Webhook] Upgraded user ${userId} to "${tariffId}" plan successfully via YooKassa notification.`);
      return true;
    }
  }
  return false;
}

// 4. POST Webhook notification receiver for YooKassa
app.post("/api/yookassa/notify", async (req, res) => {
  try {
    const body = req.body;
    console.log("Received YooKassa payment webhook:", JSON.stringify(body));
    await processYooKassaWebhook(body);
    res.status(200).send("OK");
  } catch (err: any) {
    console.error("YooKassa webhook handler error:", err);
    res.status(500).send("Internal Webhook Error");
  }
});

// Flat webhook mapping
app.post("/yookassa/notify", async (req, res) => {
  try {
    const body = req.body;
    console.log("Received flat YooKassa webhook:", JSON.stringify(body));
    await processYooKassaWebhook(body);
    res.status(200).send("OK");
  } catch (err: any) {
    console.error("YooKassa flat webhook handler error:", err);
    res.status(500).send("Internal Webhook Error");
  }
});


// --- ADMIN & AD PANEL SECURED CONTROLLERS ---

// Middleware to authorize admin requests
function authenticateAdmin(req: any, res: any, next: any) {
  authenticateToken(req, res, () => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ error: "Доступ запрещен. Требуются права администратора." });
    }
  });
}

// 1. GET Real-Time Analytics Metrics
app.get("/api/admin/metrics", authenticateAdmin, async (req, res) => {
  try {
    const totalDecks = await prisma.pitchDeck.count();
    const totalRequests = await prisma.requestLog.count();
    const totalUsers = await prisma.user.count();
    const proUsers = await prisma.user.count({ where: { isPro: true } });
    const activeAds = await prisma.ad.count({ where: { isActive: true } });

    const recentRequests = await prisma.requestLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    res.json({
      totalDecks,
      totalRequests,
      totalUsers,
      proUsers,
      activeAds,
      recentRequests,
    });
  } catch (err: any) {
    console.error("Fetch metrics error:", err);
    res.status(500).json({ error: "Ошибка при получении аналитики." });
  }
});

// 2. GET All Users for Administration Table
app.get("/api/admin/users", authenticateAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isPro: true,
        plan: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (err: any) {
    console.error("Fetch users error:", err);
    res.status(500).json({ error: "Ошибка при получении пользователей." });
  }
});

// 3. POST Grant or Revoke user subscription (PRO status)
app.post("/api/admin/users/:id/toggle-pro", authenticateAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const target = await prisma.user.findUnique({ where: { id: userId } });

    if (!target) {
      return res.status(404).json({ error: "Пользователь не найден." });
    }

    const nextIsPro = !target.isPro;
    const nextPlan = nextIsPro ? "Pro" : "Free";

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { 
        isPro: nextIsPro,
        plan: nextPlan
      },
    });

    res.json({
      success: true,
      user: { id: updated.id, email: updated.email, isPro: updated.isPro, plan: updated.plan },
      message: `Подписка успешно ${updated.isPro ? "выдана" : "отозвана"} для ${updated.email}`
    });
  } catch (err: any) {
    console.error("Toggle user subscription error:", err);
    res.status(500).json({ error: "Ошибка переключения подписки." });
  }
});

// 4. POST Grant or Revoke admin role
app.post("/api/admin/users/:id/toggle-role", authenticateAdmin, async (req: any, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Prevent self role modification to avoid lockouts
    if (userId === req.user.userId) {
      return res.status(400).json({ error: "Вы не можете изменить свою собственную роль." });
    }

    const target = await prisma.user.findUnique({ where: { id: userId } });

    if (!target) {
      return res.status(404).json({ error: "Пользователь не найден." });
    }

    const updatedRole = target.role === "admin" ? "user" : "admin";
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: updatedRole },
    });

    res.json({
      success: true,
      user: { id: updated.id, email: updated.email, role: updated.role },
      message: `Роль изменена на ${updated.role === "admin" ? "admin" : "user"} для ${updated.email}`
    });
  } catch (err: any) {
    console.error("Toggle user role error:", err);
    res.status(500).json({ error: "Ошибка переключения прав администратора." });
  }
});

// 5. DELETE Remove excess users completely
app.delete("/api/admin/users/:id", authenticateAdmin, async (req: any, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (userId === req.user.userId) {
      return res.status(400).json({ error: "Вы не можете удалить свою собственную учетную запись." });
    }

    await prisma.user.delete({ where: { id: userId } });
    res.json({ success: true, message: "Пользователь успешно удален из системы." });
  } catch (err: any) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: "Ошибка при удалении пользователя." });
  }
});

// 6. GET All Ads Campaign (Active & Inactive)
app.get("/api/admin/ads", authenticateAdmin, async (req, res) => {
  try {
    const ads = await prisma.ad.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(ads);
  } catch (err: any) {
    console.error("Fetch ads error:", err);
    res.status(500).json({ error: "Ошибка при получении рекламы." });
  }
});

// 7. POST Add new campaign promo slot
app.post("/api/admin/ads", authenticateAdmin, async (req, res) => {
  try {
    const { title, content, link, imageUrl, isActive } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Заголовок и содержание рекламы обязательны." });
    }

    const createdAd = await prisma.ad.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        link: link ? link.trim() : null,
        imageUrl: imageUrl ? imageUrl.trim() : null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json({
      success: true,
      ad: createdAd,
      message: "Кампания успешно добавлена."
    });
  } catch (err: any) {
    console.error("Create ad error:", err);
    res.status(500).json({ error: "Ошибка при создании рекламного слота." });
  }
});

// 8. PUT Full details editing for existing ad
app.put("/api/admin/ads/:id", authenticateAdmin, async (req, res) => {
  try {
    const adId = parseInt(req.params.id);
    const { title, content, link, imageUrl, isActive } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Заголовок и содержание обязательны." });
    }

    const updated = await prisma.ad.update({
      where: { id: adId },
      data: {
        title: title.trim(),
        content: content.trim(),
        link: link ? link.trim() : null,
        imageUrl: imageUrl ? imageUrl.trim() : null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.json({
      success: true,
      ad: updated,
      message: "Рекламный слот успешно обновлен."
    });
  } catch (err: any) {
    console.error("Update ad error:", err);
    res.status(500).json({ error: "Ошибка при обновлении рекламы." });
  }
});

// 9. POST Toggle ad visibility on the fly
app.post("/api/admin/ads/:id/toggle", authenticateAdmin, async (req, res) => {
  try {
    const adId = parseInt(req.params.id);
    const item = await prisma.ad.findUnique({ where: { id: adId } });

    if (!item) {
      return res.status(404).json({ error: "Реклама не найдена." });
    }

    const updated = await prisma.ad.update({
      where: { id: adId },
      data: { isActive: !item.isActive },
    });

    res.json({
      success: true,
      ad: updated,
      message: `Реклама ${updated.isActive ? 'активирована' : 'деактивирована'}`
    });
  } catch (err: any) {
    console.error("Toggle ad error:", err);
    res.status(500).json({ error: "Ошибка переключения видимости рекламы." });
  }
});

// 10. DELETE Remove advertisement banner
app.delete("/api/admin/ads/:id", authenticateAdmin, async (req, res) => {
  try {
    const adId = parseInt(req.params.id);

    await prisma.ad.delete({ where: { id: adId } });
    res.json({ success: true, message: "Рекламный слот успешно удален." });
  } catch (err: any) {
    console.error("Delete ad error:", err);
    res.status(500).json({ error: "Ошибка при удалении рекламы." });
  }
});

// 11. GET Public route: Fetch active campaigns for live preview in dashboards
app.get("/api/ads/active", async (req, res) => {
  try {
    const activeAds = await prisma.ad.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(activeAds);
  } catch (err: any) {
    console.warn("Public ads loader error, fallback to empty list", err);
    res.json([]);
  }
});

// 0.4 API: List saved pitch decks for authorized user
app.get("/api/decks", authenticateToken, async (req: any, res) => {
  try {
    const rawDecks = await prisma.pitchDeck.findMany({
      where: { userId: req.user.userId },
      orderBy: { updatedAt: "desc" }
    });

    // Deserialize database strings back into fully hydrated React state structures
    const decks = rawDecks.map(d => ({
      id: d.id,
      title: d.title,
      subtitle: d.subtitle || "",
      idea: d.idea,
      mode: d.mode,
      slides: JSON.parse(d.slidesJson),
      roast: d.roastJson ? JSON.parse(d.roastJson) : null,
      canvas: d.canvasJson ? JSON.parse(d.canvasJson) : null,
      updatedAt: d.updatedAt,
    }));

    res.json(decks);
  } catch (err: any) {
    console.error("Fetch saved decks error:", err);
    res.status(500).json({ error: "Ошибка при загрузке сохраненных презентаций." });
  }
});

// 0.5 API: Save, create, or update a pitch deck
app.post("/api/decks", authenticateToken, async (req: any, res) => {
  try {
    const { id, title, subtitle, idea, mode, slides, roast, canvas } = req.body;

    if (!id || !title || !idea) {
      return res.status(400).json({ error: "Неполные данные презентации (id, title, idea обязательны)." });
    }

    // Verify deck ownership if the presentation already exists to prevent unauthorized overwrite
    const existingDeck = await prisma.pitchDeck.findUnique({
      where: { id }
    });

    if (existingDeck && existingDeck.userId !== req.user.userId) {
      return res.status(403).json({ error: "У вас нет прав на редактирование этой презентации." });
    }

    // High performance upsert
    const savedDeck = await prisma.pitchDeck.upsert({
      where: { id },
      update: {
        title,
        subtitle: subtitle || "",
        idea,
        mode,
        slidesJson: JSON.stringify(slides),
        roastJson: roast ? JSON.stringify(roast) : null,
        canvasJson: canvas ? JSON.stringify(canvas) : null,
      },
      create: {
        id,
        title,
        subtitle: subtitle || "",
        idea,
        mode,
        slidesJson: JSON.stringify(slides),
        roastJson: roast ? JSON.stringify(roast) : null,
        canvasJson: canvas ? JSON.stringify(canvas) : null,
        userId: req.user.userId,
      }
    });

    res.json({
      success: true,
      deckId: savedDeck.id,
      message: "Презентация успешно сохранена в вашей библиотеке."
    });
  } catch (err: any) {
    console.error("Save deck error:", err);
    res.status(500).json({ error: "Ошибка при сохранении презентации в БД." });
  }
});

// 0.6 API: Fetch a single deck (accessible publicly for potential sharing, but securely verified)
app.get("/api/decks/:id", async (req, res) => {
  try {
    const deck = await prisma.pitchDeck.findUnique({
      where: { id: req.params.id }
    });

    if (!deck) {
      return res.status(404).json({ error: "Презентация не найдена." });
    }

    res.json({
      id: deck.id,
      title: deck.title,
      subtitle: deck.subtitle || "",
      idea: deck.idea,
      mode: deck.mode,
      slides: JSON.parse(deck.slidesJson),
      roast: deck.roastJson ? JSON.parse(deck.roastJson) : null,
      canvas: deck.canvasJson ? JSON.parse(deck.canvasJson) : null,
      updatedAt: deck.updatedAt,
      userId: deck.userId
    });
  } catch (err: any) {
    console.error("Get specific deck error:", err);
    res.status(500).json({ error: "Ошибка при получении презентации по ID." });
  }
});

// 0.7 API: Delete a saved presentation
app.delete("/api/decks/:id", authenticateToken, async (req: any, res) => {
  try {
    const deck = await prisma.pitchDeck.findUnique({
      where: { id: req.params.id }
    });

    if (!deck) {
      return res.status(404).json({ error: "Презентация не найдена." });
    }

    if (deck.userId !== req.user.userId) {
      return res.status(403).json({ error: "У вас нет прав на удаление этой презентации." });
    }

    await prisma.pitchDeck.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true, message: "Презентация успешно удалена." });
  } catch (err: any) {
    console.error("Delete deck error:", err);
    res.status(500).json({ error: "Не удалось удалить презентацию из БД." });
  }
});

// 1. API: Pitch AI Interview Helper
app.post("/api/interview", authenticateToken, async (req, res) => {
  try {
    const { idea, mode, messages, canvas } = req.body;

    if (!idea) {
      return res.status(400).json({ error: "No startup idea provided." });
    }

    const userMessages = messages.filter((m: any) => m.sender === "user" || m.sender === "Founder");
    const lastUserMsg = userMessages[userMessages.length - 1]?.text || "";
    if (userMessages.length > 0 && isGibberish(lastUserMsg)) {
      const validUserMessages = userMessages.filter((m: any) => !isGibberish(m.text));
      const turnIndex = validUserMessages.length;
      const nextQuestion = getClarificationQuestion(turnIndex, idea);
      
      return res.json({
        nextQuestion,
        interviewComplete: false,
        investorSentiment: "skeptical",
        underlyingThoughts: "Пользователь ввел бессмысленный или пустой ответ. Прошу уточнить детали.",
        canvasUpdates: {}
      });
    }

    const modeLimits = { quick: 3, investor: 5, shark: 6 }[mode as "quick" | "investor" | "shark"] || 5;
    const userTurns = messages.filter((m: any) => m.sender === "user").length;

    const modeInstructions = {
      quick: "Быстрый режим: максимум 3 вопроса за всё интервью. Только ключевые пробелы.",
      investor: "Режим инвестора: максимум 5 вопросов за всё интервью. Спокойный, деловой тон.",
      shark: "Режим акулы: максимум 6 вопросов. Жёстко оспаривай ТОЛЬКО слабые или пустые ответы — не придирайся к нормальным.",
    }[mode as "quick" | "investor" | "shark"] || "Режим инвестора: максимум 5 вопросов.";

    const chatContext = messages.map((m: any) => `${m.sender === 'user' ? 'Founder' : 'Investor'}: ${m.text}`).join("\n");

    const systemInstruction = `
      You are a VC partner helping compile a pitch deck. Tone: calm, concise, respectful — NOT an interrogator.
      Each API call costs money — minimize unnecessary follow-ups.

      User's idea: "${idea}"
      Mode: ${mode.toUpperCase()} — ${modeInstructions}
      User answers so far: ${userTurns}. Hard limit: ${modeLimits} investor questions total.

      CORE RULES:
      1. If the founder's last answer is reasonable and covers the topic — briefly acknowledge ("Понял, фиксирую." / "Ок, записал.") and move to the NEXT unfilled canvas block. Do NOT dig deeper.
      2. If the founder's last answer is gibberish, off-topic, empty, or nonsense (e.g., "пкпкер", "фигня", meaningless keys, or random text without real content):
         - Do NOT acknowledge it as recorded. Do NOT say "Ок, записал" or "Понял, фиксирую".
         - Do NOT move to the next canvas block.
         - Do NOT set any updates to "compiled" for the current slot; keep or change its status to "thinking".
         - Politely ask the founder to answer the actual question again or clarify (e.g., "Кажется, это не совсем относится к нашему вопросу. Давайте вернемся к...", "Не совсем понял ответ. Расскажите подробнее о...").
      3. Ask a follow-up or challenge ONLY when: answer is empty/vague, contradicts itself, or has an obvious red flag you disagree with.
      4. ONE question per turn maximum. Max 2 short sentences total in nextQuestion.
      5. Always ask the founder to reply in bullet points: end with "Ответьте по пунктам (• ...)" when asking something new.
      6. If all canvas blocks are "compiled" OR userTurns >= ${modeLimits}: set interviewComplete=true and nextQuestion = "Отлично, данных достаточно! Сейчас автоматически соберу презентацию..." — do NOT mention PPTX/PDF buttons.

      Return JSON:
      {
        "nextQuestion": "Russian. Brief ack + one question OR completion message.",
        "interviewComplete": false,
        "investorSentiment": "skeptical" | "bored" | "intrigued" | "impressed" | "combative",
        "underlyingThoughts": "Max 1 short sentence. Neutral unless real concern.",
        "canvasUpdates": {
          "problem": { "summary": "...", "bullets": [], "status": "locked" | "thinking" | "compiled" },
          "solution": { "summary": "...", "bullets": [], "status": "locked" | "thinking" | "compiled" },
          "market": { "summary": "...", "bullets": [], "status": "locked" | "thinking" | "compiled" },
          "moneyModel": { "summary": "...", "bullets": [], "status": "locked" | "thinking" | "compiled" },
          "competitors": { "summary": "...", "bullets": [], "status": "locked" | "thinking" | "compiled" },
          "goToMarket": { "summary": "...", "bullets": [], "status": "locked" | "thinking" | "compiled" },
          "risks": { "summary": "...", "bullets": [], "status": "locked" | "thinking" | "compiled" }
        }
      }

      All text in Russian. Mark section "compiled" when founder gave enough info — do not re-ask.
    `;

    const prompt = `
      Conversation:
      ${chatContext}

      Canvas:
      ${JSON.stringify(canvas, null, 2)}

      Update canvas from founder's answers. Reply with nextQuestion — acknowledge if ok, challenge only if needed.
    `;

    const result = await callLLM(systemInstruction, prompt, 1500);
    const mergedCanvas = { ...canvas, ...(result.canvasUpdates || {}) };
    const compiledCount = Object.values(mergedCanvas).filter(
      (c: any) => c?.status === "compiled"
    ).length;
    const interviewComplete =
      result.interviewComplete === true ||
      userTurns >= modeLimits ||
      compiledCount >= 6;

    if (interviewComplete) {
      result.interviewComplete = true;
      result.nextQuestion =
        "Отлично, данных достаточно! Сейчас автоматически соберу презентацию...";
      result.underlyingThoughts = "Интервью завершено — запускаю генерацию деки.";
    }

    res.json(result);
  } catch (err: any) {
    console.error("API Error in /api/interview (falling back to mock):", err);
    res.json(getMockInterviewResponse(req.body.messages || [], req.body.mode || "investor", req.body.idea));
  }
});

function autoMapImagesToSlides(slides: any[], sessionImages: any[]) {
  if (!sessionImages || sessionImages.length === 0 || !Array.isArray(slides)) return;

  // 1. Keep track of which slide already has an image ID assigned (like 'img_xxx')
  const assignedImageIds = new Set<string>();
  for (const s of slides) {
    if (s.image && typeof s.image === "string" && s.image.startsWith("img_")) {
      assignedImageIds.add(s.image);
    }
  }

  // 2. Identify images that have NOT been explicitly assigned by the LLM (unassigned)
  const unassignedImages = sessionImages.filter((img: any) => !assignedImageIds.has(img.id));

  // 3. For any unassigned image, resolve a reasonable slide index semantically
  for (const img of unassignedImages) {
    const descLower = (img.description || "").toLowerCase();
    let targetIndex = -1;

    if (descLower.includes("лого") || descLower.includes("logo") || descLower.includes("бренд") || descLower.includes("brand")) {
      targetIndex = 0; // Title Slide
    } else if (
      descLower.includes("продукт") || 
      descLower.includes("интерфейс") || 
      descLower.includes("скриншот") || 
      descLower.includes("приложен") || 
      descLower.includes("экран") || 
      descLower.includes("product") || 
      descLower.includes("screen") || 
      descLower.includes("mockup")
    ) {
      targetIndex = 2; // Solution/Product Slide
    } else if (
      descLower.includes("рынок") || 
      descLower.includes("диаграмм") || 
      descLower.includes("график") || 
      descLower.includes("маркет") || 
      descLower.includes("market") || 
      descLower.includes("chart") || 
      descLower.includes("tam") || 
      descLower.includes("som") || 
      descLower.includes("sam")
    ) {
      targetIndex = 3; // Target Market Slide
    } else if (
      descLower.includes("бизнес-модель") || 
      descLower.includes("модель") || 
      descLower.includes("цена") || 
      descLower.includes("монет") || 
      descLower.includes("revenue") || 
      descLower.includes("model") || 
      descLower.includes("price")
    ) {
      targetIndex = 4; // Business Model
    } else if (
      descLower.includes("таблица") || 
      descLower.includes("конкурент") || 
      descLower.includes("сравнен") || 
      descLower.includes("матриц") || 
      descLower.includes("competitor") || 
      descLower.includes("moat")
    ) {
      targetIndex = 6; // Competitors Matrix
    } else if (
      descLower.includes("кьюар") || 
      descLower.includes("qr") || 
      descLower.includes("контакт") || 
      descLower.includes("founders") || 
      descLower.includes("презентац") || 
      descLower.includes("предложен") || 
      descLower.includes("команд") || 
      descLower.includes("team") || 
      descLower.includes("ask")
    ) {
      targetIndex = 9; // Ask/Contacts slide
    } else {
      // Find first empty slot
      targetIndex = slides.findIndex((s: any) => !s.image || s.image === "" || s.image.includes("local"));
    }

    if (targetIndex !== -1 && targetIndex < slides.length) {
      slides[targetIndex].image = img.image; // Assign actual base64
      slides[targetIndex].imageDescription = img.description;
    }
  }

  // 4. For any slides that the LLM matched by ID, replace the placeholder ID string with the actual base64 data URL
  for (const s of slides) {
    if (s.image && typeof s.image === "string" && s.image.startsWith("img_")) {
      const matched = sessionImages.find((img: any) => img.id === s.image);
      if (matched) {
        s.image = matched.image;
        s.imageDescription = matched.description || s.imageDescription;
      }
    }
  }
}

// 2. API: Generate 10-Slide Pitch Deck and Roast Analysis
app.post("/api/generate_deck", authenticateToken, async (req, res) => {
  const idea = req.body.idea;
  const mode = req.body.mode || "investor";
  const messages = req.body.messages || [];
  const canvas = req.body.canvas || {};
  const sessionImages = req.body.sessionImages || [];

  if (!idea) {
    return res.status(400).json({ error: "No startup idea provided." });
  }

  const isFastGeneration = messages.length <= 1;
  let aiDeck: any = null;

  try {
    aiDeck = await generateDeckWithAI(idea, mode, messages, canvas, isFastGeneration, sessionImages);
  } catch (err: any) {
    console.error("API Error in /api/generate_deck (using local generator):", err.message?.slice(0, 200));
  }

  const deck = normalizeDeck(
    aiDeck || generateLocalDeck(idea, mode, canvas),
    idea,
    mode,
    canvas
  );

  // Map session images systematically
  autoMapImagesToSlides(deck.slides, sessionImages);

  res.json(deck);
});

// 2.5 API: Rewrite slide using image description/theme
app.post("/api/rewrite_slide", authenticateToken, async (req, res) => {
  try {
    const { slide, imageDescription, idea, mode } = req.body;

    if (!slide || !imageDescription) {
      return res.status(400).json({ error: "Недостаточно данных для перегенерации слайда." });
    }

    const systemInstruction = `
      You are Pitch Deck AI Slide Improver.
      The user has uploaded an image to this slide with description: "${imageDescription}".
      Your task is to rewrite the slide's content and speaker notes to dynamically reference, incorporate, and integrate this image naturally.
      
      Startup Idea: ${idea || "Pitch deck project"}
      Mode: ${mode || "investor"}
      
      Rules:
      - Return a JSON object matching this schema exactly:
        {
          "title": "Russian. Beautiful professional slide title",
          "subtitle": "Russian. Relevant short subtitle mentioning/fitting the context",
          "content": ["bullet 1 with metrics/context", "bullet 2", "bullet 3", "bullet 4"],
          "speechScript": "Russian. 3-5 smooth sentences for the speaker, explaining BOTH the bullets AND referring to the illustrated image (e.g. 'Как вы видите на графике...', 'На скриншоте интерфейса показано...')"
        }
      - Keep all text in Russian.
      - Ensure you integrate the theme of the image ("${imageDescription}") into the slide logically! If it's a competitor table, talk about positioning. If it's a team photo, mention team chemistry. If it's a mobile mock-up, talk about product usability.
    `;

    const prompt = `
      Current Slide:
      ${JSON.stringify(slide, null, 2)}

      Image Description/Theme:
      "${imageDescription}"

      Please improve and rewrite this slide content to incorporate the image.
    `;

    const result = await callLLM(systemInstruction, prompt, 1250);

    res.json({
      success: true,
      slide: {
        ...slide,
        title: result.title || slide.title,
        subtitle: result.subtitle || slide.subtitle,
        content: Array.isArray(result.content) ? result.content : slide.content,
        speechScript: result.speechScript || slide.speechScript,
        imageDescription: imageDescription, // Keep the description
      }
    });
  } catch (err: any) {
    console.error("API error in /api/rewrite_slide:", err);
    res.json({
      success: false,
      error: err.message,
      slide: req.body.slide
    });
  }
});

function isGibberish(text: string): boolean {
  if (!text) return true;
  const trimmed = text.trim();
  if (trimmed.length === 0) return true;
  if (trimmed.length < 3) return true;

  if (/^(.)\1+$/i.test(trimmed)) return true;

  if (/^[0-9!@#$%^&*()_+={}\[\]|\\:";'<>?,.\/\-\s]+$/.test(trimmed)) return true;

  const words = trimmed.split(/\s+/);
  if (words.length === 1 && words[0].length > 6) {
    const word = words[0].toLowerCase();
    const isRussian = /[а-я]/i.test(word);
    const isEnglish = /[a-z]/i.test(word);
    if (isRussian) {
      const vowels = word.match(/[аеёиоуыэюя]/g);
      if (!vowels || vowels.length < 2) return true;
    } else if (isEnglish) {
      const vowels = word.match(/[aeiouy]/g);
      if (!vowels || vowels.length < 2) return true;
    }
  }

  const lower = trimmed.toLowerCase();
  const nonsenseWords = ["фигня", "пкпкер", "хз", "херня", "лол", "кек", "хзхз", "бред", "ыыы", "ааа", "тест", "asdf", "qwerty"];
  if (nonsenseWords.includes(lower)) return true;

  return false;
}

function getClarificationQuestion(turnIndex: number, idea: string): string {
  if (turnIndex === 0) {
    return `Не совсем понял ваш ответ. Давайте вернемся к началу. Идея проекта: "${idea}". Пожалуйста, расскажите подробнее: какую конкретно проблему клиентов решает ваш стартап и кто целевая аудитория? Ответьте по пунктам (•).`;
  }
  const challenges = [
    `Не совсем понял ответ. Давайте уточним решение: как физически работает ваш продукт и почему пользователи купят его в первые минуты? Ответьте по пунктам (•).`,
    `Кажется, этот ответ не относится к вопросу. Давайте подробнее про рынок: кто ваш клиент, каков объем рынка (TAM/SAM) и откуда эти цифры? Ответьте по пунктам (•).`,
    `Не уловил суть ответа. Давайте сфокусируемся на монетизации: какая у вас бизнес-модель, цена и плановые показатели LTV/CAC? Ответьте по пунктам (•).`,
    `Ответ не содержит конкретики. Как вы планируете выходить на рынок (GTM)? Как вы получите первые 100 платящих клиентов? Ответьте по пунктам (•).`,
    `Давайте вернемся к сути. Кто ваши ключевые конкуренты и в чём ваше кардинальное отличие (moat)? Ответьте по пунктам (•).`,
    `Пожалуйста, ответьте на вопрос по существу. Каковы главные риски вашего стартапа и какой объем инвестиций вы ищете? Ответьте по пунктам (•).`
  ];
  return challenges[turnIndex - 1] || challenges[challenges.length - 1];
}

// Helper for Mock Interview Response
function getMockInterviewResponse(messages: any[], mode: string, idea: string) {
  // We calculate user replies by finding how many 'user' (founder) messages are in the history
  const userMessages = messages.filter((m: any) => m.sender === 'user' || m.sender === 'Founder');
  const lastUserMessage = userMessages[userMessages.length - 1]?.text || "";
  const isLastGibberish = lastUserMessage ? isGibberish(lastUserMessage) : false;

  const validUserMessages = userMessages.filter((m: any) => !isGibberish(m.text));
  const turnIndex = validUserMessages.length; // 0, 1, 2, 3, 4, 5, 6...

  // Define a complete sequential list of professional VC questions tailored to the 10 slides and the canvas:
  const maxTurns = mode === "quick" ? 3 : mode === "shark" ? 6 : 5;

  const questions = [
    `Понял, фиксирую. Следующий блок — решение: как работает продукт и почему купят в первые минуты? Ответьте по пунктам (•).`,
    `Ок, записал. Рынок: кто клиент, TAM/SAM, откуда цифры? Ответьте по пунктам (•).`,
    `Принято. Монетизация: модель, цена, LTV/CAC если есть. Ответьте по пунктам (•).`,
    `Понял. GTM: как получите первых 100 клиентов? Ответьте по пунктам (•).`,
    `Ок. Конкуренты и ваше отличие — в чём moat? Ответьте по пунктам (•).`,
    `Последний блок: главные риски и сколько инвестиций ищете? Ответьте по пунктам (•).`,
  ];

  // We can cycle questions or show the completion prompt if turnIndex goes past our questions array
  let nextQuestion = "";
  if (isLastGibberish) {
    nextQuestion = getClarificationQuestion(turnIndex, idea);
  } else {
    if (turnIndex === 0) {
      nextQuestion = `Идея: "${idea}". Отвечайте коротко, по пунктам (•). Первый блок — клиент и проблема: кто платит и какую боль решаете?`;
    } else if (turnIndex < maxTurns) {
      nextQuestion = questions[turnIndex - 1] || questions[questions.length - 1];
    } else {
      nextQuestion = `Отлично, данных достаточно! Сейчас автоматически соберу презентацию...`;
    }
  }

  const interviewComplete = turnIndex >= maxTurns;

  const sentiments = ["skeptical", "intrigued", "intrigued", "impressed", "impressed", "impressed"] as const;
  const thoughtsList = [
    "Собираю факты по блокам, без лишних уточнений.",
    "Ответ по проблеме принят, двигаемся дальше.",
    "Картина проясняется, экономика пока без красных флагов.",
    "Хороший темп — хватает для черновика деки.",
    "Почти всё на месте, можно генерировать.",
    "Готово к сборке презентации.",
  ];
  const sentiment = isLastGibberish ? "skeptical" : sentiments[Math.min(turnIndex, sentiments.length - 1)];
  const thoughts = isLastGibberish ? "Пользователь дал пустой или бессмысленный ответ. Требуется уточнение." : thoughtsList[Math.min(turnIndex, thoughtsList.length - 1)];

  if (!isLastGibberish && mode === "shark" && turnIndex > 0 && turnIndex < maxTurns && turnIndex % 2 === 0) {
    nextQuestion = `Уточню один момент — ${nextQuestion.replace(/^Понял[^?]*\.\s*|^Ок[^?]*\.\s*|^Принято\.\s*/i, "")}`;
  }

  return {
    nextQuestion,
    interviewComplete,
    investorSentiment: sentiment,
    underlyingThoughts: interviewComplete ? "Интервью завершено — запускаю генерацию деки." : thoughts,
    canvasUpdates: {
      problem: {
        summary: `Фокусированная боль рынка в контексте: "${idea}"`,
        bullets: [
          "Клиенты тратят часы на ручные, неэкологичные или дорогие решения",
          "Существующие инструменты создают сильное трение и высокий отток в нише",
          "Проблема подтверждена прямыми опросами целевой аудитории"
        ],
        status: turnIndex >= 1 ? "compiled" : "thinking"
      },
      solution: {
        summary: "Интеллектуальное и автоматизированное решение",
        bullets: [
          "Моментальное закрытие боли без лишних барьеров настройки",
          "Встроенный ИИ-помощник минимизирует время выполнения задач",
          "Простота использования и мгновенный wow-эффект для пользователя"
        ],
        status: turnIndex >= 2 ? "compiled" : "thinking"
      },
      market: {
        summary: "Растущий рынок цифровых B2B/B2C услуг",
        bullets: [
          "Выход на глобальный рынок профессионалов и фрилансеров",
          "Потенциальная аудитория оценивается в миллионы активных пользователей",
          "Целевой сегмент (SOM) готов к немедленному пилотному тестированию"
        ],
        status: turnIndex >= 3 ? "compiled" : "locked"
      },
      moneyModel: {
        summary: "SaaS Модель + плата за объем использования",
        bullets: [
          "Базовая доступная подписка на сервис с гибким триалом",
          "Корпоративный тариф для команд с глубокой кастомизацией под ключ",
          "Транзакционные сборы или комиссии за экстра-объем"
        ],
        status: turnIndex >= 4 ? "compiled" : "locked"
      },
      competitors: {
        summary: "Слабая локальная автоматизация и дорогие агентства",
        bullets: [
          "Существующие гиганты неповоротливы и не имеют узкого фокуса",
          "Альтернативные решения — ручной труд или сложные конструкторы",
          "Преимущество продукта: высокая скорость и нулевая кривая обучения"
        ],
        status: turnIndex >= 5 ? "compiled" : "locked"
      },
      goToMarket: {
        summary: "Прямые партнерства и вирусный продукт-маркетинг",
        bullets: [
          "Вирусные публикации на профильных ресурсах для фаундеров",
          "Интеграции с лидерами мнений и закрытые партнерские сети",
          "Прямые холодные продажи первым 100 корпоративным клиентам"
        ],
        status: turnIndex >= 6 ? "compiled" : "locked"
      },
      risks: {
        summary: "Низкий порог входа и копирование крупными игроками",
        bullets: [
          "Риск копирования (нивелируется скоростью обновлений и комьюнити)",
          "Недоверие к качеству ИИ на старте (решается прозрачным тест-драйвом)",
          "Высокий CAC на зрелых стадиях (решается сильным реферальным циклом)"
        ],
        status: turnIndex >= 7 ? "compiled" : "locked"
      }
    }
  };
}

// Helper for Mock Pitch Deck Response
function getMockDeckResponse(idea: string, mode: string, canvas: any) {
  const name = "PITCHFLOW AI";
  return {
    id: "mock_deck_123",
    title: name,
    subtitle: `ИИ-платформа, которая революционизирует нишу: "${idea}"`,
    idea,
    mode,
    slides: [
      {
        type: "title",
        title: name,
        subtitle: `Концепция, созданная в режиме ${mode}`,
        content: [
          "Инвестиционная презентация",
          "Быстрый запуск и масштабирование на основе реального спроса",
          `Подготовлено по итогам глубокого ИИ-интервью`
        ],
        speechScript: `Приветствую, уважаемые инвесторы! Сегодня я представляю проект ${name}. Мы решаем острую рыночную проблему в области "${idea}". Наш проект прошел жесткую валидацию и готов к быстрому захвату растущей рыночной доли. Позвольте показать вам, почему эта возможность стоит вашего внимания.`
      },
      {
        type: "problem",
        title: "Проблема: Острая боль рынка",
        subtitle: canvas.problem?.summary || "Friction in progress",
        content: canvas.problem?.bullets || [
          "Существующие игроки игнорируют мелких создателей контента",
          "Традиционные решения занимают до 4-5 недель настройки и требуют больших бюджетов",
          "Потеря до 40% потенциальной выручки из-за сложного пользовательского опыта"
        ],
        speechScript: "Посмотрите на слайд: ключевая проблема в том, что существующие игроки абсолютно игнорируют сегмент мелких создателей и специалистов. Инструменты слишком сложные, дорогие, а ручная настройка занимает недели. В итоге клиенты просто теряют до половины своей выручки на этапе старта."
      },
      {
        type: "solution",
        title: "Решение: Автоматизированная система",
        subtitle: canvas.solution?.summary || "Seamless smart tooling",
        content: canvas.solution?.bullets || [
          "Запуск готовой воронки за 3 минуты под ключ",
          "Встроенная аналитика и автокоррекция маркетинга под управлением нейросети",
          "Интуитивно понятный B2B дашборд"
        ],
        speechScript: "Наше решение автоматизирует весь цикл. Больше не нужны программисты, дизайнеры или маркетологи. Нейросеть генерирует и оптимизирует воронки за минуты. Это дает пользователям колоссальное преимущество по скорости тестирования гипотез!"
      },
      {
        type: "market",
        title: "Рынок и Целевая Аудитория",
        subtitle: canvas.market?.summary || "Growing TAM/SAM",
        content: [
          "TAM (Общий объем рынка): $40 миллиардов на глобальном уровне",
          "SAM (Доступный объем): $1.2 миллиарда в целевых регионах",
          "SOM (Наша цель на 3 года): $15 миллионов на базе привлечения 20,000 активных юзеров",
          "Рынок растет на 22.4% в год благодаря цифровизации создателей"
        ],
        speechScript: "Мы работаем на огромном и быстрорастущем рынке. Общий рынок цифровых услуг и монетизации создателей превышает 40 миллиардов долларов. Наша скромная, но реалистичная цель — взять 15 миллионов долларов за 3 года, заняв свободные ниши, где крупные игроки слишком неповоротливы."
      },
      {
        type: "pricing",
        title: "Бизнес-Модель: Юнит-Экономика",
        subtitle: canvas.moneyModel?.summary || "SaaS business scaling",
        content: canvas.moneyModel?.bullets || [
          "Подписка 'Pro Starter': $19 в месяц для создателей",
          "Подписка 'Agency Prime': $79 в месяц для команд",
          "Транзакционный сбор: 2% за обработку платежей внутри платформы",
          "Средний LTV (жизненный цикл клиента): $320 при стоимости привлечения (CAC) в $45"
        ],
        speechScript: "Наша бизнес-модель прозрачна и легко масштабируется. Мы используем гибридный подход: фиксированная SaaS-подписка плюс небольшая транзакционная комиссия 2%. При стоимости привлечения клиента в 45 долларов, его жизненная ценность составляет 320 долларов, что дает отличное соотношение LTV к CAC, равное семи."
      },
      {
        type: "competition",
        title: "Конкурентное преимущество и Moat",
        subtitle: canvas.competitors?.summary || "Why we dominate",
        content: [
          "Универсальные конструкторы — слишком сложны для новичков",
          "Маркетинговые агентства — недоступно дорого для начинающих",
          "Наш главный барьер (Moat): проприетарные алгоритмы авто-маркетинга, которые улучшаются с каждым новым клиентом",
          "Простота продукта позволяет сократить отток пользователей на 50%"
        ],
        speechScript: "В отличие от крупных и сложных конструкторов, мы делаем ставку на ультра-простой запуск без обучения. А от агентств мы отличаемся ценой, которая в 30 раз дешевле при сопоставимом качестве автоматизированных процессов. Наш ИИ постоянно дообучается, усиливая наш технологический барьер."
      },
      {
        type: "launch",
        title: "Стратегия Выхода на Рынок (Go-to-Market)",
        subtitle: canvas.goToMarket?.summary || "High conversion viral loops",
        content: canvas.goToMarket?.bullets || [
          "Партизанский маркетинг и интеграции на тематических ресурсах",
          "Реферальная программа: 'Приведи друга — получи бесплатный месяц'",
          "Коллаборации с лидерами мнений и авторами курсов",
          "Запуск бесплатного промо-конструктора для вирусного охвата"
        ],
        speechScript: "Мы не планируем тратить миллионы на стандартную рекламу. Вместо этого мы внедряем встроенный реферальный механизм и запускаем бесплатный вирусный продукт, который сам по себе рекламирует основную платформу. Также у нас уже есть договоренности с 15 инфлюенсерами."
      },
      {
        type: "risks",
        title: "Анализ Рисков и Безопасность",
        subtitle: canvas.risks?.summary || "Vulnerability map & mitigation",
        content: canvas.risks?.bullets || [
          "Риск: Копирование гигантами. Решение: Высокая скорость обновления продукта и фокус на узкой нише.",
          "Риск: Отток пользователей. Решение: Геймификация удержания и постоянное добавление новых ИИ-сценариев.",
          "Риск: Ограничения API третьих сторон. Решение: Собственные разработанные нейросетевые мини-модели."
        ],
        speechScript: "У любого бизнеса есть риски, и мы смотрим на них трезво. Главный риск — копирование крупными игроками, но их фокус размыт. Мы же двигаемся в 10 раз быстрее и строим сообщество вокруг узкой специализации. Для снижения внешних зависимостей мы внедряем собственную гибридную архитектуру моделей."
      },
      {
        type: "traction",
        title: "Текущие Результаты и Traction",
        subtitle: "Первые победы команды",
        content: [
          "Зарегистрировано более 800 пользователей на ранний закрытый бета-тест",
          "Сформировано комьюнити из 3,000 потенциальных клиентов в Telegram и Discord",
          "Проведены глубинные интервью со 120 представителями ниши",
          "Более 40% бета-тестеров подтвердили готовность оплатить Pro тариф"
        ],
        speechScript: "Хотя мы только на старте, наш трекшн уже доказывает ценность. У нас в листе ожидания 800 горячих пользователей, а 40% из опрошенных бета-тестеров заявили, что готовы внести предоплату сразу после релиза. Рынок буквально требует этот продукт."
      },
      {
        type: "ask",
        title: "Финансовый Раунд и Цели",
        subtitle: "Инвестиции для кратного роста",
        content: [
          "Ищем ангельские инвестиции: $150,000 за 10% доли (Pre-seed)",
          "50% — Разработка продукта и развитие ИИ-функционала",
          "30% — Привлечение клиентов и масштабирование воронки",
          "20% — Операционные расходы и юридическое оформление",
          "Ключевая цель: Достичь $35k MRR (ежемесячной выручки) за 12 месяцев"
        ],
        speechScript: "Мы привлекаем раунд в размере 150 тысяч долларов. Эти средства позволят нам за год дойти до 35 тысяч долларов ежемесячной выручки и выйти на самоокупаемость. Будем рады видеть вас на борту этого амбициозного полета. Вопросы?"
      }
    ],
    roast: {
      score: Math.floor(Math.random() * 25) + 50, // 50 to 75
      verdict: "ОСТОРОЖНЫЙ ИНТЕРЕС / ТРЕБУЕТ ДЕТАЛЬНОГО АНАЛИЗА",
      roastText: `Этот питч выглядит симпатично на бумаге, но давайте снимем розовые очки. Называть очередную обертку над API сторонних сервисов "революционным ИИ" — классический трюк 2026 года. Большинство ваших преимуществ рассыпется сразу, как только крупный игрок со встроенными платежами добавит одну галочку в настройках. Модель привлечения клиентов выглядит чересчур оптимистичной, а CAC в $45 — это фантазии для презентации. Вы недооцениваете сложность удержания клиентов, которые быстро натестируют гипотезы и отменят B2B подписку. Тем не менее, у вас есть понимание боли и быстрый трекшн, что делает проект пригодным для проверки.`,
      weakSpots: [
        "Минимальный барьер для копирования (Moat близок к нулю)",
        "Слишком оптимистичный CAC в $45 без подтвержденных платных каналов привлечения",
        "Уязвимость к изменениям условий сторонних ИИ-платформ",
        "Высокий риск оттока клиентов (churn rate)"
      ],
      recommendations: [
        "Показать реальные платящие когорты, а не просто голословную готовность бета-тестеров",
        "Разработать уникальную базу данных / кастомный фидбэк-луп, который невозможно скопировать",
        "Просчитать стресс-сценарий юнит-экономики при CAC > $100"
      ]
    }
  };
}

// Vite integration: serve static assets or delegate to dev server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
