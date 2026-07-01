import type { Mode, PitchCanvas, CanvasSection } from "../types";

export const DECK_GENERATION_TOKEN_COST = 100;

export const PLAN_TOKEN_ALLOWANCE: Record<string, number> = {
  Free: 100,
  Base: 500,
  Middle: 1500,
  Pro: 3000,
};

export type InterviewBlockKey =
  | "branding"
  | "problem"
  | "problemProof"
  | "solution"
  | "product"
  | "whyNow"
  | "market"
  | "team"
  | "traction"
  | "moneyModel"
  | "competitors"
  | "goToMarket"
  | "roadmap"
  | "ask"
  | "risks";

export interface InterviewBlockSpec {
  key: InterviewBlockKey;
  canvasTitle: string;
  question: string;
  articleRef: string;
}

/** Полный порядок вопросов по логике инвесторского питч-дека (статья + 12 слайдов Decksy). */
export const INTERVIEW_BLOCKS: InterviewBlockSpec[] = [
  {
    key: "branding",
    canvasTitle: "✨ Брендинг",
    articleRef: "Обложка",
    question:
      "Брендинг и титул: • точное название компании • слоган или цитата для обложки • ваше имя и роль • пожелания по слайдам (лого, фото команды и т.д.)",
  },
  {
    key: "problem",
    canvasTitle: "🧩 Проблема",
    articleRef: "Проблема — формулировка",
    question:
      "Проблема: • кто ваш платящий клиент • какую боль решаете (1–2 предложения без технических деталей) • почему это важно для клиента прямо сейчас",
  },
  {
    key: "problemProof",
    canvasTitle: "📉 Валидация проблемы",
    articleRef: "Проблема — цифры и источники",
    question:
      "Подтверждение проблемы: • статистика или факты (цифры, %, объём) • откуда данные (источник) • готовы ли платить за решение сегодня",
  },
  {
    key: "solution",
    canvasTitle: "⚙️ Решение",
    articleRef: "Решение",
    question:
      "Решение: • что делает продукт в 1–2 предложениях • почему это работает лучше текущих альтернатив • главный результат для клиента",
  },
  {
    key: "product",
    canvasTitle: "🧠 Продукт",
    articleRef: "Продукт — механика",
    question:
      "Продукт: • как пользователь проходит путь (шаг 1 → 2 → 3) • 2–3 ключевые фичи • что уже есть (MVP, демо, прототип)",
  },
  {
    key: "whyNow",
    canvasTitle: "⏱ Почему сейчас",
    articleRef: "Контекст / Why Now",
    question:
      "Почему сейчас: • что изменилось на рынке/в технологии • 2–3 драйвера роста спроса • почему окно возможности открыто именно сейчас",
  },
  {
    key: "market",
    canvasTitle: "👥 Рынок",
    articleRef: "Рынок",
    question:
      "Рынок: • TAM / SAM / SOM (хотя бы оценка) • кто платит • CAGR или почему рынок растёт • 2–3 драйвера роста на 3–5 лет",
  },
  {
    key: "team",
    canvasTitle: "👤 Команда",
    articleRef: "Команда",
    question:
      "Команда: • кто в core-team (имя, роль) • 2–3 измеримых результата каждого (не «делал», а «вырастил X») • какие компетенции закрыты, чего не хватает",
  },
  {
    key: "traction",
    canvasTitle: "🚀 Traction",
    articleRef: "Summary / текущие результаты",
    question:
      "Traction: • выручка / пользователи / пилоты / LOI — если есть • если pre-seed без метрик — честно напишите «нет traction» и что валидируете • динамика по месяцам/кварталам",
  },
  {
    key: "moneyModel",
    canvasTitle: "💵 Монетизация",
    articleRef: "Бизнес-модель + Unit Economics",
    question:
      "Монетизация: • как зарабатываете (подписка, комиссия, разовая) • цена • LTV, CAC, LTV:CAC — если знаете; иначе «требует валидации» • contribution margin если есть",
  },
  {
    key: "competitors",
    canvasTitle: "🥊 Конкуренты",
    articleRef: "Конкурентный анализ",
    question:
      "Конкуренты: • альтернативные способы решить проблему (не только прямые конкуренты) • 2–4 ваших преимущества • почему клиент уйдёт к вам",
  },
  {
    key: "goToMarket",
    canvasTitle: "📣 GTM",
    articleRef: "Стратегия выхода на рынок",
    question:
      "Go-to-market: • первый конкретный рынок (страна/сегмент, не «Европа») • каналы привлечения • как получите первых 100–1000 клиентов",
  },
  {
    key: "roadmap",
    canvasTitle: "🗺 Roadmap",
    articleRef: "Roadmap",
    question:
      "Roadmap на 12–18 мес.: • ключевые вехи по кварталам • новые продукты / рынки / найм / партнёрства • что даст кратный рост к следующему раунду",
  },
  {
    key: "ask",
    canvasTitle: "💰 Раунд",
    articleRef: "Детали раунда",
    question:
      "Запрос инвестиций: • сколько привлекаете • на что пойдут деньги (% по статьям) • runway • что инвестор получит (доля, use of funds)",
  },
  {
    key: "risks",
    canvasTitle: "⚡ Риски",
    articleRef: "Риски",
    question:
      "Риски: • 2–3 главных операционных риска • как их снижаете • что может пойти не так при масштабировании",
  },
];

const MODE_BLOCKS: Record<Mode, InterviewBlockKey[]> = {
  quick: [
    "branding",
    "problem",
    "solution",
    "market",
    "moneyModel",
    "competitors",
    "goToMarket",
    "ask",
  ],
  investor: [
    "branding",
    "problem",
    "problemProof",
    "solution",
    "product",
    "whyNow",
    "market",
    "team",
    "traction",
    "moneyModel",
    "competitors",
    "goToMarket",
    "roadmap",
    "ask",
    "risks",
  ],
  shark: [
    "branding",
    "problem",
    "problemProof",
    "solution",
    "product",
    "whyNow",
    "market",
    "team",
    "traction",
    "moneyModel",
    "competitors",
    "goToMarket",
    "roadmap",
    "ask",
    "risks",
  ],
};

export function getInterviewBlocksForMode(mode: Mode): InterviewBlockSpec[] {
  const keys = MODE_BLOCKS[mode] || MODE_BLOCKS.investor;
  return keys
    .map((key) => INTERVIEW_BLOCKS.find((b) => b.key === key))
    .filter((b): b is InterviewBlockSpec => Boolean(b));
}

export function getRequiredBlockCount(mode: Mode): number {
  return getInterviewBlocksForMode(mode).length;
}

export function isCanvasSection(value: unknown): value is CanvasSection {
  return Boolean(value && typeof value === "object" && "status" in (value as CanvasSection));
}

export function countCompiledBlocks(canvas: PitchCanvas, mode: Mode): number {
  const keys = getInterviewBlocksForMode(mode).map((b) => b.key);
  return keys.filter((key) => canvas[key]?.status === "compiled").length;
}

export function getNextInterviewBlock(canvas: PitchCanvas, mode: Mode): InterviewBlockSpec | null {
  const blocks = getInterviewBlocksForMode(mode);
  return blocks.find((block) => canvas[block.key]?.status !== "compiled") || null;
}

export function isInterviewComplete(
  canvas: PitchCanvas,
  mode: Mode,
  userTurns: number,
  options?: { skipTurnCheck?: boolean },
): boolean {
  const blocks = getInterviewBlocksForMode(mode);
  const allCompiled = blocks.every((block) => canvas[block.key]?.status === "compiled");
  if (!allCompiled) return false;
  if (options?.skipTurnCheck) return true;
  return userTurns >= blocks.length;
}

export function buildInterviewQuestion(block: InterviewBlockSpec, idea: string, mode: Mode): string {
  const prefix =
    mode === "shark"
      ? "Следующий блок — "
      : mode === "quick"
        ? "Короткий режим — "
        : "Следующий блок — ";
  return `${prefix}${block.canvasTitle.replace(/^[^\s]+\s/, "")}: ${block.question} (идея: «${idea}»). Ответьте по пунктам (•).`;
}

export function buildInitialBrandingQuestion(idea: string): string {
  const block = INTERVIEW_BLOCKS[0];
  return `Привет! Идея: «${idea}». Начнём с обложки деки.\n${block.question}\nЗагрузите лого и фото через кнопку «Фото» внизу чата. Ответьте по пунктам (•).`;
}

export function createEmptyCanvasSection(title: string, summary: string): CanvasSection {
  return { title, summary, bullets: [], status: "locked" };
}

export function createInitialCanvas(): PitchCanvas {
  const canvas = {} as PitchCanvas;
  for (const block of INTERVIEW_BLOCKS) {
    canvas[block.key] = createEmptyCanvasSection(
      block.canvasTitle,
      `Собираем блок «${block.canvasTitle}» по ходу интервью...`
    );
  }
  return canvas;
}

export function getPlanTokenAllowance(plan?: string | null, role?: string | null): number {
  if (role === "admin") return Number.POSITIVE_INFINITY;
  return PLAN_TOKEN_ALLOWANCE[plan || "Free"] ?? PLAN_TOKEN_ALLOWANCE.Free;
}

export function canAffordDeckGeneration(
  tokenBalance: number | undefined,
  role?: string | null
): boolean {
  if (role === "admin") return true;
  return (tokenBalance ?? 0) >= DECK_GENERATION_TOKEN_COST;
}
