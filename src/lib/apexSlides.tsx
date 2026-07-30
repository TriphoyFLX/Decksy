// ============================================================
// Файл 1: apexSlides.tsx
// Полный апгрейд: Glassmorphism 2.0, премиум-типографика,
// плотная верстка без пустот, умные сетки.
// ============================================================

import React from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  Wallet,
  TrendingDown,
  Coffee,
  ImagePlus,
  Zap,
  Shield,
  Target,
  User,
  Check,
  X,
} from "lucide-react";
import type { Slide, SlideVisualData } from "../types";
import { PremiumImage } from "./slideVisuals";
import { getConstructorStyle } from "../components/SlideConstructor";
import type { SlideConstructorLayout } from "../types";
import { TEMPLATE_CATALOG, type DeckTemplateId, type StyleKey } from "./deckTheme";
import { extractMetricValue, looksLikeMetric } from "./slideMetrics";
import {
  CreamHero,
  CreamProblemStatement,
  CreamStatTriplet,
  CreamProductSteps,
  CreamFeatureCards,
  CreamMarketStack,
  CreamCompareMatrix,
  CreamBizSplit,
  CreamTractionBoard,
  CreamTeamRow,
  CreamRoadmapTimeline,
  CreamAskSlide,
  CreamVisionMap,
} from "./creamSlides";
import {
  AppleHero,
  AppleProblemSolve,
  AppleFeatureBento,
  AppleProductSteps,
  AppleMarketStack,
  AppleCompareMatrix,
  AppleBizSplit,
  AppleTractionBoard,
  AppleTeamRow,
  AppleRoadmapTimeline,
  AppleAskSlide,
  AppleVisionMap,
} from "./appleSlides";

// --- Константы дизайна ---
const APEX_BLUE = "#0071e3";
const APEX_GREEN = "#30d158";
// Премиум-палитра: глубокий космический фон, яркие сочные акценты
const PREMIUM_COLORS = {
  violet: "#8B5CF6",
  emerald: "#10B981",
  amber: "#F59E0B",
  sky: "#0EA5E9",
  rose: "#F43F5E",
};

type InlineRenderer = (text: string, index: number, className: string, Tag?: React.ElementType) => React.ReactNode;

export type GlassSurface = {
  isLight: boolean;
  hasImageBg: boolean;
  titleClass: string;
  bodyClass: string;
  mutedClass: string;
  labelColor: string;
  accent: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  creamGlass?: boolean;
  appleGlass?: boolean;
};

// --- Расширенная функция определения поверхности ---
export function getGlassSurface(slide: Slide, selectedStyle: StyleKey = "cosmic-dark", forExport = false): GlassSurface {
  const deckTemplate = (slide.visualData?.deckTemplate || "") as string;
  const templateEntry = (deckTemplate in TEMPLATE_CATALOG
    ? TEMPLATE_CATALOG[deckTemplate as DeckTemplateId]
    : undefined);

  if (deckTemplate === "apple") {
    const isLight =
      selectedStyle === "clean-light" || Boolean(TEMPLATE_CATALOG.apple?.isLightBackground);
    return {
      isLight,
      hasImageBg: false,
      appleGlass: true,
      titleClass: isLight ? "text-black" : "text-white",
      bodyClass: isLight ? "text-[#3C3C43]" : "text-[#EBEBF5]",
      mutedClass: isLight ? "text-[rgba(60,60,67,0.6)]" : "text-[rgba(235,235,245,0.6)]",
      labelColor: "#007AFF",
      accent: "#007AFF",
      secondary: "#5856D6",
      success: "#34C759",
      warning: "#FF9500",
      danger: "#FF3B30",
    };
  }

  if (deckTemplate === "cream") {
    return {
      isLight: false,
      hasImageBg: false,
      creamGlass: true,
      titleClass: "text-[#f5f3ee]",
      bodyClass: "text-[#f5f3ee]/85",
      mutedClass: "text-[#f5f3ee]/60",
      labelColor: "#c9793c",
      accent: "#c9793c",
      secondary: "#3c6b74",
      success: "#3c6b74",
      warning: "#d9a441",
      danger: "#8a3b2b",
    };
  }

  const templateAccent = templateEntry?.accent;
  const isLight = Boolean(templateEntry?.isLightBackground) || selectedStyle === "clean-light";
  const hasImageBg =
    deckTemplate === "titanium" || deckTemplate === "midnight" || deckTemplate === "ember";

  const accent = templateAccent || (isLight ? "#0d9488" : PREMIUM_COLORS.violet);

  return {
    isLight,
    hasImageBg,
    titleClass: isLight ? "text-slate-950" : "text-white",
    bodyClass: isLight ? "text-slate-600" : "text-slate-200/90",
    mutedClass: isLight ? "text-slate-500" : "text-slate-400",
    labelColor: accent,
    accent,
    secondary: isLight ? "#0ea5e9" : PREMIUM_COLORS.sky,
    success: isLight ? "#059669" : PREMIUM_COLORS.emerald,
    warning: PREMIUM_COLORS.amber,
    danger: PREMIUM_COLORS.rose,
  };
}

function alpha(hex: string, opacity: string): string {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return `${hex}${opacity}`;
  return `#${normalized}${opacity}`;
}

/** Supervity-style bento tile tones */
export type BentoTone = "surface" | "ink" | "accent" | "soft" | "glass";

export function bentoCardStyle(
  glass: GlassSurface,
  tone: BentoTone = "surface",
  forExport = false,
): React.CSSProperties {
  if (glass.appleGlass) {
    if (tone === "accent") {
      return { background: glass.accent, borderColor: "transparent", color: "#000" };
    }
    if (tone === "ink") {
      return { background: "#000000", borderColor: "transparent", color: "#fff" };
    }
    if (glass.isLight) {
      return {
        background: tone === "soft" ? "#F2F2F7" : "#FFFFFF",
        borderColor: "transparent",
        boxShadow: "0 8px 28px rgba(0,0,0,0.06)",
      };
    }
    return {
      background: tone === "soft" ? "#2C2C2E" : "#1C1C1E",
      borderColor: "transparent",
    };
  }

  if (glass.creamGlass) {
    if (tone === "accent") {
      return { background: glass.accent, borderColor: "transparent", color: "#1a120c" };
    }
    if (tone === "ink") {
      return { background: "rgba(0,0,0,0.55)", borderColor: "rgba(255,255,255,0.12)" };
    }
    return {
      background: forExport ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.07)",
      borderColor: "rgba(255,255,255,0.14)",
      boxShadow: forExport ? undefined : "inset 0 1px 0 rgba(255,255,255,0.1)",
      backdropFilter: forExport ? undefined : "blur(24px)",
      WebkitBackdropFilter: forExport ? undefined : "blur(24px)",
    };
  }

  if (tone === "accent") {
    return {
      background: glass.accent,
      borderColor: "transparent",
      boxShadow: `0 16px 40px ${alpha(glass.accent, "55")}`,
      color: glass.isLight ? "#0a0a0a" : "#0a0a0a",
    };
  }

  if (tone === "ink") {
    return {
      background: glass.isLight ? "#0a0a0a" : "#0a0a0a",
      borderColor: "transparent",
      boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
      color: "#ffffff",
    };
  }

  if (tone === "soft") {
    return glass.isLight
      ? {
          background: "#F3F4F6",
          borderColor: "transparent",
          boxShadow: "0 10px 28px rgba(15,23,42,0.05)",
        }
      : {
          background: "rgba(255,255,255,0.06)",
          borderColor: "transparent",
          boxShadow: "0 12px 32px rgba(0,0,0,0.22)",
        };
  }

  if (tone === "glass" || glass.hasImageBg) {
    return {
      background: glass.isLight ? "rgba(255,255,255,0.72)" : "rgba(18,18,22,0.62)",
      borderColor: glass.isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.12)",
      boxShadow: "0 12px 36px rgba(0,0,0,0.18)",
      backdropFilter: forExport ? undefined : "blur(28px)",
      WebkitBackdropFilter: forExport ? undefined : "blur(28px)",
    };
  }

  // Default surface — solid bento tile (reference style)
  if (glass.isLight) {
    return {
      background: "#FFFFFF",
      borderColor: "transparent",
      boxShadow: "0 12px 36px rgba(15,23,42,0.07), 0 2px 6px rgba(15,23,42,0.04)",
    };
  }
  return {
    background: "#141416",
    borderColor: "transparent",
    boxShadow: "0 16px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
  };
}

export function glassCardStyle(glass: GlassSurface, forExport = false): React.CSSProperties {
  return bentoCardStyle(glass, "surface", forExport);
}

export const slideBodyClass = "flex-1 min-h-0 w-full h-full";

/** Soft super-rounded bento tiles (Supervity / Apple Keynote vibe) */
export const glassCardClass = "rounded-[1.75rem] border-0 overflow-hidden relative";
export const bentoCardClass = glassCardClass;
export const bentoGapClass = "gap-3";

export const BentoPill: React.FC<{
  children: React.ReactNode;
  tone?: "accent" | "ink" | "soft";
  glass: GlassSurface;
}> = ({ children, tone = "soft", glass }) => {
  const style: React.CSSProperties =
    tone === "accent"
      ? { background: glass.accent, color: "#0a0a0a" }
      : tone === "ink"
        ? { background: "#0a0a0a", color: "#fff" }
        : glass.isLight
          ? { background: "rgba(15,23,42,0.06)", color: "#0f172a" }
          : { background: "rgba(255,255,255,0.1)", color: "#fff" };
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-wide whitespace-nowrap"
      style={style}
    >
      {children}
    </span>
  );
};

export const BentoOrb: React.FC<{ glass: GlassSurface; ink?: boolean; onAccent?: boolean }> = ({ glass, ink, onAccent }) => (
  <span
    className="absolute top-3 right-3 h-7 w-7 rounded-full flex items-center justify-center text-[14px] font-light leading-none z-[1]"
    style={{
      background: onAccent
        ? "rgba(0,0,0,0.12)"
        : ink
          ? "rgba(255,255,255,0.14)"
          : glass.isLight
            ? "rgba(15,23,42,0.08)"
            : "rgba(255,255,255,0.1)",
      color: onAccent ? "#0a0a0a" : ink || !glass.isLight ? "#fff" : "#0a0a0a",
    }}
  >
    +
  </span>
);

// Иконки болей с премиум-градиентами
const PAIN_ICON_COLORS = [
  { bg: "rgba(244,63,94,0.15)", fg: PREMIUM_COLORS.rose },
  { bg: "rgba(245,158,11,0.15)", fg: PREMIUM_COLORS.amber },
  { bg: "rgba(59,130,246,0.15)", fg: "#3B82F6" },
  { bg: "rgba(16,185,129,0.15)", fg: PREMIUM_COLORS.emerald },
];

function pickPainIcon(text: string, index: number): LucideIcon {
  const t = text.toLowerCase();
  if (/врем|час|минут|очеред|жд|долго/.test(t)) return Clock;
  if (/цен|дорог|стоим|бюджет|денег|руб|₽|\$/.test(t)) return Wallet;
  if (/район|гео|локац|адрес|рядом|мест/.test(t)) return MapPin;
  if (/клиент|посетител|люд|аудитор|пользовател/.test(t)) return Users;
  if (/качеств|вкус|уровен|сервис/.test(t)) return Coffee;
  if (/конкурен|рынок|доля|потер/.test(t)) return TrendingDown;
  return [AlertTriangle, Zap, Shield, Target][index % 4];
}

function extractMetricHint(text: string): string | null {
  const delta = text.match(/(?:↑|↓)\s*[\d,.]+%?(?:\s*YoY)?/i);
  if (delta) return delta[0];
  const pct = text.match(/[\d,.]+\s*%/);
  if (pct) return pct[0];
  return null;
}

function shortInsight(text: string, max = 48): string {
  const cleaned = text.replace(/^[^:]+:\s*/, "").trim();
  if (!cleaned) return "";
  return cleaned.length > max ? `${cleaned.slice(0, max - 1)}…` : cleaned;
}

function parseItems(content: string[], parseBullet: (s: string) => { label: string; detail: string }) {
  return content.map((item, i) => {
    const parsed = parseBullet(item);
    return {
      raw: item,
      label: parsed.label || `Пункт ${i + 1}`,
      detail: parsed.detail || item,
      number: extractMetricHint(item) || extractMetricValue(item) || "",
    };
  });
}

// --- Компоненты для секций ---
export const ApexSectionLabel: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = PREMIUM_COLORS.violet }) => (
  <p className="text-[10px] font-medium uppercase tracking-[0.2em] mb-2" style={{ color }}>
    {children}
  </p>
);

export const ApexTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "text-white",
}) => {
  const text = typeof children === "string" ? children : "";
  const long = text.length > 30;
  return (
    <h2
      className={`${long ? "text-lg sm:text-xl md:text-2xl" : "text-xl sm:text-2xl md:text-3xl"} font-bold tracking-tight leading-[1.1] mb-3 line-clamp-2 ${className}`}
      style={{ letterSpacing: "-0.02em" }}
    >
      {children}
    </h2>
  );
};

// Hero-слайд с премиум-оформлением
export const ApexHero: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  content: string[];
  image?: string;
  founderName?: React.ReactNode;
  founderRole?: string;
  brandQuote?: React.ReactNode;
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  forExport?: boolean;
  constructorLayout?: SlideConstructorLayout;
  glass?: GlassSurface;
}> = ({
  title,
  subtitle,
  badge,
  content,
  image,
  founderName,
  founderRole,
  brandQuote,
  renderBullet,
  forExport,
  constructorLayout,
  glass,
}) => {
  const titleText = typeof title === "string" ? title : "";
  const firstLetter = (titleText || "P").trim().charAt(0).toUpperCase();
  const longTitle = titleText.length > 42;
  const titleSize = longTitle
    ? forExport ? "text-3xl" : "text-xl sm:text-2xl"
    : forExport ? "text-5xl" : "text-3xl sm:text-4xl";
  const founderText = typeof founderName === "string" ? founderName : content.find((c) => /основатель|ceo|founder|владелец/i.test(c))?.replace(/^[^:]+:\s*/i, "") || "";
  const quoteText = typeof brandQuote === "string" ? brandQuote : content.find((c) => c.startsWith("«") || c.includes("слоган"))?.replace(/^«|»$/g, "") || "";

  const useConstructor = constructorLayout?.enabled && !forExport;
  const titleClass = glass?.titleClass || "text-white";
  const mutedClass = glass?.mutedClass || "text-white/55";
  const highlightBullets = content.filter((c) => c && !/основатель|founder|ceo|«/.test(c)).slice(0, 3);

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 lg:gap-8 items-center justify-center lg:justify-start">
      {/* Левая часть: бренд-блок */}
      <div className="flex-1 flex flex-col justify-center text-left z-10 max-w-xl">
        {/* Логотип или инициалы */}
        <div className="mb-6">
          {image ? (
            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <PremiumImage src={image} variant="thumb" className="!w-full !h-full !min-h-full !rounded-2xl object-cover" />
            </div>
          ) : (
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center font-bold border border-white/10 shadow-2xl text-black"
              style={{
                background: glass?.accent
                  ? `linear-gradient(145deg, ${glass.accent}, ${glass.secondary || glass.accent})`
                  : "linear-gradient(to bottom right, #7c3aed, #3730a3)",
                color: glass?.accent ? "#0a0a0a" : "#fff",
              }}
            >
              <span className="text-3xl font-black">{firstLetter}</span>
            </div>
          )}
        </div>

        {badge && <div className="mb-3">{badge}</div>}

        <h1 className={`${titleSize} font-extrabold leading-[1.05] ${titleClass} tracking-tight mb-4`}>
          {title || "Название проекта"}
        </h1>

        {subtitle && (
          <p className={`text-sm md:text-base ${mutedClass} leading-relaxed max-w-md mb-6`}>
            {subtitle}
          </p>
        )}

        {/* Основатель + цитата */}
        <div
          className="flex items-center gap-4 mb-6 p-3 rounded-2xl border max-w-fit"
          style={{
            background: glass?.hasImageBg ? "rgba(14,14,20,0.7)" : "rgba(255,255,255,0.05)",
            borderColor: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <User className="h-6 w-6 text-white/70" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{founderText || "Имя основателя"}</div>
            <div className="text-xs text-white/50">{founderRole || "CEO & Founder"}</div>
          </div>
        </div>

        {(quoteText || brandQuote) && (
          <div className="border-l-2 pl-4" style={{ borderColor: glass?.accent || "#8b5cf6" }}>
            <p className={`text-sm italic leading-relaxed ${mutedClass}`}>
              «{quoteText || brandQuote}»
            </p>
          </div>
        )}
      </div>

      {/* Правая часть: визуальная панель */}
      <div className="hidden lg:flex w-full lg:w-[45%] items-center justify-center">
        <div
          className="w-full aspect-square max-h-[400px] rounded-[32px] overflow-hidden relative shadow-2xl border border-white/10"
          style={{
            background: glass?.hasImageBg
              ? "rgba(14,14,20,0.55)"
              : "linear-gradient(to bottom right, #0f172a, #000)",
            backdropFilter: glass?.hasImageBg ? "blur(20px)" : undefined,
          }}
        >
          {!image && highlightBullets.length > 0 && (
            <div className="absolute inset-0 p-6 flex flex-col justify-center gap-3 z-10">
              {highlightBullets.map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl px-4 py-3 border border-white/10"
                  style={{ background: i === 0 && glass?.accent ? `${glass.accent}22` : "rgba(255,255,255,0.05)" }}
                >
                  <p className="text-xs leading-snug text-white/80">{renderBullet(item, i, "")}</p>
                </div>
              ))}
            </div>
          )}
          {!image && highlightBullets.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-8xl font-black text-white/5 select-none">{firstLetter}</div>
            </div>
          )}
          {image && <PremiumImage src={image} variant="hero" className="absolute inset-0 !min-h-full !rounded-[32px] opacity-60" />}
          {/* Декоративный градиент */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(to top, ${glass?.accent ? alpha(glass.accent, "33") : "rgba(76,29,149,0.3)"}, transparent 55%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
};


function parseProblemSolutionPairs(
  content: string[],
  problemSolutions: SlideVisualData["problemSolutions"] | undefined,
  parseBullet: (s: string) => { label: string; detail: string },
): { problemLabel: string; problem: string; solutionLabel: string; solution: string }[] {
  if (problemSolutions?.length) {
    return problemSolutions.slice(0, 4).map((p, i) => {
      const probParsed = parseBullet(p.problem);
      const solParsed = parseBullet(p.solution);
      return {
        problemLabel: p.problemLabel || probParsed.label || `Боль ${i + 1}`,
        problem: probParsed.detail || p.problem,
        solutionLabel: p.solutionLabel || solParsed.label || "Решение",
        solution: solParsed.detail || p.solution,
      };
    });
  }

  return content.slice(0, 4).map((raw, i) => {
    const parts = raw.split(/\s*(?:→|->|—\s*решение|\/\s*решение)\s*/i);
    if (parts.length >= 2 && parts[1]?.trim()) {
      const left = parseBullet(parts[0]);
      const right = parseBullet(parts[1]);
      return {
        problemLabel: left.label || `Боль ${i + 1}`,
        problem: left.detail || parts[0],
        solutionLabel: right.label || "Решение",
        solution: right.detail || parts[1],
      };
    }
    const parsed = parseBullet(raw);
    return {
      problemLabel: parsed.label || `Боль ${i + 1}`,
      problem: parsed.detail || raw,
      solutionLabel: "Решение",
      solution: "Закрываем эту боль продуктом и понятным процессом",
    };
  });
}

/** Problem + how we solve it — paired bento rows */
export const ApexProblemSolution: React.FC<{
  content: string[];
  problemSolutions?: SlideVisualData["problemSolutions"];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, problemSolutions, parseBullet, renderBullet, renderLabel, glass, forExport }) => {
  const pairs = parseProblemSolutionPairs(content, problemSolutions, parseBullet);
  const rows = Math.min(Math.max(pairs.length, 1), 4);

  return (
    <div className={`flex flex-col gap-2.5 h-full min-h-0 ${slideBodyClass}`}>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 shrink-0 px-1">
        <span className="text-[8px] uppercase tracking-[0.18em] font-bold" style={{ color: glass.danger }}>
          Проблема
        </span>
        <span className={`text-[8px] uppercase tracking-widest ${glass.mutedClass}`}>→</span>
        <span className="text-[8px] uppercase tracking-[0.18em] font-bold" style={{ color: glass.success }}>
          Как решаем
        </span>
      </div>

      <div
        className="grid flex-1 min-h-0 gap-2.5"
        style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
      >
        {pairs.map((pair, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto_1fr] gap-2 items-stretch min-h-0">
            <div className={`${bentoCardClass} p-3 flex flex-col justify-center gap-1`} style={bentoCardStyle(glass, "ink", forExport)}>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[7px] font-mono font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[9px] font-bold text-white/90 line-clamp-1">
                  {renderLabel ? renderLabel(pair.problemLabel, i, "") : pair.problemLabel}
                </span>
              </div>
              <p className="text-[9px] leading-snug text-white/70 line-clamp-3">
                {renderBullet(pair.problem, i, "")}
              </p>
            </div>

            <div className="flex items-center justify-center">
              <span
                className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                style={{ background: alpha(glass.accent, "33"), color: glass.accent }}
              >
                →
              </span>
            </div>

            <div className={`${bentoCardClass} p-3 flex flex-col justify-center gap-1`} style={bentoCardStyle(glass, i === 0 ? "accent" : "surface", forExport)}>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                  style={{
                    background: i === 0 ? "rgba(0,0,0,0.14)" : alpha(glass.success, "22"),
                    color: i === 0 ? "#0a0a0a" : glass.success,
                  }}
                >
                  Fix
                </span>
                <span className={`text-[9px] font-bold line-clamp-1 ${i === 0 ? "text-black" : glass.titleClass}`}>
                  {renderLabel ? renderLabel(pair.solutionLabel, i + 10, "") : pair.solutionLabel}
                </span>
              </div>
              <p className={`text-[9px] leading-snug line-clamp-3 ${i === 0 ? "text-black/70" : glass.bodyClass}`}>
                {renderBullet(pair.solution, i + 10, "")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Сетка проблем с карточками-виджетами
export const ApexPainGrid: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  image?: string;
  cardImages?: string[];
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, parseBullet, renderBullet, renderLabel, image, cardImages, glass, forExport }) => {
  const count = Math.min(Math.max(content.slice(0, 4).length, 1), 4);
  return (
    <div
      className={`grid gap-3 ${slideBodyClass} overflow-hidden items-stretch h-full`}
      style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
    >
      {content.slice(0, 4).map((item, i) => {
        const parsed = parseBullet(item);
        const label = parsed.label || `Боль ${i + 1}`;
        const detail = parsed.detail || item;
        const Icon = pickPainIcon(`${label} ${detail}`, i);
        const colors = PAIN_ICON_COLORS[i % PAIN_ICON_COLORS.length];
        const cardImg = cardImages?.[i];
        const metric = extractMetricHint(item);

        const tone = (["soft", "surface", "ink", "accent"] as const)[i % 4];
        const onAccent = tone === "accent";
        const onInk = tone === "ink";
        const titleCls = onAccent ? "text-black" : onInk ? "text-white" : glass.titleClass;
        const bodyCls = onAccent ? "text-black/70" : onInk ? "text-white/70" : glass.bodyClass;
        return (
          <div
            key={i}
            className={`${glassCardClass} p-4 flex flex-col gap-3 text-left h-full justify-between`}
            style={bentoCardStyle(glass, tone, forExport)}
          >
            <BentoOrb glass={glass} ink={onInk} />
            {/* Верхняя часть: иконка или фото */}
            {cardImg ? (
              <div className="h-16 rounded-[1.25rem] overflow-hidden shrink-0">
                <PremiumImage src={cardImg} variant="thumb" className="!min-h-16 !h-16 !rounded-[1.25rem]" />
              </div>
            ) : (
              <div
                className="w-12 h-12 rounded-[1.1rem] flex items-center justify-center shrink-0"
                style={{
                  background: onAccent ? "rgba(0,0,0,0.12)" : onInk ? "rgba(255,255,255,0.12)" : colors.bg,
                  color: onAccent ? "#0a0a0a" : onInk ? "#fff" : colors.fg,
                }}
              >
                <Icon className="h-6 w-6" strokeWidth={1.5} />
              </div>
            )}

            {/* Заголовок и описание */}
            <div className="flex flex-col gap-2 flex-1">
              <h3 className={`text-sm font-semibold leading-tight line-clamp-2 ${titleCls}`}>
                {renderLabel ? renderLabel(label, i, "") : label}
              </h3>
              <p className={`text-xs leading-relaxed line-clamp-4 flex-1 ${bodyCls}`}>
                {renderBullet(detail, i, "")}
              </p>
            </div>

            {/* Метрика или инсайт внизу */}
            {metric ? (
              <div className="text-xs font-medium px-2 py-1 rounded-lg bg-white/5 w-fit" style={{ color: glass.danger }}>
                {metric}
              </div>
            ) : (
              <div className={`text-[10px] italic ${glass.mutedClass} border-t border-white/5 pt-2`}>
                {shortInsight(detail) || "Ключевая боль"}
              </div>
            )}
          </div>
        );
      })}
      {image && content.length <= 3 && (
        <div className="col-span-full rounded-3xl overflow-hidden h-24 mt-1">
          <PremiumImage src={image} variant="hero" className="!min-h-full !rounded-3xl" />
        </div>
      )}
    </div>
  );
};

// Панель рынка с улучшенной типографикой
export const ApexMarketPanel: React.FC<{
  content: string[];
  metrics?: SlideVisualData["metrics"];
  parseBullet: (s: string) => { label: string; detail: string };
  extractNumber: (s: string) => string;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, metrics, parseBullet, extractNumber, renderLabel, glass, forExport }) => {
  const items = metrics && metrics.length >= 2
    ? metrics.slice(0, 3).map((m) => ({ label: m.label, value: m.value, detail: "" }))
    : content.slice(0, 3).map((item) => {
        const parsed = parseBullet(item);
        const num = extractNumber(item);
        return {
          label: parsed.label || `Сегмент`,
          value: num || parsed.detail.slice(0, 50),
          detail: num ? parsed.detail.replace(num, "").replace(/^[\s—\-:]+/, "").trim() : parsed.detail,
        };
      });

  const accents = [glass.accent, glass.secondary, glass.success];

  return (
    <div className={`flex flex-col gap-3 h-full ${slideBodyClass}`}>
      <div className="grid gap-3 min-h-0 flex-1 items-stretch h-full" style={{ gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))` }}>
        {items.map((item, i) => (
          <div key={i} className={`${glassCardClass} p-4 flex flex-col gap-3 h-full justify-between`} style={glassCardStyle(glass, forExport)}>
            <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-lg w-fit" style={{ color: accents[i], background: `${accents[i]}15` }}>
              {renderLabel && !metrics?.length ? renderLabel(item.label, i, "") : item.label}
            </span>
            <div className={`text-xl font-bold leading-tight line-clamp-2 ${glass.titleClass}`}>{item.value}</div>
            {item.detail && (
              <p className={`text-xs leading-relaxed line-clamp-4 flex-1 ${glass.bodyClass}`}>{item.detail}</p>
            )}
            {/* Прогресс-бар для визуализации */}
            <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${40 + i * 25}%`, background: accents[i] }} />
            </div>
          </div>
        ))}
      </div>
      {content[3] && (
        <div className={`shrink-0 ${glassCardClass} px-4 py-2 flex items-center gap-2 border-emerald-500/20`} style={glassCardStyle(glass, forExport)}>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">Тренд</span>
          <span className={`text-xs line-clamp-1 ${glass.bodyClass}`}>{content[3]}</span>
        </div>
      )}
    </div>
  );
};

// Конкурентная панель
export const ApexCompetitionPanel: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  image?: string;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, parseBullet, renderBullet, image, glass, forExport }) => (
  <div className={`grid gap-3 ${slideBodyClass} ${image ? "grid-cols-3" : "grid-cols-2"}`}>
    <div className={`${glassCardClass} p-4 flex flex-col gap-2`} style={glassCardStyle(glass, forExport)}>
      <span className="text-[10px] font-medium uppercase tracking-wider text-rose-400">Конкуренты</span>
      <ul className="space-y-2 flex-1">
        {content.slice(0, 2).map((item, i) => (
          <li key={i} className={`text-xs leading-relaxed flex gap-2 ${glass.bodyClass}`}>
            <span className="text-rose-400 shrink-0 mt-0.5">●</span>
            <span className="line-clamp-2">{renderBullet(parseBullet(item).detail || item, i, "")}</span>
          </li>
        ))}
      </ul>
    </div>
    <div className={`${glassCardClass} p-4 flex flex-col gap-2 border-emerald-500/20`} style={glassCardStyle(glass, forExport)}>
      <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">Наше отличие</span>
      <ul className="space-y-2 flex-1">
        {(content.slice(2, 4).length ? content.slice(2, 4) : content.slice(0, 2)).map((item, i) => (
          <li key={i} className={`text-xs leading-relaxed flex gap-2 ${glass.isLight ? "text-emerald-800" : "text-emerald-100"}`}>
            <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
            <span className="line-clamp-2">{renderBullet(parseBullet(item).detail || item, i + 2, "")}</span>
          </li>
        ))}
      </ul>
    </div>
    {image && (
      <div className={`${glassCardClass} overflow-hidden p-1`} style={glassCardStyle(glass, forExport)}>
        <PremiumImage src={image} variant="thumb" className="!min-h-full h-full rounded-2xl" />
      </div>
    )}
  </div>
);

// Bento ROI / metrics grid (Supervity-style asymmetric tiles)
export const ApexStatsGrid: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  extractNumber: (s: string) => string;
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, parseBullet, extractNumber, renderBullet, renderLabel, glass, forExport }) => {
  const hasNumbers = content.slice(0, 4).some((item) => looksLikeMetric(item));

  if (!hasNumbers) {
    return (
      <ApexPainGrid
        content={content}
        parseBullet={parseBullet}
        renderBullet={renderBullet}
        renderLabel={renderLabel}
        glass={glass}
        forExport={forExport}
      />
    );
  }

  const items = content.slice(0, 4).map((item, i) => {
    const parsed = parseBullet(item);
    return {
      num: extractMetricValue(item) || extractNumber(item) || "",
      label: parsed.label || `Метрика ${i + 1}`,
      detail: parsed.detail || item,
      metric: extractMetricHint(item),
    };
  });

  while (items.length < 4) {
    items.push({ num: "—", label: "Метрика", detail: "", metric: null as string | null });
  }

  const [a, b, c, d] = items;
  const accentTitle = "text-black";
  const accentBody = "text-black/70";
  const inkTitle = "text-white";
  const inkBody = "text-white/70";

  return (
    <div
      className={`grid h-full min-h-0 ${slideBodyClass} overflow-hidden`}
      style={{
        gridTemplateColumns: "1.05fr 1.15fr 0.95fr",
        gridTemplateRows: "1.15fr 0.95fr",
        gap: "0.75rem",
      }}
    >
      <div className={`${bentoCardClass} p-4 flex flex-col justify-between`} style={{ ...bentoCardStyle(glass, "soft", forExport), gridColumn: "1", gridRow: "1" }}>
        <BentoOrb glass={glass} />
        <div className={`text-3xl sm:text-4xl font-black tracking-tight leading-none ${glass.titleClass}`}>{a.num || "100%"}</div>
        <div>
          <p className={`text-[11px] font-bold leading-tight line-clamp-2 ${glass.titleClass}`}>
            {renderLabel ? renderLabel(a.label, 0, "") : a.label}
          </p>
          {a.detail && <p className={`text-[9px] mt-1 line-clamp-2 ${glass.mutedClass}`}>{a.detail}</p>}
        </div>
      </div>

      <div
        className={`${bentoCardClass} p-4 flex flex-col justify-between`}
        style={{ ...bentoCardStyle(glass, "accent", forExport), gridColumn: "2", gridRow: "1 / span 2" }}
      >
        <div className="flex items-start justify-between">
          <div className="flex -space-x-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-7 w-7 rounded-full border-2 border-black/10"
                style={{ background: i === 1 ? "#0a0a0a" : "rgba(0,0,0,0.18)" }}
              />
            ))}
          </div>
          <span className="h-7 w-7 rounded-full bg-black/15 text-black flex items-center justify-center text-sm">→</span>
        </div>
        <div>
          <div className={`text-4xl sm:text-5xl font-black tracking-tight leading-none ${accentTitle}`}>{b.num || "70%"}</div>
          <p className={`text-[12px] font-bold mt-2 leading-snug line-clamp-3 ${accentTitle}`}>
            {renderLabel ? renderLabel(b.label, 1, "") : b.label}
          </p>
          {b.detail && <p className={`text-[9px] mt-1.5 line-clamp-3 ${accentBody}`}>{b.detail}</p>}
        </div>
      </div>

      <div className={`${bentoCardClass} p-4 flex flex-col justify-between`} style={{ ...bentoCardStyle(glass, "surface", forExport), gridColumn: "3", gridRow: "1" }}>
        <BentoOrb glass={glass} />
        <div
          className="absolute -right-4 -top-6 h-24 w-24 rounded-full blur-2xl opacity-50 pointer-events-none"
          style={{ background: glass.accent }}
        />
        <div className={`text-3xl sm:text-4xl font-black tracking-tight leading-none relative ${glass.titleClass}`}>{c.num || "80%+"}</div>
        <p className={`text-[10px] font-semibold line-clamp-2 relative ${glass.titleClass}`}>
          {renderLabel ? renderLabel(c.label, 2, "") : c.label}
        </p>
      </div>

      <div className={`${bentoCardClass} p-4 flex flex-col justify-between`} style={{ ...bentoCardStyle(glass, "ink", forExport), gridColumn: "3", gridRow: "2" }}>
        <BentoOrb glass={glass} ink />
        <div className={`text-3xl font-black tracking-tight leading-none ${inkTitle}`}>{d.num || "4"}</div>
        <p className={`text-[10px] font-semibold leading-snug line-clamp-3 ${inkBody}`}>
          {renderLabel ? renderLabel(d.label, 3, "") : d.label}
        </p>
      </div>

      <div className={`${bentoCardClass} px-4 py-3 flex items-center gap-2 flex-wrap content-center`} style={{ ...bentoCardStyle(glass, "surface", forExport), gridColumn: "1", gridRow: "2" }}>
        {[a, b, c, d]
          .flatMap((it, i) => (it.metric ? [{ t: it.metric as string, i }] : []))
          .slice(0, 3)
          .map((p) => (
            <BentoPill key={p.i} glass={glass} tone={p.i === 1 ? "accent" : "soft"}>
              {p.t}
            </BentoPill>
          ))}
        {!a.metric && !b.metric && (
          <>
            <BentoPill glass={glass} tone="accent">ROI</BentoPill>
            <BentoPill glass={glass} tone="ink">AI</BentoPill>
            <BentoPill glass={glass} tone="soft">Scale</BentoPill>
          </>
        )}
      </div>
    </div>
  );
};

export const ApexBigStat: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  extractNumber: (s: string) => string;
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, parseBullet, extractNumber, renderBullet, renderLabel, glass, forExport }) => {
  const primary = content[0] || "Ключевая метрика";
  const parsed = parseBullet(primary);
  const stat = extractMetricValue(primary) || extractNumber(primary);
  if (!stat || !looksLikeMetric(primary)) {
    return (
      <ApexFeatureColumns
        content={content}
        parseBullet={parseBullet}
        renderBullet={renderBullet}
        renderLabel={renderLabel}
        glass={glass}
        forExport={forExport}
      />
    );
  }
  const label = parsed.label && parsed.label !== stat ? parsed.label : "Главная цифра";
  return (
    <div className={`flex flex-col items-center justify-center text-center gap-3 px-4 ${slideBodyClass}`}>
      <span className="text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: glass.accent }}>
        {renderLabel ? renderLabel(label, 0, "") : label}
      </span>
      <div className={`text-5xl sm:text-6xl font-black tracking-tight leading-none ${glass.titleClass}`}>{stat}</div>
      {parsed.detail && parsed.detail !== stat && (
        <p className={`text-xs max-w-md leading-relaxed line-clamp-3 ${glass.bodyClass}`}>
          {renderBullet(parsed.detail, 0, "")}
        </p>
      )}
      {content.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          {content.slice(1, 4).map((item, i) => (
            <span
              key={i}
              className={`text-[9px] px-2.5 py-1 rounded-full border ${glass.isLight ? "bg-white/80 border-slate-200" : "bg-white/[0.06] border-white/10"} ${glass.bodyClass}`}
            >
              {renderBullet(item, i + 1, "")}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export const ApexQuotePoster: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, parseBullet, renderBullet, glass, forExport }) => {
  const items = parseItems(content, parseBullet);
  const quote = items[0]?.detail || content[0] || "";
  return (
    <div className={`flex flex-col justify-center gap-4 ${slideBodyClass}`}>
      <div className={`${glassCardClass} p-5 sm:p-6 flex flex-col justify-center min-h-[45%]`} style={glassCardStyle(glass, forExport)}>
        <div className="text-5xl font-black leading-none mb-2" style={{ color: alpha(glass.accent, "55") }}>
          “
        </div>
        <p className={`text-base sm:text-lg font-semibold leading-snug ${glass.titleClass}`}>
          {renderBullet(quote, 0, "")}
        </p>
      </div>
      {items.length > 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {items.slice(1, 4).map((item, i) => (
            <div key={i} className={`${glassCardClass} p-3`} style={glassCardStyle(glass, forExport)}>
              <p className={`text-[10px] font-semibold line-clamp-1 ${glass.titleClass}`}>{item.label}</p>
              <p className={`text-[9px] mt-1 line-clamp-3 ${glass.bodyClass}`}>{renderBullet(item.detail, i + 1, "")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ApexPainStack: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, parseBullet, renderBullet, renderLabel, glass, forExport }) => {
  const items = parseItems(content, parseBullet).slice(0, 4);
  const side = items.slice(1);
  const rows = Math.max(side.length, 1);
  return (
    <div className={`grid grid-cols-[1.1fr_1fr] gap-3 h-full ${slideBodyClass}`}>
      <div className={`${glassCardClass} p-4 flex flex-col justify-between h-full`} style={glassCardStyle(glass, forExport)}>
        <span className="text-[8px] uppercase tracking-widest font-bold" style={{ color: glass.danger }}>
          Главная боль
        </span>
        <div className="flex-1 flex flex-col justify-center">
          <div className={`text-4xl font-black ${glass.titleClass}`}>{items[0]?.number || "01"}</div>
          <h3 className={`text-sm font-bold mt-1 ${glass.titleClass}`}>
            {renderLabel ? renderLabel(items[0]?.label || "Проблема", 0, "") : items[0]?.label || "Проблема"}
          </h3>
          <p className={`text-[10px] mt-2 line-clamp-6 ${glass.bodyClass}`}>
            {renderBullet(items[0]?.detail || content[0] || "", 0, "")}
          </p>
        </div>
      </div>
      <div className="grid gap-2 h-full" style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}>
        {(side.length ? side : [{ label: "Инсайт", detail: "Дополнительный контекст", raw: "", number: "" }]).map((item, i) => (
          <div key={i} className={`${glassCardClass} p-3 flex gap-2 items-start h-full`} style={glassCardStyle(glass, forExport)}>
            <span
              className="text-[10px] font-mono font-bold rounded-full px-2 py-1 shrink-0"
              style={{ color: glass.danger, background: alpha(glass.danger, "22") }}
            >
              {String(i + 2).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h3 className={`text-[10px] font-semibold line-clamp-1 ${glass.titleClass}`}>
                {renderLabel ? renderLabel(item.label, i + 1, "") : item.label}
              </h3>
              <p className={`text-[8.5px] line-clamp-3 ${glass.bodyClass}`}>{renderBullet(item.detail, i + 1, "")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ApexSplitQuote: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, parseBullet, renderBullet, renderLabel, glass, forExport }) => {
  const items = parseItems(content, parseBullet).slice(0, 4);
  const side = items.slice(1);
  return (
    <div className={`grid grid-cols-[0.95fr_1.05fr] gap-3 h-full ${slideBodyClass}`}>
      <div
        className={`${glassCardClass} p-4 flex flex-col justify-between h-full`}
        style={{ ...glassCardStyle(glass, forExport), borderColor: alpha(glass.danger, "55") }}
      >
        <div className="text-5xl font-black leading-none" style={{ color: alpha(glass.danger, "88") }}>
          “
        </div>
        <p className={`text-sm font-semibold leading-tight flex-1 flex items-center ${glass.titleClass}`}>
          {renderBullet(items[0]?.detail || content[0] || "", 0, "")}
        </p>
        <span className={`text-[8px] uppercase tracking-widest ${glass.mutedClass}`}>голос клиента</span>
      </div>
      <div className="grid gap-2 h-full" style={{ gridTemplateRows: `repeat(${Math.max(side.length, 1)}, minmax(0, 1fr))` }}>
        {(side.length ? side : [{ label: "Инсайт", detail: "Контекст", raw: "", number: "" }]).map((item, i) => (
          <div key={i} className={`${glassCardClass} p-3 flex flex-col justify-center h-full`} style={glassCardStyle(glass, forExport)}>
            <span className="text-[7px] uppercase tracking-widest font-bold" style={{ color: glass.accent }}>
              {renderLabel ? renderLabel(item.label, i + 1, "") : item.label}
            </span>
            <p className={`text-[9px] mt-1 line-clamp-3 ${glass.bodyClass}`}>{renderBullet(item.detail, i + 1, "")}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ApexFeatureColumns: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, parseBullet, renderBullet, renderLabel, glass, forExport }) => {
  const items = parseItems(content, parseBullet).slice(0, 4);
  const cols = Math.min(Math.max(items.length, 1), 4);
  const tones = ["soft", "ink", "accent", "surface"] as const;
  return (
    <div
      className={`grid gap-3 h-full items-stretch ${slideBodyClass}`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {items.map((item, i) => {
        const tone = tones[i % tones.length];
        const onAccent = tone === "accent";
        const onInk = tone === "ink";
        const titleCls = onAccent ? "text-black" : onInk ? "text-white" : glass.titleClass;
        const bodyCls = onAccent ? "text-black/70" : onInk ? "text-white/65" : glass.bodyClass;
        return (
          <div
            key={i}
            className={`${glassCardClass} p-4 flex flex-col gap-2.5 h-full justify-between`}
            style={bentoCardStyle(glass, tone, forExport)}
          >
            <div className="flex items-start justify-between gap-2 relative min-h-[1.75rem]">
              <BentoPill glass={glass} tone={onAccent ? "ink" : onInk ? "accent" : "accent"}>
                {String(i + 1).padStart(2, "0")}
              </BentoPill>
            </div>
            <BentoOrb glass={glass} ink={onInk} />
            <h3 className={`text-[12px] font-bold leading-tight line-clamp-2 ${titleCls}`}>
              {renderLabel ? renderLabel(item.label, i, "") : item.label}
            </h3>
            <p className={`text-[9px] leading-snug line-clamp-5 flex-1 ${bodyCls}`}>
              {renderBullet(item.detail, i, "")}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export const ApexProductSplit: React.FC<{
  content: string[];
  image?: string;
  imageCaption?: string;
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, image, imageCaption, parseBullet, renderBullet, renderLabel, glass, forExport }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch h-full ${slideBodyClass}`}>
    <div className={`${glassCardClass} p-3.5 space-y-2 flex flex-col justify-center h-full`} style={glassCardStyle(glass, forExport)}>
      {content.slice(0, 3).map((item, i) => {
        const p = parseBullet(item);
        return (
          <div
            key={i}
            className={`flex gap-2.5 items-start rounded-2xl p-2.5 border ${glass.isLight ? "border-white/60 bg-white/40" : "border-white/10 bg-white/[0.04]"}`}
          >
            <div
              className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-sm font-bold"
              style={{ background: alpha(glass.accent, "22"), color: glass.accent }}
            >
              {i + 1}
            </div>
            <div className="min-w-0">
              {p.label && (
                <h3 className={`text-[10px] font-semibold mb-0.5 ${glass.titleClass}`}>
                  {renderLabel ? renderLabel(p.label, i, "") : p.label}
                </h3>
              )}
              <p className={`text-[9px] leading-relaxed line-clamp-3 ${glass.bodyClass}`}>
                {renderBullet(p.detail || item, i, "")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
    {image ? (
      <div className={`${glassCardClass} p-1.5 overflow-hidden h-full`} style={glassCardStyle(glass, forExport)}>
        <PremiumImage src={image} caption={imageCaption} variant="hero" className="!rounded-2xl !min-h-full" />
      </div>
    ) : (
      <div className={`${glassCardClass} p-3.5 flex flex-col gap-2 h-full`} style={glassCardStyle(glass, forExport)}>
        <span className="text-[8px] uppercase tracking-widest font-bold" style={{ color: glass.accent }}>
          Как работает
        </span>
        {content.slice(0, 3).map((item, i) => {
          const p = parseBullet(item);
          return (
            <div key={i} className="flex-1 flex gap-2 items-start min-h-0">
              <span className="text-[10px] font-bold shrink-0" style={{ color: glass.accent }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className={`text-[9px] line-clamp-4 ${glass.bodyClass}`}>{renderBullet(p.detail || item, i, "")}</p>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

export const ApexDemoHero: React.FC<{
  content: string[];
  image?: string;
  imageCaption?: string;
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, image, imageCaption, parseBullet, renderBullet, renderLabel, glass, forExport }) => {
  if (!image) {
    return (
      <ApexFeatureColumns
        content={content}
        parseBullet={parseBullet}
        renderBullet={renderBullet}
        renderLabel={renderLabel}
        glass={glass}
        forExport={forExport}
      />
    );
  }
  const items = parseItems(content, parseBullet).slice(0, 3);
  return (
    <div className={`grid grid-cols-[1.15fr_0.85fr] gap-3 h-full ${slideBodyClass}`}>
      <div className={`${glassCardClass} p-2 overflow-hidden h-full`} style={glassCardStyle(glass, forExport)}>
        <PremiumImage src={image} caption={imageCaption} variant="hero" className="!rounded-2xl !min-h-full" />
      </div>
      <div className="grid gap-2 h-full" style={{ gridTemplateRows: `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))` }}>
        {items.map((item, i) => (
          <div key={i} className={`${glassCardClass} p-3 flex flex-col justify-center`} style={glassCardStyle(glass, forExport)}>
            <span className="text-[7px] uppercase tracking-widest font-bold" style={{ color: glass.accent }}>
              {renderLabel ? renderLabel(item.label, i, "") : item.label}
            </span>
            <p className={`text-[9px] mt-1 line-clamp-4 ${glass.bodyClass}`}>{renderBullet(item.detail, i, "")}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ApexChartFocus: React.FC<{
  content: string[];
  metrics?: SlideVisualData["metrics"];
  parseBullet: (s: string) => { label: string; detail: string };
  extractNumber: (s: string) => string;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, metrics, parseBullet, extractNumber, renderLabel, glass, forExport }) => {
  const items = metrics?.length
    ? metrics.slice(0, 4)
    : parseItems(content, parseBullet)
        .slice(0, 4)
        .map((i) => ({
          label: i.label,
          value: extractNumber(i.raw) || i.number || i.detail.slice(0, 18),
          highlight: Boolean(i.number),
        }));
  return (
    <div className={`grid grid-cols-[1.1fr_0.9fr] gap-3 h-full ${slideBodyClass}`}>
      <div className={`${glassCardClass} p-4 flex flex-col justify-end relative overflow-hidden h-full`} style={glassCardStyle(glass, forExport)}>
        <div className="absolute inset-x-4 top-4 bottom-12 flex items-end gap-2">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-xl"
              style={{
                height: `${36 + i * 16}%`,
                background: `linear-gradient(to top, ${glass.accent}, ${alpha(glass.secondary, "AA")})`,
                opacity: item.highlight ? 1 : 0.7,
              }}
            />
          ))}
        </div>
        <div className="relative z-10">
          <span className="text-[8px] uppercase tracking-widest font-bold" style={{ color: glass.accent }}>
            market signal
          </span>
          <p className={`text-[10px] mt-1 ${glass.mutedClass}`}>{content[3] || "Фокус на платящем сегменте."}</p>
        </div>
      </div>
      <div className="grid gap-2 h-full" style={{ gridTemplateRows: `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))` }}>
        {items.map((item, i) => (
          <div key={i} className={`${glassCardClass} px-3 py-2 flex items-center justify-between gap-2`} style={glassCardStyle(glass, forExport)}>
            <span className={`text-[8px] line-clamp-1 ${glass.bodyClass}`}>
              {renderLabel && !metrics?.length ? renderLabel(item.label, i, "") : item.label}
            </span>
            <strong className={`text-[11px] shrink-0 ${glass.titleClass}`}>{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ApexPricingCards: React.FC<{
  content: string[];
  pricing?: SlideVisualData["pricing"];
  parseBullet: (s: string) => { label: string; detail: string };
  extractNumber: (s: string) => string;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, pricing, parseBullet, extractNumber, glass, forExport }) => {
  const items = pricing?.length
    ? pricing.slice(0, 3).map((p) => ({ label: p.label, price: p.price, detail: p.detail || p.price, featured: p.featured }))
    : content.slice(0, 3).map((item, i) => {
        const p = parseBullet(item);
        return { label: p.label || `Тариф ${i + 1}`, price: extractNumber(item) || p.detail, detail: p.detail, featured: i === 1 };
      });
  return (
    <div
      className={`grid gap-2.5 h-full items-stretch ${slideBodyClass}`}
      style={{ gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))` }}
    >
      {items.map((item, i) => {
        const featured = item.featured || i === 1;
        return (
          <div
            key={i}
            className={`${glassCardClass} p-4 flex flex-col justify-between h-full ${featured ? "ring-1 ring-white/25" : ""}`}
            style={
              featured
                ? {
                    background: `linear-gradient(160deg, ${alpha(glass.accent, "E6")}, ${alpha(glass.secondary, "CC")})`,
                    borderColor: "rgba(255,255,255,0.25)",
                  }
                : glassCardStyle(glass, forExport)
            }
          >
            <div className={`text-[8px] uppercase tracking-widest ${featured ? "text-white/70" : glass.mutedClass}`}>
              {item.label}
            </div>
            <div className={`text-xl font-black my-2 ${featured ? "text-white" : glass.titleClass}`}>{item.price}</div>
            <p className={`text-[9px] leading-relaxed line-clamp-5 ${featured ? "text-white/85" : glass.bodyClass}`}>
              {item.detail}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export const ApexRevenueLadder: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  extractNumber: (s: string) => string;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, parseBullet, extractNumber, renderLabel, glass, forExport }) => {
  const items = parseItems(content, parseBullet).slice(0, 4);
  return (
    <div className={`grid grid-cols-4 gap-2 items-stretch h-full ${slideBodyClass}`}>
      {items.map((item, i) => (
        <div
          key={i}
          className={`${glassCardClass} p-3 flex flex-col justify-between`}
          style={{ ...glassCardStyle(glass, forExport), minHeight: `${70 + i * 8}%` }}
        >
          <span className="text-[7px] uppercase tracking-widest font-bold line-clamp-1" style={{ color: glass.accent }}>
            {renderLabel ? renderLabel(item.label, i, "") : item.label}
          </span>
          <div>
            <div className={`text-base font-black ${glass.titleClass}`}>
              {extractNumber(item.raw) || item.number || `${i + 1}x`}
            </div>
            <p className={`text-[8px] line-clamp-3 mt-1 ${glass.bodyClass}`}>{item.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

type CompetitorRow = NonNullable<SlideVisualData["competitors"]>[number];
type CompareFeature = NonNullable<SlideVisualData["compareFeatures"]>[number];

function normalizeCompetitors(
  content: string[],
  competitors: SlideVisualData["competitors"] | undefined,
  parseBullet: (s: string) => { label: string; detail: string },
): CompetitorRow[] {
  if (competitors?.length) {
    return competitors.slice(0, 4).map((c, i) => ({
      ...c,
      label: c.label || `Игрок ${i + 1}`,
      detail: c.detail || "",
      advantages: (c.advantages || []).slice(0, 6),
      rating: typeof c.rating === "number" ? Math.min(10, Math.max(1, c.rating)) : c.ours ? 9 : 5 + i,
    }));
  }
  const items = parseItems(content, parseBullet).slice(0, 4);
  return items.map((item, i) => {
    const ours = /наш|мы|отлич|преим|nordflow|наш продукт/i.test(`${item.label} ${item.detail}`) || i === items.length - 1;
    return {
      label: item.label,
      detail: item.detail,
      ours,
      advantages: item.detail
        .split(/[,;•]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 4),
      rating: ours ? 9 : 4 + i,
    };
  });
}

function buildCompareFeatures(
  players: CompetitorRow[],
  compareFeatures: SlideVisualData["compareFeatures"] | undefined,
): CompareFeature[] {
  if (compareFeatures?.length) {
    return compareFeatures.slice(0, 8).map((f) => ({
      label: f.label,
      scores: players.map((_, i) => f.scores[i] ?? false),
    }));
  }

  const pool = [
    "Цена / прозрачность",
    "Онлайн-бронь",
    "Страховка / SLA",
    "Ассортимент",
    "Скорость выдачи",
    "Рейтинг / отзывы",
    "B2B контракты",
    "Данные / аналитика",
  ];

  const featureSet = new Set<string>();
  players.forEach((p) => (p.advantages || []).forEach((a) => featureSet.add(a.slice(0, 42))));
  const labels = [...featureSet].slice(0, 6);
  while (labels.length < 6) {
    const next = pool[labels.length];
    if (!labels.includes(next)) labels.push(next);
    else break;
  }

  return labels.slice(0, 7).map((label, fi) => ({
    label,
    scores: players.map((p) => {
      if (p.ours) return fi < 6 ? true : "partial";
      const hit = (p.advantages || []).some((a) => a.toLowerCase().includes(label.slice(0, 8).toLowerCase()));
      if (hit) return true;
      if (fi === 0) return "partial";
      return fi % (players.indexOf(p) + 2) === 0 ? "partial" : false;
    }),
  }));
}

function CompetitorLogoSlot({
  player,
  glass,
  forExport,
  editable,
  onLogoChange,
}: {
  player: CompetitorRow;
  glass: GlassSurface;
  forExport?: boolean;
  editable?: boolean;
  onLogoChange?: (logo: string) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const initial = (player.label || "?").trim().charAt(0).toUpperCase() || "?";

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onLogoChange?.(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <button
      type="button"
      disabled={!editable || forExport}
      onClick={() => inputRef.current?.click()}
      className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden border shrink-0 flex items-center justify-center ${
        editable && !forExport ? "cursor-pointer group" : "cursor-default"
      }`}
      style={{
        borderColor: player.ours ? alpha(glass.accent, "66") : glass.isLight ? "rgba(15,23,42,0.1)" : "rgba(255,255,255,0.14)",
        background: player.ours
          ? `linear-gradient(145deg, ${alpha(glass.accent, "44")}, ${alpha(glass.secondary, "33")})`
          : glass.isLight
            ? "rgba(15,23,42,0.04)"
            : "rgba(255,255,255,0.06)",
      }}
      title={editable ? "Загрузить лого конкурента" : player.label}
    >
      {player.logo ? (
        <img src={player.logo} alt={player.label} className="w-full h-full object-cover" />
      ) : (
        <span className={`text-base font-black ${glass.titleClass}`}>{initial}</span>
      )}
      {editable && !forExport && (
        <span className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
          <ImagePlus className="h-3.5 w-3.5 text-white" />
          <span className="text-[6px] text-white/90 uppercase tracking-wider mt-0.5">лого</span>
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </button>
  );
}

function ScoreCell({
  value,
  glass,
}: {
  value: boolean | "partial";
  glass: GlassSurface;
}) {
  if (value === true) {
    return (
      <span
        className="inline-flex items-center justify-center w-6 h-6 rounded-full"
        style={{ background: alpha(glass.success, "22"), color: glass.success }}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    );
  }
  if (value === "partial") {
    return (
      <span
        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[8px] font-bold"
        style={{ background: alpha(glass.warning, "22"), color: glass.warning }}
      >
        ~
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full"
      style={{ background: alpha(glass.danger, "14"), color: glass.danger }}
    >
      <X className="h-3 w-3" strokeWidth={2.5} />
    </span>
  );
}

/** Maxed competition slide: logos + advantage cards + feature matrix */
export const ApexCompetitionArena: React.FC<{
  content: string[];
  competitors?: SlideVisualData["competitors"];
  compareFeatures?: SlideVisualData["compareFeatures"];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  glass: GlassSurface;
  forExport?: boolean;
  editable?: boolean;
  onCompetitorsChange?: (competitors: CompetitorRow[]) => void;
}> = ({
  content,
  competitors,
  compareFeatures,
  parseBullet,
  renderBullet,
  glass,
  forExport,
  editable,
  onCompetitorsChange,
}) => {
  const players = normalizeCompetitors(content, competitors, parseBullet);
  const features = buildCompareFeatures(players, compareFeatures);
  const cols = Math.min(Math.max(players.length, 2), 4);

  const patchPlayer = (index: number, patch: Partial<CompetitorRow>) => {
    const next = players.map((p, i) => (i === index ? { ...p, ...patch } : p));
    onCompetitorsChange?.(next);
  };

  return (
    <div className={`flex flex-col gap-2 h-full min-h-0 ${slideBodyClass}`}>
      {/* Player cards with logos */}
      <div
        className="grid gap-2 shrink-0"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {players.map((player, i) => {
          const rating = player.rating ?? (player.ours ? 9 : 5);
          const tone = player.ours ? "accent" : ((["soft", "surface", "ink"] as const)[i % 3]);
          const onAccent = tone === "accent";
          const onInk = tone === "ink";
          const titleCls = onAccent ? "text-black" : onInk ? "text-white" : glass.titleClass;
          const mutedCls = onAccent ? "text-black/60" : onInk ? "text-white/55" : glass.mutedClass;
          const bodyCls = onAccent ? "text-black/75" : onInk ? "text-white/70" : glass.bodyClass;
          return (
            <div
              key={i}
              className={`${glassCardClass} p-3 flex flex-col gap-2 min-h-0`}
              style={bentoCardStyle(glass, tone, forExport)}
            >
              <div className="flex items-center gap-2">
                <CompetitorLogoSlot
                  player={player}
                  glass={glass}
                  forExport={forExport}
                  editable={editable}
                  onLogoChange={(logo) => patchPlayer(i, { logo })}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className={`text-[10px] font-bold truncate ${titleCls}`}>{player.label}</p>
                    {player.ours && (
                      <BentoPill glass={glass} tone="ink">мы</BentoPill>
                    )}
                  </div>
                  <p className={`text-[8px] line-clamp-1 ${mutedCls}`}>
                    {player.tagline || player.detail}
                  </p>
                </div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: onAccent ? "rgba(0,0,0,0.12)" : onInk ? "rgba(255,255,255,0.14)" : glass.isLight ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.08)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${rating * 10}%`,
                    background: onAccent ? "#0a0a0a" : player.ours ? glass.accent : glass.secondary,
                  }}
                />
              </div>
              <ul className="space-y-0.5 min-h-0">
                {(player.advantages?.length
                  ? player.advantages
                  : player.detail
                    ? [player.detail]
                    : ["—"]
                )
                  .slice(0, player.ours ? 6 : 4)
                  .map((adv, ai) => (
                    <li key={ai} className={`text-[7.5px] leading-snug flex gap-1 ${bodyCls}`}>
                      <span className="shrink-0">{player.ours ? "✓" : "·"}</span>
                      <span className="line-clamp-1">{adv}</span>
                    </li>
                  ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Feature matrix */}
      <div className={`${glassCardClass} flex-1 min-h-0 overflow-hidden flex flex-col`} style={glassCardStyle(glass, forExport)}>
        <div
          className="grid gap-0 px-2 py-1.5 border-b shrink-0 items-center"
          style={{
            gridTemplateColumns: `minmax(90px, 1.35fr) repeat(${cols}, minmax(0, 1fr))`,
            borderColor: glass.isLight ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.1)",
            background: glass.isLight ? "rgba(15,23,42,0.03)" : "rgba(255,255,255,0.04)",
          }}
        >
          <span className="text-[7px] uppercase tracking-widest font-bold" style={{ color: glass.accent }}>
            Преимущество
          </span>
          {players.map((p, i) => (
            <span key={i} className={`text-[7px] font-bold text-center truncate px-0.5 ${p.ours ? "" : glass.mutedClass}`} style={p.ours ? { color: glass.accent } : undefined}>
              {p.label}
            </span>
          ))}
        </div>
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {features.map((feat, fi) => (
            <div
              key={fi}
              className="grid gap-0 px-2 py-1 flex-1 items-center min-h-0 border-b last:border-b-0"
              style={{
                gridTemplateColumns: `minmax(90px, 1.35fr) repeat(${cols}, minmax(0, 1fr))`,
                borderColor: glass.isLight ? "rgba(15,23,42,0.05)" : "rgba(255,255,255,0.05)",
                background: fi % 2 === 0 ? "transparent" : glass.isLight ? "rgba(15,23,42,0.02)" : "rgba(255,255,255,0.02)",
              }}
            >
              <span className={`text-[8px] font-medium line-clamp-2 pr-1 ${glass.bodyClass}`}>{feat.label}</span>
              {players.map((_, pi) => (
                <div key={pi} className="flex justify-center">
                  <ScoreCell value={feat.scores[pi] ?? false} glass={glass} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {editable && !forExport && (
        <p className={`text-[7px] ${glass.mutedClass}`}>
          Нажми на лого → загрузить. Матрица: ✓ есть · ~ частично · ✕ нет
        </p>
      )}
    </div>
  );
};

/** Compact comparison table — usable as alternate competition variant */
export const ApexCompareTable: React.FC<{
  content: string[];
  competitors?: SlideVisualData["competitors"];
  parseBullet: (s: string) => { label: string; detail: string };
  glass: GlassSurface;
  forExport?: boolean;
  editable?: boolean;
  onCompetitorsChange?: (competitors: CompetitorRow[]) => void;
}> = ({ content, competitors, parseBullet, glass, forExport, editable, onCompetitorsChange }) => {
  const players = normalizeCompetitors(content, competitors, parseBullet);
  const rows = players.slice(0, 5);

  return (
    <div className={`flex flex-col gap-2 h-full min-h-0 ${slideBodyClass}`}>
      <div className={`${glassCardClass} overflow-hidden flex-1 min-h-0 flex flex-col`} style={glassCardStyle(glass, forExport)}>
        <div
          className="grid grid-cols-[1.1fr_1.4fr_0.55fr_0.55fr] gap-0 px-3 py-2.5 border-b shrink-0 items-center"
          style={{
            borderColor: glass.isLight ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.1)",
            background: glass.isLight ? "rgba(15,23,42,0.03)" : "rgba(255,255,255,0.04)",
          }}
        >
          <span className="text-[8px] uppercase tracking-widest font-bold" style={{ color: glass.accent }}>
            Игрок
          </span>
          <span className="text-[8px] uppercase tracking-widest font-bold" style={{ color: glass.accent }}>
            Суть
          </span>
          <span className="text-[8px] uppercase tracking-widest font-bold text-center" style={{ color: glass.success }}>
            Сила
          </span>
          <span className={`text-[8px] uppercase tracking-widest font-bold text-center ${glass.mutedClass}`}>Статус</span>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {rows.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-[1.1fr_1.4fr_0.55fr_0.55fr] gap-0 px-3 py-2 flex-1 items-center border-b last:border-b-0 min-h-0"
              style={{
                borderColor: glass.isLight ? "rgba(15,23,42,0.06)" : "rgba(255,255,255,0.06)",
                background: i % 2 === 0 ? "transparent" : glass.isLight ? "rgba(15,23,42,0.02)" : "rgba(255,255,255,0.02)",
              }}
            >
              <div className="flex items-center gap-2 min-w-0 pr-1">
                <CompetitorLogoSlot
                  player={row}
                  glass={glass}
                  forExport={forExport}
                  editable={editable}
                  onLogoChange={(logo) => {
                    const next = players.map((p, idx) => (idx === i ? { ...p, logo } : p));
                    onCompetitorsChange?.(next);
                  }}
                />
                <p className={`text-[10px] font-semibold line-clamp-1 ${glass.titleClass}`}>{row.label}</p>
              </div>
              <p className={`text-[8px] line-clamp-2 ${glass.mutedClass}`}>{row.detail}</p>
              <div className="flex justify-center">
                <span className={`text-[11px] font-black ${glass.titleClass}`}>{row.rating ?? "—"}</span>
              </div>
              <div className="flex justify-center">
                {row.ours ? (
                  <span className="text-[7px] uppercase font-bold px-1.5 py-0.5 rounded" style={{ background: alpha(glass.accent, "28"), color: glass.accent }}>
                    мы
                  </span>
                ) : (
                  <span className={`text-[10px] ${glass.mutedClass}`}>VS</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ApexPositioningMap: React.FC<{
  content: string[];
  competitors?: SlideVisualData["competitors"];
  parseBullet: (s: string) => { label: string; detail: string };
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, competitors, parseBullet, glass, forExport }) => {
  const items = competitors?.length
    ? competitors.slice(0, 4).map((c) => ({ label: c.label, detail: c.detail, ours: c.ours }))
    : parseItems(content, parseBullet)
        .slice(0, 4)
        .map((i, idx) => ({ ...i, ours: idx >= 3 }));
  return (
    <div className={`grid grid-cols-[1fr_0.9fr] gap-3 h-full ${slideBodyClass}`}>
      <div className={`${glassCardClass} p-4 relative overflow-hidden h-full`} style={glassCardStyle(glass, forExport)}>
        <div className={`absolute left-4 right-4 top-1/2 h-px ${glass.isLight ? "bg-neutral-300" : "bg-white/15"}`} />
        <div className={`absolute top-4 bottom-4 left-1/2 w-px ${glass.isLight ? "bg-neutral-300" : "bg-white/15"}`} />
        {items.map((item, i) => (
          <div
            key={i}
            className="absolute rounded-xl px-2 py-1 text-[8px] font-semibold border"
            style={{
              left: `${i === 0 ? 12 : i === 1 ? 55 : i === 2 ? 18 : 62}%`,
              top: `${i === 0 ? 18 : i === 1 ? 28 : i === 2 ? 62 : 58}%`,
              color: item.ours ? "#fff" : glass.isLight ? "#171717" : "#fff",
              background: item.ours ? glass.accent : glass.isLight ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.1)",
              borderColor: item.ours ? alpha(glass.accent, "88") : "rgba(255,255,255,0.18)",
            }}
          >
            {item.ours ? "Мы" : item.label}
          </div>
        ))}
        <span className={`absolute left-4 bottom-2 text-[7px] ${glass.mutedClass}`}>низкая дифф.</span>
        <span className={`absolute right-4 top-2 text-[7px] ${glass.mutedClass}`}>премиум</span>
      </div>
      <div className="grid gap-2 h-full" style={{ gridTemplateRows: `repeat(${Math.min(items.length, 3)}, minmax(0, 1fr))` }}>
        {items.slice(0, 3).map((item, i) => (
          <div key={i} className={`${glassCardClass} p-3 flex flex-col justify-center`} style={glassCardStyle(glass, forExport)}>
            <span className="text-[7px] uppercase tracking-widest font-bold" style={{ color: glass.accent }}>
              {item.label}
            </span>
            <p className={`text-[8.5px] line-clamp-2 mt-1 ${glass.bodyClass}`}>{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ApexRoadmap: React.FC<{
  content: string[];
  timeline?: SlideVisualData["timeline"];
  parseBullet: (s: string) => { label: string; detail: string };
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, timeline, parseBullet, renderLabel, glass, forExport }) => {
  const items = timeline?.length
    ? timeline.slice(0, 4).map((t) => ({ label: t.label, title: t.title, detail: t.detail || "" }))
    : parseItems(content, parseBullet)
        .slice(0, 4)
        .map((i) => ({ label: i.label, title: i.label, detail: i.detail }));
  return (
    <div className={`relative pl-1 h-full overflow-hidden ${slideBodyClass}`}>
      <div className="absolute left-[18px] top-3 bottom-3 w-px" style={{ background: alpha(glass.accent, "44") }} />
      <div className="grid gap-2 h-full" style={{ gridTemplateRows: `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))` }}>
        {items.map((item, i) => (
          <div key={i} className="relative flex gap-3 items-stretch min-h-0">
            <div
              className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold z-10 border"
              style={{ background: alpha(glass.accent, "22"), color: glass.accent, borderColor: alpha(glass.accent, "44") }}
            >
              {item.label.slice(0, 3)}
            </div>
            <div className={`${glassCardClass} p-3 flex-1 min-w-0`} style={glassCardStyle(glass, forExport)}>
              <h3 className={`text-[11px] font-bold line-clamp-1 ${glass.titleClass}`}>
                {renderLabel ? renderLabel(item.title, i, "") : item.title}
              </h3>
              <p className={`text-[9px] mt-1 line-clamp-3 ${glass.bodyClass}`}>{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ApexGtmFunnel: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, parseBullet, renderLabel, glass, forExport }) => {
  const items = parseItems(content, parseBullet).slice(0, 3);
  const icons = ["📣", "🎯", "🚀"];
  return (
    <div
      className={`grid gap-2.5 h-full items-stretch ${slideBodyClass}`}
      style={{ gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))` }}
    >
      {items.map((item, i) => (
        <div key={i} className={`${glassCardClass} p-3.5 flex flex-col h-full`} style={glassCardStyle(glass, forExport)}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ background: alpha(glass.accent, "18") }}>
              {icons[i] || "•"}
            </span>
            <span className="text-[9px] uppercase tracking-widest font-bold line-clamp-2" style={{ color: glass.accent }}>
              {renderLabel ? renderLabel(item.label, i, "") : item.label}
            </span>
          </div>
          <p className={`text-[9px] leading-relaxed line-clamp-6 flex-1 ${glass.bodyClass}`}>{item.detail}</p>
        </div>
      ))}
    </div>
  );
};

export const ApexFundingSplit: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  extractNumber: (s: string) => string;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, parseBullet, extractNumber, renderLabel, glass, forExport }) => {
  const items = parseItems(content, parseBullet).slice(0, 4);
  const ask = items[0];
  return (
    <div className={`grid grid-cols-[0.95fr_1.05fr] gap-3 h-full ${slideBodyClass}`}>
      <div
        className={`${glassCardClass} p-5 flex flex-col justify-center text-center h-full`}
        style={bentoCardStyle(glass, "accent", forExport)}
      >
        <span className="text-[8px] uppercase tracking-widest text-black/55 font-bold">Запрос</span>
        <div className="text-3xl sm:text-4xl font-black text-black mt-2">
          {extractNumber(ask?.raw || "") || ask?.number || "Seed"}
        </div>
        <p className="text-[10px] text-black/75 mt-2 line-clamp-3">{ask?.detail || ask?.label}</p>
      </div>
      <div className="grid gap-2 h-full" style={{ gridTemplateRows: `repeat(${Math.max(items.length - 1, 1)}, minmax(0, 1fr))` }}>
        {items.slice(1).map((item, i) => (
          <div key={i} className={`${glassCardClass} p-3 flex flex-col justify-center`} style={glassCardStyle(glass, forExport)}>
            <span className="text-[7px] uppercase tracking-widest font-bold" style={{ color: glass.accent }}>
              {renderLabel ? renderLabel(item.label, i + 1, "") : item.label}
            </span>
            <p className={`text-[9px] mt-1 line-clamp-3 ${glass.bodyClass}`}>{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ApexCTA: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  content: string[];
  image?: string;
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ title, subtitle, content, renderBullet, glass, forExport }) => {
  const cards = content.slice(0, 3);
  while (cards.length < 3) cards.push(cards[cards.length - 1] || "Связаться");
  const tones = ["ink", "soft", "accent"] as const;
  return (
    <div className={`grid grid-cols-[1.05fr_1.35fr] gap-3 h-full min-h-0 ${slideBodyClass}`}>
      <div className="flex flex-col justify-center gap-2 pr-1">
        <h2 className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-[1.1] ${glass.titleClass}`}>
          {title}
        </h2>
        {subtitle && <p className={`text-[11px] leading-relaxed ${glass.mutedClass}`}>{subtitle}</p>}
      </div>
      <div className="grid grid-cols-3 gap-2.5 h-full min-h-0">
        {cards.map((item, i) => {
          const tone = tones[i];
          const onAccent = tone === "accent";
          const onInk = tone === "ink";
          return (
            <div
              key={i}
              className={`${glassCardClass} p-3.5 flex flex-col justify-between h-full`}
              style={bentoCardStyle(glass, tone, forExport)}
            >
              <BentoOrb glass={glass} ink={onInk} />
              <p className={`text-[10px] font-semibold leading-snug line-clamp-6 mt-6 ${onAccent ? "text-black" : onInk ? "text-white" : glass.titleClass}`}>
                {renderBullet(item, i, "")}
              </p>
              <span
                className="mt-3 inline-flex self-start px-2.5 py-1 rounded-full text-[8px] font-bold"
                style={{
                  background: onAccent ? "#0a0a0a" : onInk ? glass.accent : glass.isLight ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.1)",
                  color: onAccent ? "#fff" : onInk ? "#0a0a0a" : glass.isLight ? "#0a0a0a" : "#fff",
                }}
              >
                {i === 2 ? "Go →" : "Next"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ApexVisionMap: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, parseBullet, renderBullet, renderLabel, glass, forExport }) => {
  const items = parseItems(content, parseBullet).slice(0, 4);
  return (
    <div className={`grid grid-cols-2 gap-2.5 h-full ${slideBodyClass}`}>
      {items.map((item, i) => (
        <div key={i} className={`${glassCardClass} p-3.5 flex flex-col justify-between h-full`} style={glassCardStyle(glass, forExport)}>
          <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: glass.accent }}>
            {String(i + 1).padStart(2, "0")} · {renderLabel ? renderLabel(item.label, i, "") : item.label}
          </span>
          <p className={`text-[10px] leading-relaxed line-clamp-5 mt-2 ${glass.bodyClass}`}>
            {renderBullet(item.detail, i, "")}
          </p>
        </div>
      ))}
    </div>
  );
};

export const SwissProblemGrid: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  image?: string;
  cardImages?: string[];
  glass: GlassSurface;
  forExport?: boolean;
}> = (props) => <ApexPainGrid {...props} />;

export const SwissSolutionList: React.FC<{
  content: string[];
  image?: string;
  imageCaption?: string;
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, image, imageCaption, parseBullet, renderBullet, renderLabel, glass, forExport }) => {
  if (!image) {
    return (
      <div className={`grid grid-cols-2 gap-2.5 h-full ${slideBodyClass}`}>
        {content.slice(0, 4).map((item, i) => {
          const p = parseBullet(item);
          return (
            <div key={i} className={`${glassCardClass} p-3 flex gap-2.5 h-full`} style={glassCardStyle(glass, forExport)}>
              <div
                className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-sm font-bold"
                style={{ background: alpha(glass.accent, "22"), color: glass.accent }}
              >
                {i + 1}
              </div>
              <div className="min-w-0">
                <h3 className={`text-[10px] font-semibold line-clamp-2 ${glass.titleClass}`}>
                  {p.label ? (renderLabel ? renderLabel(p.label, i, "") : p.label) : renderBullet(item, i, "")}
                </h3>
                {p.detail && <p className={`text-[9px] mt-1 line-clamp-4 ${glass.bodyClass}`}>{p.detail}</p>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <ApexProductSplit
      content={content}
      image={image}
      imageCaption={imageCaption}
      parseBullet={parseBullet}
      renderBullet={renderBullet}
      renderLabel={renderLabel}
      glass={glass}
      forExport={forExport}
    />
  );
};

export function shouldUseApexLayout(slide: Slide): boolean {
  const t = slide.visualData?.template;
  return t === "apex" || t === "swiss" || t === "cream" || t === "apple";
}

export function isSwissTemplate(slide: Slide): boolean {
  return slide.visualData?.template === "swiss";
}

export function isCreamTemplate(slide: Slide): boolean {
  return slide.visualData?.template === "cream";
}

export function isAppleTemplate(slide: Slide): boolean {
  return slide.visualData?.template === "apple";
}

export const ApexSlideContent: React.FC<{
  slide: Slide;
  index: number;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  sectionLabel?: React.ReactNode;
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  extractNumber: (s: string) => string;
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  selectedStyle?: StyleKey;
  forExport?: boolean;
  onUpdate?: (patch: Partial<Slide>) => void;
}> = ({
  slide,
  index,
  title,
  subtitle,
  badge,
  sectionLabel,
  content,
  parseBullet,
  extractNumber,
  renderBullet,
  renderLabel,
  selectedStyle = "cosmic-dark",
  forExport,
  onUpdate,
}) => {
  const type = slide.type;
  const variant = slide.visualData?.variant || "";
  const swiss = isSwissTemplate(slide);
  const cream = isCreamTemplate(slide);
  const apple = isAppleTemplate(slide);
  const titanium = (slide.visualData?.deckTemplate || "") === "titanium";
  /** Cream + Titanium share maxed dense layouts */
  const dense = cream || titanium;
  const glass = getGlassSurface(slide, (selectedStyle || "cosmic-dark") as StyleKey, forExport);
  const editable = !!onUpdate && !forExport;

  const updateCompetitors = (competitors: NonNullable<SlideVisualData["competitors"]>) => {
    onUpdate?.({
      visualData: {
        ...slide.visualData,
        competitors,
        compareFeatures: slide.visualData?.compareFeatures,
        layout: "matrix",
      },
    });
  };

  return (
    <div className="h-full w-full min-h-0 overflow-hidden bg-transparent">
      <div className="h-full flex flex-col py-0.5 relative min-h-0 overflow-hidden">
        <div className="relative z-10 flex flex-col h-full min-h-0">
          {index !== 0 && type !== "title" && !dense && !apple && (
            <div className="mb-2 text-left shrink-0">
              {sectionLabel && <ApexSectionLabel color={glass.accent}>{sectionLabel}</ApexSectionLabel>}
              <ApexTitle className={glass.titleClass}>{title}</ApexTitle>
              {subtitle && <p className={`text-[10px] ${glass.mutedClass}`}>{subtitle}</p>}
            </div>
          )}

          <div className="flex-1 min-h-0 flex flex-col">
            {(index === 0 || type === "title") &&
              (cream ? (
                <CreamHero
                  title={title}
                  subtitle={subtitle}
                  content={content}
                  image={slide.image}
                  founderName={slide.founderName}
                  founderRole={slide.founderRole}
                  glass={glass}
                  forExport={forExport}
                />
              ) : apple ? (
                <AppleHero
                  title={title}
                  subtitle={subtitle}
                  content={content}
                  image={slide.image}
                  founderName={slide.founderName}
                  founderRole={slide.founderRole}
                  glass={glass}
                  forExport={forExport}
                />
              ) : (
                <ApexHero
                  title={title}
                  subtitle={subtitle}
                  badge={badge}
                  content={content}
                  image={slide.image}
                  founderName={slide.founderName}
                  founderRole={slide.founderRole}
                  brandQuote={slide.brandQuote}
                  renderBullet={renderBullet}
                  forExport={forExport}
                  constructorLayout={slide.visualData?.constructorLayout}
                  glass={glass}
                />
              ))}

            {type === "problem" &&
              (apple ? (
                <AppleProblemSolve
                  title={title}
                  content={content}
                  problemSolutions={slide.visualData?.problemSolutions}
                  parseBullet={parseBullet}
                  renderBullet={renderBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ) : dense ? (
                <CreamProblemStatement
                  title={title}
                  content={content}
                  image={slide.image}
                  problemSolutions={slide.visualData?.problemSolutions}
                  parseBullet={parseBullet}
                  renderBullet={renderBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ) : (
                <ApexProblemSolution
                  content={content}
                  problemSolutions={slide.visualData?.problemSolutions}
                  parseBullet={parseBullet}
                  renderBullet={renderBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ))}

            {type === "market" &&
              (apple ? (
                <AppleMarketStack
                  title={title}
                  subtitle={subtitle}
                  content={content}
                  metrics={slide.visualData?.metrics}
                  parseBullet={parseBullet}
                  extractNumber={extractNumber}
                  renderBullet={renderBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ) : dense ? (
                <CreamMarketStack
                  title={title}
                  subtitle={subtitle}
                  content={content}
                  metrics={slide.visualData?.metrics}
                  parseBullet={parseBullet}
                  extractNumber={extractNumber}
                  renderBullet={renderBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ) : variant === "chart-focus" ? (
                <ApexChartFocus
                  content={content}
                  metrics={slide.visualData?.metrics}
                  parseBullet={parseBullet}
                  extractNumber={extractNumber}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ) : variant === "big-stat" ? (
                <ApexBigStat
                  content={content}
                  parseBullet={parseBullet}
                  extractNumber={extractNumber}
                  renderBullet={renderBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ) : (
                <ApexMarketPanel
                  content={content}
                  metrics={slide.visualData?.metrics}
                  parseBullet={parseBullet}
                  extractNumber={extractNumber}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ))}

            {(type === "solution" || type === "product") &&
              (apple ? (
                type === "product" || variant === "apple-product" ? (
                  <AppleProductSteps
                    title={title}
                    subtitle={subtitle}
                    content={content}
                    image={slide.image}
                    cardImages={slide.visualData?.images}
                    parseBullet={parseBullet}
                    renderBullet={renderBullet}
                    renderLabel={renderLabel}
                    glass={glass}
                    forExport={forExport}
                  />
                ) : (
                  <AppleFeatureBento
                    title={title}
                    subtitle={subtitle}
                    content={content}
                    parseBullet={parseBullet}
                    renderBullet={renderBullet}
                    renderLabel={renderLabel}
                    glass={glass}
                    forExport={forExport}
                  />
                )
              ) : dense ? (
                type === "product" || variant === "cream-steps" ? (
                  <CreamProductSteps
                    title={title}
                    subtitle={subtitle}
                    content={content}
                    cardImages={slide.visualData?.images}
                    parseBullet={parseBullet}
                    renderBullet={renderBullet}
                    renderLabel={renderLabel}
                    glass={glass}
                    forExport={forExport}
                  />
                ) : (
                  <CreamFeatureCards
                    title={title}
                    subtitle={subtitle}
                    content={content}
                    parseBullet={parseBullet}
                    renderBullet={renderBullet}
                    renderLabel={renderLabel}
                    glass={glass}
                    forExport={forExport}
                  />
                )
              ) : variant === "feature-columns" ? (
                <ApexFeatureColumns
                  content={content}
                  parseBullet={parseBullet}
                  renderBullet={renderBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ) : variant === "demo-hero" ? (
                <ApexDemoHero
                  content={content}
                  image={slide.image}
                  imageCaption={slide.imageDescription}
                  parseBullet={parseBullet}
                  renderBullet={renderBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ) : swiss ? (
                <SwissSolutionList
                  content={content}
                  image={slide.image}
                  imageCaption={slide.imageDescription}
                  parseBullet={parseBullet}
                  renderBullet={renderBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ) : (
                <ApexProductSplit
                  content={content}
                  image={slide.image}
                  imageCaption={slide.imageDescription}
                  parseBullet={parseBullet}
                  renderBullet={renderBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ))}

            {type === "competition" &&
              (apple ? (
                <AppleCompareMatrix
                  title={title}
                  subtitle={subtitle}
                  content={content}
                  competitors={slide.visualData?.competitors}
                  compareFeatures={slide.visualData?.compareFeatures}
                  parseBullet={parseBullet}
                  glass={glass}
                  forExport={forExport}
                />
              ) : dense ? (
                <CreamCompareMatrix
                  title={title}
                  subtitle={subtitle}
                  content={content}
                  competitors={slide.visualData?.competitors}
                  compareFeatures={slide.visualData?.compareFeatures}
                  parseBullet={parseBullet}
                  glass={glass}
                  forExport={forExport}
                  editable={editable}
                  onCompetitorsChange={updateCompetitors}
                />
              ) : variant === "positioning" ? (
                <ApexPositioningMap
                  content={content}
                  competitors={slide.visualData?.competitors}
                  parseBullet={parseBullet}
                  glass={glass}
                  forExport={forExport}
                />
              ) : variant === "compare-compact" ? (
                <ApexCompareTable
                  content={content}
                  competitors={slide.visualData?.competitors}
                  parseBullet={parseBullet}
                  glass={glass}
                  forExport={forExport}
                  editable={editable}
                  onCompetitorsChange={updateCompetitors}
                />
              ) : (
                <ApexCompetitionArena
                  content={content}
                  competitors={slide.visualData?.competitors}
                  compareFeatures={slide.visualData?.compareFeatures}
                  parseBullet={parseBullet}
                  renderBullet={renderBullet}
                  glass={glass}
                  forExport={forExport}
                  editable={editable}
                  onCompetitorsChange={updateCompetitors}
                />
              ))}

            {type === "pricing" &&
              (apple ? (
                <AppleBizSplit
                  title={title}
                  subtitle={subtitle}
                  content={content}
                  pricing={slide.visualData?.pricing}
                  parseBullet={parseBullet}
                  extractNumber={extractNumber}
                  renderBullet={renderBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ) : dense ? (
                <CreamBizSplit
                  title={title}
                  subtitle={subtitle}
                  content={content}
                  pricing={slide.visualData?.pricing}
                  parseBullet={parseBullet}
                  extractNumber={extractNumber}
                  renderBullet={renderBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ) : variant === "revenue-ladder" || variant === "unit-economics" ? (
                <ApexRevenueLadder
                  content={content}
                  parseBullet={parseBullet}
                  extractNumber={extractNumber}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ) : (
                <ApexPricingCards
                  content={content}
                  pricing={slide.visualData?.pricing}
                  parseBullet={parseBullet}
                  extractNumber={extractNumber}
                  glass={glass}
                  forExport={forExport}
                />
              ))}

            {type === "traction" &&
              (apple ? (
                <AppleTractionBoard
                  title={title}
                  subtitle={subtitle}
                  content={content}
                  parseBullet={parseBullet}
                  extractNumber={extractNumber}
                  renderBullet={renderBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ) : dense ? (
                <CreamTractionBoard
                  title={title}
                  subtitle={subtitle}
                  content={content}
                  parseBullet={parseBullet}
                  extractNumber={extractNumber}
                  renderBullet={renderBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ) : variant === "growth-timeline" ? (
                <ApexRoadmap
                  content={content}
                  timeline={slide.visualData?.timeline}
                  parseBullet={parseBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ) : (
                <ApexStatsGrid
                  content={content}
                  parseBullet={parseBullet}
                  extractNumber={extractNumber}
                  renderBullet={renderBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ))}

            {type === "launch" &&
              (apple ? (
                <AppleRoadmapTimeline
                  title={title}
                  subtitle={subtitle}
                  content={content}
                  timeline={slide.visualData?.timeline}
                  parseBullet={parseBullet}
                  renderBullet={renderBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ) : dense ? (
                <CreamRoadmapTimeline
                  title={title}
                  subtitle={subtitle}
                  content={content}
                  timeline={slide.visualData?.timeline}
                  parseBullet={parseBullet}
                  renderBullet={renderBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ) : variant === "gtm-funnel" ? (
                <ApexGtmFunnel content={content} parseBullet={parseBullet} renderLabel={renderLabel} glass={glass} forExport={forExport} />
              ) : (
                <ApexRoadmap
                  content={content}
                  timeline={slide.visualData?.timeline}
                  parseBullet={parseBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ))}

            {type === "sauce" &&
              (apple ? (
                <AppleTeamRow
                  title={title}
                  subtitle={subtitle}
                  content={content}
                  teamMembers={slide.visualData?.teamMembers}
                  parseBullet={parseBullet}
                  renderBullet={renderBullet}
                  glass={glass}
                  forExport={forExport}
                />
              ) : dense ? (
                <CreamTeamRow
                  title={title}
                  subtitle={subtitle}
                  content={content}
                  teamMembers={slide.visualData?.teamMembers}
                  parseBullet={parseBullet}
                  renderBullet={renderBullet}
                  glass={glass}
                  forExport={forExport}
                />
              ) : (
                <ApexFeatureColumns
                  content={content}
                  parseBullet={parseBullet}
                  renderBullet={renderBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ))}

            {type === "ask" &&
              (apple ? (
                <AppleAskSlide
                  title={title}
                  subtitle={subtitle}
                  content={content}
                  parseBullet={parseBullet}
                  extractNumber={extractNumber}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ) : dense ? (
                <CreamAskSlide
                  title={title}
                  subtitle={subtitle}
                  content={content}
                  parseBullet={parseBullet}
                  extractNumber={extractNumber}
                  renderBullet={renderBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ) : (
                <ApexFundingSplit
                  content={content}
                  parseBullet={parseBullet}
                  extractNumber={extractNumber}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ))}

            {type === "vision" &&
              (apple ? (
                <AppleVisionMap
                  title={title}
                  subtitle={subtitle}
                  content={content}
                  parseBullet={parseBullet}
                  renderBullet={renderBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ) : dense ? (
                <CreamVisionMap
                  title={title}
                  subtitle={subtitle}
                  content={content}
                  parseBullet={parseBullet}
                  renderBullet={renderBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ) : variant === "quote-poster" ? (
                <ApexQuotePoster
                  content={content}
                  parseBullet={parseBullet}
                  renderBullet={renderBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ) : (
                <ApexVisionMap
                  content={content}
                  parseBullet={parseBullet}
                  renderBullet={renderBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              ))}

            {type === "risks" && (
              <ApexPainGrid
                content={content}
                parseBullet={parseBullet}
                renderBullet={renderBullet}
                renderLabel={renderLabel}
                glass={glass}
                forExport={forExport}
              />
            )}

            {!["title", "problem", "solution", "product", "market", "pricing", "traction", "launch", "ask", "vision", "competition", "sauce", "risks"].includes(
              type,
            ) &&
              index !== 0 && (
                <ApexFeatureColumns
                  content={content}
                  parseBullet={parseBullet}
                  renderBullet={renderBullet}
                  renderLabel={renderLabel}
                  glass={glass}
                  forExport={forExport}
                />
              )}
          </div>
        </div>
      </div>
    </div>
  );
};