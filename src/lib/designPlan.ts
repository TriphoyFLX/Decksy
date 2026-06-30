import type { Slide } from "../types";
import type { DeckTemplateId, StyleKey } from "./deckTheme";
import { SLIDE_TYPES } from "./deckBuilder";

export interface SlideDesignPlan {
  slideIndex: number;
  type: Slide["type"];
  layoutIntent: string;
  maxWords: number;
  emphasis: string;
  contentFormat: "headline" | "metric" | "quote" | "cards" | "timeline" | "comparison";
}

export interface DeckDesignPlan {
  theme: string;
  visualStyle: string;
  palette: {
    background: string;
    accent: string;
    text: string;
    surface: string;
  };
  layoutRules: {
    maxWordsPerSlide: number;
    whitespace: number;
    accentColor: string;
  };
  recommendedTemplate: DeckTemplateId;
  recommendedStyle: StyleKey;
  slidePlans: SlideDesignPlan[];
}

const DEFAULT_VARIANT_BY_FORMAT: Record<SlideDesignPlan["contentFormat"], string> = {
  headline: "hero-bold",
  metric: "big-stat",
  quote: "quote-poster",
  cards: "stats-grid",
  timeline: "roadmap",
  comparison: "matrix-2x2",
};

const FORMAT_BY_TYPE: Record<string, SlideDesignPlan["contentFormat"][]> = {
  title: ["headline"],
  problem: ["metric", "quote", "cards"],
  solution: ["headline", "cards"],
  product: ["cards", "headline"],
  market: ["metric", "cards"],
  competition: ["comparison", "cards"],
  pricing: ["cards", "metric"],
  traction: ["metric", "timeline", "cards"],
  launch: ["timeline", "cards"],
  sauce: ["cards", "headline"],
  ask: ["metric", "headline"],
  vision: ["quote", "headline"],
};

export function getDefaultDesignPlan(idea: string): DeckDesignPlan {
  const accent = "#22C55E";
  return {
    theme: idea.slice(0, 48) || "Startup Pitch",
    visualStyle: "Apple + Stripe + Behance poster decks",
    palette: {
      background: "#0F172A",
      accent,
      text: "#F8FAFC",
      surface: "rgba(255,255,255,0.06)",
    },
    layoutRules: {
      maxWordsPerSlide: 35,
      whitespace: 0.7,
      accentColor: accent,
    },
    recommendedTemplate: "studio",
    recommendedStyle: "cosmic-dark",
    slidePlans: SLIDE_TYPES.map((type, slideIndex) => {
      const formats = FORMAT_BY_TYPE[type] || ["cards"];
      const contentFormat = formats[slideIndex % formats.length];
      return {
        slideIndex,
        type,
        layoutIntent: DEFAULT_VARIANT_BY_FORMAT[contentFormat],
        maxWords: type === "title" ? 18 : 35,
        emphasis: "Один главный смысл без воды",
        contentFormat,
      };
    }),
  };
}

export function normalizeDesignPlan(raw: any, idea: string): DeckDesignPlan {
  const fallback = getDefaultDesignPlan(idea);
  const allowedTemplates: DeckTemplateId[] = ["apex", "swiss", "titanium", "ember", "midnight", "studio"];
  const allowedStyles: StyleKey[] = ["cosmic-dark", "clean-light", "cobalt"];

  const recommendedTemplate = allowedTemplates.includes(raw?.recommendedTemplate)
    ? raw.recommendedTemplate
    : fallback.recommendedTemplate;
  const recommendedStyle = allowedStyles.includes(raw?.recommendedStyle)
    ? raw.recommendedStyle
    : fallback.recommendedStyle;

  const slidePlans: SlideDesignPlan[] = SLIDE_TYPES.map((type, slideIndex) => {
    const fromAi = Array.isArray(raw?.slidePlans)
      ? raw.slidePlans.find((p: any) => Number(p?.slideIndex) === slideIndex)
      : null;
    const formats = FORMAT_BY_TYPE[type] || ["cards"];
    const contentFormat = formats.includes(fromAi?.contentFormat)
      ? fromAi.contentFormat
      : formats[slideIndex % formats.length];
    const layoutIntent =
      typeof fromAi?.layoutIntent === "string" && fromAi.layoutIntent.length > 0
        ? fromAi.layoutIntent
        : DEFAULT_VARIANT_BY_FORMAT[contentFormat];

    return {
      slideIndex,
      type,
      layoutIntent,
      maxWords: Math.min(45, Math.max(12, Number(fromAi?.maxWords) || (type === "title" ? 18 : 35))),
      emphasis: String(fromAi?.emphasis || fallback.slidePlans[slideIndex]?.emphasis || "Один главный смысл"),
      contentFormat,
    };
  });

  return {
    theme: String(raw?.theme || fallback.theme),
    visualStyle: String(raw?.visualStyle || fallback.visualStyle),
    palette: {
      background: raw?.palette?.background || fallback.palette.background,
      accent: raw?.palette?.accent || fallback.palette.accent,
      text: raw?.palette?.text || fallback.palette.text,
      surface: raw?.palette?.surface || fallback.palette.surface,
    },
    layoutRules: {
      maxWordsPerSlide: Number(raw?.layoutRules?.maxWordsPerSlide) || 35,
      whitespace: Number(raw?.layoutRules?.whitespace) || 0.7,
      accentColor: raw?.layoutRules?.accentColor || raw?.palette?.accent || accentColorFromPlan(fallback),
    },
    recommendedTemplate,
    recommendedStyle,
    slidePlans,
  };
}

function accentColorFromPlan(plan: DeckDesignPlan): string {
  return plan.layoutRules.accentColor || plan.palette.accent;
}

export function designPlanPromptBlock(plan: DeckDesignPlan): string {
  const slides = plan.slidePlans
    .map(
      (s) =>
        `  Slide ${s.slideIndex + 1} (${s.type}): layout="${s.layoutIntent}", format=${s.contentFormat}, maxWords=${s.maxWords}, emphasis="${s.emphasis}"`
    )
    .join("\n");

  return `
DESIGN PLAN (mandatory — poster-grade Behance/Apple/Stripe style):
- Theme: ${plan.theme}
- Visual style: ${plan.visualStyle}
- Palette: bg ${plan.palette.background}, accent ${plan.palette.accent}, text ${plan.palette.text}
- Rules: max ${plan.layoutRules.maxWordsPerSlide} words/slide, ~${Math.round(plan.layoutRules.whitespace * 100)}% whitespace, ONE accent color only
- Forbidden: long paragraphs, 10-item lists, buzzwords, rainbow colors, duplicate layouts on adjacent slides
- Content style: concrete facts only ("Запустили за 14 дней", "250k пользователей"), NOT ("стремимся к инновациям")
- Each slide = one poster idea. Prefer "Label: Value" bullets. Big numbers when metrics exist.
Per-slide layout intents:
${slides}
Before finalizing each slide, self-check readability/visual balance/minimalism/modernity/unified style (target 9/10). If lower — simplify text and tighten layout intent.`;
}
