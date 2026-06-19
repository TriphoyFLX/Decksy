import type { PitchDeck, Slide } from "../types";

export interface ProjectBranding {
  companyName: string;
  tagline: string;
  founderName: string;
  founderRole: string;
  quote: string;
  logoImage?: string;
  slideNotes?: string;
}

export const EMPTY_PROJECT_BRANDING: ProjectBranding = {
  companyName: "",
  tagline: "",
  founderName: "",
  founderRole: "Основатель",
  quote: "",
  logoImage: "",
};

export function resolveCompanyName(branding: ProjectBranding | undefined, idea: string): string {
  const name = branding?.companyName?.trim();
  if (name) return name;
  return "Название проекта";
}

export function brandingContextForAI(branding?: ProjectBranding): string {
  if (!branding) return "";
  const lines = [
    branding.companyName?.trim() && `Company name (USE EXACTLY, do not invent another): "${branding.companyName.trim()}"`,
    branding.tagline?.trim() && `Tagline: "${branding.tagline.trim()}"`,
    branding.founderName?.trim() && `Founder: ${branding.founderName.trim()}, role: ${branding.founderRole || "Основатель"}`,
    branding.quote?.trim() && `Brand quote for title slide: "${branding.quote.trim()}"`,
    branding.slideNotes?.trim() &&
      `User wishes for specific slides (reflect in outline bullets): ${branding.slideNotes.trim()}`,
  ].filter(Boolean);
  if (!lines.length) {
    return `
BRANDING NOT PROVIDED BY USER:
- Do NOT invent a company/brand name (no "Ritual Coffee", no creative names).
- Use title slide company name: "Название проекта" until user provides one.
- Leave founder fields empty or use "Основатель" placeholder only.`;
  }
  return `\nUSER-PROVIDED BRANDING (mandatory — never override or rename):\n${lines.join("\n")}`;
}

export function applyBrandingToDeck(
  deck: PitchDeck,
  branding?: ProjectBranding
): PitchDeck {
  if (!deck.slides?.length) return deck;
  const b = branding || EMPTY_PROJECT_BRANDING;
  const company = resolveCompanyName(b, deck.idea);
  const titleSlide = deck.slides[0];
  const slides = [...deck.slides];

  slides[0] = {
    ...titleSlide,
    type: "title",
    title: company,
    subtitle: b.tagline?.trim() || titleSlide.subtitle || deck.idea.slice(0, 100),
    founderName: b.founderName?.trim() || titleSlide.founderName,
    founderRole: b.founderRole?.trim() || titleSlide.founderRole || "Основатель",
    brandQuote: b.quote?.trim() || titleSlide.brandQuote,
    image: b.logoImage || titleSlide.image,
    badge: titleSlide.badge || "PITCH DECK",
    content: buildTitleContent(b, titleSlide),
    speechScript: buildTitleSpeech(company, b, titleSlide.speechScript),
  };

  return { ...deck, title: company, subtitle: slides[0].subtitle, slides };
}

function buildTitleContent(b: ProjectBranding, slide: Slide): string[] {
  const items: string[] = [];
  if (b.founderName?.trim()) {
    items.push(`${b.founderRole || "Основатель"}: ${b.founderName.trim()}`);
  }
  if (b.quote?.trim()) {
    items.push(`«${b.quote.trim()}»`);
  }
  const extra = (slide.content || []).filter(
    (c) =>
      c &&
      !/сгенерировано|seed|инвестиционн/i.test(c) &&
      !items.some((x) => x.includes(c.slice(0, 20)))
  );
  return [...items, ...extra].slice(0, 3);
}

function buildTitleSpeech(company: string, b: ProjectBranding, fallback: string): string {
  if (b.founderName?.trim()) {
    const role = b.founderRole?.trim() || "основатель";
    const quote = b.quote?.trim() ? ` ${b.quote.trim()}` : "";
    return `Добрый день! Меня зовут ${b.founderName.trim()}, я ${role} ${company}.${quote ? ` Наш слоган: «${b.quote.trim()}».` : ""} Сегодня представляю проект и покажу, почему это сильная бизнес-возможность.`;
  }
  return fallback;
}

function pickBulletValue(bullets: string[], pattern: RegExp): string {
  const line = bullets.find((b) => pattern.test(b));
  if (!line) return "";
  return line.replace(/^[^:]+:\s*/i, "").replace(/^«|»$/g, "").trim();
}

export function parseBrandingFromCanvas(canvas?: Record<string, any>): ProjectBranding {
  const b = canvas?.branding;
  const bullets = Array.isArray(b?.bullets) ? b.bullets : [];
  const slideNotesBullets = bullets.filter((x: string) => /слайд|пожелан|хочу на/i.test(x));
  const slideNotes = slideNotesBullets.join("\n") || bullets.slice(5).join("\n");
  return {
    companyName:
      pickBulletValue(bullets, /назван|компан/i) ||
      bullets[0]?.replace(/^название:\s*/i, "") ||
      b?.summary?.split("|")[0]?.trim() ||
      "",
    tagline: pickBulletValue(bullets, /слоган|tagline/i) || bullets[1]?.replace(/^слоган:\s*/i, "") || "",
    founderName:
      pickBulletValue(bullets, /основатель|founder|ceo/i) ||
      bullets[2]?.replace(/^основатель:\s*/i, "") ||
      "",
    founderRole: pickBulletValue(bullets, /роль|role/i) || bullets[3] || "Основатель",
    quote: pickBulletValue(bullets, /цитат|quote/i) || bullets[4]?.replace(/^«|»$/g, "") || "",
    slideNotes: slideNotes || undefined,
    logoImage: canvas?._logoImage,
  };
}

export function mergeBrandingFromInterview(
  canvas: Record<string, any> | undefined,
  current: ProjectBranding,
  sessionImages: { description: string; image: string }[] = []
): ProjectBranding {
  const fromCanvas = parseBrandingFromCanvas(canvas);
  const logoImg = sessionImages.find((i) => /лого/i.test(i.description))?.image;
  return {
    ...current,
    companyName: fromCanvas.companyName || current.companyName,
    tagline: fromCanvas.tagline || current.tagline,
    founderName: fromCanvas.founderName || current.founderName,
    founderRole: fromCanvas.founderRole || current.founderRole,
    quote: fromCanvas.quote || current.quote,
    slideNotes: fromCanvas.slideNotes || current.slideNotes,
    logoImage: logoImg || current.logoImage || fromCanvas.logoImage,
  };
}
