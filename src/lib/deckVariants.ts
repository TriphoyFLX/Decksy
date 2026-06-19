import type { PitchDeck, Slide } from "../types";
import { type DeckTemplateId, resolveLayoutEngine } from "./deckTheme";

export type DeckTemplate = DeckTemplateId;

const SLIDE_VARIANTS: Record<string, string[]> = {
  title: ["hero-centered", "hero-bold", "hero-minimal"],
  problem: ["stats-grid", "pain-stack", "split-quote"],
  solution: ["product-split", "feature-columns", "demo-hero"],
  market: ["metric-row", "chart-focus", "tam-bento"],
  pricing: ["price-tiers", "unit-economics", "revenue-ladder"],
  sauce: ["team-grid", "moat-tech", "ip-stack"],
  competition: ["matrix-2x2", "compare-table", "positioning"],
  launch: ["roadmap", "milestone-track", "gtm-funnel"],
  risks: ["risk-cards", "mitigation-grid", "scenario-split"],
  ask: ["cta-center", "funding-split", "contact-row"],
};

function hashSeed(...parts: (string | number)[]): number {
  const s = parts.join("|");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pick<T>(arr: T[], seed: number, salt = 0): T {
  return arr[(seed + salt) % arr.length];
}

export function assignDeckVariants(
  deck: PitchDeck,
  idea: string,
  userId?: number,
  forceTemplate?: DeckTemplateId
): DeckTemplateId {
  const seed = hashSeed(idea, userId ?? 0, deck.title ?? "");
  const templates: DeckTemplateId[] = ["apex", "titanium", "ember", "midnight", "swiss"];
  const templateId = forceTemplate ?? pick(templates, seed, 3);
  const layoutEngine = resolveLayoutEngine(templateId);

  deck.slides.forEach((slide, index) => {
    const type = slide.type || "title";
    const variants = SLIDE_VARIANTS[type] || SLIDE_VARIANTS.title;
    const variant = pick(variants, seed, index * 7 + 1);
    slide.visualData = {
      ...(slide.visualData || {}),
      template: layoutEngine,
      deckTemplate: templateId,
      variant,
    };
  });

  return templateId;
}

export function getSlideVariant(slide: Slide): string {
  return slide.visualData?.variant || "default";
}

export function getDeckTemplate(slide: Slide): DeckTemplate {
  return (slide.visualData?.template as DeckTemplate) || "apex";
}
