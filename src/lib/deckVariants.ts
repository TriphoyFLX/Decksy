// ============================================================
// Файл 3: variantEngine.ts
// Полный код без сокращений.
// ============================================================

import type { PitchDeck, Slide } from "../types";
import type { DeckDesignPlan } from "./designPlan";
import { normalizeDeckTemplateId, resolveLayoutEngine, type DeckTemplateId } from "./deckTheme";

export type DeckTemplate = DeckTemplateId;

const SLIDE_VARIANTS: Record<string, string[]> = {
  title: ["hero-centered", "hero-bold", "hero-minimal"],
  problem: ["problem-solve", "pain-stack", "split-quote"],
  solution: ["product-split", "feature-columns", "demo-hero", "quote-poster"],
  product: ["product-split", "feature-columns", "demo-hero"],
  market: ["big-stat", "metric-row", "chart-focus", "tam-bento"],
  pricing: ["price-tiers", "unit-economics", "revenue-ladder"],
  traction: ["big-stat", "traction-metrics", "growth-timeline", "proof-board"],
  sauce: ["team-grid", "moat-tech", "ip-stack"],
  competition: ["battle", "compare-table", "positioning", "compare-compact"],
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

function pairProblemSolutions(deck: PitchDeck) {
  const problem = deck.slides.find((s) => s.type === "problem");
  const solution = deck.slides.find((s) => s.type === "solution");
  if (!problem) return;

  if (problem.visualData?.problemSolutions?.length) {
    problem.visualData = {
      ...problem.visualData,
      variant: "problem-solve",
    };
    return;
  }

  const pains = (problem.content || []).slice(0, 4);
  const fixes = (solution?.content || []).slice(0, 4);

  const pairs = pains.map((pain, i) => {
    const arrowSplit = pain.split(/\s*(?:→|->|—\s*решение|\/\s*решение)\s*/i);
    if (arrowSplit.length >= 2 && arrowSplit[1]?.trim()) {
      return {
        problem: arrowSplit[0].trim(),
        solution: arrowSplit[1].trim(),
      };
    }
    const fix = fixes[i] || fixes[0] || "";
    return {
      problem: pain,
      solution: fix || "Закрываем эту боль продуктом и процессом",
    };
  });

  if (!pairs.length && fixes.length) {
    pairs.push(
      ...fixes.slice(0, 3).map((fix) => ({
        problem: "Ключевая боль рынка",
        solution: fix,
      })),
    );
  }

  if (pairs.length) {
    problem.visualData = {
      ...(problem.visualData || {}),
      problemSolutions: pairs,
      variant: "problem-solve",
    };
  }
}

export function assignDeckVariants(
  deck: PitchDeck,
  idea: string,
  userId?: number,
  forceTemplate?: DeckTemplateId,
  designPlan?: DeckDesignPlan | null
): DeckTemplateId {
  const seed = hashSeed(idea, userId ?? 0, deck.title ?? "");
  const templates: DeckTemplateId[] = ["cream", "titanium", "apple"];
  const templateId = normalizeDeckTemplateId(
    forceTemplate ?? designPlan?.recommendedTemplate ?? pick(templates, seed, 3),
  );
  const layoutEngine = resolveLayoutEngine(templateId);

  const CREAM_VARIANT_BY_TYPE: Partial<Record<string, string>> = {
    title: "hero-centered",
    problem: "problem-solve",
    solution: "cream-features",
    product: "cream-steps",
    market: "tam-bento",
    competition: "battle",
    pricing: "cream-biz",
    traction: "cream-traction",
    sauce: "cream-team",
    launch: "roadmap",
    ask: "funding-split",
    vision: "vision-map",
  };

  const TITANIUM_VARIANT_BY_TYPE: Partial<Record<string, string>> = {
    title: "hero-centered",
    problem: "problem-solve",
    solution: "cream-features",
    product: "cream-steps",
    market: "tam-bento",
    competition: "battle",
    pricing: "cream-biz",
    traction: "cream-traction",
    sauce: "cream-team",
    launch: "roadmap",
    ask: "funding-split",
    vision: "vision-map",
  };

  const APPLE_VARIANT_BY_TYPE: Partial<Record<string, string>> = {
    title: "hero-centered",
    problem: "apple-grouped",
    solution: "apple-features",
    product: "apple-product",
    market: "apple-metrics",
    competition: "battle",
    pricing: "apple-biz",
    traction: "apple-traction",
    sauce: "apple-team",
    launch: "apple-timeline",
    ask: "apple-cta",
    vision: "vision-map",
  };

  deck.slides.forEach((slide, index) => {
    const type = slide.type || "title";
    const variants = SLIDE_VARIANTS[type] || SLIDE_VARIANTS.title;
    const planned = designPlan?.slidePlans?.find((p) => p.slideIndex === index);
    const plannedVariant =
      planned?.layoutIntent && variants.includes(planned.layoutIntent) ? planned.layoutIntent : null;
    let variant = plannedVariant || pick(variants, seed, index * 7 + 1);
    if (type === "problem") variant = "problem-solve";
    if (templateId === "cream" && CREAM_VARIANT_BY_TYPE[type]) {
      variant = CREAM_VARIANT_BY_TYPE[type]!;
    }
    if (templateId === "titanium" && TITANIUM_VARIANT_BY_TYPE[type]) {
      variant = TITANIUM_VARIANT_BY_TYPE[type]!;
    }
    if (templateId === "apple" && APPLE_VARIANT_BY_TYPE[type]) {
      variant = APPLE_VARIANT_BY_TYPE[type]!;
    }
    if (templateId === "apple" && type === "problem") {
      variant = "apple-grouped";
    }
    slide.visualData = {
      ...(slide.visualData || {}),
      template: layoutEngine,
      deckTemplate: templateId,
      variant,
    };
  });

  pairProblemSolutions(deck);

  if (designPlan) {
    deck.designPlan = designPlan;
  }

  return templateId;
}

export function getSlideVariant(slide: Slide): string {
  return slide.visualData?.variant || "default";
}

export function getDeckTemplate(slide: Slide): DeckTemplate {
  return normalizeDeckTemplateId(slide.visualData?.deckTemplate as string);
}
