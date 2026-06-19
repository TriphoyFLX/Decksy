import { PitchDeck, Slide } from "../types";
import { resolveCompanyName, type ProjectBranding } from "./projectBranding";

export const SLIDE_TYPES: Slide["type"][] = [
  "title",
  "problem",
  "solution",
  "product",
  "market",
  "competition",
  "pricing",
  "traction",
  "launch",
  "sauce",
  "ask",
  "vision",
];

const SLIDE_TITLES: Record<Slide["type"], string> = {
  title: "Титульный слайд",
  problem: "💥 Хук: боль рынка",
  solution: "⚡ Решение",
  product: "🧠 Продукт",
  market: "📊 Рынок",
  competition: "🧨 Конкуренты",
  pricing: "💸 Бизнес-модель",
  traction: "🚀 Traction",
  launch: "🛠 Go-To-Market",
  sauce: "👥 Команда",
  ask: "💰 Финансы и запрос",
  vision: "🧾 Vision",
  risks: "Риски",
  tech: "Технология",
};

function extractStartupName(idea: string): string {
  const stopWords = new Set([
    "для", "по", "с", "и", "в", "на", "из", "от", "к", "при", "через", "помощью",
    "мобильное", "приложение", "сервис", "платформа", "система", "решение", "проект",
    "the", "for", "with", "and", "app", "mobile", "service", "platform",
  ]);

  const keywords = idea
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .map((w) => w.toLowerCase())
    .filter((w) => w.length > 2 && !stopWords.has(w));

  if (keywords.length === 0) return "PitchFlow AI";

  const scored = keywords.map((word) => {
    let score = word.length;
    if (/^(трекинг|осанк|здоров|финанс|образован|доставк)/.test(word)) score += 5;
    if (/(инга|ения|ение|ован|иров)/.test(word)) score -= 3;
    return { word, score };
  });
  scored.sort((a, b) => b.score - a.score);

  let raw = scored[0].word;
  if (/ки$/i.test(raw)) {
    raw = raw.replace(/ки$/i, "ка");
  } else if (/инга$/i.test(raw)) {
    raw = raw.replace(/инга$/i, "инг");
  } else {
    raw = raw
      .replace(/(ения|ение|аний|ений|ировка|ность|ости)$/i, "")
      .replace(/(ов|ам|ям|ий|ый|ая|ое|ии|е|у|и|а|о|ы)$/i, "");
  }

  const label = raw.charAt(0).toUpperCase() + raw.slice(1);
  return label.length >= 3 ? label : "Название проекта";
}

function hashIdea(idea: string): number {
  let hash = 0;
  for (let i = 0; i < idea.length; i++) {
    hash = (hash * 31 + idea.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pick<T>(arr: T[], seed: number, offset = 0): T {
  return arr[(seed + offset) % arr.length];
}

function formatMoney(base: number): string {
  if (base >= 1_000_000_000) return `$${(base / 1_000_000_000).toFixed(1)} млрд`;
  if (base >= 1_000_000) return `$${Math.round(base / 1_000_000)} млн`;
  return `$${Math.round(base / 1_000)} тыс`;
}

export function generateLocalDeck(idea: string, mode: string, canvas?: Record<string, any>): PitchDeck {
  const seed = hashIdea(idea);
  const branding = canvas?._projectBranding as ProjectBranding | undefined;
  const name = branding?.companyName?.trim() || resolveCompanyName(branding || { companyName: "", tagline: "", founderName: "", founderRole: "", quote: "" }, idea);
  const tam = pick([2.1, 4.5, 8.2, 12.0, 25.0, 40.0], seed) * 1_000_000_000;
  const sam = tam * pick([0.08, 0.12, 0.15, 0.18], seed);
  const som = sam * pick([0.05, 0.08, 0.1, 0.12], seed);
  const users = pick([12000, 25000, 50000, 80000, 150000], seed);
  const cac = pick([28, 35, 45, 58, 72], seed);
  const ltv = cac * pick([5, 6, 7, 8], seed);
  const mrr = pick([18, 25, 35, 48], seed);
  const ask = pick([100, 150, 200, 250, 350], seed) * 1000;
  const growth = pick([18, 22, 28, 34], seed);

  const problemBullets = canvas?.problem?.bullets?.length
    ? canvas.problem.bullets
    : [
        `Целевая аудитория тратит 3–5 часов в неделю на неэффективные решения в нише «${idea.slice(0, 60)}»`,
        "Существующие инструменты сложны, дороги и не дают измеримого результата",
        `Потери до ${pick([30, 35, 40, 45], seed)}% потенциальной выручки из-за плохого UX и долгого онбординга`,
        "Проблема подтверждена 80+ глубинными интервью с представителями целевого сегмента",
      ];

  const solutionBullets = canvas?.solution?.bullets?.length
    ? canvas.solution.bullets
    : [
        `Запуск продукта за ${pick([3, 5, 7], seed)} минут без технических навыков`,
        "ИИ-ядро автоматизирует ключевые процессы и снижает операционные затраты на 60%",
        "Интуитивный интерфейс с мгновенным wow-эффектом для новых пользователей",
        "Интеграции с популярными экосистемами (Telegram, Slack, Notion, CRM)",
      ];

  const slides: Slide[] = SLIDE_TYPES.map((type) => {
    switch (type) {
      case "title":
        return {
          type: "title",
          title: name,
          subtitle: branding?.tagline?.trim() || idea.slice(0, 100),
          founderName: branding?.founderName?.trim(),
          founderRole: branding?.founderRole?.trim() || "Основатель",
          brandQuote: branding?.quote?.trim(),
          image: branding?.logoImage,
          badge: "PITCH DECK",
          content: [
            branding?.founderName ? `${branding.founderRole || "Основатель"}: ${branding.founderName}` : "",
            branding?.quote ? `«${branding.quote}»` : "",
          ].filter(Boolean),
          speechScript: branding?.founderName
            ? `Добрый день! Меня зовут ${branding.founderName}, я ${branding.founderRole || "основатель"} ${name}.`
            : `Представляю проект: ${idea}.`,
        };
      case "problem":
        return {
          type: "problem",
          title: SLIDE_TITLES.problem,
          subtitle: canvas?.problem?.summary || "Боль ЦА",
          content: problemBullets,
          speechScript: `Ключевая боль: ${idea}. Кто страдает, как часто, сколько это стоит — разберём на этом слайде.`,
        };
      case "solution":
        return {
          type: "solution",
          title: SLIDE_TITLES.solution,
          subtitle: canvas?.solution?.summary || "Что делаем",
          content: solutionBullets,
          speechScript: `${name} решает боль за счёт конкретного механизма, а не абстрактной «инновации».`,
        };
      case "product":
        return {
          type: "product",
          title: SLIDE_TITLES.product,
          subtitle: "Фичи и user flow",
          content: [
            "Ключевые фичи: 3–4 конкретных возможности продукта",
            "User flow: что делает пользователь за 60 секунд",
            "Статус: MVP / пилот / прототип — указать честно",
            "Демо: скриншот или ссылка на прототип",
          ],
          speechScript: "Показываю, что внутри продукта и как пользователь проходит путь от входа до ценности.",
        };
      case "market":
        return {
          type: "market",
          title: SLIDE_TITLES.market,
          subtitle: canvas?.market?.summary || "TAM / SAM / SOM",
          content: [
            `TAM: ${formatMoney(tam)} — требует уточнения по нише`,
            `SAM: ${formatMoney(sam)}`,
            `SOM: ${formatMoney(som)} за 3 года`,
            `Рост рынка: ~${growth}% в год`,
          ],
          speechScript: `Рынок ${formatMoney(tam)}. Фокус на сегменте, который платит сейчас.`,
        };
      case "competition":
        return {
          type: "competition",
          title: SLIDE_TITLES.competition,
          subtitle: canvas?.competitors?.summary || "Позиционирование",
          content: [
            "Прямые конкуренты: 2–3 игрока",
            "Почему текущие решения не закрывают боль",
            `Наше отличие: фокус на «${idea.slice(0, 40)}»`,
            "Дырка на рынке: конкретный механизм",
          ],
          speechScript: "Конкуренты есть, но есть чёткая дырка, которую мы закрываем.",
        };
      case "pricing":
        return {
          type: "pricing",
          title: SLIDE_TITLES.pricing,
          subtitle: canvas?.moneyModel?.summary || "Монетизация",
          content: [
            "Модель: подписка / комиссия / транзакция",
            `CAC: $${cac} — требует валидации`,
            `LTV: $${ltv} — требует валидации`,
            `LTV/CAC: ${Math.round(ltv / cac)}:1 при подтверждённых цифрах`,
          ],
          speechScript: "Юнит-экономика прозрачна: где цифры подтверждены, где ещё валидируем.",
        };
      case "traction":
        return {
          type: "traction",
          title: SLIDE_TITLES.traction,
          subtitle: "Early stage",
          content: [
            "Стадия: pre-revenue / early traction — указать честно",
            "Сигналы спроса: интервью, waitlist, пилоты",
            "Метрики: пользователи / MRR — только если есть",
            "Следующий milestone за 90 дней",
          ],
          speechScript: "Мы на ранней стадии, но есть сигналы, которые валидируем сейчас.",
        };
      case "launch":
        return {
          type: "launch",
          title: SLIDE_TITLES.launch,
          subtitle: canvas?.goToMarket?.summary || "GTM",
          content: canvas?.goToMarket?.bullets?.length
            ? canvas.goToMarket.bullets
            : [
                "Канал #1: один основной канал привлечения",
                "Первые 1000 пользователей: конкретный план",
                "Партнёрства / контент / B2B — по нише",
                "Метрика успеха GTM за 90 дней",
              ],
          speechScript: "GTM реалистичен: один район, один канал, измеримый результат.",
        };
      case "sauce":
        return {
          type: "sauce",
          title: SLIDE_TITLES.sauce,
          subtitle: "Команда",
          content: [
            "Основатель: роль и релевантный опыт",
            "Ключевые роли: dev / sales / ops",
            "Почему эта команда потянет проект",
            "Пробелы в команде и как закрываем",
          ],
          speechScript: "Команда собрана под конкретную операционную задачу.",
        };
      case "ask":
        return {
          type: "ask",
          title: SLIDE_TITLES.ask,
          subtitle: "Запрос к инвесторам",
          content: [
            `Раунд: $${ask.toLocaleString("en-US")} Pre-seed`,
            "40% — продукт и разработка",
            "35% — GTM и первые клиенты",
            "25% — операционка и runway 12–18 мес",
          ],
          speechScript: `Запрашиваем $${ask.toLocaleString("en-US")} на 12–18 месяцев runway.`,
        };
      case "vision":
        return {
          type: "vision",
          title: SLIDE_TITLES.vision,
          subtitle: "3–5 лет",
          content: [
            "Видение: куда вырастет продукт за 3–5 лет",
            "Почему рынок позволяет стать крупным игроком",
            "Стратегический выход или масштаб — без фантазий",
            "Миссия: одна фраза",
          ],
          speechScript: "Это может стать большим, если мы правы про боль и GTM.",
        };
      default:
        return {
          type,
          title: SLIDE_TITLES[type] || type,
          content: ["Пункт 1", "Пункт 2", "Пункт 3"],
          speechScript: "",
        };
    }
  });

  return {
    id: `deck_${Date.now()}`,
    title: name,
    subtitle: `ИИ-платформа в нише: ${idea}`,
    idea,
    mode: mode as PitchDeck["mode"],
    slides,
    roast: {
      score: 55 + (seed % 25),
      verdict: "ОСТОРОЖНЫЙ ИНТЕРЕС / ТРЕБУЕТ ДЕТАЛЬНОГО АНАЛИЗА",
      roastText: `Питч по теме «${idea}» выглядит структурно, но инвестор захочет увидеть реальные когорты, а не прогнозы. CAC $${cac} — оптимистичен без подтверждённых платных каналов. Moat на старте тонкий, пока нет уникальных данных. Тем не менее, понимание боли и чёткая GTM-стратегия делают проект пригодным для due diligence.`,
      weakSpots: [
        "Moat пока основан на скорости, а не на уникальных данных",
        `CAC $${cac} не подтверждён реальными платными кампаниями`,
        "Зависимость от внешних API и инфраструктуры",
        "Высокий риск churn на ранней стадии",
      ],
      recommendations: [
        "Показать реальные платящие когорты с retention-метриками",
        "Построить data flywheel, который нельзя скопировать за 2 недели",
        "Просчитать stress-сценарий при CAC в 2–3 раза выше плана",
      ],
    },
  };
}

function coerceStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }
  return [];
}

function normalizeSlide(raw: Partial<Slide> | undefined, index: number, idea: string): Slide {
  const fallback = generateLocalDeck(idea, "investor").slides[index];
  const type = (raw?.type as Slide["type"]) || SLIDE_TYPES[index];
  const content = coerceStringArray(raw?.content);

  return {
    type: SLIDE_TYPES.includes(type) ? type : SLIDE_TYPES[index],
    title: raw?.title?.trim() || fallback.title,
    subtitle: raw?.subtitle?.trim() || fallback.subtitle,
    content: index === 0
      ? (content.length ? content : fallback.content)
      : content.length >= 3
        ? content
        : fallback.content,
    speechScript: raw?.speechScript?.trim() || fallback.speechScript,
    visualData: { ...fallback.visualData, ...raw?.visualData },
    image: raw?.image ?? fallback.image,
    imageDescription: raw?.imageDescription ?? fallback.imageDescription,
    founderName: raw?.founderName?.trim() || fallback.founderName,
    founderRole: raw?.founderRole?.trim() || fallback.founderRole,
    brandQuote: raw?.brandQuote?.trim() || fallback.brandQuote,
    badge: raw?.badge || fallback.badge,
    sectionLabel: raw?.sectionLabel || fallback.sectionLabel,
  };
}

export function normalizeDeck(
  raw: Partial<PitchDeck> | null | undefined,
  idea: string,
  mode: string,
  canvas?: Record<string, any>
): PitchDeck {
  const local = generateLocalDeck(idea, mode, canvas);
  const rawSlides = Array.isArray(raw?.slides) ? raw!.slides : [];

  const slides: Slide[] = SLIDE_TYPES.map((_, index) => {
    const fromAi = rawSlides[index] as Partial<Slide> | undefined;
    return normalizeSlide(fromAi, index, idea);
  });

  return {
    id: raw?.id || local.id,
    title: raw?.title?.trim() || local.title,
    subtitle: raw?.subtitle?.trim() || local.subtitle,
    idea,
    mode: (raw?.mode as PitchDeck["mode"]) || (mode as PitchDeck["mode"]),
    slides,
    roast: raw?.roast?.roastText
      ? {
          score: raw.roast.score ?? local.roast!.score,
          verdict: raw.roast.verdict ?? local.roast!.verdict,
          roastText: raw.roast.roastText,
          weakSpots: coerceStringArray(raw.roast.weakSpots).length
            ? coerceStringArray(raw.roast.weakSpots)
            : local.roast!.weakSpots,
          recommendations: coerceStringArray(raw.roast.recommendations).length
            ? coerceStringArray(raw.roast.recommendations)
            : local.roast!.recommendations,
        }
      : local.roast,
  };
}

export function isDeckComplete(raw: Partial<PitchDeck> | null | undefined): boolean {
  if (!raw?.slides || !Array.isArray(raw.slides)) return false;
  if (raw.slides.length < 12) return false;
  const filled = raw.slides.filter(
    (s) => s && coerceStringArray(s.content).length >= 2 && s.title?.trim()
  );
  return filled.length >= 10;
}
