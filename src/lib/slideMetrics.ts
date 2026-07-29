/** Detects real numeric metrics — not random Cyrillic letters from words. */
export function extractMetricValue(str: string): string | null {
  if (!str?.trim()) return null;

  const withUnit = str.match(
    /(?:↑|↓)?\s*(?:[$€£₽]\s*)?\d[\d\s,.]*(?:[.,]\d+)?\s*(?:%|x|×|X|млн|млрд|тыс\.?|bn|mn|b|k|K|M|B|\+)?/i
  );
  if (withUnit) {
    const v = withUnit[0].trim();
    if (/\d/.test(v)) return v;
  }

  const pct = str.match(/\d[\d,.]*\s*%/);
  if (pct) return pct[0].trim();

  return null;
}

export function looksLikeMetric(str: string): boolean {
  return extractMetricValue(str) !== null;
}

/** Short label for slide frame header/footer — never overflow the slide. */
export function formatDeckFrameLabel(name: string, maxLen = 32): string {
  const cleaned = name.replace(/\s+/g, " ").trim();
  if (!cleaned) return "Проект";
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen - 1).trim()}…`;
}

const JUNK_TITLE_RE =
  /скачать|заказать|бизнес[-\s]?план|шаблон|бесплатн|скопируй|нажми|перейди|купить\s+сейчас/i;

export function sanitizeCompanyName(name: string | undefined | null, fallback = "Название проекта"): string {
  const trimmed = name?.replace(/\s+/g, " ").trim() || "";
  if (!trimmed) return fallback;
  if (trimmed.length > 72 || JUNK_TITLE_RE.test(trimmed)) return fallback;
  return trimmed;
}
