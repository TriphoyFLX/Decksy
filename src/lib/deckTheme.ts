// ============================================================
// Файл 2: deckTheme.ts
// Полный код без сокращений.
// ============================================================

import type React from "react";

/** Only two live templates */
export type DeckTemplateId = "cream" | "titanium";

export type DeckLayoutEngine = "apex" | "swiss" | "cream" | "apple";

export type StyleKey = "cobalt" | "clean-light" | "cosmic-dark";

export interface TemplateCatalogEntry {
  id: DeckTemplateId;
  name: string;
  source: string;
  description: string;
  frameGradient: string;
  gridBg: string;
  accent: string;
  selectedStyle: StyleKey;
  /** Full-bleed JPEG/WebP from PresentationBack */
  backgroundImage?: string;
  /** Light gradient themes need dark text on frame chrome */
  isLightBackground?: boolean;
  layoutEngine: DeckLayoutEngine;
  overlayOpacity?: number;
}

export const TEMPLATE_CATALOG: Record<DeckTemplateId, TemplateCatalogEntry> = {
  cream: {
    id: "cream",
    name: "Cream Glass",
    source: "Teamplate3.html",
    description: "Investor pitch: кремовая типографика, glass-карточки, teal/amber glow",
    frameGradient: "linear-gradient(165deg, #07080a 0%, #0a0708 42%, #08090b 100%)",
    gridBg:
      "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
    accent: "#c9793c",
    selectedStyle: "cosmic-dark",
    layoutEngine: "cream",
  },
  titanium: {
    id: "titanium",
    name: "Titanium",
    source: "PresentationBack",
    description: "Mesh-градиент: чёрный, золото и холодный синий",
    backgroundImage: "/themes/titanium-bg.jpeg",
    frameGradient: "linear-gradient(135deg, #0a0a10 0%, #1a1520 50%, #0d0d12 100%)",
    gridBg:
      "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)",
    accent: "#f0a050",
    selectedStyle: "cosmic-dark",
    layoutEngine: "apex",
    overlayOpacity: 0.42,
  },
};

/** Map legacy template ids → live catalog */
export function normalizeDeckTemplateId(id: string | undefined | null): DeckTemplateId {
  if (id === "cream") return "cream";
  if (id === "titanium") return "titanium";
  return "cream";
}

export function resolveLayoutEngine(templateId: DeckTemplateId): DeckLayoutEngine {
  return TEMPLATE_CATALOG[templateId]?.layoutEngine ?? "cream";
}

export interface AmbientLayer {
  className?: string;
  style: React.CSSProperties;
}

export interface TemplateFrameAppearance {
  frameStyle: React.CSSProperties;
  headerClass: string;
  footerClass: string;
  titleHeaderClass: string;
  gridBg: string;
  gridBgSize: string;
  frameBorderClass: string;
  showGlowBlobs: boolean;
  overlayStyle?: React.CSSProperties;
  ambientLayers?: AmbientLayer[];
}

export function getTemplateFrameAppearance(
  templateId: DeckTemplateId,
  selectedStyle: StyleKey,
  isTitleSlide: boolean
): TemplateFrameAppearance {
  const tpl = TEMPLATE_CATALOG[normalizeDeckTemplateId(templateId)];
  const isThemeLight = selectedStyle === "clean-light" || tpl.isLightBackground;
  const isThemeCobalt = selectedStyle === "cobalt";
  const useImageBg = Boolean(tpl.backgroundImage) && !isThemeCobalt;

  if (tpl.id === "cream" && !isThemeCobalt && !isThemeLight) {
    return {
      frameStyle: { background: tpl.frameGradient },
      headerClass:
        "flex items-center justify-between text-[8px] sm:text-[9px] font-mono pb-2 relative z-10 border-b border-white/[0.09] text-[#f5f3ee]/60",
      footerClass:
        "pt-2 flex items-center justify-between text-[7px] sm:text-[8px] font-mono uppercase tracking-[0.1em] relative z-10 border-t border-white/[0.09] text-[#f5f3ee]/40",
      titleHeaderClass: "text-[#f5f3ee] uppercase tracking-[0.14em] font-bold",
      gridBg: tpl.gridBg,
      gridBgSize: "28px 28px",
      frameBorderClass: "border-white/[0.09]",
      showGlowBlobs: true,
      ambientLayers: [
        {
          className: "z-[1] pointer-events-none",
          style: {
            background:
              "radial-gradient(ellipse 55% 45% at 8% 12%, rgba(60,107,116,0.42), transparent 62%)",
          },
        },
        {
          className: "z-[1] pointer-events-none",
          style: {
            background:
              "radial-gradient(ellipse 50% 42% at 92% 82%, rgba(201,121,60,0.32), transparent 58%)",
          },
        },
        {
          className: "z-[1] pointer-events-none",
          style: {
            background:
              "radial-gradient(ellipse 38% 30% at 72% 18%, rgba(217,164,65,0.18), transparent 55%)",
          },
        },
      ],
    };
  }

  let frameStyle: React.CSSProperties = {};
  let headerClass = "flex items-center justify-between text-[8px] sm:text-[9px] font-mono pb-2 relative z-10 border-b ";
  let footerClass = "pt-2 flex items-center justify-between text-[7px] sm:text-[8px] font-mono uppercase tracking-widest relative z-10 border-t ";
  let frameBorderClass = "";
  let gridBg = tpl.gridBg;
  let gridBgSize = "40px 40px";
  let titleHeaderClass = "text-white uppercase tracking-widest font-bold";
  let showGlowBlobs = false;
  let overlayStyle: React.CSSProperties | undefined;
  let ambientLayers: AmbientLayer[] | undefined;

  if (isThemeCobalt) {
    if (isTitleSlide) {
      frameBorderClass = "border-white/10";
      headerClass += "border-white/10 text-blue-200/65";
      footerClass += "border-white/10 text-blue-200/50";
      titleHeaderClass = "text-white uppercase tracking-widest font-bold";
      frameStyle = { background: "linear-gradient(to bottom right, #0b45cf, #001f7a)" };
      gridBg =
        "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)";
      showGlowBlobs = true;
    } else {
      frameBorderClass = "border-blue-100/80";
      headerClass += "border-blue-100/50 text-slate-500";
      footerClass += "border-blue-100/50 text-slate-500";
      titleHeaderClass = "text-[#004de6] uppercase tracking-widest font-bold";
      frameStyle = { background: "linear-gradient(to bottom, #ffffff, #f8fafc)" };
      gridBg =
        "linear-gradient(rgba(0,77,230,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,77,230,0.04) 1px, transparent 1px)";
    }
  } else if (isThemeLight) {
    frameBorderClass = "border-neutral-200/80";
    headerClass += "border-neutral-200/60 text-neutral-500";
    footerClass += "border-neutral-200/60 text-neutral-500";
    titleHeaderClass = "text-neutral-900 uppercase tracking-widest font-bold";
    frameStyle = { background: "linear-gradient(to bottom, #ffffff, #f8fafc)" };
    gridBg =
      "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)";
  } else if (useImageBg) {
    frameBorderClass = "border-white/10";
    headerClass += "border-white/10 text-white/50";
    footerClass += "border-white/10 text-white/40";
    titleHeaderClass = "text-white uppercase tracking-widest font-bold";
    frameStyle = {
      backgroundImage: `url(${tpl.backgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
    overlayStyle = {
      background: `rgba(0,0,0,${tpl.overlayOpacity ?? 0.35})`,
    };
    gridBg = tpl.gridBg;
    showGlowBlobs = false;
  } else {
    frameBorderClass = "border-white/10";
    headerClass += "border-white/5 text-slate-500";
    footerClass += "border-white/5 text-slate-500";
    frameStyle = { background: tpl.frameGradient };
    gridBg = tpl.gridBg;
    showGlowBlobs = true;
  }

  return {
    frameStyle,
    headerClass,
    footerClass,
    titleHeaderClass,
    gridBg,
    gridBgSize,
    frameBorderClass,
    showGlowBlobs,
    overlayStyle,
    ambientLayers,
  };
}

export interface DeckThemeCustom {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  borderColor?: string;
  frameGradient?: string;
}

export const DEFAULT_CUSTOM_THEMES: Record<StyleKey, DeckThemeCustom> = {
  "cosmic-dark": {
    primary: "#a78bfa",
    accent: "#34d399",
    background: "#09090b",
    surface: "#18181b",
    text: "#fafafa",
    textMuted: "#a1a1aa",
    borderColor: "rgba(255,255,255,0.08)",
  },
  "clean-light": {
    primary: "#0d9488",
    accent: "#0891b2",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#0f172a",
    textMuted: "#64748b",
    borderColor: "#e2e8f0",
  },
  cobalt: {
    primary: "#004de6",
    accent: "#0ea5e9",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#0f172a",
    textMuted: "#475569",
    borderColor: "rgba(0, 77, 230, 0.12)",
  },
};

export interface ResolvedSlideTheme {
  isLight: boolean;
  isCobalt: boolean;
  isTitle: boolean;
  isDark: boolean;
  primary: string;
  accent: string;
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
  frameGradient: string;
  borderColor: string;
  titleClass: string;
  bodyClass: string;
  mutedClass: string;
  cardClass: string;
  innerCardBg: string;
  titleColor: string;
  bulletTextColor: string;
  subtitleColor: string;
  accentText: string;
  footerTextColor: string;
  dotColor: string;
}

export function resolveSlideTheme(
  selectedStyle: StyleKey,
  slideIndex: number,
  slideType: string,
  custom?: DeckThemeCustom | null
): ResolvedSlideTheme {
  const isTitle = slideIndex === 0 || slideType === "title";
  const isLight = selectedStyle === "clean-light";
  const isCobalt = selectedStyle === "cobalt";
  const isDark = selectedStyle === "cosmic-dark" || (isCobalt && isTitle);
  const base = custom || DEFAULT_CUSTOM_THEMES[selectedStyle];

  if (isCobalt && isTitle) {
    return {
      isLight: false,
      isCobalt: true,
      isTitle: true,
      isDark: true,
      primary: custom?.primary || "#60a5fa",
      accent: custom?.accent || "#34d399",
      bg: custom?.frameGradient || "linear-gradient(to bottom right, #0b45cf, #001f7a)",
      surface: "rgba(255,255,255,0.1)",
      text: custom?.text || "#ffffff",
      textMuted: custom?.textMuted || "#93c5fd",
      frameGradient: custom?.frameGradient || "linear-gradient(to bottom right, #0b45cf, #001f7a)",
      borderColor: custom?.borderColor || "rgba(255,255,255,0.15)",
      titleClass: "text-white",
      bodyClass: "text-blue-100",
      mutedClass: "text-blue-200/80",
      cardClass: "bg-white/10 border-white/20 text-white",
      innerCardBg: "bg-white/10 border border-white/20 text-white",
      titleColor: "text-white",
      bulletTextColor: "text-blue-100",
      subtitleColor: "text-blue-200",
      accentText: "text-sky-300",
      footerTextColor: "#93c5fd",
      dotColor: "#34d399",
    };
  }

  if (isCobalt && !isTitle) {
    return {
      isLight: true,
      isCobalt: true,
      isTitle: false,
      isDark: false,
      primary: base.primary,
      accent: base.accent,
      bg: base.background,
      surface: base.surface,
      text: base.text,
      textMuted: base.textMuted,
      frameGradient: `linear-gradient(to bottom, ${base.background}, ${base.surface})`,
      borderColor: base.borderColor || "rgba(0, 77, 230, 0.12)",
      titleClass: "text-slate-950",
      bodyClass: "text-slate-700",
      mutedClass: "text-slate-500",
      cardClass: "bg-white border border-blue-100 text-slate-800",
      innerCardBg: "bg-white border border-blue-100 text-slate-800 shadow-sm",
      titleColor: "text-slate-950",
      bulletTextColor: "text-slate-600",
      subtitleColor: "text-blue-700",
      accentText: "text-blue-600",
      footerTextColor: "#475569",
      dotColor: base.primary,
    };
  }

  if (isLight) {
    return {
      isLight: true,
      isCobalt: false,
      isTitle,
      isDark: false,
      primary: base.primary,
      accent: base.accent,
      bg: base.background,
      surface: base.surface,
      text: base.text,
      textMuted: base.textMuted,
      frameGradient: `linear-gradient(to bottom, ${base.background}, ${base.surface})`,
      borderColor: base.borderColor || "#e2e8f0",
      titleClass: "text-neutral-950",
      bodyClass: "text-neutral-700",
      mutedClass: "text-neutral-500",
      cardClass:
        "bg-white border-0 text-slate-800 shadow-[0_12px_36px_rgba(15,23,42,0.07)] rounded-[1.75rem]",
      innerCardBg:
        "bg-white border-0 text-slate-800 shadow-[0_12px_36px_rgba(15,23,42,0.07)] rounded-[1.75rem]",
      titleColor: "text-slate-950",
      bulletTextColor: "text-slate-600",
      subtitleColor: "text-slate-500",
      accentText: "text-teal-600",
      footerTextColor: "#64748b",
      dotColor: base.accent,
    };
  }

  return {
    isLight: false,
    isCobalt: false,
    isTitle,
    isDark: true,
    primary: base.primary,
    accent: base.accent,
    bg: base.background,
    surface: base.surface,
    text: base.text,
    textMuted: base.textMuted,
    frameGradient: custom?.frameGradient || `linear-gradient(to bottom, ${base.background}, #040405)`,
    borderColor: base.borderColor || "rgba(255,255,255,0.08)",
    titleClass: "text-white",
    bodyClass: "text-slate-300",
    mutedClass: "text-slate-400",
    cardClass:
      "bg-[#141416] border-0 text-slate-100 shadow-[0_16px_40px_rgba(0,0,0,0.35)] rounded-[1.75rem]",
    innerCardBg:
      "bg-[#141416] border-0 text-slate-100 shadow-[0_16px_40px_rgba(0,0,0,0.35)] rounded-[1.75rem]",
    titleColor: "text-white",
    bulletTextColor: "text-slate-200",
    subtitleColor: "text-slate-400",
    accentText: "text-[#C8F31E]",
    footerTextColor: "#64748b",
    dotColor: base.primary,
  };
}

export function getFrameStyles(
  selectedStyle: StyleKey,
  isTitle: boolean,
  custom?: DeckThemeCustom | null
): { frameStyle: React.CSSProperties; headerClass: string; footerClass: string; gridBg: string; titleHeaderClass: string } {
  const t = resolveSlideTheme(selectedStyle, isTitle ? 0 : 1, isTitle ? "title" : "problem", custom);
  const headerBorder = t.isLight ? "border-neutral-200/60 text-neutral-500" : t.isCobalt && isTitle ? "border-white/10 text-blue-200/65" : t.isCobalt ? "border-blue-100/50 text-slate-500" : "border-white/5 text-slate-500";
  const titleHeader = t.isLight ? "text-neutral-900" : t.isCobalt && isTitle ? "text-white" : t.isCobalt ? "text-[#004de6]" : "text-white";

  return {
    frameStyle: { background: t.frameGradient },
    headerClass: `flex items-center justify-between text-[8px] font-mono pb-2 relative z-10 border-b ${headerBorder}`,
    footerClass: `pt-2 flex items-center justify-between text-[7px] font-mono uppercase tracking-widest relative z-10 border-t ${headerBorder}`,
    gridBg: t.isLight
      ? "linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px)"
      : "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)",
    titleHeaderClass: `${titleHeader} uppercase tracking-widest font-bold`,
  };
}
