import React, { useRef } from "react";
import { Camera } from "lucide-react";
import type { SlideVisualData } from "../types";

type StyleKey = "cobalt" | "clean-light" | "cosmic-dark";

interface ThemeSlice {
  isLight: boolean;
  isCobalt: boolean;
  isDark: boolean;
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
    accent: isLight ? "#0d9488" : isCobalt ? "#0071e3" : "#34d399",
    muted: isLight ? "#64748b" : "#94a3b8",
    cardBg: isLight
      ? "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(248,250,252,0.9))"
      : isCobalt
        ? "rgba(255,255,255,0.94)"
        : "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
    cardBorder: isLight
      ? "rgba(15,23,42,0.08)"
      : isCobalt
        ? "rgba(0,77,230,0.12)"
        : "rgba(148,163,184,0.16)",
    titleClass: isLight ? "text-slate-950" : isCobalt ? "text-slate-950" : "text-white",
    textClass: isLight ? "text-slate-600" : isCobalt ? "text-slate-600" : "text-slate-200",
    isDark: selectedStyle === "cosmic-dark",
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
      className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 border-b pb-2 mb-2 text-left shrink-0"
      style={{ borderColor: s.cardBorder }}
    >
      <div className="space-y-1 min-w-0 flex-1">
        {sectionLabel && (
          <div className={`text-[7px] sm:text-[8px] font-mono uppercase tracking-[0.15em] font-bold leading-tight ${accentClass}`}>
            {sectionLabel}
          </div>
        )}
        <div className={`text-xs sm:text-sm font-display font-black tracking-tight uppercase leading-tight break-words ${s.titleClass}`}>
          {title}
        </div>
      </div>
      {subtitle && (
        <div className={`shrink-0 max-w-[45%] text-[7px] sm:text-[8px] font-mono py-1 px-2 rounded-full uppercase tracking-wider border line-clamp-2 ${s.isLight ? "bg-white/80 text-slate-600 border-slate-200/80 shadow-sm" : s.isDark ? "bg-white/[0.06] text-slate-200 border-slate-400/20" : "bg-blue-50 text-blue-700 border-blue-100"}`}>
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
  editable?: boolean;
  onMemberImageChange?: (index: number, imageDataUrl: string) => void;
}> = ({ members, selectedStyle, forExport, editable, onMemberImageChange }) => {
  const s = getStyleSlice(selectedStyle);
  const cols = members.length <= 2 ? members.length : members.length === 3 ? 3 : 2;
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleFile = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        onMemberImageChange?.(index, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="grid gap-2 sm:gap-2.5 my-auto min-h-0 flex-1"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {members.slice(0, 4).map((m, i) => (
        <div
          key={i}
          className="relative rounded-2xl p-2.5 sm:p-3 flex flex-col items-center text-center gap-2 border backdrop-blur-sm min-h-0"
          style={{
            background: s.isLight
              ? "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)"
              : s.isCobalt
                ? "linear-gradient(145deg, #ffffff 0%, #f0f6ff 100%)"
                : "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
            borderColor: s.cardBorder,
            boxShadow: s.isLight ? "0 6px 24px rgba(0,0,0,0.05)" : "0 6px 28px rgba(0,0,0,0.3)",
          }}
        >
          <button
            type="button"
            disabled={!editable || forExport}
            onClick={() => editable && fileRefs.current[i]?.click()}
            className={`relative group rounded-2xl ${editable && !forExport ? "cursor-pointer" : ""}`}
            aria-label={`Загрузить фото: ${m.name}`}
          >
            {m.image ? (
              <PremiumImage src={m.image} alt={m.name} variant="avatar" forExport={forExport} className="!h-14 !w-14 sm:!h-16 sm:!w-16" />
            ) : (
              <div
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center border border-dashed"
                style={{ borderColor: s.cardBorder, background: s.cardBg }}
              >
                <Camera className="h-5 w-5 opacity-40" style={{ color: s.muted }} />
              </div>
            )}
            {editable && !forExport && (
              <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="h-4 w-4 text-white" />
              </div>
            )}
            <input
              ref={(el) => { fileRefs.current[i] = el; }}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(i, f);
                e.target.value = "";
              }}
            />
          </button>
          <div className="space-y-0.5 min-w-0 w-full">
            <p className={`text-[10px] sm:text-[11px] font-bold truncate leading-tight ${s.titleClass}`}>{m.name}</p>
            <p
              className="text-[7px] sm:text-[8px] font-mono uppercase tracking-widest font-semibold truncate leading-tight"
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
  const items = metrics.slice(0, 3);
  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 my-auto min-h-0 flex-1">
      {items.map((m, i) => (
        <div
          key={i}
          className={`rounded-xl p-2 sm:p-2.5 border text-left flex flex-col min-h-0 overflow-hidden ${m.highlight ? "ring-1" : ""}`}
          style={{
            background: m.highlight
              ? `linear-gradient(135deg, ${s.accent}14 0%, transparent 100%)`
              : s.cardBg,
            borderColor: m.highlight ? `${s.accent}44` : s.cardBorder,
            ringColor: m.highlight ? `${s.accent}33` : undefined,
          }}
        >
          <span className="text-[6.5px] sm:text-[7px] font-mono uppercase tracking-widest font-bold block mb-1 truncate" style={{ color: s.muted }}>
            {m.label}
          </span>
          <span className={`text-[11px] sm:text-sm font-display font-black tracking-tight leading-tight line-clamp-3 ${s.titleClass}`}>
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
