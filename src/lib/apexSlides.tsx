import React from "react";
import type { Slide } from "../types";
import { PremiumImage } from "./slideVisuals";

const APEX_BLUE = "#0071e3";
const APEX_GREEN = "#30d158";

export const ApexSectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: APEX_BLUE }}>
    {children}
  </p>
);

export const ApexTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <h2
    className={`text-lg sm:text-xl md:text-2xl font-bold tracking-tight leading-tight text-white mb-3 ${className}`}
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
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
}> = ({ title, subtitle, badge, content, image, renderBullet }) => {
  if (image) {
    return (
      <div className="relative h-full rounded-2xl overflow-hidden">
        <PremiumImage src={image} variant="hero" className="absolute inset-0 !min-h-full !rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20" />
        <div className="relative z-10 h-full flex flex-col justify-end p-4 sm:p-5 text-center">
          {badge}
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase leading-none mb-2">{title}</div>
          {subtitle && <p className="text-sm text-white/60 mb-3">{subtitle}</p>}
          <div className="flex flex-wrap justify-center gap-2">
            {content.slice(0, 3).map((c, i) => (
              <span key={i} className="text-[9px] px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-white/85">
                {renderBullet(c, i, "")}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const letter = String(typeof title === "string" ? title : "A").charAt(0).toUpperCase();
  return (
    <div className="h-full flex flex-col items-center justify-center text-center relative">
      <div
        className="w-14 h-14 rounded-[22px] flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-2xl"
        style={{
          background: "linear-gradient(145deg, #1d6bf3, #0040c8)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 24px 48px rgba(0,100,255,0.25)",
        }}
      >
        {letter}
      </div>
      {badge}
      <div
        className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-none mb-3 uppercase"
        style={{
          background: "linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.55) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-0.04em",
        }}
      >
        {title}
      </div>
      {subtitle && <p className="text-sm text-white/45 max-w-md mb-4 leading-relaxed">{subtitle}</p>}
      <div className="grid grid-cols-3 gap-2 w-full max-w-lg mt-2">
        {content.slice(0, 3).map((c, i) => (
          <div key={i} className="rounded-xl p-2 border border-white/[0.06] bg-white/[0.03] text-left">
            <span className="text-[7px] text-white/30 uppercase tracking-widest block mb-0.5">0{i + 1}</span>
            <span className="text-[9px] text-white/70 leading-snug">{renderBullet(c, i, "")}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ApexStatsGrid: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  extractNumber: (s: string) => string;
}> = ({ content, parseBullet, extractNumber }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-0.5 rounded-2xl overflow-hidden border border-white/[0.06] my-auto">
    {content.slice(0, 4).map((item, i) => {
      const parsed = parseBullet(item);
      const num = extractNumber(item) || parsed.detail.match(/[\d$%]+/)?.[0] || "—";
      return (
        <div
          key={i}
          className="p-3 sm:p-4 flex flex-col gap-1 border-r border-white/[0.06] last:border-r-0 bg-white/[0.04] hover:bg-white/[0.07] transition-colors"
        >
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-none">
            {num}
          </div>
          <div className="text-[9px] text-white/45 leading-snug">{parsed.label || parsed.detail}</div>
          <div className="text-[8px] font-medium mt-0.5" style={{ color: APEX_GREEN }}>
            ↑ метрика
          </div>
        </div>
      );
    })}
  </div>
);

export const ApexProductSplit: React.FC<{
  content: string[];
  image?: string;
  imageCaption?: string;
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
}> = ({ content, image, imageCaption, parseBullet, renderBullet }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-auto items-center">
    <div className="space-y-3">
      {content.slice(0, 3).map((item, i) => {
        const p = parseBullet(item);
        return (
          <div key={i} className="flex gap-3 items-start">
            <div
              className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-sm"
              style={{ background: i === 0 ? "rgba(0,113,227,0.12)" : i === 1 ? "rgba(48,209,88,0.1)" : "rgba(255,179,0,0.1)" }}
            >
              {i === 0 ? "⚡" : i === 1 ? "🔒" : "🤖"}
            </div>
            <div>
              {p.label && <h3 className="text-[11px] font-semibold text-white mb-0.5">{p.label}</h3>}
              <p className="text-[10px] text-white/45 leading-relaxed">{renderBullet(p.detail || item, i, "")}</p>
            </div>
          </div>
        );
      })}
    </div>
    {image ? (
      <PremiumImage src={image} caption={imageCaption} variant="hero" />
    ) : (
      <div
        className="aspect-square rounded-[28px] border border-white/[0.08] flex items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}
      >
        <div className="w-[80%] rounded-2xl border border-white/10 bg-white/[0.05] p-4 space-y-2">
          <div className="flex gap-1.5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          {[100, 80, 60, 45, 100, 75].map((w, i) => (
            <div key={i} className="h-1.5 rounded-full bg-white/10" style={{ width: `${w}%`, opacity: 1 - i * 0.08 }} />
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
}> = ({ content, parseBullet, extractNumber }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-auto">
    {content.slice(0, 3).map((item, i) => {
      const p = parseBullet(item);
      const price = extractNumber(item) || p.detail;
      const featured = i === 1;
      return (
        <div
          key={i}
          className={`rounded-2xl p-3 border text-left ${featured ? "ring-1 ring-white/20 scale-[1.02]" : ""}`}
          style={{
            background: featured ? "linear-gradient(160deg, #0071e3 0%, #0040a8 100%)" : "rgba(255,255,255,0.03)",
            borderColor: featured ? "transparent" : "rgba(255,255,255,0.08)",
          }}
        >
          <div className="text-[8px] uppercase tracking-widest text-white/50 mb-1">{p.label || `Тариф ${i + 1}`}</div>
          <div className="text-lg font-bold text-white mb-2">{price}</div>
          <p className="text-[9px] text-white/55 leading-relaxed">{p.detail}</p>
        </div>
      );
    })}
  </div>
);

export const ApexRoadmap: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
}> = ({ content, parseBullet }) => (
  <div className="relative my-auto pl-2">
    <div className="absolute left-[4.5rem] top-3 bottom-3 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />
    <div className="space-y-2">
      {content.slice(0, 4).map((item, i) => {
        const p = parseBullet(item);
        return (
          <div key={i} className="grid grid-cols-[4.5rem_1fr] gap-3 items-start">
            <div className="text-[8px] font-semibold text-white/35 text-right pt-3 uppercase tracking-wide">
              Q{i + 1} '26
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3 relative">
              <div
                className="absolute -left-[1.15rem] top-3 w-2.5 h-2.5 rounded-full border-2"
                style={{
                  background: i === 0 ? APEX_GREEN : i === 1 ? APEX_BLUE : "rgba(255,255,255,0.2)",
                  borderColor: i <= 1 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)",
                }}
              />
              <div className="text-[8px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: i === 0 ? APEX_GREEN : APEX_BLUE }}>
                {p.label || `Этап ${i + 1}`}
              </div>
              <p className="text-[10px] text-white/75 leading-snug">{p.detail}</p>
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
}> = ({ title, subtitle, content, image, renderBullet }) => (
  <div className="h-full flex flex-col items-center justify-center text-center my-auto">
    <span
      className="inline-block text-[8px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3 border"
      style={{ background: "rgba(0,113,227,0.12)", borderColor: "rgba(0,113,227,0.25)", color: "#4da3ff" }}
    >
      Инвестиционное предложение
    </span>
    <div className="text-xl sm:text-2xl font-extrabold text-white mb-2 tracking-tight">{title}</div>
    {subtitle && <p className="text-sm text-white/40 mb-4 max-w-sm">{subtitle}</p>}
    <div className="flex flex-wrap justify-center gap-2 mb-4">
      {content.slice(0, 3).map((c, i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] text-white/70">
          {renderBullet(c, i, "")}
        </div>
      ))}
    </div>
    {image && <PremiumImage src={image} variant="thumb" className="max-w-[140px] mx-auto" />}
  </div>
);

export function shouldUseApexLayout(slide: Slide): boolean {
  return slide.visualData?.template === "apex" || slide.visualData?.template === "swiss";
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
}) => {
  const type = slide.type;
  const variant = slide.visualData?.variant || "";

  return (
    <div className="h-full flex flex-col py-1 relative">
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative z-10 flex flex-col h-full">
        {index !== 0 && type !== "title" && (
          <div className="mb-2 text-left">
            {sectionLabel && <ApexSectionLabel>{sectionLabel}</ApexSectionLabel>}
            <ApexTitle>{title}</ApexTitle>
            {subtitle && <p className="text-[10px] text-white/45">{subtitle}</p>}
          </div>
        )}

        {(index === 0 || type === "title") && (
          <ApexHero
            title={title}
            subtitle={subtitle}
            badge={badge}
            content={content}
            image={slide.image}
            renderBullet={renderBullet}
          />
        )}

        {(type === "problem" || (type === "market" && variant === "metric-row")) && (
          <ApexStatsGrid content={content} parseBullet={parseBullet} extractNumber={extractNumber} />
        )}

        {type === "solution" && (
          <ApexProductSplit
            content={content}
            image={slide.image}
            imageCaption={slide.imageDescription}
            parseBullet={parseBullet}
            renderBullet={renderBullet}
          />
        )}

        {type === "market" && variant !== "metric-row" && slide.visualData?.metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 my-auto">
            {slide.visualData.metrics.map((m, i) => (
              <div key={i} className="rounded-xl p-3 bg-white/[0.04] border border-white/[0.06]">
                <div className="text-[8px] text-white/40 uppercase tracking-widest">{m.label}</div>
                <div className="text-lg font-bold text-white">{m.value}</div>
              </div>
            ))}
          </div>
        )}

        {type === "pricing" && <ApexPricingCards content={content} parseBullet={parseBullet} extractNumber={extractNumber} />}

        {type === "launch" && <ApexRoadmap content={content} parseBullet={parseBullet} />}

        {(type === "ask" || type === "cta") && (
          <ApexCTA
            title={title}
            subtitle={subtitle}
            content={content}
            image={slide.image}
            renderBullet={renderBullet}
          />
        )}

        {!["title", "problem", "solution", "market", "pricing", "launch", "ask", "cta"].includes(type) &&
          index !== 0 && (
            <ApexStatsGrid content={content} parseBullet={parseBullet} extractNumber={extractNumber} />
          )}
      </div>
    </div>
  );
};
