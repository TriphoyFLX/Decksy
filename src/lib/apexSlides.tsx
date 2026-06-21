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
} from "lucide-react";
import type { Slide, SlideVisualData } from "../types";
import { PremiumImage } from "./slideVisuals";
import { getConstructorStyle } from "../components/SlideConstructor";
import type { SlideConstructorLayout } from "../types";

const APEX_BLUE = "#0071e3";
const APEX_GREEN = "#30d158";

export type GlassSurface = {
  isLight: boolean;
  hasImageBg: boolean;
  titleClass: string;
  bodyClass: string;
  mutedClass: string;
  labelColor: string;
};

export function getGlassSurface(slide: Slide, forExport = false): GlassSurface {
  const deckTemplate = (slide.visualData as { deckTemplate?: string } | undefined)?.deckTemplate;
  const isLight = deckTemplate === "ember";
  const hasImageBg =
    deckTemplate === "titanium" || deckTemplate === "midnight" || deckTemplate === "ember";
  return {
    isLight,
    hasImageBg,
    titleClass: isLight ? "text-neutral-900" : "text-white",
    bodyClass: isLight ? "text-neutral-700" : "text-white/75",
    mutedClass: isLight ? "text-neutral-500" : "text-white/50",
    labelColor: APEX_BLUE,
  };
}

export function glassCardStyle(glass: GlassSurface, forExport = false): React.CSSProperties {
  if (glass.isLight) {
    return {
      background: forExport ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.42)",
      borderColor: "rgba(255,255,255,0.72)",
      boxShadow: forExport
        ? "0 4px 24px rgba(0,0,0,0.08)"
        : "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.85)",
      backdropFilter: forExport ? undefined : "blur(24px)",
      WebkitBackdropFilter: forExport ? undefined : "blur(24px)",
    };
  }
  if (glass.hasImageBg) {
    return {
      background: forExport ? "rgba(12,12,18,0.78)" : "rgba(255,255,255,0.1)",
      borderColor: "rgba(255,255,255,0.22)",
      boxShadow: forExport
        ? "0 4px 24px rgba(0,0,0,0.3)"
        : "0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.18)",
      backdropFilter: forExport ? undefined : "blur(22px)",
      WebkitBackdropFilter: forExport ? undefined : "blur(22px)",
    };
  }
  return {
    background: forExport ? "rgba(18,18,22,0.88)" : "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.2)",
    boxShadow: forExport
      ? "0 4px 24px rgba(0,0,0,0.35)"
      : "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.14)",
    backdropFilter: forExport ? undefined : "blur(20px)",
    WebkitBackdropFilter: forExport ? undefined : "blur(20px)",
  };
}

export const glassCardClass = "rounded-2xl border backdrop-blur-xl";

const PAIN_ICON_COLORS = [
  { bg: "rgba(226,75,74,0.14)", fg: "#ff6b6b" },
  { bg: "rgba(255,179,0,0.12)", fg: "#ffb340" },
  { bg: "rgba(0,113,227,0.12)", fg: "#4da3ff" },
  { bg: "rgba(48,209,88,0.1)", fg: "#30d158" },
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

function shortInsight(text: string, max = 42): string {
  const cleaned = text.replace(/^[^:]+:\s*/, "").trim();
  if (!cleaned) return "";
  return cleaned.length > max ? `${cleaned.slice(0, max - 1)}…` : cleaned;
}

export const ApexSectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: APEX_BLUE }}>
    {children}
  </p>
);

export const ApexTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "text-white",
}) => (
  <h2
    className={`text-base sm:text-lg md:text-xl font-bold tracking-tight leading-tight mb-2 ${className}`}
    style={{ letterSpacing: "-0.03em" }}
  >
    {children}
  </h2>
);

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
}) => {
  const titleText = typeof title === "string" ? title : "";
  const firstLetter = (titleText || "P").trim().charAt(0).toUpperCase();
  const founderText =
    typeof founderName === "string"
      ? founderName
      : content.find((c) => /основатель|ceo|founder|владелец/i.test(c))?.replace(/^[^:]+:\s*/i, "") || "";
  const quoteText =
    typeof brandQuote === "string"
      ? brandQuote
      : content.find((c) => c.startsWith("«") || c.includes("слоган"))?.replace(/^«|»$/g, "") || "";

  const useConstructor = constructorLayout?.enabled && !forExport;
  const logoStyle = getConstructorStyle("logo", constructorLayout);
  const titleStyle = getConstructorStyle("title", constructorLayout);
  const subtitleStyle = getConstructorStyle("subtitle", constructorLayout);
  const founderStyle = getConstructorStyle("founder", constructorLayout);
  const quoteStyle = getConstructorStyle("quote", constructorLayout);

  const titleSize = forExport ? "text-5xl" : "text-xl sm:text-2xl md:text-3xl";
  const logoSize = forExport ? "w-20 h-20 text-3xl" : "w-16 h-16 sm:w-20 sm:h-20 text-2xl";

  return (
    <div className={`h-full relative ${useConstructor ? "" : "flex flex-col md:flex-row gap-4 items-stretch"}`}>
      {/* Left: brand block */}
      <div className={`${useConstructor ? "relative h-full w-full" : "flex-1 flex flex-col justify-center text-left min-w-0 z-10"}`}>
        <div style={logoStyle} className={useConstructor ? "z-20" : "mb-3"}>
          {image ? (
            <div className={`${logoSize} rounded-2xl overflow-hidden border border-white/15 shadow-xl shrink-0`}>
              <PremiumImage src={image} variant="thumb" className="!w-full !h-full !min-h-full !rounded-2xl object-cover" />
            </div>
          ) : (
            <div
              className={`${logoSize} rounded-2xl flex flex-col items-center justify-center font-bold text-white shrink-0 border border-dashed border-white/20`}
              style={{
                background: "linear-gradient(145deg, #1d6bf3, #0040c8)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 16px 32px rgba(0,100,255,0.2)",
              }}
            >
              <span className="text-2xl sm:text-3xl">{firstLetter}</span>
              <span className="text-[6px] text-white/40 uppercase tracking-widest mt-0.5 flex items-center gap-0.5">
                {!forExport && (
                  <>
                    <ImagePlus className="h-2.5 w-2.5" />
                    лого
                  </>
                )}
              </span>
            </div>
          )}
        </div>

        {badge && !useConstructor && <div className="mb-2">{badge}</div>}

        <div style={titleStyle} className={useConstructor ? "z-20" : ""}>
          <h1
            className={`${titleSize} font-extrabold leading-[1.05] uppercase text-white tracking-tight`}
            style={{ letterSpacing: "-0.03em" }}
          >
            {title || "Название проекта"}
          </h1>
        </div>

        <div style={subtitleStyle} className={useConstructor ? "z-20" : "mt-2"}>
          {subtitle ? (
            <p className="text-[10px] sm:text-xs md:text-sm text-white/55 leading-relaxed max-w-md">
              {subtitle}
            </p>
          ) : (
            <p className="text-[10px] text-white/30 italic">Подзаголовок / слоган</p>
          )}
        </div>

        <div style={founderStyle} className={`${useConstructor ? "z-20" : "mt-4"} flex items-center gap-2.5`}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-white/15"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <User className="h-4 w-4 text-white/70" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] sm:text-sm font-semibold text-white truncate">
              {founderText || "Имя владельца"}
            </div>
            <div className="text-[9px] text-white/40 uppercase tracking-wider">
              {founderRole || "Основатель"}
            </div>
          </div>
        </div>

        {(quoteText || brandQuote) && (
          <div
            className={`${useConstructor ? "z-20" : "mt-3"} border-l-2 pl-3`}
            style={{
              ...(quoteStyle || {}),
              borderColor: "rgba(0,113,227,0.5)",
            }}
          >
            <p className="text-[9px] sm:text-[10px] text-white/50 italic leading-relaxed line-clamp-3">
              {quoteText ? `«${quoteText}»` : brandQuote}
            </p>
          </div>
        )}
      </div>

      {/* Right: decorative panel (hidden in constructor mode) */}
      {!useConstructor && (
        <div className="hidden md:flex w-[38%] shrink-0 items-center justify-center relative">
          <div
            className="w-full aspect-square max-h-[85%] rounded-[28px] border border-white/[0.08] relative overflow-hidden"
            style={{
              background: forExport
                ? "linear-gradient(135deg, #0a1628 0%, #1a1a2e 100%)"
                : "linear-gradient(135deg, #0a1628 0%, #1a1a2e 50%, #0f3460 100%)",
            }}
          >
            {!forExport && (
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: "radial-gradient(circle at 30% 40%, rgba(0,113,227,0.4), transparent 50%)",
                }}
              />
            )}
            {!forExport && !image && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="text-6xl font-black uppercase opacity-[0.07] text-white select-none"
                  style={{ letterSpacing: "-0.05em" }}
                >
                  {firstLetter}
                </div>
              </div>
            )}
            {image && (
              <PremiumImage src={image} variant="hero" className={`absolute inset-0 !min-h-full !rounded-[28px] ${forExport ? "opacity-60" : "opacity-40"}`} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const ApexPainGrid: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  image?: string;
  cardImages?: string[];
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, parseBullet, renderBullet, image, cardImages, glass, forExport }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 my-auto min-h-0">
    {content.slice(0, 4).map((item, i) => {
      const parsed = parseBullet(item);
      const label = parsed.label || `Боль ${i + 1}`;
      const detail = parsed.detail || item;
      const Icon = pickPainIcon(`${label} ${detail}`, i);
      const colors = PAIN_ICON_COLORS[i % PAIN_ICON_COLORS.length];
      const cardImg = cardImages?.[i];
      const metric = extractMetricHint(item);

      return (
        <div
          key={i}
          className={`${glassCardClass} p-2.5 sm:p-3 flex flex-col gap-1.5 text-left min-h-0`}
          style={glassCardStyle(glass, forExport)}
        >
          {cardImg ? (
            <div className="h-12 rounded-xl overflow-hidden shrink-0">
              <PremiumImage src={cardImg} variant="thumb" className="!min-h-12 !h-12 !rounded-xl" />
            </div>
          ) : (
            <div
              className="h-12 rounded-xl border border-dashed flex flex-col items-center justify-center gap-0.5 shrink-0"
              style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.02)" }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: colors.bg, color: colors.fg }}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
              </div>
              <span className="text-[6px] text-white/25 uppercase tracking-wider flex items-center gap-0.5">
                <ImagePlus className="h-2.5 w-2.5" />
                фото
              </span>
            </div>
          )}
          <h3 className={`text-[9px] sm:text-[10px] font-semibold leading-tight line-clamp-2 ${glass.titleClass}`}>
            {label}
          </h3>
          <p className={`text-[8px] sm:text-[9px] leading-snug line-clamp-3 flex-1 ${glass.bodyClass}`}>
            {renderBullet(detail, i, "")}
          </p>
          {metric ? (
            <div className="text-[7px] font-medium mt-auto" style={{ color: APEX_GREEN }}>
              {metric}
            </div>
          ) : (
            <div className="text-[7px] text-white/25 mt-auto line-clamp-1 italic">
              {shortInsight(detail) || "Ключевая боль"}
            </div>
          )}
        </div>
      );
    })}
    {image && content.length <= 3 && (
      <div className="col-span-2 sm:col-span-4 rounded-2xl overflow-hidden h-20 sm:h-24 mt-0.5">
        <PremiumImage src={image} variant="hero" className="!min-h-full !rounded-2xl" />
      </div>
    )}
  </div>
);

export const ApexMarketPanel: React.FC<{
  content: string[];
  metrics?: SlideVisualData["metrics"];
  parseBullet: (s: string) => { label: string; detail: string };
  extractNumber: (s: string) => string;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, metrics, parseBullet, extractNumber, glass, forExport }) => {
  const items =
    metrics && metrics.length >= 2
      ? metrics.slice(0, 3).map((m) => ({ label: m.label, value: m.value, detail: "" }))
      : content.slice(0, 3).map((item) => {
          const parsed = parseBullet(item);
          const num = extractNumber(item);
          return {
            label: parsed.label || `Сегмент`,
            value: num || parsed.detail.slice(0, 40),
            detail: num ? parsed.detail.replace(num, "").replace(/^[\s—\-:]+/, "").trim() : parsed.detail,
          };
        });

  const accents = ["#0071e3", "#5e5ce6", "#30d158"];

  return (
    <div className="flex flex-col gap-2 my-auto min-h-0 flex-1">
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 min-h-0 flex-1">
        {items.map((item, i) => (
          <div
            key={i}
            className={`${glassCardClass} p-2 sm:p-2.5 flex flex-col gap-1 min-h-0 overflow-hidden`}
            style={glassCardStyle(glass, forExport)}
          >
            <span
              className="text-[6.5px] sm:text-[7px] font-mono uppercase tracking-widest font-bold truncate px-1.5 py-0.5 rounded-full w-fit max-w-full"
              style={{ color: accents[i], background: `${accents[i]}18` }}
            >
              {item.label}
            </span>
            <div className={`text-[11px] sm:text-xs font-bold leading-tight line-clamp-2 ${glass.titleClass}`}>{item.value}</div>
            {item.detail && (
              <p className={`text-[7px] sm:text-[8px] leading-snug line-clamp-3 flex-1 ${glass.bodyClass}`}>{item.detail}</p>
            )}
          </div>
        ))}
      </div>
      {content[3] && (
        <div
          className={`shrink-0 ${glassCardClass} px-2 py-1 flex items-center gap-1.5 border-emerald-500/25`}
          style={{ ...glassCardStyle(glass, forExport), background: glass.isLight ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.1)" }}
        >
          <span className="text-[6px] font-mono uppercase text-emerald-500 font-bold shrink-0">Тренд</span>
          <span className={`text-[7px] line-clamp-1 ${glass.bodyClass}`}>{content[3]}</span>
        </div>
      )}
    </div>
  );
};

export const ApexCompetitionPanel: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  image?: string;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, parseBullet, renderBullet, image, glass, forExport }) => (
  <div className={`grid gap-2 my-auto min-h-0 flex-1 ${image ? "grid-cols-3" : "grid-cols-2"}`}>
    <div className={`${glassCardClass} p-2.5 flex flex-col gap-1 min-h-0 overflow-hidden`} style={glassCardStyle(glass, forExport)}>
      <span className="text-[7px] font-mono uppercase tracking-widest text-rose-400 font-bold">Конкуренты</span>
      <ul className="space-y-1 flex-1 min-h-0 overflow-hidden">
        {content.slice(0, 2).map((item, i) => (
          <li key={i} className={`text-[8px] leading-snug flex gap-1 ${glass.bodyClass}`}>
            <span className="text-rose-400 shrink-0">•</span>
            <span className="line-clamp-2">{renderBullet(parseBullet(item).detail || item, i, "")}</span>
          </li>
        ))}
      </ul>
    </div>
    <div
      className={`${glassCardClass} p-2.5 flex flex-col gap-1 min-h-0 overflow-hidden border-emerald-500/30`}
      style={{ ...glassCardStyle(glass, forExport), background: glass.isLight ? "rgba(16,185,129,0.14)" : "rgba(16,185,129,0.1)" }}
    >
      <span className="text-[7px] font-mono uppercase tracking-widest text-emerald-500 font-bold">Наше отличие</span>
      <ul className="space-y-1 flex-1 min-h-0 overflow-hidden">
        {(content.slice(2, 4).length ? content.slice(2, 4) : content.slice(0, 2)).map((item, i) => (
          <li key={i} className={`text-[8px] leading-snug flex gap-1 ${glass.isLight ? "text-emerald-800" : "text-emerald-200/90"}`}>
            <span className="text-emerald-400 shrink-0">✓</span>
            <span className="line-clamp-2">{renderBullet(parseBullet(item).detail || item, i + 2, "")}</span>
          </li>
        ))}
      </ul>
    </div>
    {image && (
      <div className={`${glassCardClass} overflow-hidden min-h-0 p-1`} style={glassCardStyle(glass, forExport)}>
        <PremiumImage src={image} variant="thumb" className="!min-h-full h-full rounded-xl" />
      </div>
    )}
  </div>
);

export const ApexStatsGrid: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  extractNumber: (s: string) => string;
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, parseBullet, extractNumber, renderBullet, glass, forExport }) => {
  const hasNumbers = content.slice(0, 4).some((item) => {
    const parsed = parseBullet(item);
    return Boolean(extractNumber(item) || parsed.detail.match(/[\d$%]+/));
  });

  if (!hasNumbers) {
    return (
      <ApexPainGrid
        content={content}
        parseBullet={parseBullet}
        renderBullet={renderBullet}
        glass={glass}
        forExport={forExport}
      />
    );
  }

  return (
  <div className={`grid grid-cols-2 sm:grid-cols-4 gap-1.5 my-auto`}>
    {content.slice(0, 4).map((item, i) => {
      const parsed = parseBullet(item);
      const num = extractNumber(item) || parsed.detail.match(/[\d$%млнмлрдтыс]+/i)?.[0];
      const label = parsed.label || parsed.detail;
      const metric = extractMetricHint(item);
      const Icon = pickPainIcon(item, i);
      const colors = PAIN_ICON_COLORS[i % PAIN_ICON_COLORS.length];

      return (
        <div
          key={i}
          className={`${glassCardClass} p-3 sm:p-4 flex flex-col gap-1 min-h-0`}
          style={glassCardStyle(glass, forExport)}
        >
          {num ? (
            <>
              <div className={`text-xl sm:text-2xl font-bold tracking-tight leading-none ${glass.titleClass}`}>
                {num}
              </div>
              <div className={`text-[9px] leading-snug line-clamp-2 ${glass.bodyClass}`}>{label}</div>
              {metric && (
                <div className="text-[8px] font-medium mt-0.5" style={{ color: APEX_GREEN }}>
                  {metric}
                </div>
              )}
            </>
          ) : (
            <>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center mb-0.5"
                style={{ background: colors.bg, color: colors.fg }}
              >
                <Icon className="h-4 w-4" strokeWidth={2.2} />
              </div>
              <div className={`text-[9px] font-semibold leading-snug line-clamp-2 ${glass.titleClass}`}>{label}</div>
              <div className={`text-[8px] leading-snug line-clamp-2 ${glass.mutedClass}`}>{parsed.detail}</div>
            </>
          )}
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
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, image, imageCaption, parseBullet, renderBullet, glass, forExport }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-auto items-stretch min-h-0 flex-1">
    <div className={`${glassCardClass} p-3 space-y-2.5 flex flex-col justify-center`} style={glassCardStyle(glass, forExport)}>
      {content.slice(0, 3).map((item, i) => {
        const p = parseBullet(item);
        return (
          <div
            key={i}
            className={`flex gap-2.5 items-start rounded-xl p-2 border ${glass.isLight ? "border-white/60 bg-white/35" : "border-white/10 bg-white/[0.04]"}`}
          >
            <div
              className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-sm"
              style={{ background: i === 0 ? "rgba(0,113,227,0.15)" : i === 1 ? "rgba(48,209,88,0.12)" : "rgba(255,179,0,0.12)" }}
            >
              {i === 0 ? "⚡" : i === 1 ? "🔒" : "🤖"}
            </div>
            <div className="min-w-0">
              {p.label && <h3 className={`text-[10px] font-semibold mb-0.5 ${glass.titleClass}`}>{p.label}</h3>}
              <p className={`text-[9px] leading-relaxed line-clamp-3 ${glass.bodyClass}`}>
                {renderBullet(p.detail || item, i, "")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
    {image ? (
      <div className={`${glassCardClass} p-1.5 overflow-hidden min-h-0`} style={glassCardStyle(glass, forExport)}>
        <PremiumImage src={image} caption={imageCaption} variant="hero" className="!rounded-xl !min-h-[120px]" />
      </div>
    ) : (
      <div
        className={`${glassCardClass} aspect-square flex items-center justify-center relative overflow-hidden`}
        style={glassCardStyle(glass, forExport)}
      >
        <div
          className={`w-[80%] rounded-2xl border p-4 space-y-2 ${glass.isLight ? "border-neutral-200/80 bg-white/50" : "border-white/15 bg-white/[0.06]"}`}
        >
          <div className="flex gap-1.5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          {[100, 80, 60, 45, 100, 75].map((w, idx) => (
            <div key={idx} className={`h-1.5 rounded-full ${glass.isLight ? "bg-neutral-300/60" : "bg-white/10"}`} style={{ width: `${w}%`, opacity: 1 - idx * 0.08 }} />
          ))}
        </div>
      </div>
    )}
  </div>
);

export const ApexPricingCards: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  extractNumber: (s: string) => string;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, parseBullet, extractNumber, glass, forExport }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-auto">
    {content.slice(0, 3).map((item, i) => {
      const p = parseBullet(item);
      const price = extractNumber(item) || p.detail;
      const featured = i === 1;
      return (
        <div
          key={i}
          className={`${glassCardClass} p-3 text-left ${featured ? "ring-1 ring-white/25 scale-[1.02]" : ""}`}
          style={
            featured
              ? {
                  background: "linear-gradient(160deg, rgba(0,113,227,0.85) 0%, rgba(0,64,168,0.9) 100%)",
                  borderColor: "rgba(255,255,255,0.25)",
                  backdropFilter: forExport ? undefined : "blur(16px)",
                  WebkitBackdropFilter: forExport ? undefined : "blur(16px)",
                }
              : glassCardStyle(glass, forExport)
          }
        >
          <div className={`text-[8px] uppercase tracking-widest mb-1 ${featured ? "text-white/70" : glass.mutedClass}`}>
            {p.label || `Тариф ${i + 1}`}
          </div>
          <div className={`text-lg font-bold mb-2 ${featured ? "text-white" : glass.titleClass}`}>{price}</div>
          <p className={`text-[9px] leading-relaxed ${featured ? "text-white/80" : glass.bodyClass}`}>{p.detail}</p>
        </div>
      );
    })}
  </div>
);

export const ApexRoadmap: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, parseBullet, glass, forExport }) => (
  <div className="relative my-auto pl-2">
    <div className={`absolute left-[4.5rem] top-3 bottom-3 w-px bg-gradient-to-b from-transparent ${glass.isLight ? "via-neutral-300/50" : "via-white/15"} to-transparent`} />
    <div className="space-y-2">
      {content.slice(0, 4).map((item, i) => {
        const p = parseBullet(item);
        return (
          <div key={i} className="grid grid-cols-[4.5rem_1fr] gap-3 items-start">
            <div className={`text-[8px] font-semibold text-right pt-3 uppercase tracking-wide ${glass.mutedClass}`}>
              Q{i + 1} '26
            </div>
            <div className={`${glassCardClass} p-3 relative`} style={glassCardStyle(glass, forExport)}>
              <div
                className="absolute -left-[1.15rem] top-3 w-2.5 h-2.5 rounded-full border-2"
                style={{
                  background: i === 0 ? APEX_GREEN : i === 1 ? APEX_BLUE : glass.isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.2)",
                  borderColor: i <= 1 ? "rgba(255,255,255,0.15)" : glass.isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)",
                }}
              />
              <div className="text-[8px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: i === 0 ? APEX_GREEN : APEX_BLUE }}>
                {p.label || `Этап ${i + 1}`}
              </div>
              <p className={`text-[10px] leading-snug ${glass.bodyClass}`}>{p.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export const ApexCTA: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  content: string[];
  image?: string;
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ title, subtitle, content, image, renderBullet, glass, forExport }) => (
  <div className="h-full flex flex-col items-center justify-center text-center my-auto">
    <span
      className="inline-block text-[8px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3 border"
      style={{ background: "rgba(0,113,227,0.12)", borderColor: "rgba(0,113,227,0.25)", color: "#4da3ff" }}
    >
      Инвестиционное предложение
    </span>
    <div className={`text-xl sm:text-2xl font-extrabold mb-2 tracking-tight ${glass.titleClass}`}>{title}</div>
    {subtitle && <p className={`text-sm mb-4 max-w-sm ${glass.mutedClass}`}>{subtitle}</p>}
    <div className="flex flex-wrap justify-center gap-2 mb-4">
      {content.slice(0, 3).map((c, i) => (
        <div
          key={i}
          className={`${glassCardClass} px-3 py-2 text-[10px]`}
          style={glassCardStyle(glass, forExport)}
        >
          <span className={glass.bodyClass}>{renderBullet(c, i, "")}</span>
        </div>
      ))}
    </div>
    {image && <PremiumImage src={image} variant="thumb" className="max-w-[140px] mx-auto" />}
  </div>
);

export const SwissProblemGrid: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  image?: string;
  cardImages?: string[];
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, parseBullet, renderBullet, image, cardImages, glass, forExport }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 my-auto">
    {content.slice(0, 4).map((item, i) => {
      const p = parseBullet(item);
      const label = p.label || `Боль ${i + 1}`;
      const detail = p.detail || item;
      const Icon = pickPainIcon(`${label} ${detail}`, i);
      const colors = PAIN_ICON_COLORS[i % PAIN_ICON_COLORS.length];
      const cardImg = cardImages?.[i];
      const metric = extractMetricHint(item);

      return (
        <div
          key={i}
          className={`${glassCardClass} p-2.5 sm:p-3 flex flex-col gap-1.5 text-left min-h-0`}
          style={glassCardStyle(glass, forExport)}
        >
          {cardImg ? (
            <div className="h-11 rounded-xl overflow-hidden shrink-0">
              <PremiumImage src={cardImg} variant="thumb" className="!min-h-11 !h-11 !rounded-xl" />
            </div>
          ) : (
            <div
              className="h-11 rounded-xl border border-dashed flex flex-col items-center justify-center gap-0.5 shrink-0"
              style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}
            >
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: colors.bg, color: colors.fg }}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
              </div>
              <span className="text-[6px] text-white/25 uppercase tracking-wider flex items-center gap-0.5">
                <ImagePlus className="h-2.5 w-2.5" />
                фото
              </span>
            </div>
          )}
          <h3 className={`text-[9px] sm:text-[10px] font-semibold leading-tight line-clamp-2 ${glass.titleClass}`}>
            {label}
          </h3>
          {detail && (
            <p className={`text-[8px] sm:text-[9px] leading-snug line-clamp-3 flex-1 ${glass.bodyClass}`}>
              {renderBullet(detail, i, "")}
            </p>
          )}
          {metric ? (
            <div className="text-[7px] font-medium mt-auto" style={{ color: "#e24b4a" }}>
              {metric}
            </div>
          ) : (
            <div className={`text-[7px] mt-auto line-clamp-1 italic ${glass.mutedClass}`}>
              {shortInsight(detail) || "Ключевая боль"}
            </div>
          )}
        </div>
      );
    })}
    {image && content.length <= 3 && (
      <div className={`col-span-2 sm:col-span-4 ${glassCardClass} overflow-hidden h-20 mt-0.5 p-1`} style={glassCardStyle(glass, forExport)}>
        <PremiumImage src={image} variant="hero" className="!min-h-full !rounded-xl" />
      </div>
    )}
  </div>
);

export const SwissSolutionList: React.FC<{
  content: string[];
  image?: string;
  imageCaption?: string;
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, image, imageCaption, parseBullet, renderBullet, glass, forExport }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-auto items-stretch min-h-0 flex-1">
    <div className={`${glassCardClass} p-3 space-y-2`} style={glassCardStyle(glass, forExport)}>
      {content.slice(0, 3).map((item, i) => {
        const p = parseBullet(item);
        return (
          <div key={i} className="flex gap-2 items-start">
            <div
              className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-sm font-semibold"
              style={{ background: "rgba(0,113,227,0.12)", color: "#4da3ff" }}
            >
              {i + 1}
            </div>
            <div className="min-w-0">
              <h3 className={`text-[10px] font-semibold mb-0.5 ${glass.titleClass}`}>{p.label || renderBullet(item, i, "")}</h3>
              {p.detail && <p className={`text-[9px] leading-snug line-clamp-2 ${glass.bodyClass}`}>{p.detail}</p>}
            </div>
          </div>
        );
      })}
    </div>
    {image ? (
      <div className={`${glassCardClass} p-1.5 overflow-hidden`} style={glassCardStyle(glass, forExport)}>
        <PremiumImage src={image} caption={imageCaption} variant="hero" className="!rounded-xl" />
      </div>
    ) : (
      <div
        className={`${glassCardClass} aspect-[4/3] flex items-center justify-center text-[9px] border-dashed ${glass.mutedClass}`}
        style={glassCardStyle(glass, forExport)}
      >
        Скриншот продукта
      </div>
    )}
  </div>
);

export function shouldUseApexLayout(slide: Slide): boolean {
  return slide.visualData?.template === "apex" || slide.visualData?.template === "swiss";
}

export function isSwissTemplate(slide: Slide): boolean {
  return slide.visualData?.template === "swiss";
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
  forExport?: boolean;
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
  forExport,
}) => {
  const type = slide.type;
  const variant = slide.visualData?.variant || "";
  const swiss = isSwissTemplate(slide);
  const glass = getGlassSurface(slide, forExport);

  return (
    <div className="h-full w-full min-h-0 overflow-hidden bg-transparent">
    <div className="h-full flex flex-col py-0.5 relative min-h-0 overflow-hidden">
      <div className="relative z-10 flex flex-col h-full min-h-0">
        {index !== 0 && type !== "title" && (
          <div className="mb-2 text-left shrink-0">
            {sectionLabel && <ApexSectionLabel>{sectionLabel}</ApexSectionLabel>}
            <ApexTitle className={glass.titleClass}>{title}</ApexTitle>
            {subtitle && <p className={`text-[10px] ${glass.mutedClass}`}>{subtitle}</p>}
          </div>
        )}

        {(index === 0 || type === "title") && (
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
          />
        )}

        {type === "problem" &&
          (swiss ? (
            <SwissProblemGrid
              content={content}
              parseBullet={parseBullet}
              renderBullet={renderBullet}
              image={slide.image}
              cardImages={slide.visualData?.images}
              glass={glass}
              forExport={forExport}
            />
          ) : (
            <ApexPainGrid
              content={content}
              parseBullet={parseBullet}
              renderBullet={renderBullet}
              image={slide.image}
              cardImages={slide.visualData?.images}
              glass={glass}
              forExport={forExport}
            />
          ))}

        {type === "market" && (
          <ApexMarketPanel
            content={content}
            metrics={slide.visualData?.metrics}
            parseBullet={parseBullet}
            extractNumber={extractNumber}
            glass={glass}
            forExport={forExport}
          />
        )}

        {(type === "solution" || type === "product") &&
          (swiss ? (
            <SwissSolutionList
              content={content}
              image={slide.image}
              imageCaption={slide.imageDescription}
              parseBullet={parseBullet}
              renderBullet={renderBullet}
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
              glass={glass}
              forExport={forExport}
            />
          ))}

        {type === "traction" && (
          <ApexPainGrid
            content={content}
            parseBullet={parseBullet}
            renderBullet={renderBullet}
            glass={glass}
            forExport={forExport}
          />
        )}

        {type === "competition" && (
          <ApexCompetitionPanel
            content={content}
            parseBullet={parseBullet}
            renderBullet={renderBullet}
            image={slide.image}
            glass={glass}
            forExport={forExport}
          />
        )}

        {type === "pricing" && (
          <ApexPricingCards
            content={content}
            parseBullet={parseBullet}
            extractNumber={extractNumber}
            glass={glass}
            forExport={forExport}
          />
        )}

        {type === "launch" && (
          <ApexRoadmap content={content} parseBullet={parseBullet} glass={glass} forExport={forExport} />
        )}

        {(type === "ask" || type === "cta" || type === "vision") && (
          <ApexCTA
            title={title}
            subtitle={subtitle}
            content={content}
            image={slide.image}
            renderBullet={renderBullet}
            glass={glass}
            forExport={forExport}
          />
        )}

        {type === "sauce" && !slide.visualData?.teamMembers?.length && (
          <ApexPainGrid
            content={content}
            parseBullet={parseBullet}
            renderBullet={renderBullet}
            image={slide.image}
            glass={glass}
            forExport={forExport}
          />
        )}

        {!["title", "problem", "solution", "product", "market", "pricing", "traction", "launch", "ask", "cta", "vision", "competition", "sauce"].includes(type) &&
          index !== 0 && (
            <ApexStatsGrid
              content={content}
              parseBullet={parseBullet}
              extractNumber={extractNumber}
              renderBullet={renderBullet}
              glass={glass}
              forExport={forExport}
            />
          )}
      </div>
    </div>
    </div>
  );
};
