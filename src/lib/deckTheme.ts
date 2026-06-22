import type React from "react";

export type DeckTemplateId = "apex" | "swiss" | "titanium" | "ember" | "midnight";

export type DeckLayoutEngine = "apex" | "swiss";

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
  apex: {
    id: "apex",
    name: "Apex",
    source: "Teamplate.html",
    description: "Apple-style: чёрный фон, синие акценты, hero-центр",
    frameGradient: "linear-gradient(to bottom, #000000, #050505)",
    gridBg:
      "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
    accent: "#0071e3",
    selectedStyle: "cosmic-dark",
    layoutEngine: "apex",
  },
  swiss: {
    id: "swiss",
    name: "Swiss Pro",
    source: "Teamplate2.html",
    description: "Структурированные карточки, метрики, roadmap",
    frameGradient: "linear-gradient(to bottom, #050505, #0a0a0a)",
    gridBg:
      "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)",
    accent: "#0071e3",
    selectedStyle: "cosmic-dark",
    layoutEngine: "swiss",
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
  ember: {
    id: "ember",
    name: "Ember",
    source: "PresentationBack",
    description: "Тёплый кремовый фон с оранжевым mesh-свечением",
    backgroundImage: "/themes/ember-bg.jpeg",
    frameGradient: "linear-gradient(to bottom, #fdf8f0, #fff5eb)",
    gridBg:
      "linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px)",
    accent: "#ea580c",
    selectedStyle: "clean-light",
    isLightBackground: true,
    layoutEngine: "apex",
    overlayOpacity: 0.18,
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    source: "PresentationBack",
    description: "Премиальный тёмный металл со световым акцентом",
    backgroundImage: "/themes/midnight-bg.jpeg",
    frameGradient: "linear-gradient(135deg, #050505 0%, #121212 60%, #1a1a1a 100%)",
    gridBg:
      "linear-gradient(rgba(255,255,255,0.014) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.014) 1px, transparent 1px)",
    accent: "#e2e8f0",
    selectedStyle: "cosmic-dark",
    layoutEngine: "apex",
    overlayOpacity: 0.34,
  },
};

export function resolveLayoutEngine(templateId: DeckTemplateId): DeckLayoutEngine {
  return TEMPLATE_CATALOG[templateId]?.layoutEngine ?? "apex";
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
}

export function getTemplateFrameAppearance(
  templateId: DeckTemplateId,
  selectedStyle: StyleKey,
  isTitleSlide: boolean
): TemplateFrameAppearance {
  const tpl = TEMPLATE_CATALOG[templateId];
  const isThemeLight = selectedStyle === "clean-light" || tpl.isLightBackground;
  const isThemeCobalt = selectedStyle === "cobalt";
  const useImageBg = Boolean(tpl.backgroundImage) && !isThemeCobalt;

  let frameStyle: React.CSSProperties = {};
  let headerClass = "flex items-center justify-between text-[8px] sm:text-[9px] font-mono pb-2 relative z-10 border-b ";
  let footerClass = "pt-2 flex items-center justify-between text-[7px] sm:text-[8px] font-mono uppercase tracking-widest relative z-10 border-t ";
  let frameBorderClass = "";
  let gridBg = tpl.gridBg;
  let gridBgSize = "40px 40px";
  let titleHeaderClass = "text-white uppercase tracking-widest font-bold";
  let showGlowBlobs = false;
  let overlayStyle: React.CSSProperties | undefined;

  if (isThemeCobalt) {
    if (isTitleSlide) {
      frameBorderClass = "border-white/10";
      frameStyle = { background: "linear-gradient(to bottom right, #0b45cf, #001f7a)" };
      headerClass += "border-white/10 text-blue-200/65";
      footerClass += "border-white/10 text-blue-200/65";
      titleHeaderClass = "text-white uppercase tracking-widest font-bold";
      gridBg =
        "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)";
    } else {
      frameBorderClass = "border-blue-100/50";
      frameStyle = { background: "linear-gradient(to bottom, #ffffff, #f7faf5)" };
      headerClass += "border-blue-100/50 text-slate-400";
      footerClass += "border-blue-100/50 text-slate-400";
      titleHeaderClass = "text-[#004de6] uppercase tracking-widest font-bold";
      gridBg =
        "linear-gradient(rgba(0,77,230,0.008) 1px, transparent 1px), linear-gradient(90deg, rgba(0,77,230,0.008) 1px, transparent 1px)";
      gridBgSize = "45px 45px";
    }
  } else if (useImageBg && tpl.backgroundImage) {
    frameStyle = {
      backgroundImage: `url(${tpl.backgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
    if (tpl.isLightBackground) {
      frameBorderClass = "border-neutral-200/80";
      headerClass += "border-neutral-300/60 text-neutral-500";
      footerClass += "border-neutral-300/60 text-neutral-500";
      titleHeaderClass = "text-neutral-900 uppercase tracking-widest font-bold";
      if (tpl.overlayOpacity && tpl.overlayOpacity > 0) {
        overlayStyle = { background: `rgba(255,255,255,${tpl.overlayOpacity})` };
      }
    } else {
      frameBorderClass = "border-white/10";
      headerClass += "border-white/15 text-white/55";
      footerClass += "border-white/15 text-white/55";
      titleHeaderClass = "text-white uppercase tracking-widest font-bold";
      if (tpl.overlayOpacity && tpl.overlayOpacity > 0) {
        overlayStyle = { background: `rgba(0,0,0,${tpl.overlayOpacity})` };
      }
    }
  } else if (isThemeLight) {
    frameBorderClass = "border-neutral-200/95";
    frameStyle = { background: "linear-gradient(to bottom, #ffffff, #fafafa)" };
    headerClass += "border-neutral-200/60 text-neutral-400";
    footerClass += "border-neutral-200/60 text-neutral-400";
    titleHeaderClass = "text-neutral-900 uppercase tracking-widest font-bold";
    gridBg =
      "linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px)";
    gridBgSize = "30px 30px";
  } else {
    frameBorderClass = "border-white/5 hover:border-white/8";
    frameStyle = { background: tpl.frameGradient };
    headerClass += "border-white/5 text-slate-500";
    footerClass += "border-white/5 text-slate-500";
    titleHeaderClass = "text-white uppercase tracking-widest font-bold";
    showGlowBlobs = !tpl.backgroundImage;
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
  };
}

export interface DeckThemeCustom {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  frameGradient?: string;
  borderColor?: string;
}

export const DEFAULT_CUSTOM_THEMES: Record<StyleKey, DeckThemeCustom> = {
  cobalt: {
    primary: "#004de6",
    accent: "#0071e3",
    background: "#ffffff",
    surface: "#f5f9ff",
    text: "#0f172a",
    textMuted: "#475569",
    frameGradient: "linear-gradient(to bottom right, #0b45cf, #001f7a)",
    borderColor: "rgba(0, 77, 230, 0.12)",
  },
  "clean-light": {
    primary: "#004de6",
    accent: "#10b981",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#171717",
    textMuted: "#64748b",
    frameGradient: "linear-gradient(to bottom, #ffffff, #fafafa)",
    borderColor: "#e2e8f0",
  },
  "cosmic-dark": {
    primary: "#10b981",
    accent: "#3b82f6",
    background: "#09090b",
    surface: "rgba(255,255,255,0.04)",
    text: "#f8fafc",
    textMuted: "#94a3b8",
    frameGradient: "linear-gradient(to bottom, #09090b, #040405)",
    borderColor: "rgba(255,255,255,0.08)",
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
      cardClass: "bg-white/90 border border-neutral-200/80 text-neutral-800 backdrop-blur-sm",
      innerCardBg: "bg-white/90 border border-neutral-200/80 text-neutral-800 shadow-sm backdrop-blur-sm",
      titleColor: "text-neutral-950",
      bulletTextColor: "text-neutral-600",
      subtitleColor: "text-neutral-500",
      accentText: "text-orange-600",
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
    cardClass: "bg-white/[0.06] border border-white/10 text-slate-200 backdrop-blur-sm",
    innerCardBg: "bg-white/[0.06] border border-white/10 text-slate-200 backdrop-blur-sm",
    titleColor: "text-white",
    bulletTextColor: "text-slate-300",
    subtitleColor: "text-slate-400",
    accentText: "text-cyan-400",
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
