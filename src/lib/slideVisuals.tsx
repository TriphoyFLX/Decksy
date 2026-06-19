import React from "react";
import type { SlideVisualData } from "../types";

type StyleKey = "cobalt" | "clean-light" | "cosmic-dark";

interface ThemeSlice {
  isLight: boolean;
  isCobalt: boolean;
  accent: string;
  muted: string;
  cardBg: string;
  cardBorder: string;
  titleClass: string;
  textClass: string;
}

export function getStyleSlice(selectedStyle: StyleKey): ThemeSlice {
  const isLight = selectedStyle === "clean-light";
  const isCobalt = selectedStyle === "cobalt";
  return {
    isLight,
    isCobalt,
    accent: isLight ? "#004de6" : isCobalt ? "#0071e3" : "#10b981",
    muted: isLight ? "#64748b" : "#94a3b8",
    cardBg: isLight
      ? "rgba(255,255,255,0.92)"
      : isCobalt
        ? "rgba(255,255,255,0.94)"
        : "rgba(255,255,255,0.04)",
    cardBorder: isLight
      ? "rgba(0,0,0,0.08)"
      : isCobalt
        ? "rgba(0,77,230,0.12)"
        : "rgba(255,255,255,0.08)",
    titleClass: isLight ? "text-neutral-950" : isCobalt ? "text-slate-950" : "text-white",
    textClass: isLight ? "text-neutral-600" : isCobalt ? "text-slate-600" : "text-slate-300",
  };
}

export const SlideSectionHeader: React.FC<{
  sectionLabel?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  accentClass?: string;
  selectedStyle: StyleKey;
}> = ({ sectionLabel, title, subtitle, accentClass = "text-emerald-400", selectedStyle }) => {
  const s = getStyleSlice(selectedStyle);
  return (
    <div
      className="flex items-start justify-between gap-3 border-b pb-2 mb-2 text-left"
      style={{ borderColor: s.cardBorder }}
    >
      <div className="space-y-1 min-w-0">
        {sectionLabel && (
          <div className={`text-[7px] sm:text-[8px] font-mono uppercase tracking-[0.2em] font-bold ${accentClass}`}>
            {sectionLabel}
          </div>
        )}
        <div className={`text-sm sm:text-base md:text-lg font-display font-black tracking-tight uppercase leading-tight ${s.titleClass}`}>
          {title}
        </div>
      </div>
      {subtitle && (
        <div className={`hidden sm:block shrink-0 text-[8px] font-mono py-1 px-2.5 rounded-full uppercase tracking-wider border ${s.isLight ? "bg-neutral-50 text-neutral-600 border-neutral-200" : "bg-white/5 text-slate-400 border-white/10"}`}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

export const PremiumImage: React.FC<{
  src: string;
  alt?: string;
  variant?: "hero" | "card" | "thumb" | "avatar";
  caption?: string;
  className?: string;
  forExport?: boolean;
}> = ({ src, alt = "", variant = "card", caption, className = "", forExport }) => {
  const base =
    variant === "hero"
      ? "relative w-full h-full min-h-[120px] sm:min-h-[160px] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/30"
      : variant === "avatar"
        ? "relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden ring-2 ring-white/20 shadow-lg"
        : variant === "thumb"
          ? "relative h-full min-h-[72px] rounded-xl overflow-hidden ring-1 ring-white/10"
          : "relative rounded-xl overflow-hidden ring-1 ring-white/10 shadow-lg shadow-black/20 min-h-[90px] h-full";

  return (
    <div className={`${base} ${className}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none"
        style={forExport ? { opacity: 0.85 } : undefined}
      />
      {caption && (
        <div className="absolute bottom-0 inset-x-0 px-2.5 py-2 bg-gradient-to-t from-black/90 to-transparent">
          <p className="text-[8px] sm:text-[9px] text-white/95 font-medium truncate text-center">{caption}</p>
        </div>
      )}
    </div>
  );
};

export const TeamPlateGrid: React.FC<{
  members: NonNullable<SlideVisualData["teamMembers"]>;
  selectedStyle: StyleKey;
  forExport?: boolean;
}> = ({ members, selectedStyle, forExport }) => {
  const s = getStyleSlice(selectedStyle);
  const cols = members.length <= 2 ? 2 : members.length <= 4 ? 2 : 3;

  return (
    <div
      className={`grid gap-2.5 sm:gap-3 my-auto`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {members.map((m, i) => (
        <div
          key={i}
          className="relative rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center gap-2.5 border backdrop-blur-sm transition-transform"
          style={{
            background: s.isLight
              ? "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)"
              : s.isCobalt
                ? "linear-gradient(145deg, #ffffff 0%, #f0f6ff 100%)"
                : "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
            borderColor: s.cardBorder,
            boxShadow: s.isLight ? "0 8px 30px rgba(0,0,0,0.06)" : "0 8px 32px rgba(0,0,0,0.35)",
          }}
        >
          <div className="relative">
            <PremiumImage src={m.image} alt={m.name} variant="avatar" forExport={forExport} />
            <div
              className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-black text-white"
              style={{ background: s.accent }}
            >
              {i + 1}
            </div>
          </div>
          <div className="space-y-0.5 min-w-0 w-full">
            <p className={`text-[11px] sm:text-xs font-bold truncate ${s.titleClass}`}>{m.name}</p>
            <p
              className="text-[8px] sm:text-[9px] font-mono uppercase tracking-widest font-semibold truncate"
              style={{ color: s.accent }}
            >
              {m.role}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export const MetricBento: React.FC<{
  metrics: NonNullable<SlideVisualData["metrics"]>;
  selectedStyle: StyleKey;
}> = ({ metrics, selectedStyle }) => {
  const s = getStyleSlice(selectedStyle);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 my-auto">
      {metrics.slice(0, 6).map((m, i) => (
        <div
          key={i}
          className={`rounded-xl p-2.5 sm:p-3 border text-left ${m.highlight ? "col-span-2 sm:col-span-1" : ""}`}
          style={{
            background: m.highlight
              ? `linear-gradient(135deg, ${s.accent}18 0%, transparent 100%)`
              : s.cardBg,
            borderColor: m.highlight ? `${s.accent}44` : s.cardBorder,
          }}
        >
          <span className="text-[7px] font-mono uppercase tracking-widest font-bold block mb-1" style={{ color: s.muted }}>
            {m.label}
          </span>
          <span className={`text-base sm:text-lg font-display font-black tracking-tight ${s.titleClass}`}>
            {m.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export const SplitContentLayout: React.FC<{
  left: React.ReactNode;
  image?: string;
  imageCaption?: string;
  imagePosition?: "right" | "left";
  forExport?: boolean;
}> = ({ left, image, imageCaption, imagePosition = "right", forExport }) => {
  if (!image) return <>{left}</>;
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 my-auto ${imagePosition === "left" ? "md:[direction:rtl]" : ""}`}>
      <div className="flex flex-col justify-center md:[direction:ltr]">{left}</div>
      <div className="md:[direction:ltr] min-h-[100px]">
        <PremiumImage src={image} caption={imageCaption} variant="hero" forExport={forExport} />
      </div>
    </div>
  );
};

export const BulletCards: React.FC<{
  items: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (text: string, i: number, className: string) => React.ReactNode;
  selectedStyle: StyleKey;
  accentDot?: string;
  max?: number;
}> = ({ items, parseBullet, renderBullet, selectedStyle, accentDot = "bg-emerald-500", max = 4 }) => {
  const s = getStyleSlice(selectedStyle);
  return (
    <div className="space-y-1.5">
      {items.slice(0, max).map((item, i) => {
        const parsed = parseBullet(item);
        return (
          <div
            key={i}
            className="rounded-xl p-2.5 flex items-start gap-2.5 text-left border"
            style={{ background: s.cardBg, borderColor: s.cardBorder }}
          >
            <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${accentDot}`} />
            <div className="min-w-0">
              {parsed.label ? (
                <span className={`text-[9px] font-bold uppercase font-mono block mb-0.5 ${s.titleClass}`}>
                  {parsed.label}
                </span>
              ) : null}
              {renderBullet(
                parsed.detail || item,
                i,
                `text-[10px] sm:text-[11px] leading-snug ${s.textClass}`
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const HeroTitleSlide: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  content: string[];
  image?: string;
  imageDescription?: string;
  selectedStyle: StyleKey;
  forExport?: boolean;
  renderBullet: (text: string, i: number, className: string) => React.ReactNode;
}> = ({
  title,
  subtitle,
  badge,
  content,
  image,
  imageDescription,
  selectedStyle,
  forExport,
  renderBullet,
}) => {
  const s = getStyleSlice(selectedStyle);
  const firstLetter = (typeof title === "string" ? title : "D").toString().trim().charAt(0).toUpperCase();

  if (image) {
    return (
      <div className="relative h-full flex flex-col justify-end overflow-hidden rounded-xl">
        <PremiumImage src={image} alt={imageDescription} variant="hero" className="absolute inset-0 !min-h-full !rounded-none" forExport={forExport} />
        <div className="relative z-10 p-4 sm:p-5 space-y-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          {badge}
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight leading-none">
              {title}
            </div>
            {subtitle && <p className="text-sm text-white/75 font-medium">{subtitle}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {content.slice(0, 3).map((item, i) => (
              <span key={i} className="text-[9px] px-2 py-1 rounded-full bg-white/15 text-white/90 border border-white/20 backdrop-blur-sm">
                {renderBullet(item, i, "")}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between h-full py-2 text-center">
      <div className="flex flex-col items-center pt-1">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-2xl mb-3"
          style={{
            background: `linear-gradient(135deg, ${s.accent} 0%, ${s.isLight ? "#111" : "#065f46"} 100%)`,
          }}
        >
          {firstLetter}
        </div>
        {badge}
      </div>
      <div className="space-y-2 my-auto px-2">
        <div className={`text-xl sm:text-2xl md:text-3xl font-display font-black uppercase tracking-tight leading-none ${s.titleClass}`}>
          {title}
        </div>
        {subtitle && <p className={`text-xs sm:text-sm ${s.textClass} max-w-md mx-auto`}>{subtitle}</p>}
      </div>
      <div className="grid grid-cols-3 gap-2 border-t pt-2" style={{ borderColor: s.cardBorder }}>
        {content.slice(0, 3).map((item, i) => (
          <div
            key={i}
            className="rounded-xl p-2 text-left border"
            style={{ background: s.cardBg, borderColor: s.cardBorder }}
          >
            <span className="text-[7px] font-mono uppercase tracking-wider block mb-0.5" style={{ color: s.muted }}>
              0{i + 1}
            </span>
            {renderBullet(item, i, `text-[9px] font-medium ${s.textClass}`)}
          </div>
        ))}
      </div>
    </div>
  );
};
