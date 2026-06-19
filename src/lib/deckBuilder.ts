import { PitchDeck, Slide } from "../types";
import { resolveCompanyName, type ProjectBranding } from "./projectBranding";

export const SLIDE_TYPES: Slide["type"][] = [
  "title",
  "problem",
  "solution",
  "market",
  "pricing",
  "sauce",
  "competition",
  "launch",
  "risks",
  "ask",
];

const SLIDE_TITLES = [
  "Титульный слайд",
  "Проблема: Острая боль рынка",
  "Решение: Продукт и ценность",
  "Рынок и Целевая Аудитория",
  "Бизнес-Модель: Юнит-Экономика",
  "Secret Sauce: Технологический Moat",
  "Конкурентное преимущество",
  "Стратегия Выхода на Рынок (GTM)",
  "Анализ Рисков и Безопасность",
  "Финансовый Раунд и Цели",
];

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

  const slides: Slide[] = [
    {
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
        ? `Добрый день! Меня зовут ${branding.founderName}, я ${branding.founderRole || "основатель"} ${name}. Представляю проект: ${idea}.`
        : `Добрый день! Представляю проект: ${idea}. Покажу проблему, решение и бизнес-модель.`,
    },
    {
      type: "problem",
      title: SLIDE_TITLES[1],
      subtitle: canvas?.problem?.summary || "Friction in the target market",
      content: problemBullets,
      speechScript: `Ключевая проблема рынка: миллионы пользователей сталкиваются с неэффективными решениями в сфере «${idea}». Текущие инструменты слишком сложны и дороги. Наши исследования показали, что ${pick([65, 72, 78, 83], seed)}% целевой аудитории готовы перейти на современную альтернативу прямо сейчас.`,
    },
    {
      type: "solution",
      title: SLIDE_TITLES[2],
      subtitle: canvas?.solution?.summary || "Automated smart platform",
      content: solutionBullets,
      speechScript: `Наше решение — ${name}: платформа, которая закрывает боль за счёт автоматизации и ИИ. Пользователь получает результат за минуты, а не недели. Мы сокращаем time-to-value в 10 раз и делаем сложные процессы доступными каждому.`,
    },
    {
      type: "market",
      title: SLIDE_TITLES[3],
      subtitle: canvas?.market?.summary || "TAM / SAM / SOM",
      content: [
        `TAM (Общий объём рынка): ${formatMoney(tam)} на глобальном уровне`,
        `SAM (Доступный объём): ${formatMoney(sam)} в целевых регионах СНГ и Европы`,
        `SOM (Цель на 3 года): ${formatMoney(som)} при ${users.toLocaleString("ru-RU")} активных пользователей`,
        `Рынок растёт на ${growth}% в год благодаря цифровизации и спросу на ИИ-решения`,
      ],
      speechScript: `Мы работаем на рынке объёмом ${formatMoney(tam)}. Наш реалистичный SOM — ${formatMoney(som)} за три года. Сегмент растёт на ${growth}% ежегодно, и ${name} попадает в идеальное окно возможностей.`,
    },
    {
      type: "pricing",
      title: SLIDE_TITLES[4],
      subtitle: canvas?.moneyModel?.summary || "SaaS + usage-based",
      content: [
        `Тариф Starter: $${pick([9, 12, 15, 19], seed)}/мес — для индивидуальных пользователей`,
        `Тариф Pro: $${pick([29, 39, 49, 59], seed)}/мес — для команд до 10 человек`,
        `Тариф Enterprise: от $${pick([99, 149, 199], seed)}/мес — кастомизация и SLA`,
        `LTV: $${ltv} при CAC $${cac} — соотношение LTV/CAC = ${Math.round(ltv / cac)}:1`,
      ],
      speechScript: `Бизнес-модель — гибридная SaaS-подписка с usage-based компонентом. При CAC в $${cac} и LTV $${ltv} юнит-экономика устойчива. Средний чек растёт на 15% каждые 6 месяцев за счёт апсейлов.`,
    },
    {
      type: "sauce",
      title: SLIDE_TITLES[5],
      subtitle: "Проприетарные алгоритмы и data moat",
      content: [
        `Собственная ML-модель, обученная на ${pick([50, 80, 120, 200], seed)}K+ размеченных данных ниши`,
        "Уникальный feedback loop: каждый новый пользователь улучшает точность на 0.3%",
        `Патентуемая архитектура pipeline — время отклика < ${pick([80, 120, 200], seed)} мс`,
        "Vendor lock-in через накопленные пользовательские данные и персонализацию",
      ],
      speechScript: `Наш технологический барьер — проприетарные алгоритмы и data flywheel. Чем больше пользователей, тем точнее продукт. Это создаёт защитный ров, который невозможно скопировать за пару недель.`,
    },
    {
      type: "competition",
      title: SLIDE_TITLES[6],
      subtitle: canvas?.competitors?.summary || "Почему мы выигрываем",
      content: [
        "Крупные универсальные платформы — слишком сложны и нефокусированы",
        "Ручной труд и агентства — в 20–30 раз дороже при сопоставимом качестве",
        `Наш Moat: узкая специализация на «${idea.slice(0, 40)}» + скорость внедрения`,
        `Снижение churn на ${pick([35, 42, 50], seed)}% за счёт персонализации и community`,
      ],
      speechScript: `Конкуренты либо слишком универсальны, либо слишком дороги. Мы занимаем sweet spot: узкий фокус, мгновенный запуск, ИИ-автоматизация. Это даёт нам преимущество в скорости и удержании.`,
    },
    {
      type: "launch",
      title: SLIDE_TITLES[7],
      subtitle: canvas?.goToMarket?.summary || "Viral GTM loops",
      content: canvas?.goToMarket?.bullets?.length
        ? canvas.goToMarket.bullets
        : [
            "Product-led growth: бесплатный tier с вирусным шерингом результатов",
            `Реферальная программа: приведи друга — ${pick([1, 2, 3], seed)} месяца Pro бесплатно`,
            "Партнёрства с 15+ инфлюенсерами и профильными комьюнити",
            `План: ${pick([500, 1000, 2000], seed)} платящих клиентов за первые 6 месяцев`,
          ],
      speechScript: `Go-to-market строится на product-led growth и виральности. Мы не сжигаем бюджет на рекламу — продукт сам себя продаёт. Первые ${pick([500, 1000, 2000], seed)} клиентов — через комьюнити, рефералы и контент-маркетинг.`,
    },
    {
      type: "risks",
      title: SLIDE_TITLES[8],
      subtitle: canvas?.risks?.summary || "Risk map & mitigation",
      content: canvas?.risks?.bullets?.length
        ? canvas.risks.bullets
        : [
            "Риск: Копирование гигантами — Митигация: скорость итераций в 10x + узкая ниша",
            "Риск: Высокий churn — Митигация: геймификация, onboarding и customer success",
            "Риск: Зависимость от API — Митигация: гибридная on-premise + cloud архитектура",
          ],
      speechScript: `Мы честно оцениваем риски. Главный — копирование крупными игроками, но наш фокус и скорость дают фору в 12–18 месяцев. Для каждого риска есть конкретный план митигации.`,
    },
    {
      type: "ask",
      title: SLIDE_TITLES[9],
      subtitle: "Инвестиции для кратного роста",
      content: [
        `Ищем: $${ask.toLocaleString("en-US")} за ${pick([8, 10, 12, 15], seed)}% доли (Pre-seed)`,
        "50% — Разработка продукта и R&D (ИИ, мобильные клиенты)",
        "30% — Маркетинг, GTM и привлечение первых 2000 клиентов",
        "20% — Операционные расходы, юридика, compliance",
        `Цель: $${mrr}K MRR за 12 месяцев, break-even на 18-м месяце`,
      ],
      speechScript: `Мы привлекаем $${ask.toLocaleString("en-US")} на Pre-seed. За 12 месяцев выходим на $${mrr}K MRR. Эти средства — топливо для захвата рынка, пока окно возможностей открыто. Буду рад ответить на ваши вопросы!`,
    },
  ];

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
  if (raw.slides.length < 10) return false;
  const filled = raw.slides.filter(
    (s) => s && coerceStringArray(s.content).length >= 3 && s.title?.trim()
  );
  return filled.length >= 10;
}
