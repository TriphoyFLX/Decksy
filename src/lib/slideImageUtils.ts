import type { Slide, SlideVisualData } from "../types";
import { findSlideIndexByType } from "./deckBuilder";

export type ImageCategory = "logo" | "product" | "market" | "team" | "competitor" | "contact" | "other";

export interface SessionImage {
  id: string;
  image: string;
  description?: string;
}

const TEAM_KEYWORDS = [
  "команд", "team", "founder", "co-founder", "основател", "ceo", "cto", "cfo", "coo",
  "директор", "партнёр", "партнер", "headshot", "портрет", "фото основ", "лицо",
];
const LOGO_KEYWORDS = ["лого", "logo", "бренд", "brand", "иконк"];
const PRODUCT_KEYWORDS = [
  "продукт", "интерфейс", "скриншот", "приложен", "экран", "product", "screen",
  "mockup", "ui", "ux", "дашборд", "dashboard", "mvp",
];
const MARKET_KEYWORDS = [
  "рынок", "диаграмм", "график", "маркет", "market", "chart", "tam", "som", "sam", "тренд",
];
const COMPETITOR_KEYWORDS = [
  "таблица", "конкурент", "сравнен", "матриц", "competitor", "moat", "позицион",
];
const CONTACT_KEYWORDS = ["кьюар", "qr", "контакт", "визитк", "pitch deck pdf"];

export function classifyImage(description: string): ImageCategory {
  const d = (description || "").toLowerCase();
  if (TEAM_KEYWORDS.some((k) => d.includes(k))) return "team";
  if (LOGO_KEYWORDS.some((k) => d.includes(k))) return "logo";
  if (PRODUCT_KEYWORDS.some((k) => d.includes(k))) return "product";
  if (MARKET_KEYWORDS.some((k) => d.includes(k))) return "market";
  if (COMPETITOR_KEYWORDS.some((k) => d.includes(k))) return "competitor";
  if (CONTACT_KEYWORDS.some((k) => d.includes(k))) return "contact";
  return "other";
}

const ROLE_PATTERNS: { pattern: RegExp; role: string }[] = [
  { pattern: /\bceo\b/i, role: "CEO" },
  { pattern: /\bcto\b/i, role: "CTO" },
  { pattern: /\bcfo\b/i, role: "CFO" },
  { pattern: /\bcoo\b/i, role: "COO" },
  { pattern: /основател/i, role: "Основатель" },
  { pattern: /co-?founder/i, role: "Co-founder" },
  { pattern: /директор/i, role: "Директор" },
  { pattern: /продукт/i, role: "Product" },
  { pattern: /маркетинг/i, role: "Marketing" },
  { pattern: /разработ/i, role: "Engineering" },
];

export function parseTeamMember(description: string, image: string): { name: string; role: string; image: string } {
  const raw = (description || "").trim();
  let role = "Команда";
  for (const { pattern, role: r } of ROLE_PATTERNS) {
    if (pattern.test(raw)) {
      role = r;
      break;
    }
  }

  let name = raw
    .replace(/фото|photo|портрет|headshot|команда|team|изображение|скрин/gi, "")
    .replace(/\b(ceo|cto|cfo|coo)\b/gi, "")
    .replace(/основатель|co-?founder|директор/gi, "")
    .replace(/[,;:—\-–|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!name || name.length < 2) {
    name = role === "Команда" ? "Участник команды" : "Участник";
  }

  if (name.length > 40) name = name.slice(0, 40).trim();

  return { name, role, image };
}

function firstSlideIndex(slides: Slide[], types: Slide["type"][]): number {
  for (const t of types) {
    const idx = findSlideIndexByType(slides, t);
    if (idx >= 0) return idx;
  }
  return -1;
}

function parseLabelDetail(line: string): { label: string; detail: string } {
  const m = line.match(/^([^:—\-]+)[:—\-]\s*(.+)$/);
  if (!m) return { label: "", detail: line.trim() };
  return { label: m[1].trim(), detail: m[2].trim() };
}

function extractMetricValue(text: string): string {
  return text.match(/(?:\$|₽)?\d[\d\s,.]*(?:\s?(?:млрд|млн|тыс|%|B|M|K|к\b|руб\.?|₽|x))?/i)?.[0]?.trim() || "";
}

function applyStructuredVisualData(slides: Slide[]): void {
  for (const slide of slides) {
    if (!slide.content?.length) continue;
    const parsed = slide.content.map(parseLabelDetail);

    const metrics = parsed
      .map(({ label, detail }) => {
        const raw = detail || label;
        const value = extractMetricValue(raw);
        if (!value && !/\d|tam|sam|som|cac|ltv|mrr|arr|gmv|выруч|рост/i.test(`${label} ${raw}`)) return null;
        return {
          label: label || "Метрика",
          value: value || raw.slice(0, 42),
          highlight: /tam|sam|som|mrr|arr|cac|ltv|gmv|рост|выруч/i.test(label),
        };
      })
      .filter(Boolean) as NonNullable<SlideVisualData["metrics"]>;

    if (metrics.length >= 2 && ["market", "pricing", "traction", "ask"].includes(slide.type)) {
      slide.visualData = { ...(slide.visualData || {}), metrics, layout: slide.visualData?.layout || "metrics" };
    }

    if (slide.type === "pricing") {
      const pricing = parsed.slice(0, 4).map(({ label, detail }, i) => ({
        label: label || (i === 0 ? "Base" : i === 1 ? "Pro" : `Tier ${i + 1}`),
        price: extractMetricValue(detail) || extractMetricValue(label) || (i === 1 ? "Pro" : "Custom"),
        detail: detail.replace(extractMetricValue(detail), "").replace(/^[\s—\-:]+/, "").trim() || detail,
        featured: i === 1,
      }));
      slide.visualData = { ...(slide.visualData || {}), pricing, layout: slide.visualData?.layout || "pricing" };
    }

    if (slide.type === "launch" || slide.type === "traction") {
      const timeline = parsed.slice(0, 4).map(({ label, detail }, i) => ({
        label: label || (slide.type === "launch" ? `Q${i + 1}` : `Этап ${i + 1}`),
        title: detail.split(/[.;]/)[0]?.trim() || detail || label,
        detail,
      }));
      slide.visualData = { ...(slide.visualData || {}), timeline, layout: slide.visualData?.layout || "timeline" };
    }

    if (slide.type === "competition") {
      const competitors = parsed.slice(0, 4).map(({ label, detail }, i) => ({
        label: label || (i < 2 ? `Конкурент ${i + 1}` : "Наше отличие"),
        detail,
        ours: /наш|мы|отлич|преим/i.test(`${label} ${detail}`) || i >= 2,
      }));
      slide.visualData = { ...(slide.visualData || {}), competitors, layout: slide.visualData?.layout || "matrix" };
    }
  }
}

export function fixMisplacedTeamLayout(slides: Slide[]): void {
  const sauceIdx = findSlideIndexByType(slides, "sauce");
  if (sauceIdx < 0) return;

  for (let i = 0; i < slides.length; i++) {
    if (i === sauceIdx) continue;
    const slide = slides[i];
    if (slide.visualData?.layout === "team" && slide.visualData.teamMembers?.length) {
      slides[sauceIdx].visualData = {
        ...(slides[sauceIdx].visualData || {}),
        layout: "team",
        teamMembers: slide.visualData.teamMembers,
      };
      if (!slides[sauceIdx].title || slides[sauceIdx].title.includes("Moat")) {
        slides[sauceIdx].title = "Команда проекта";
      }
      slides[sauceIdx].sectionLabel = "👥 Команда • Founders & Core Team";
      slide.visualData = { ...slide.visualData, layout: undefined, teamMembers: undefined };
      slide.image = slide.image;
    }
  }
}

export function enrichSlidesWithVisuals(slides: Slide[], sessionImages: SessionImage[]): void {
  if (!Array.isArray(slides)) return;
  fixMisplacedTeamLayout(slides);
  applyStructuredVisualData(slides);
  if (!sessionImages?.length) return;

  const byCategory = new Map<ImageCategory, SessionImage[]>();
  for (const img of sessionImages) {
    const cat = classifyImage(img.description || "");
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(img);
  }

  const assignToSlide = (index: number, image: string, description?: string, visualPatch?: Partial<SlideVisualData>) => {
    if (index < 0 || index >= slides.length) return;
    const slide = slides[index];
    if (!slide.image) {
      slide.image = image;
      slide.imageDescription = description;
    }
    slide.visualData = { ...(slide.visualData || {}), ...visualPatch };
  };

  const teamImages = byCategory.get("team") || [];
  if (teamImages.length >= 1) {
    const teamMembers = teamImages.map((img) =>
      parseTeamMember(img.description || "", img.image)
    );
    const teamIdx = firstSlideIndex(slides, ["sauce", "tech"]);
    if (teamIdx >= 0 && slides[teamIdx]) {
      slides[teamIdx].visualData = {
        ...(slides[teamIdx].visualData || {}),
        layout: "team",
        teamMembers,
      };
      slides[teamIdx].title = slides[teamIdx].title?.includes("Moat")
        ? "Команда проекта"
        : slides[teamIdx].title || "Команда проекта";
      slides[teamIdx].sectionLabel = "👥 Команда • Founders & Core Team";
      slides[teamIdx].image = undefined;
      slides[teamIdx].imageDescription = undefined;
    }
  }

  const logo = byCategory.get("logo")?.[0];
  if (logo) {
    assignToSlide(firstSlideIndex(slides, ["title"]), logo.image, logo.description, { layout: "hero", accentImage: logo.image });
  }

  const product = byCategory.get("product")?.[0];
  if (product) {
    assignToSlide(firstSlideIndex(slides, ["product", "solution"]), product.image, product.description, { layout: "split" });
  }

  const market = byCategory.get("market")?.[0];
  if (market) {
    assignToSlide(firstSlideIndex(slides, ["market"]), market.image, market.description, { layout: "hero" });
  }

  const competitor = byCategory.get("competitor")?.[0];
  if (competitor) {
    assignToSlide(firstSlideIndex(slides, ["competition"]), competitor.image, competitor.description, { layout: "hero" });
  }

  const contact = byCategory.get("contact")?.[0];
  if (contact) {
    assignToSlide(firstSlideIndex(slides, ["ask"]), contact.image, contact.description);
  }

  const usedIds = new Set<string>();
  for (const s of slides) {
    if (s.image) {
      const match = sessionImages.find((img) => img.image === s.image);
      if (match) usedIds.add(match.id);
    }
    for (const m of s.visualData?.teamMembers || []) {
      const match = sessionImages.find((img) => img.image === m.image);
      if (match) usedIds.add(match.id);
    }
  }

  const sauceIdx = firstSlideIndex(slides, ["sauce", "tech"]);
  const portraitLike = sessionImages.filter(
    (img) => !usedIds.has(img.id) && /ceo|founder|основат|портрет|фото|team|команд/i.test(img.description || "")
  );
  if (portraitLike.length >= 1 && sauceIdx >= 0 && !slides[sauceIdx]?.visualData?.teamMembers?.length) {
    const teamMembers = portraitLike.map((img) => parseTeamMember(img.description || "Команда", img.image));
    slides[sauceIdx].visualData = { ...(slides[sauceIdx].visualData || {}), layout: "team", teamMembers };
    slides[sauceIdx].title = "Команда проекта";
    slides[sauceIdx].sectionLabel = "👥 Команда • Founders & Core Team";
    portraitLike.forEach((img) => usedIds.add(img.id));
  }

  const leftovers = sessionImages.filter((img) => !usedIds.has(img.id));

  if (sessionImages.length === 1 && leftovers.length === 1) {
    assignToSlide(firstSlideIndex(slides, ["product", "solution"]), leftovers[0].image, leftovers[0].description, { layout: "split" });
    usedIds.add(leftovers[0].id);
  }

  const stillLeft = sessionImages.filter((img) => !usedIds.has(img.id));
  const slotPriority = [
    firstSlideIndex(slides, ["product"]),
    firstSlideIndex(slides, ["solution"]),
    firstSlideIndex(slides, ["market"]),
    firstSlideIndex(slides, ["title"]),
    firstSlideIndex(slides, ["competition"]),
    firstSlideIndex(slides, ["pricing"]),
    firstSlideIndex(slides, ["launch"]),
    firstSlideIndex(slides, ["traction"]),
    firstSlideIndex(slides, ["ask"]),
    firstSlideIndex(slides, ["problem"]),
    sauceIdx,
  ].filter((i) => i >= 0);

  let slotPtr = 0;
  for (const img of stillLeft) {
    while (slotPtr < slotPriority.length) {
      const idx = slotPriority[slotPtr++];
      const slide = slides[idx];
      if (!slide) continue;
      if (slide.visualData?.layout === "team") continue;
      if (!slide.image) {
        slide.image = img.image;
        slide.imageDescription = img.description;
        usedIds.add(img.id);
        break;
      }
      if (!slide.visualData?.images) slide.visualData = { ...(slide.visualData || {}), images: [] };
      if ((slide.visualData!.images!.length || 0) < 2) {
        slide.visualData!.images!.push(img.image);
        usedIds.add(img.id);
        break;
      }
    }
  }

  for (const s of slides) {
    if (s.image && typeof s.image === "string" && s.image.startsWith("img_")) {
      const matched = sessionImages.find((img) => img.id === s.image);
      if (matched) {
        s.image = matched.image;
        s.imageDescription = matched.description || s.imageDescription;
      }
    }
  }

  applyStructuredVisualData(slides);
}
