import React from "react";
import { Flame, Sparkles, LockKeyhole } from "lucide-react";
import { Slide } from "../types";
import { EditableText } from "./EditableText";
import {
  SlideSectionHeader,
  PremiumImage,
  TeamPlateGrid,
  MetricBento,
  SplitContentLayout,
  HeroTitleSlide,
} from "../lib/slideVisuals";
import { ApexSlideContent, shouldUseApexLayout } from "../lib/apexSlides";
import { resolveSlideTheme } from "../lib/deckTheme";
import type { DeckThemeCustom } from "../types";

export const getThemeStyles = (
  slideIndex: number, 
  type: string, 
  selectedStyle: 'cobalt' | 'clean-light' | 'cosmic-dark',
  customTheme?: DeckThemeCustom | null
) => {
  const rt = resolveSlideTheme(selectedStyle, slideIndex, type, customTheme);
  return {
    bg: rt.frameGradient,
    border: `1px solid ${rt.borderColor}`,
    textColor: rt.titleClass,
    footerTextColor: rt.footerTextColor,
    footerBorder: `1px solid ${rt.borderColor}`,
    dotColor: rt.dotColor,
    innerCardBg: rt.innerCardBg,
    accentColor: rt.primary,
    badgeBg: rt.cardClass,
    titleColor: rt.titleColor,
    bulletTextColor: rt.bulletTextColor,
    subtitleColor: rt.subtitleColor,
    accentPill: rt.cardClass,
    accentText: rt.accentText,
    textContrast: rt.bodyClass,
    resolved: rt,
  };
};

interface RenderSlideContentProps {
  slide: Slide;
  index: number;
  selectedStyle: 'cobalt' | 'clean-light' | 'cosmic-dark';
  customTheme?: DeckThemeCustom | null;
  forExport?: boolean;
  onUpdate?: (patch: Partial<Slide>) => void;
}

export const SlideRenderer: React.FC<RenderSlideContentProps> = ({
  slide,
  index,
  selectedStyle,
  customTheme,
  forExport = false,
  onUpdate
}) => {
  if (!slide) return null;

  const title = slide.title;
  const subtitle = slide.subtitle;
  const content = slide.content || [];
  const type = (slide.type || "") as string;
  const editable = !!onUpdate && !forExport;
  const theme = getThemeStyles(index, type, selectedStyle, customTheme);
  const rt = theme.resolved;

  const T = (
    text: string, 
    field: "title" | "subtitle" | "badge" | "sectionLabel", 
    className: string, 
    Tag: React.ElementType = "span"
  ) =>
    editable ? (
      <EditableText value={text} className={className} as={Tag} onSave={(v) => onUpdate!({ [field]: v })} />
    ) : (
      <Tag className={className}>{text}</Tag>
    );

  const B = (
    text: string, 
    bulletIndex: number, 
    className: string, 
    Tag: React.ElementType = "span"
  ) =>
    editable ? (
      <EditableText
        value={text}
        className={className}
        as={Tag}
        onSave={(v) => {
          const next = [...content];
          next[bulletIndex] = v;
          onUpdate!({ content: next });
        }}
      />
    ) : (
      <Tag className={className}>{text}</Tag>
    );

  // Helper to parse double part labels like "TAM: $40B" or "Key - Value"
  const parseBullet = (str: string) => {
    const splitters = [": ", " — ", " - "];
    for (const splitter of splitters) {
      if (str.includes(splitter)) {
        const idx = str.indexOf(splitter);
        const first = str.substring(0, idx).trim();
        const second = str.substring(idx + splitter.length).trim();
        return { label: first, detail: second };
      }
    }
    return { label: "", detail: str };
  };

  // Helper to parse numbers
  const extractNumber = (str: string) => {
    const match = str.match(/(\$?\d+[,.]?\d*\s*(?:миллиард\w*|млн|тыс|%|B|M|K|млрд| доллар\w*|к\b|к\s))/i);
    return match ? match[1] : "";
  };

  // TEAM SLIDE — founder photos from user uploads
  if (slide.visualData?.layout === "team" && slide.visualData.teamMembers?.length) {
    return (
      <div className="flex flex-col h-full py-1 justify-between">
        <SlideSectionHeader
          sectionLabel={slide.sectionLabel || "👥 Команда • Founders & Core Team"}
          title={T(title, "title", "", "span")}
          subtitle={subtitle ? T(subtitle, "subtitle", "", "span") : undefined}
          accentClass="text-violet-400"
          selectedStyle={selectedStyle}
        />
        <TeamPlateGrid
          members={slide.visualData.teamMembers}
          selectedStyle={selectedStyle}
          forExport={forExport}
        />
        {content.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {content.slice(0, 2).map((item, i) => (
              <div
                key={i}
                className={`rounded-xl p-2 text-[9px] border text-left ${theme.innerCardBg}`}
              >
                {B(item, i, theme.bulletTextColor)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // APEX / SWISS template — Apple-style layouts from Teamplate.html
  if (shouldUseApexLayout(slide)) {
    return (
      <ApexSlideContent
        slide={slide}
        index={index}
        title={T(title, "title", "", "span")}
        subtitle={subtitle ? T(subtitle, "subtitle", "", "span") : undefined}
        badge={slide.badge ? T(slide.badge, "badge", "", "span") : undefined}
        sectionLabel={slide.sectionLabel ? T(slide.sectionLabel, "sectionLabel", "", "span") : undefined}
        content={content}
        parseBullet={parseBullet}
        extractNumber={extractNumber}
        renderBullet={(text, i, className) => B(text, i, className)}
        forExport={forExport}
      />
    );
  }

  // 1. TITLE SLIDE (Index 0 or type === 'title')
  if (index === 0 || type === "title") {
    const isLight = selectedStyle === 'clean-light';
    const isCobalt = selectedStyle === 'cobalt';

    const badgeEl = (
      <div
        className="mx-auto inline-flex items-center space-x-1.5 border px-2.5 py-0.5 rounded-full uppercase tracking-widest font-mono text-[9px] mb-2"
        style={{
          background: isLight ? "rgba(0,0,0,0.03)" : isCobalt ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
          borderColor: isLight ? "rgba(0,0,0,0.08)" : isCobalt ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.15)",
          color: isLight ? "#004de6" : isCobalt ? "#9bf0e1" : "#9bf0e1",
        }}
      >
        <span className={`h-1 w-1 rounded-full ${isLight ? 'bg-blue-600' : 'bg-[#10b981]'}`} />
        {T(slide.badge || "✦ INVESTOR DECK", "badge", "", "span")}
      </div>
    );

    return (
      <HeroTitleSlide
        title={T(title, "title", "", "span")}
        subtitle={subtitle ? T(subtitle, "subtitle", "", "span") : undefined}
        badge={badgeEl}
        content={content}
        image={slide.image}
        imageDescription={slide.imageDescription}
        selectedStyle={selectedStyle}
        forExport={forExport}
        renderBullet={(text, i, className) => B(text, i, className)}
      />
    );
  }

  // 2. PROBLEM SLIDE (Index 1 or type === 'problem')
  if (index === 1 || type === "problem") {
    return (
      <div className="flex flex-col h-full min-h-0 py-0.5 overflow-hidden">
        <SlideSectionHeader
          sectionLabel={slide.sectionLabel || "🎯 РАЗДЕЛ 02 • АНАЛИЗ ПРОБЛЕМЫ"}
          title={T(title, "title", "", "h2")}
          subtitle={subtitle ? T(subtitle, "subtitle", "", "span") : undefined}
          accentClass={rt.isDark ? "text-rose-400" : "text-rose-600"}
          selectedStyle={selectedStyle}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-auto min-h-0 flex-1">
          <div
            className={`rounded-xl p-2.5 flex flex-col justify-between text-left border min-h-0 ${
              rt.isDark ? "bg-rose-500/10 border-rose-500/20" : "bg-rose-50 border-rose-200/60"
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <div className={`h-5 w-5 rounded-lg flex items-center justify-center border ${rt.isDark ? "bg-rose-500/15 text-rose-400 border-rose-500/25" : "bg-rose-100 text-rose-600 border-rose-200"}`}>
                <Flame className="h-3 w-3" />
              </div>
              <span className={`text-[8px] font-mono uppercase tracking-wider font-extrabold ${rt.isDark ? "text-rose-300" : "text-rose-800"}`}>
                Главный фактор боли
              </span>
            </div>
            <p className={`text-[9px] sm:text-[10px] leading-snug line-clamp-4 mt-1.5 ${rt.bodyClass}`}>
              {content[0] || "Острая неудовлетворенность текущим пользовательским опытом."}
            </p>
          </div>

          {slide.image ? (
            <PremiumImage src={slide.image} alt={slide.imageDescription} caption={slide.imageDescription} variant="hero" forExport={forExport} />
          ) : (
            <div className="space-y-1 flex flex-col justify-center min-h-0 overflow-hidden">
              {content.slice(1, 4).map((item, i) => {
                const parsed = parseBullet(item);
                return (
                  <div key={i} className={`rounded-lg p-1.5 flex items-start gap-2 text-left border min-h-0 ${theme.innerCardBg}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1 flex-shrink-0" />
                    <p className="text-[8.5px] sm:text-[9px] leading-snug line-clamp-2">
                      {parsed.label ? <strong className={`font-bold ${rt.titleClass}`}>{parsed.label}: </strong> : null}
                      <span className={rt.bodyClass}>{parsed.detail}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. SOLUTION SLIDE (Index 2 or type === 'solution')
  if (index === 2 || type === "solution") {
    const isLight = selectedStyle === 'clean-light';
    const isCobalt = selectedStyle === 'cobalt';
    return (
      <div className="flex flex-col justify-between h-full py-1">
        <div className="flex items-center justify-between border-b pb-1.5 text-left" style={{ borderColor: isLight ? "rgba(0,0,0,0.06)" : isCobalt ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)" }}>
          <div className="space-y-0.5">
            {T(slide.sectionLabel || "🚀 РАЗДЕЛ 03 • НАШЕ РЕШЕНИЕ", "sectionLabel", `text-[7px] font-mono uppercase tracking-widest font-bold ${isLight ? 'text-emerald-550' : 'text-[#10b981]'}`)}
            {T(title, "title", `text-xs sm:text-sm md:text-md lg:text-md font-extrabold tracking-tight uppercase leading-none font-display ${theme.titleColor}`, "h2")}
          </div>
          {subtitle && T(
            subtitle,
            "subtitle",
            `hidden sm:inline-block border text-[7px] font-mono py-0.5 px-2 rounded-full uppercase tracking-wider font-semibold ${isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20'}`
          )}
        </div>

        <SplitContentLayout
          image={slide.image}
          imageCaption={slide.imageDescription}
          forExport={forExport}
          left={
            <div className={`grid gap-2 ${slide.image ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"}`}>
              {content.slice(0, slide.image ? 4 : 3).map((item, i) => {
                const parsed = parseBullet(item);
                return (
                  <div key={i} className={`rounded-xl p-3 text-left flex flex-col justify-between space-y-2 border ${
                    isLight 
                      ? 'bg-white border-neutral-200 shadow-sm' 
                      : isCobalt 
                        ? 'bg-white border-blue-100 shadow-sm' 
                        : 'bg-gradient-to-b from-white/[0.04] to-white/[0.02] border border-white/8'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className={`h-5 w-5 rounded-lg flex items-center justify-center border ${isLight ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60' : 'bg-[#10b981]/10 text-emerald-400 border border-emerald-500/20'}`}>
                        <Sparkles className="h-3 w-3" />
                      </div>
                      <span className={`text-[7px] font-mono uppercase tracking-widest font-bold ${isLight ? 'text-neutral-450' : 'text-slate-500'}`}>0{i+1}</span>
                    </div>
                    <div>
                      {parsed.label ? (
                        <h4 className={`text-[9.5px] font-display font-black uppercase tracking-tight mb-0.5 ${isLight ? 'text-neutral-950' : isCobalt ? 'text-slate-900' : 'text-white'}`}>{parsed.label}</h4>
                      ) : null}
                      <p className={`text-[10px] leading-snug font-sans ${isLight ? 'text-neutral-600' : isCobalt ? 'text-slate-600' : 'text-slate-300'}`}>
                        {parsed.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          }
        />

        <div className={`flex items-center space-x-2 border p-1.5 rounded-lg text-left ${isLight ? 'bg-emerald-50/20 border-emerald-200/50' : 'bg-[#10b981]/5 border border-[#10b981]/15'}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse"></span>
          <span className={`text-[8.5px] tracking-wide font-sans truncate ${isLight ? 'text-neutral-700 font-medium' : 'text-emerald-300'}`}>Инновационный технологический подход заменяет недели сложной мануальной настройки.</span>
        </div>
      </div>
    );
  }

  // 4. MARKET SIZE (Index 3 or type === 'market')
  if (index === 3 || type === "market") {
    return (
      <div className="flex flex-col h-full min-h-0 py-0.5 overflow-hidden">
        <SlideSectionHeader
          sectionLabel={slide.sectionLabel || "👥 РАЗДЕЛ 04 • ЦЕЛЕВОЙ РЫНОК"}
          title={T(title, "title", "", "h2")}
          subtitle={subtitle ? T(subtitle, "subtitle", "", "span") : undefined}
          accentClass={rt.isDark ? "text-blue-400" : "text-blue-600"}
          selectedStyle={selectedStyle}
        />

        {slide.visualData?.metrics && slide.visualData.metrics.length >= 2 ? (
          <SplitContentLayout
            image={slide.image}
            imageCaption={slide.imageDescription}
            forExport={forExport}
            left={<MetricBento metrics={slide.visualData.metrics} selectedStyle={selectedStyle} />}
          />
        ) : (
        <div className="grid grid-cols-3 gap-2 my-auto min-h-0 flex-1">
          {content.slice(0, slide.image ? 2 : 3).map((item, i) => {
            const parsed = parseBullet(item);
            const extractedNum = extractNumber(item);
            const labelText = parsed.label || `Сегмент 0${i + 1}`;
            const descText = parsed.detail || item;

            const cardBg = rt.isDark
              ? "bg-white/[0.04] border-white/8"
              : "bg-white border-neutral-200 shadow-sm";
            const accentColor = [
              { pill: rt.isDark ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-700 border-blue-100", num: rt.isDark ? "text-blue-400" : "text-blue-700" },
              { pill: rt.isDark ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-indigo-50 text-indigo-700 border-indigo-100", num: rt.isDark ? "text-indigo-400" : "text-indigo-700" },
              { pill: rt.isDark ? "bg-sky-500/10 text-sky-400 border-sky-500/20" : "bg-sky-50 text-sky-700 border-sky-100", num: rt.isDark ? "text-sky-400" : "text-sky-700" },
            ][i] || { pill: "bg-white/5 text-white/80 border-white/10", num: "text-white" };

            return (
              <div key={i} className={`rounded-xl p-2 text-left flex flex-col justify-between gap-1 relative overflow-hidden border min-h-0 ${cardBg}`}>
                <div className="flex items-center justify-between relative z-10 gap-1">
                  <span className={`text-[7px] font-mono py-0.5 px-1 rounded uppercase tracking-widest font-extrabold border truncate ${accentColor.pill}`}>
                    {labelText}
                  </span>
                  <span className={`text-[7px] font-mono shrink-0 ${rt.mutedClass}`}>0{i + 1}</span>
                </div>
                <div className="space-y-0.5 relative z-10 min-h-0">
                  {extractedNum ? (
                    <div className={`text-sm sm:text-base font-display font-black tracking-tighter ${accentColor.num}`}>
                      {extractedNum}
                    </div>
                  ) : null}
                  <p className={`text-[8.5px] leading-snug line-clamp-2 ${rt.bodyClass}`}>
                    {extractedNum ? descText.replace(extractedNum, "").replace(/^[:-]\s*/, "").trim() : descText}
                  </p>
                </div>
              </div>
            );
          })}
          {slide.image && !slide.visualData?.metrics?.length && (
            <PremiumImage src={slide.image} alt={slide.imageDescription} caption={slide.imageDescription} variant="hero" forExport={forExport} />
          )}
        </div>
        )}

        {content[3] ? (
          <div className={`text-[8px] border-t pt-1 flex items-center gap-2 shrink-0 ${rt.isDark ? "border-white/5" : "border-neutral-200"}`}>
            <span className={`font-mono text-[7px] uppercase tracking-wider font-extrabold shrink-0 ${rt.accentText}`}>🔥 Тренды:</span>
            <span className={`italic line-clamp-1 flex-1 ${rt.bodyClass}`}>{content[3]}</span>
          </div>
        ) : null}
      </div>
    );
  }

  // 5. BUSINESS MODEL / REVENUE (Index 4 or type === 'pricing' || type === 'revenue')
  if (index === 4 || type === "pricing" || type === "revenue") {
    const isLight = selectedStyle === 'clean-light';
    const isCobalt = selectedStyle === 'cobalt';
    return (
      <div className="flex flex-col justify-around h-full py-1">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            {T(slide.sectionLabel || "💵 Раздел 05 • Бизнес-модель", "sectionLabel", `text-[7px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-amber-600' : 'text-amber-450'}`)}
            {T(title, "title", `text-xs sm:text-sm md:text-md lg:text-lg font-display font-black tracking-tight uppercase leading-tight ${isLight ? 'text-neutral-900' : isCobalt ? 'text-slate-900' : 'text-white'}`, "h2")}
          </div>
          {subtitle && T(
            subtitle,
            "subtitle",
            `hidden sm:inline-block border text-[8px] font-mono py-0.5 px-2 rounded-full uppercase tracking-wider font-semibold ${isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : isCobalt ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-auto">
          {content.slice(0, slide.image ? 2 : 3).map((item, i) => {
            const parsed = parseBullet(item);
            const extractedNum = extractNumber(item);

            // Apple pricing package style template
            const isHighlight = i === 1; // highlight middle plan as popular
            let cardClass = "";
            if (isLight) {
              cardClass = isHighlight 
                ? 'bg-gradient-to-b from-amber-50 to-amber-100/30 border-amber-300 shadow-md ring-2 ring-amber-500/10' 
                : 'bg-white border-neutral-200 shadow-sm';
            } else if (isCobalt) {
              cardClass = isHighlight 
                ? 'bg-blue-50/55 border-blue-400 shadow-md ring-2 ring-blue-500/10 text-slate-900'
                : 'bg-white border-blue-100 shadow-sm text-slate-900';
            } else {
              cardClass = isHighlight 
                ? 'bg-amber-500/[0.04] border-amber-500/40 shadow-inner' 
                : 'bg-white/[0.02] border-white/5 text-slate-400';
            }

            return (
              <div key={i} className={`rounded-xl p-2.5 text-left flex flex-col justify-between space-y-2 relative overflow-hidden transition-all border ${cardClass}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[7px] font-mono uppercase tracking-widest font-bold ${isLight ? 'text-neutral-400' : 'text-slate-500'}`}>Тариф 0{i+1}</span>
                  {isHighlight && (
                    <span className="bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[6px] px-1.5 py-0.5 font-bold uppercase rounded-full tracking-widest border border-amber-500/30">
                      ФОКУС
                    </span>
                  )}
                </div>

                <div>
                  <h4 className={`text-[9px] sm:text-[10px] font-display font-black uppercase tracking-tight truncate ${isLight ? 'text-neutral-900' : isCobalt ? 'text-slate-900' : 'text-white'}`}>
                    {parsed.label || "Подписка"}
                  </h4>
                  
                  {extractedNum ? (
                    <div className={`text-sm sm:text-base font-display font-extrabold tracking-tight mt-0.5 ${isLight ? 'text-neutral-900' : isCobalt ? 'text-[#004de6]' : 'text-amber-450'}`}>
                      {extractedNum}
                    </div>
                  ) : null}
                </div>

                <p className={`text-[8px] sm:text-[9px] leading-tight font-sans min-h-[24px] line-clamp-2 ${isLight ? 'text-neutral-600' : isCobalt ? 'text-slate-600' : 'text-slate-400'}`}>
                  {extractedNum ? parsed.detail.replace(extractedNum, "").trim() : parsed.detail}
                </p>
              </div>
            );
          })}
          {slide.image && (
            <div 
              className="rounded-xl overflow-hidden border border-white/10 relative flex flex-col justify-between bg-black/20"
              style={{ minHeight: '80px', height: '100%' }}
            >
              <img src={slide.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={slide.imageDescription || "Pricing Illustration"} />
              {slide.imageDescription && (
                <div className="absolute bottom-1 left-1 right-1 bg-black/75 backdrop-blur-sm p-1 rounded text-[7px] text-white truncate text-center leading-none">
                  {slide.imageDescription}
                </div>
              )}
            </div>
          )}
        </div>

        {content[3] ? (
          <div className={`border p-1.5 rounded-lg flex justify-between items-center text-[8px] ${isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-800' : isCobalt ? 'bg-blue-50/40 border-blue-100 text-slate-800' : 'bg-white/[0.02] border-white/5 text-slate-400'}`}>
            <span className={`font-mono uppercase tracking-wider font-extrabold ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>ЭКОНОМИКА UNIT:</span>
            <span className="font-medium">{content[3]}</span>
          </div>
        ) : (
          <p className={`text-[8px] italic text-left ${isLight ? 'text-neutral-400' : 'text-slate-500'}`}>* Прогнозируемая рентабельность проекта на горизонте 12 месяцев превышает 74%.</p>
        )}
      </div>
    );
  }

  // 6. SECRET SAUCE / TECH (Index 5 or type === 'sauce' || type === 'tech')
  if (index === 5 || type === "sauce" || type === "tech") {
    const isLight = selectedStyle === 'clean-light';
    const isCobalt = selectedStyle === 'cobalt';
    return (
      <div className="flex flex-col justify-around h-full py-1">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            {T(slide.sectionLabel || "🛡️ Раздел 06 • Технологический Moat", "sectionLabel", `text-[7px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-purple-600' : 'text-purple-400'}`)}
            {T(title, "title", `text-xs sm:text-sm md:text-md lg:text-lg font-display font-black tracking-tight uppercase leading-tight ${isLight ? 'text-neutral-900' : isCobalt ? 'text-slate-900' : 'text-white'}`, "h2")}
          </div>
          {subtitle && T(
            subtitle,
            "subtitle",
            `hidden sm:inline-block border text-[8px] font-mono py-0.5 px-2 rounded-full uppercase tracking-wider font-semibold ${isLight ? 'bg-purple-50 text-purple-700 border-purple-200' : isCobalt ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 my-auto">
          <div className={`rounded-xl p-3 flex flex-col justify-between space-y-1.5 text-left border relative overflow-hidden ${
            isLight 
              ? 'bg-gradient-to-br from-purple-50 to-indigo-50/50 border-purple-200 shadow-sm' 
              : isCobalt 
                ? 'bg-blue-50/60 border-blue-200 shadow-sm' 
                : 'bg-purple-500/[0.04] border-purple-500/20'
          }`}>
            <div className="flex items-center space-x-1.5">
              <div className={`h-5 w-5 rounded-full flex items-center justify-center border ${isLight ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-purple-500/10 text-purple-400 border-purple-500/25'}`}>
                <LockKeyhole className="h-2.5 w-2.5" />
              </div>
              <span className={`text-[9px] font-mono uppercase tracking-wider font-extrabold ${isLight ? 'text-purple-800' : isCobalt ? 'text-slate-900' : 'text-white/90'}`}>Уникальный Барьер</span>
            </div>
            <p className={`text-[10px] md:text-[11px] leading-relaxed font-sans font-medium ${isLight ? 'text-purple-950' : isCobalt ? 'text-slate-800' : 'text-purple-200/90'}`}>
              {content[2] || content[0] || "Машинное обучение и собственные алгоритмы обеспечивают долгосрочные технологические преимущества."}
            </p>
          </div>

          {slide.image ? (
            <div 
              className="rounded-xl overflow-hidden border border-white/10 relative flex flex-col justify-between bg-black/10 h-full min-h-[90px]"
            >
              <img src={slide.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={slide.imageDescription || "Sauce Illustration"} />
              {slide.imageDescription && (
                <div className="absolute bottom-1 left-1 right-1 bg-black/75 backdrop-blur-sm p-1 rounded text-[7px] text-white truncate text-center leading-none">
                  {slide.imageDescription}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1.5 flex flex-col justify-center">
              {content.slice(0, 2).map((item, i) => {
                const parsed = parseBullet(item);
                return (
                  <div key={i} className={`rounded-xl p-2.5 flex items-start gap-2 text-left border ${
                    isLight 
                      ? 'bg-white border-neutral-200 shadow-none' 
                      : isCobalt 
                        ? 'bg-white border-blue-100 shadow-none text-slate-800' 
                        : 'bg-white/[0.012] border-white/5'
                  }`}>
                    <span className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${isLight ? 'bg-purple-600' : 'bg-purple-500'}`}></span>
                    <div className="space-y-0.5">
                      {parsed.label ? (
                        <h4 className={`text-[8.5px] font-extrabold uppercase font-mono ${isLight ? 'text-purple-700' : isCobalt ? 'text-slate-900' : 'text-slate-300'}`}>{parsed.label}</h4>
                      ) : null}
                      <p className={`text-[9.5px] leading-snug font-sans ${isLight ? 'text-neutral-600' : isCobalt ? 'text-slate-600' : 'text-slate-400'}`}>
                        {parsed.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className={`text-[8px] italic text-left ${isLight ? 'text-neutral-400' : 'text-slate-500'}`}>
          * Наша интеллектуальная собственность (IP) защищена многолетними научными исследованиями и R&D заделом.
        </p>
      </div>
    );
  }

  // 7. COMPETITORS SLIDE (Index 6 or type === 'competition')
  if (index === 6 || type === "competition") {
    const isLight = selectedStyle === 'clean-light';
    const isCobalt = selectedStyle === 'cobalt';
    return (
      <div className="flex flex-col justify-around h-full py-1">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            {T(slide.sectionLabel || "🥊 Раздел 07 • Конкурентный анализ", "sectionLabel", `text-[7px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-rose-600' : 'text-[#f43f5e]'}`)}
            {T(title, "title", `text-xs sm:text-sm md:text-md lg:text-lg font-display font-black tracking-tight uppercase leading-tight ${isLight ? 'text-neutral-900' : isCobalt ? 'text-slate-900' : 'text-white'}`, "h2")}
          </div>
          {subtitle && T(
            subtitle,
            "subtitle",
            `hidden sm:inline-block border text-[8px] font-mono py-0.5 px-2 rounded-full uppercase tracking-wider font-semibold ${isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : isCobalt ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/20'}`
          )}
        </div>

        {/* Clean 2-block side-by-side positioning layout */}
        <div className={`grid grid-cols-1 ${slide.image ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-2.5 my-auto`}>
          <div className={`rounded-xl p-3 space-y-1.5 text-left border ${
            isLight 
              ? 'bg-rose-50/30 border-rose-100 shadow-sm' 
              : isCobalt 
                ? 'bg-rose-100/10 border-rose-250 shadow-sm text-slate-800' 
                : 'bg-white/[0.012] border-white/5'
          }`}>
            <span className={`text-[7.5px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-rose-700' : 'text-[#f43f5e]'}`}>Другие Игроки (Слабости)</span>
            <ul className="space-y-1">
              {content.slice(0, 2).map((item, i) => (
                <li key={i} className={`flex items-start text-[9.5px] font-sans leading-tight ${isLight ? 'text-neutral-600' : isCobalt ? 'text-slate-700' : 'text-slate-400'}`}>
                  <span className="text-[#f43f5e] mr-2 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`rounded-xl p-3 space-y-1.5 text-left relative overflow-hidden border ${
            isLight 
              ? 'bg-emerald-50/50 border-emerald-200' 
              : isCobalt 
                ? 'bg-emerald-5 border border-emerald-200 text-slate-800 shadow-sm shadow-emerald-100' 
                : 'bg-emerald-505/[0.012] border-emerald-500/20'
          }`}>
            <div className="absolute top-0 right-0 h-12 w-12 bg-emerald-500/5 rounded-full blur-xl"></div>
            <span className={`text-[7.5px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-emerald-700' : 'text-emerald-650'}`}>Наш Продукт (Преимущество)</span>
            <ul className="space-y-1">
              {content.slice(2, 4).map((item, i) => (
                <li key={i} className={`flex items-start text-[9.5px] font-sans leading-tight ${isLight ? 'text-neutral-700 font-medium' : isCobalt ? 'text-slate-800 font-medium' : 'text-emerald-300'}`}>
                  <span className="text-[#10b981] mr-1.5 mt-0.5">✔</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {slide.image && (
            <div 
              className="rounded-xl overflow-hidden border border-white/10 relative flex flex-col justify-between bg-black/20"
              style={{ minHeight: '80px', height: '100%' }}
            >
              <img src={slide.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={slide.imageDescription || "Competition Illustration"} />
              {slide.imageDescription && (
                <div className="absolute bottom-1 left-1 right-1 bg-black/75 backdrop-blur-sm p-1 rounded text-[7px] text-white truncate text-center leading-none">
                  {slide.imageDescription}
                </div>
              )}
            </div>
          )}
        </div>

        <p className={`text-[8px] italic text-left ${isLight ? 'text-neutral-400' : 'text-slate-500'}`}>
          * Фокус на узкой автоматизации позволяет сократить CAC и повысить удержание пользователей.
        </p>
      </div>
    );
  }

  // 8. GO-TO-MARKET / LAUNCH (Index 7 or type === 'launch' || type === 'gtm')
  if (index === 7 || type === "launch" || type === "gtm") {
    const isLight = selectedStyle === 'clean-light';
    const isCobalt = selectedStyle === 'cobalt';
    return (
      <div className="flex flex-col justify-around h-full py-1">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            {T(slide.sectionLabel || "🚀 Раздел 08 • Выход на Рынок (GTM)", "sectionLabel", `text-[7px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`)}
            {T(title, "title", `text-xs sm:text-sm md:text-md lg:text-lg font-display font-black tracking-tight uppercase leading-tight ${isLight ? 'text-neutral-900' : isCobalt ? 'text-slate-900' : 'text-white'}`, "h2")}
          </div>
          {subtitle && T(
            subtitle,
            "subtitle",
            `hidden sm:inline-block border text-[8px] font-mono py-0.5 px-2 rounded-full uppercase tracking-wider font-semibold ${isLight ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : isCobalt ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'}`
          )}
        </div>

        {/* Stepped layout pipeline flow */}
        <div className={`grid grid-cols-1 ${slide.image ? 'sm:grid-cols-3' : 'sm:grid-cols-4'} gap-2 my-auto`}>
          {content.slice(0, slide.image ? 2 : 4).map((item, i) => {
            const parsed = parseBullet(item);
            let cardBg = "";
            if (isLight) {
              cardBg = 'bg-gradient-to-b from-white to-slate-50 border-neutral-200 shadow-sm';
            } else if (isCobalt) {
              cardBg = 'bg-white border-blue-100 shadow-sm shadow-blue-500/5';
            } else {
              cardBg = 'bg-white/[0.02] hover:bg-white/[0.03] border-white/5';
            }

            return (
              <div key={i} className={`border rounded-xl p-2.5 text-left relative flex flex-col justify-between space-y-1.5 transition-all ${cardBg}`}>
                <div className="flex items-center justify-between">
                  <span className={`h-4.5 w-4.5 rounded-full text-[8.5px] font-mono font-bold flex items-center justify-center border ${
                    isLight 
                      ? 'bg-cyan-50 text-cyan-700 border-cyan-200' 
                      : isCobalt 
                        ? 'bg-blue-50 text-[#004de6] border-blue-150' 
                        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                  }`}>
                    {i+1}
                  </span>
                  <span className={`text-[7px] font-mono ${isLight ? 'text-neutral-400 font-bold' : 'text-slate-550'}`}>ЭТАП</span>
                </div>

                <div>
                  {parsed.label ? (
                    <h4 className={`text-[8.5px] font-display font-bold uppercase truncate mb-0.5 ${isLight ? 'text-cyan-800' : isCobalt ? 'text-slate-900' : 'text-white'}`}>{parsed.label}</h4>
                  ) : null}
                  <p className={`text-[9.5px] leading-snug font-sans line-clamp-3 ${isLight ? 'text-neutral-600' : isCobalt ? 'text-slate-600' : 'text-slate-400'}`}>
                    {parsed.detail}
                  </p>
                </div>
              </div>
            );
          })}
          {slide.image && (
            <div 
              className="rounded-xl overflow-hidden border border-white/10 relative flex flex-col justify-between bg-black/20"
              style={{ minHeight: '80px', height: '100%' }}
            >
              <img src={slide.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={slide.imageDescription || "GTM Illustration"} />
              {slide.imageDescription && (
                <div className="absolute bottom-1 left-1 right-1 bg-black/75 backdrop-blur-sm p-1 rounded text-[7px] text-white truncate text-center leading-none">
                  {slide.imageDescription}
                </div>
              )}
            </div>
          )}
        </div>

        <p className={`text-[8px] italic text-left ${isLight ? 'text-neutral-400' : 'text-slate-500'}`}>
          * Фокус на виральности и органическом привлечении обеспечивает околонулевой бюджет на старте.
        </p>
      </div>
    );
  }

  // 9. CRITICAL RISKS (Index 8 or type === 'risks')
  if (index === 8 || type === "risks") {
    const isLight = selectedStyle === 'clean-light';
    const isCobalt = selectedStyle === 'cobalt';
    return (
      <div className="flex flex-col justify-around h-full py-1">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            {T(slide.sectionLabel || "⚡ Раздел 09 • Анализ Рисков", "sectionLabel", `text-[7px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-amber-600' : 'text-amber-500'}`)}
            {T(title, "title", `text-xs sm:text-sm md:text-md lg:text-lg font-display font-black tracking-tight uppercase leading-tight ${isLight ? 'text-neutral-900' : isCobalt ? 'text-slate-900' : 'text-white'}`, "h2")}
          </div>
          {subtitle && T(
            subtitle,
            "subtitle",
            `hidden sm:inline-block border text-[8px] font-mono py-0.5 px-2 rounded-full uppercase tracking-wider font-semibold ${isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : isCobalt ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`
          )}
        </div>

        {/* Balanced risk mapping */}
        <div className={`grid grid-cols-1 ${slide.image ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-2.5 my-auto`}>
          {content.slice(0, 2).map((item, i) => {
            const parsed = parseBullet(item);
            let cardBg = "";
            if (isLight) {
              cardBg = 'bg-white border-neutral-200 shadow-sm';
            } else if (isCobalt) {
              cardBg = 'bg-white border-blue-100 shadow-sm shadow-blue-500/5';
            } else {
              cardBg = 'bg-white/[0.012] border-white/5';
            }

            return (
              <div key={i} className={`border rounded-xl p-3 text-left flex flex-col justify-between space-y-1.5 relative overflow-hidden transition-all ${cardBg}`}>
                <div className="flex items-center space-x-1.5 relative z-10">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  <span className={`text-[7px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-neutral-450' : 'text-slate-550'}`}>АНАЛИЗ РИСКА 0{i+1}</span>
                </div>
                
                <div className="relative z-10">
                  {parsed.label ? (
                    <h4 className={`text-[9.5px] font-display font-bold uppercase tracking-tight mb-0.5 ${isLight ? 'text-neutral-900' : isCobalt ? 'text-slate-900' : 'text-white'}`}>{parsed.label}</h4>
                  ) : null}
                  <p className={`text-[9.5px] leading-snug font-sans ${isLight ? 'text-neutral-600' : isCobalt ? 'text-slate-600' : 'text-slate-400'}`}>
                    {parsed.detail}
                  </p>
                </div>
              </div>
            );
          })}
          {slide.image && (
            <div 
              className="rounded-xl overflow-hidden border border-white/10 relative flex flex-col justify-between bg-black/20"
              style={{ minHeight: '80px', height: '100%' }}
            >
              <img src={slide.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={slide.imageDescription || "Risks Illustration"} />
              {slide.imageDescription && (
                <div className="absolute bottom-1 left-1 right-1 bg-black/75 backdrop-blur-sm p-1 rounded text-[7px] text-white truncate text-center leading-none">
                  {slide.imageDescription}
                </div>
              )}
            </div>
          )}
        </div>

        {content[2] ? (
          <div className={`border p-2 rounded-lg text-left text-[9px] font-medium ${isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : isCobalt ? 'bg-blue-50/50 border-blue-100 text-slate-900' : 'bg-amber-955/15 border-amber-500/15 text-amber-300'}`}>
            💡 {content[2]}
          </div>
        ) : (
          <p className={`text-[8px] italic text-left ${isLight ? 'text-neutral-400' : 'text-slate-500'}`}>
            * Систематическая проработка рисков обеспечивает юридическую и технологическую безопасность.
          </p>
        )}
      </div>
    );
  }

  // 10. THE ASK / FUNDING (Index 9 or type === 'ask' || type === 'cta')
  if (index === 9 || type === "ask" || type === "cta") {
    const isLight = selectedStyle === 'clean-light';
    const isCobalt = selectedStyle === 'cobalt';
    return (
      <div className="flex flex-col justify-around h-full py-1">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            {T(slide.sectionLabel || "🎯 Раздел 10 • Инвестиционное Предложение", "sectionLabel", `text-[7px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-emerald-700' : 'text-emerald-450'}`)}
            {T(title, "title", `text-xs sm:text-sm md:text-md lg:text-lg font-display font-black tracking-tight uppercase leading-tight ${isLight ? 'text-neutral-900' : isCobalt ? 'text-slate-900' : 'text-white'}`, "h2")}
          </div>
          {subtitle && T(
            subtitle,
            "subtitle",
            `hidden sm:inline-block border text-[8px] font-mono py-0.5 px-2 rounded-full uppercase tracking-wider font-semibold ${isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : isCobalt ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'}`
          )}
        </div>

        {/* Giant Focus block in Apple Style */}
        <div className={`grid grid-cols-1 ${slide.image ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-2.5 my-auto`}>
          <div className={`border rounded-xl p-3 flex flex-col justify-between text-left space-y-1.5 my-auto relative overflow-hidden ${
            isLight 
              ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 shadow-sm' 
              : isCobalt 
                ? 'bg-emerald-50 border-emerald-250 text-slate-800 shadow-sm' 
                : 'bg-gradient-to-br from-emerald-500/[0.05] to-teal-500/[0.1] border-emerald-500/20'
          }`}>
            <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-400/5 rounded-full blur-xl"></div>
            <div>
              <span className={`text-[7.5px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-emerald-800' : isCobalt ? 'text-slate-500' : 'text-white/50'}`}>Раунд Финансирования</span>
              <span className={`block text-base sm:text-lg font-display font-black tracking-tighter uppercase mt-0.5 ${isLight ? 'text-emerald-950' : isCobalt ? 'text-emerald-800' : 'text-white'}`}>Pre-Seed / Seed</span>
            </div>
            <p className={`text-[10px] sm:text-[10.5px] leading-snug font-sans font-medium ${isLight ? 'text-emerald-950' : isCobalt ? 'text-emerald-850' : 'text-white'}`}>
              {B(content[0] || "Консолидированный инвестиционный запрос", 0, "")}
            </p>
          </div>

          <div className={`border rounded-xl p-3 flex flex-col justify-between text-left space-y-1.5 my-auto relative overflow-hidden ${
            isLight 
              ? 'bg-gradient-to-br from-amber-50 to-amber-100/30 border-amber-200 shadow-sm' 
              : isCobalt 
                ? 'bg-slate-50 border-slate-200 text-slate-900' 
                : 'bg-white/[0.012] border-white/5'
          }`}>
            <div>
              <span className={`text-[7.5px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-neutral-500' : 'text-slate-550'}`}>Запрашиваемый Объем</span>
              <span className={`block text-base sm:text-lg font-display font-black tracking-tighter uppercase mt-0.5 ${isLight ? 'text-amber-650' : isCobalt ? 'text-slate-900' : 'text-white'}`}>
                {B(content[1] || "$100k — $550k", 1, "")}
              </span>
            </div>
            <p className={`text-[10px] sm:text-[10.5px] leading-snug font-sans font-medium ${isLight ? 'text-neutral-600' : isCobalt ? 'text-slate-700' : 'text-slate-455'}`}>
              {B(content[2] || "Капитал будет направлен на подтверждение продуктовых метрик, технологический стек и маркетинг.", 2, "")}
            </p>
          </div>

          {slide.image && (
            <PremiumImage src={slide.image} alt={slide.imageDescription} caption={slide.imageDescription} variant="hero" forExport={forExport} className="my-auto" />
          )}
        </div>

        <p className={`text-[8px] italic text-left ${isLight ? 'text-neutral-400' : 'text-slate-500'}`}>
          * Инвестиционная презентация готова к экспорту в высоком разрешении. Конфиденциально.
        </p>
      </div>
    );
  }
  
  return null;
};
