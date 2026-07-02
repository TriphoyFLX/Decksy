import type { PitchDeck, Slide } from "../types";
import type { DeckDesignPlan } from "./designPlan";
import { type DeckTemplateId, resolveLayoutEngine } from "./deckTheme";

export type DeckTemplate = DeckTemplateId;

const SLIDE_VARIANTS: Record<string, string[]> = {
  title: ["hero-centered", "hero-bold", "hero-minimal"],
  problem: ["big-stat", "quote-poster", "stats-grid", "pain-stack", "split-quote"],
  solution: ["product-split", "feature-columns", "demo-hero", "quote-poster"],
  product: ["product-split", "feature-columns", "demo-hero"],
  market: ["big-stat", "metric-row", "chart-focus", "tam-bento"],
  pricing: ["price-tiers", "unit-economics", "revenue-ladder"],
  traction: ["big-stat", "traction-metrics", "growth-timeline", "proof-board"],
  sauce: ["team-grid", "moat-tech", "ip-stack"],
  competition: ["matrix-2x2", "compare-table", "positioning"],
  launch: ["roadmap", "milestone-track", "gtm-funnel"],
  risks: ["risk-cards", "mitigation-grid", "scenario-split"],
  ask: ["funding-split", "big-stat", "cta-center", "contact-row"],
  vision: ["quote-poster", "vision-map", "future-state", "north-star"],
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
  forceTemplate?: DeckTemplateId,
  designPlan?: DeckDesignPlan | null
): DeckTemplateId {
  const seed = hashSeed(idea, userId ?? 0, deck.title ?? "");
  const templates: DeckTemplateId[] = ["studio", "cream", "apex", "titanium", "ember", "midnight", "swiss"];
  const templateId = forceTemplate ?? designPlan?.recommendedTemplate ?? pick(templates, seed, 3);
  const layoutEngine = resolveLayoutEngine(templateId);

  const CREAM_VARIANT_BY_TYPE: Partial<Record<string, string>> = {
    title: "hero-centered",
    problem: "cream-statement",
    solution: "cream-features",
    product: "cream-steps",
    market: "tam-bento",
    competition: "compare-table",
    pricing: "cream-biz",
    traction: "cream-traction",
    sauce: "cream-team",
    launch: "roadmap",
    ask: "funding-split",
  };

  deck.slides.forEach((slide, index) => {
    const type = slide.type || "title";
    const variants = SLIDE_VARIANTS[type] || SLIDE_VARIANTS.title;
    const planned = designPlan?.slidePlans?.find((p) => p.slideIndex === index);
    const plannedVariant =
      planned?.layoutIntent && variants.includes(planned.layoutIntent) ? planned.layoutIntent : null;
    let variant = plannedVariant || pick(variants, seed, index * 7 + 1);
    if (templateId === "cream" && CREAM_VARIANT_BY_TYPE[type]) {
      variant = CREAM_VARIANT_BY_TYPE[type]!;
    }
    slide.visualData = {
      ...(slide.visualData || {}),
      template: layoutEngine,
      deckTemplate: templateId,
      variant,
    };
  });

  if (designPlan) {
    deck.designPlan = designPlan;
  }

  return templateId;
}

export function getSlideVariant(slide: Slide): string {
  return slide.visualData?.variant || "default";
}

export function getDeckTemplate(slide: Slide): DeckTemplate {
  return (slide.visualData?.deckTemplate as DeckTemplate) || "apex";
}
