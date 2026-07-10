import type { Mode, PitchCanvas, CanvasSection } from "../types";
import {
  getInterviewBlocksForMode,
  INTERVIEW_BLOCKS,
  type InterviewBlockKey,
} from "./interviewFlow";

const BLOCK_KEYWORDS: Record<InterviewBlockKey, RegExp[]> = {
  branding: [/бренд/i, /название/i, /логотип/i, /слоган/i, /компани/i, /обложк/i],
  problem: [/проблем/i, /боль/i, /pain/i, /бол[ьи]/i, /потребност/i],
  problemProof: [/валидац/i, /подтвержден/i, /статистик/i, /исследован/i, /опрос/i, /данные о проблем/i],
  solution: [/решени/i, /подход/i, /value proposition/i, /ценност/i],
  product: [/продукт/i, /mvp/i, /функцион/i, /платформ/i, /сервис/i, /приложен/i, /механик/i],
  whyNow: [/почему сейчас/i, /why now/i, /окно возможност/i, /тренд/i, /контекст/i],
  market: [/рынок/i, /\btam\b/i, /\bsam\b/i, /\bsom\b/i, /cagr/i, /ёмкость/i, /емкость/i, /сегмент/i],
  team: [/команд/i, /основател/i, /ceo/i, /founder/i, /управлен/i],
  traction: [/traction/i, /метрик/i, /выручк/i, /пользовател/i, /пилот/i, /loi/i, /продаж/i, /mrr/i, /arr/i],
  moneyModel: [/монетизац/i, /бизнес-модел/i, /unit economics/i, /ltv/i, /cac/i, /марж/i, /подпис/i, /тариф/i],
  competitors: [/конкурент/i, /альтернатив/i, /сравнен/i, /benchmark/i],
  goToMarket: [/go-to-market/i, /gtm/i, /маркетинг/i, /канал/i, /привлечен/i, /продвижен/i, /выход на рынок/i],
  roadmap: [/roadmap/i, /дорожн/i, /план развит/i, /вех/i, /квартал/i],
  ask: [/раунд/i, /инвестиц/i, /привлечен/i, /use of funds/i, /runway/i, /запрос/i, /оценк/i],
  risks: [/риск/i, /угроз/i, /митигац/i],
};

const SHEET_KEYWORDS: Record<InterviewBlockKey, RegExp[]> = {
  branding: [/бренд/i, /компани/i],
  problem: [/проблем/i],
  problemProof: [/валидац/i, /исследован/i],
  solution: [/решени/i],
  product: [/продукт/i, /функцион/i],
  whyNow: [/тренд/i, /контекст/i],
  market: [/рынок/i, /tam/i, /sam/i],
  team: [/команд/i, /кадр/i],
  traction: [/метрик/i, /выручк/i, /продаж/i, /финанс/i],
  moneyModel: [/финанс/i, /p&l/i, /unit/i, /монетизац/i, /бюджет/i],
  competitors: [/конкурент/i],
  goToMarket: [/маркетинг/i, /gtm/i, /канал/i],
  roadmap: [/roadmap/i, /план/i],
  ask: [/инвестиц/i, /раунд/i, /финанс/i],
  risks: [/риск/i],
};

function extractBullets(text: string): string[] {
  const bullets: string[] = [];
  for (const rawLine of text.split(/\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const bulletMatch = line.match(/^(?:[\u2022•\-\*–—]|\d+[\.\)])\s+(.+)$/);
    if (bulletMatch) {
      bullets.push(bulletMatch[1].trim());
      continue;
    }
    if (line.length >= 24 && line.length <= 220 && !/^[=\-#]{3,}/.test(line)) {
      bullets.push(line);
    }
  }
  return [...new Set(bullets)].slice(0, 8);
}

function scoreBlock(title: string, body: string, key: InterviewBlockKey): number {
  const haystack = `${title}\n${body.slice(0, 4000)}`;
  let score = 0;
  for (const re of BLOCK_KEYWORDS[key]) {
    if (re.test(title)) score += 4;
    if (re.test(haystack)) score += 2;
  }
  return score;
}

function splitSections(text: string): Array<{ title: string; body: string }> {
  const sections: Array<{ title: string; body: string }> = [];
  const lines = text.split(/\n/);
  let currentTitle = "Общий текст";
  let currentBody: string[] = [];

  const flush = () => {
    const body = currentBody.join("\n").trim();
    if (body.length >= 30) {
      sections.push({ title: currentTitle, body });
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const headingMatch = trimmed.match(
      /^(?:={2,}\s*Лист\s*[«"]([^»"]+)[»"]\s*={2,}|#{1,3}\s*(.+)|(?:\d+(?:\.\d+)*)[\.\)]\s*(.{4,80}))$/,
    );
    if (headingMatch) {
      flush();
      currentTitle = (headingMatch[1] || headingMatch[2] || headingMatch[3] || "Раздел").trim();
      currentBody = [];
      continue;
    }
    if (/^[A-ZА-ЯЁ][A-ZА-ЯЁ0-9\s\-\/]{3,60}$/.test(trimmed) && trimmed.length <= 60) {
      flush();
      currentTitle = trimmed;
      currentBody = [];
      continue;
    }
    currentBody.push(line);
  }
  flush();

  if (sections.length === 0 && text.trim().length >= 40) {
    sections.push({ title: "Документ", body: text.trim() });
  }
  return sections;
}

function buildSection(
  blockKey: InterviewBlockKey,
  body: string,
  title: string,
): CanvasSection {
  const block = INTERVIEW_BLOCKS.find((b) => b.key === blockKey)!;
  const bullets = extractBullets(body);
  const summarySource =
    bullets[0] ||
    body
      .split(/\n/)
      .map((l) => l.trim())
      .find((l) => l.length >= 30) ||
    body.slice(0, 220).trim();

  const hasNumbers = /\d[\d\s.,]*(?:%|₽|\$|млн|млрд|тыс|k\b|m\b)/i.test(body);
  const richEnough = bullets.length >= 2 || (summarySource.length >= 80 && hasNumbers);
  const partial = bullets.length >= 1 || summarySource.length >= 50;

  return {
    title: block.canvasTitle,
    summary: summarySource.slice(0, 280),
    bullets: bullets.slice(0, 6),
    status: richEnough ? "compiled" : partial ? "thinking" : "locked",
  };
}

function assignSectionsToBlocks(
  sections: Array<{ title: string; body: string }>,
  mode: Mode,
): Partial<PitchCanvas> {
  const requiredKeys = getInterviewBlocksForMode(mode).map((b) => b.key);
  const assigned: Partial<Record<InterviewBlockKey, { title: string; body: string }>> = {};

  for (const section of sections) {
    let bestKey: InterviewBlockKey | null = null;
    let bestScore = 0;

    for (const key of requiredKeys) {
      let score = scoreBlock(section.title, section.body, key);
      for (const re of SHEET_KEYWORDS[key]) {
        if (re.test(section.title)) score += 3;
      }
      if (score > bestScore) {
        bestScore = score;
        bestKey = key;
      }
    }

    if (bestKey && bestScore >= 2) {
      const prev = assigned[bestKey];
      assigned[bestKey] = {
        title: section.title,
        body: prev ? `${prev.body}\n\n${section.body}` : section.body,
      };
    }
  }

  const updates: Partial<PitchCanvas> = {};
  for (const key of requiredKeys) {
    const chunk = assigned[key];
    if (chunk) {
      updates[key] = buildSection(key, chunk.body, chunk.title);
    }
  }
  return updates;
}

export function parseBriefLocally(
  briefText: string,
  idea: string,
  mode: Mode,
): {
  canvasUpdates: Partial<PitchCanvas>;
  missingBlockKeys: InterviewBlockKey[];
  summary: string;
} {
  const sections = splitSections(briefText);
  const canvasUpdates = assignSectionsToBlocks(sections, mode);
  const requiredKeys = getInterviewBlocksForMode(mode).map((b) => b.key);

  if (!canvasUpdates.branding && idea.trim().length >= 10) {
    canvasUpdates.branding = {
      title: INTERVIEW_BLOCKS[0].canvasTitle,
      summary: idea.trim().slice(0, 200),
      bullets: [idea.trim()],
      status: "thinking",
    };
  }

  const missingBlockKeys = requiredKeys.filter(
    (key) => canvasUpdates[key]?.status !== "compiled",
  );
  const compiled = requiredKeys.filter((key) => canvasUpdates[key]?.status === "compiled").length;
  const chars = briefText.length;

  const summary =
    compiled > 0
      ? `Локально разобрал документы (${chars.toLocaleString("ru-RU")} симв.): заполнено ${compiled} из ${requiredKeys.length} блоков. Для точного AI-разбора добавьте GEN_API_KEY в .env.`
      : `Текст извлечён (${chars.toLocaleString("ru-RU")} симв.), но по разделам мало совпадений — дополню вопросами в чате. Для AI-разбора добавьте GEN_API_KEY в .env.`;

  return { canvasUpdates, missingBlockKeys, summary };
}

export function isLlmConfigured(): boolean {
  const gemini = process.env.GEMINI_API_KEY?.trim();
  const gen = process.env.GEN_API_KEY?.trim();
  const valid = (v?: string) =>
    Boolean(v && v !== "MY_GEMINI_API_KEY" && !v.startsWith("CHANGE_ME"));
  return valid(gemini) || valid(gen);
}
