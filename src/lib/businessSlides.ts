import type { Slide } from "../types";

/** Investor-grade pitch deck: title + 11 business blocks */
export const BUSINESS_SLIDE_SPECS: Record<Slide["type"], { emoji: string; title: string; mustCover: string[] }> = {
  title: {
    emoji: "🏷",
    title: "Титульный",
    mustCover: ["Название", "Слоган", "Основатель", "Логотип"],
  },
  problem: {
    emoji: "💥",
    title: "Хук — Problem",
    mustCover: [
      "Какую боль решает проект?",
      "У кого эта боль (ЦА)?",
      "Насколько острая: частота / деньги / масштаб",
    ],
  },
  solution: {
    emoji: "⚡",
    title: "Решение — Solution",
    mustCover: [
      "Что именно делает продукт (1–2 предложения без воды)",
      "Почему это работает",
    ],
  },
  product: {
    emoji: "🧠",
    title: "Продукт",
    mustCover: [
      "Что внутри (фичи)",
      "Как пользователь взаимодействует (flow)",
      "MVP / демо / прототип — что есть сейчас",
    ],
  },
  market: {
    emoji: "📊",
    title: "Рынок — Market",
    mustCover: [
      "TAM / SAM / SOM (хотя бы грубо)",
      "Кто платит деньги",
      "Почему рынок растёт",
    ],
  },
  competition: {
    emoji: "🧨",
    title: "Конкуренты",
    mustCover: [
      "Кто уже делает это",
      "Почему они хуже / где дырка",
      "Ваше позиционирование",
    ],
  },
  pricing: {
    emoji: "💸",
    title: "Бизнес-модель",
    mustCover: [
      "Как зарабатываете",
      "Цена / подписка / комиссия",
      "Unit-экономика: CAC и LTV (базово, или «требует валидации»)",
    ],
  },
  traction: {
    emoji: "🚀",
    title: "Traction",
    mustCover: [
      "Пользователи / выручка / рост — если есть",
      "Если нет — честно: early stage, что валидируете",
      "Пилоты / кейсы",
    ],
  },
  launch: {
    emoji: "🛠",
    title: "Go-To-Market",
    mustCover: [
      "Как привлекаете пользователей",
      "Каналы (TikTok, B2B, SEO, партнёрки)",
      "Первые 1000 пользователей — откуда",
    ],
  },
  sauce: {
    emoji: "👥",
    title: "Команда",
    mustCover: [
      "Кто делает проект",
      "Почему они потянут",
      "Роли: dev / CEO / sales",
    ],
  },
  ask: {
    emoji: "💰",
    title: "Финансы / запрос",
    mustCover: [
      "Сколько денег нужно",
      "На что именно",
      "Runway и что получит инвестор",
    ],
  },
  vision: {
    emoji: "🧾",
    title: "Vision",
    mustCover: [
      "Куда это ведёт через 3–5 лет",
      "Почему может стать большим",
    ],
  },
  risks: {
    emoji: "⚠️",
    title: "Риски",
    mustCover: ["Операционные риски", "Митигация"],
  },
  tech: {
    emoji: "⚙️",
    title: "Технология",
    mustCover: ["Стек", "Масштабирование"],
  },
};

export function businessPromptForAI(): string {
  return Object.entries(BUSINESS_SLIDE_SPECS)
    .filter(([type]) => type !== "risks" && type !== "tech")
    .map(([type, spec]) => {
      const lines = spec.mustCover.map((l) => `    - ${l}`).join("\n");
      return `${spec.emoji} type="${type}" — ${spec.title}:\n${lines}`;
    })
    .join("\n\n");
}
