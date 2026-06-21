/** Detects a short natural-language request to create a document (not pasted draft text). */
export function isWordGenerationPrompt(text: string): boolean {
  const raw = text.trim();
  const t = raw.toLowerCase();
  if (t.length < 8) return false;

  const hasCommand = /(?:^|\s)(?:сделай|напиши|составь|создай|подготовь|сгенерируй|оформи|сформируй)(?:\s|$)/.test(t);
  const hasDocType =
    /(?:документ|докс|docx|word|ворд|реферат|сочинен|проект|домашн|отчёт|отчет|стать|курсов|исследовательск)/.test(t);
  const topicOnly = /^(?:реферат|сочинение|проект|документ|докс|docx)\s+(?:про|на тему|о)\s+/i.test(raw);
  const looksLikeDraft =
    raw.length >= 120 || /\n{2,}/.test(raw) || /(?:^|\n)\s*(?:цель|задачи|введение|гипотеза)\s*:/im.test(raw);

  if (looksLikeDraft && !hasCommand) return false;
  if (topicOnly) return true;
  if (hasCommand && hasDocType) return true;
  if (hasCommand && /(?:про|на тему|о)\s+\S+/i.test(raw) && raw.length < 160) return true;

  return false;
}

/** Pulls the subject/topic out of prompts like «Сделай проект про робототехнику». */
export function extractWordPromptTopic(text: string): string {
  const t = text.trim();
  const patterns = [
    /(?:проект|реферат|сочинение|документ|докс|docx|word|ворд)\s+(?:про|на тему|о)\s+(.+)/i,
    /(?:про|на тему|о)\s+([^.!?\n]+)/i,
    /(?:сделай|напиши|создай|составь|подготовь|сгенерируй|оформи)\s+(?:мне\s+)?(?:школьный\s+)?(?:проект|реферат|сочинение|документ|докс|docx|word)?\s*(?:про|на тему|о)?\s*(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = t.match(pattern);
    if (match?.[1]?.trim()) {
      return match[1].trim().replace(/[.!?]+$/, "").slice(0, 200);
    }
  }

  return t
    .replace(/^(?:сделай|напиши|создай|составь|подготовь|сгенерируй|оформи)\s+(?:мне\s+)?/i, "")
    .replace(/(?:школьный\s+)?(?:проект|реферат|сочинение|документ|докс|docx|word|ворд)\s*/i, "")
    .trim()
    .slice(0, 200) || t;
}

export function minWordInputLength(text: string): number {
  return isWordGenerationPrompt(text) ? 12 : 30;
}

export type WordGenerationMode = "prompt" | "improve";

export function resolveWordGenerationMode(text: string, requested?: string): WordGenerationMode {
  if (requested === "prompt" || requested === "improve") return requested;
  return isWordGenerationPrompt(text) ? "prompt" : "improve";
}
