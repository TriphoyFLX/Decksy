import React from "react";
import { Flame, Sparkles, LockKeyhole } from "lucide-react";
import { Slide } from "../types";
import { EditableText } from "./EditableText";

export const getThemeStyles = (
  slideIndex: number, 
  type: string, 
  selectedStyle: 'cobalt' | 'clean-light' | 'cosmic-dark'
) => {
  const isTitle = slideIndex === 0 || type === 'title';
  switch (selectedStyle) {
    case 'clean-light':
      return {
        bg: 'linear-gradient(to bottom, #ffffff, #f8fafc)',
        border: '1px solid #e2e8f0',
        textColor: 'text-neutral-900',
        footerTextColor: '#64748b',
        footerBorder: '1px solid #e2e8f0',
        dotColor: '#10b981',
        innerCardBg: 'bg-white border border-neutral-200/80 shadow-sm text-neutral-800',
        accentColor: '#004de6',
        badgeBg: 'bg-neutral-100 text-neutral-800 border-neutral-200',
        titleColor: 'text-neutral-900',
        bulletTextColor: 'text-neutral-600',
        subtitleColor: 'text-neutral-500',
        accentPill: 'bg-neutral-100 text-neutral-850 border-neutral-200',
        accentText: 'text-neutral-900',
        textContrast: 'text-neutral-700'
      };
    case 'cobalt':
      if (isTitle) {
        return {
          bg: 'linear-gradient(to bottom right, #004de6, #002db3)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          textColor: 'text-white',
          footerTextColor: '#93c5fd',
          footerBorder: '1px solid rgba(255, 255, 255, 0.1)',
          dotColor: '#34d399',
          innerCardBg: 'bg-white/10 border border-white/20 text-white',
          accentColor: '#60a5fa',
          badgeBg: 'bg-white/15 text-white border-white/20',
          titleColor: 'text-white',
          bulletTextColor: 'text-blue-100',
          subtitleColor: 'text-blue-200',
          accentPill: 'bg-white/10 text-white border-white/25',
          accentText: 'text-sky-300',
          textContrast: 'text-blue-100'
        };
      } else {
        return {
          bg: 'linear-gradient(to bottom, #ffffff, #f5f9ff)',
          border: '1px solid rgba(0, 77, 230, 0.15)',
          textColor: 'text-slate-900',
          footerTextColor: '#475569',
          footerBorder: '1px solid rgba(0, 77, 230, 0.08)',
          dotColor: '#004de6',
          innerCardBg: 'bg-white border border-blue-100/90 hover:border-blue-200 shadow-md shadow-blue-500/5 text-slate-800',
          accentColor: '#004de6',
          badgeBg: 'bg-blue-50 text-blue-800 border-blue-100',
          titleColor: 'text-slate-950',
          bulletTextColor: 'text-slate-600',
          subtitleColor: 'text-blue-600 font-bold',
          accentPill: 'bg-blue-600 text-white border-blue-700',
          accentText: 'text-blue-600',
          textContrast: 'text-slate-700'
        };
      }
    case 'cosmic-dark':
    default:
      return {
        bg: 'linear-gradient(to bottom, #111115, #070709)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        textColor: 'text-slate-100',
        footerTextColor: '#475569',
        footerBorder: '1px solid rgba(255, 255, 255, 0.06)',
        dotColor: '#10b981',
        innerCardBg: 'bg-white/[0.02] border border-white/5 text-slate-300',
        accentColor: '#10b981',
        badgeBg: 'bg-white/5 border-white/10 text-slate-300',
        titleColor: 'text-white',
        bulletTextColor: 'text-slate-300',
        subtitleColor: 'text-slate-400',
        accentPill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        accentText: 'text-cyan-400',
        textContrast: 'text-slate-300'
      };
  }
};

interface RenderSlideContentProps {
  slide: Slide;
  index: number;
  selectedStyle: 'cobalt' | 'clean-light' | 'cosmic-dark';
  forExport?: boolean;
  onUpdate?: (patch: Partial<Slide>) => void;
}

export const SlideRenderer: React.FC<RenderSlideContentProps> = ({
  slide,
  index,
  selectedStyle,
  forExport = false,
  onUpdate
}) => {
  if (!slide) return null;

  const title = slide.title;
  const subtitle = slide.subtitle;
  const content = slide.content || [];
  const type = (slide.type || "") as string;
  const editable = !!onUpdate && !forExport;
  const theme = getThemeStyles(index, type, selectedStyle);

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

  // 1. TITLE SLIDE (Index 0 or type === 'title')
  if (index === 0 || type === "title") {
    const isLight = selectedStyle === 'clean-light';
    const isCobalt = selectedStyle === 'cobalt';
    
    const firstLetter = (title || "A").trim().charAt(0).toUpperCase();
    let logoMarkBg = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
    let logoMarkColor = "text-white";
    let logoMarkShadow = "shadow-[0_12px_30px_rgba(16,185,129,0.25)]";
    if (isLight) {
      logoMarkBg = "linear-gradient(135deg, #111115 0%, #1a1a20 100%)";
      logoMarkColor = "text-white";
      logoMarkShadow = "shadow-[0_12px_24px_rgba(0,0,0,0.15)]";
    } else if (isCobalt) {
      logoMarkBg = "linear-gradient(135deg, #0071e3 0%, #004bc2 100%)";
      logoMarkColor = "text-white";
      logoMarkShadow = "shadow-[0_12px_30px_rgba(0,113,227,0.3)]";
    }

    return (
      <div className="flex flex-col justify-between h-full py-1 text-center font-sans">
        {/* SQUIRCLE BRAND MARK FROM APEX TEMPLATE */}
        <div className="flex flex-col items-center justify-center pt-2">
          <div 
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg sm:text-xl font-extrabold tracking-tighter ${logoMarkColor} ${logoMarkShadow} border border-white/5`}
            style={{ background: logoMarkBg }}
          >
            {firstLetter}
          </div>
        </div>

        <div
          className="mx-auto inline-flex items-center space-x-1.5 border px-2.5 py-0.5 rounded-full uppercase tracking-widest font-mono text-[9px]"
          style={{
            background: isLight ? "rgba(0,0,0,0.03)" : isCobalt ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
            borderColor: isLight ? "rgba(0,0,0,0.08)" : isCobalt ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.1)5",
            color: isLight ? "#004de6" : isCobalt ? "#9bf0e1" : "#9bf0e1",
          }}
        >
          <span className={`h-1 w-1 rounded-full ${isLight ? 'bg-blue-600' : 'bg-[#10b981]'}`} style={forExport ? { animation: "none" } : undefined}></span>
          {T(slide.badge || "✦ SERIES B INVESTOR DECK", "badge", "", "span")}
        </div>

        <div className="space-y-2.5 my-auto">
          {T(
            title,
            "title",
            (isLight ? "text-neutral-900 font-extrabold" : isCobalt ? "text-white font-black" : "text-white font-black") + 
            " tracking-tighter uppercase leading-none font-display " + 
            (forExport ? "text-5xl" : "text-lg sm:text-2xl md:text-3xl lg:text-4xl"),
            "h1"
          )}
          {subtitle && T(
            subtitle,
            "subtitle",
            (isLight ? "text-neutral-500" : isCobalt ? "text-blue-105" : "text-slate-400") + 
            " font-medium font-sans max-w-xl mx-auto tracking-normal " + 
            (forExport ? "text-base" : "text-xs sm:text-sm"),
            "p"
          )}
        </div>

        {/* DENSE HORIZONTAL BENTO CARD SPLIT FOR CATEGORIES */}
        <div className="grid grid-cols-3 gap-2 border-t pt-2" style={{ borderColor: isLight ? "rgba(0,0,0,0.08)" : isCobalt ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)" }}>
          {slide.image ? (
            <>
              {content.slice(0, 2).map((item, i) => (
                <div
                  key={i}
                  className="rounded-lg p-1.5 text-center border text-left flex flex-col justify-between"
                  style={{
                    background: isLight ? "rgba(0,0,0,0.01)" : isCobalt ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                    borderColor: isLight ? "rgba(0,0,0,0.05)" : isCobalt ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
                  }}
                >
                  <span className={`block uppercase tracking-wider font-mono ${isLight ? 'text-neutral-450' : 'text-slate-550'}`} style={{ fontSize: "7px" }}>
                    Презентация {i + 1}
                  </span>
                  {B(
                    item,
                    i,
                    `block font-sans font-medium text-[9px] sm:text-[10px] leading-tight mt-0.5 ${isLight ? 'text-neutral-800' : isCobalt ? 'text-white' : 'text-slate-300'}`,
                    "span"
                  )}
                </div>
              ))}
              <div 
                className="rounded-lg overflow-hidden border relative flex flex-col justify-between bg-black/20 h-[50px] md:h-auto min-h-[40px]"
                style={{
                  borderColor: isLight ? "rgba(0,0,0,0.08)" : isCobalt ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)"
                }}
              >
                <img src={slide.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={slide.imageDescription || "Image"} />
                {slide.imageDescription && (
                  <div className="absolute bottom-1 left-1 right-1 bg-black/75 backdrop-blur-sm p-1 rounded text-[7px] text-white truncate text-center leading-none">
                    {slide.imageDescription}
                  </div>
                )}
              </div>
            </>
          ) : (
            content.slice(0, 3).map((item, i) => (
              <div
                key={i}
                className="rounded-lg p-1.5 text-center border text-left flex flex-col justify-between"
                style={{
                  background: isLight ? "rgba(0,0,0,0.01)" : isCobalt ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                  borderColor: isLight ? "rgba(0,0,0,0.05)" : isCobalt ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
                }}
              >
                <span className={`block uppercase tracking-wider font-mono ${isLight ? 'text-neutral-450' : 'text-slate-550'}`} style={{ fontSize: "7px" }}>
                  Раздел 0{i + 1}
                </span>
                {B(
                  item,
                  i,
                  `block font-sans font-medium text-[9px] sm:text-[10px] leading-tight mt-0.5 ${isLight ? 'text-neutral-800' : isCobalt ? 'text-white' : 'text-slate-300'}`,
                  "span"
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // 2. PROBLEM SLIDE (Index 1 or type === 'problem')
  if (index === 1 || type === "problem") {
    const isLight = selectedStyle === 'clean-light';
    const isCobalt = selectedStyle === 'cobalt';
    return (
      <div className="flex flex-col justify-between h-full py-1">
        <div className="flex items-center justify-between border-b pb-1.5 text-left" style={{ borderColor: isLight ? "rgba(0,0,0,0.06)" : isCobalt ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)" }}>
          <div className="space-y-0.5">
            {T(slide.sectionLabel || "🎯 РАЗДЕЛ 02 • АНАЛИЗ ПРОБЛЕМЫ", "sectionLabel", `text-[7px] font-mono uppercase tracking-widest font-bold ${isLight ? 'text-rose-600' : 'text-rose-400'}`)}
            {T(title, "title", `text-xs sm:text-sm md:text-md lg:text-md font-extrabold tracking-tight uppercase leading-none font-display ${theme.titleColor}`, "h2")}
          </div>
          {subtitle && T(
            subtitle,
            "subtitle",
            `hidden sm:inline-block border text-[7px] font-mono py-0.5 px-2 rounded-full uppercase tracking-wider font-semibold ${isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`
          )}
        </div>

        {/* iOS block layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-auto">
          <div className={`rounded-xl p-3 flex flex-col justify-between text-left space-y-2 border ${isLight ? 'bg-rose-50/40 border-rose-200/50 text-neutral-850 shadow-sm' : isCobalt ? 'bg-rose-50/50 border-rose-200/50 text-slate-850' : 'bg-[#ff453a]/5 border border-[#ff453a]/15 text-red-105'}`}>
            <div className="flex items-center space-x-1.5">
              <div className={`h-5 w-5 rounded-lg flex items-center justify-center border ${isLight ? 'bg-rose-50 text-rose-600 border-rose-200/60' : 'bg-[#ff453a]/10 text-[#ff453a] border border-[#ff453a]/25'}`}>
                <Flame className="h-3 w-3" />
              </div>
              <span className={`text-[8px] font-mono uppercase tracking-wider font-extrabold ${isLight ? 'text-rose-850' : 'text-white'}`}>Главный Фактор Боли</span>
            </div>
            <p className={`text-[10px] sm:text-[11px] leading-snug font-sans ${isLight ? 'text-neutral-700 font-medium' : isCobalt ? 'text-slate-800 font-medium' : 'text-rose-200/90'}`}>
              {content[0] || "Острая неудовлетворенность текущим пользовательским опытом."}
            </p>
          </div>

          {slide.image ? (
            <div className="rounded-xl overflow-hidden border border-white/10 relative flex flex-col justify-between bg-black/20 h-[100px] md:h-auto min-h-[50px]">
              <img src={slide.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={slide.imageDescription || "Problem Illustration"} />
              {slide.imageDescription && (
                <div className="absolute bottom-1 left-1 right-1 bg-black/75 backdrop-blur-sm p-1 rounded text-[7px] text-white truncate text-center leading-none">
                  {slide.imageDescription}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1.5 flex flex-col justify-center">
              {content.slice(1, 4).map((item, i) => {
                const parsed = parseBullet(item);
                return (
                  <div key={i} className={`rounded-lg p-2 flex items-start gap-2 text-left border ${isLight ? 'bg-neutral-50/50 border-neutral-200/50 text-neutral-850' : isCobalt ? 'bg-white border-blue-105 text-slate-850 shadow-sm' : 'bg-white/[0.015] border border-white/5 text-slate-350'}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1 flex-shrink-0"></span>
                    <p className="text-[9.5px] leading-snug font-sans">
                      {parsed.label ? <strong className={`font-bold ${isLight ? 'text-neutral-900' : isCobalt ? 'text-slate-900' : 'text-white'}`}>{parsed.label}: </strong> : null}
                      <span className={`${isLight ? 'text-neutral-600' : isCobalt ? 'text-slate-650' : 'text-slate-350'}`}>{parsed.detail}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className={`text-[8px] italic text-left ${isLight ? 'text-neutral-400' : 'text-slate-500'} border-t pt-1`} style={{ borderColor: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.03)" }}>
          * Подтверждено проверенными когортными исследованиями и аналитикой активности пользователей.
        </p>
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

        {/* Minimal tidy row blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 my-auto">
          {content.slice(0, slide.image ? 2 : 3).map((item, i) => {
            const parsed = parseBullet(item);
            return (
              <div key={i} className={`rounded-xl p-3 text-left transition-all flex flex-col justify-between space-y-2 border ${
                isLight 
                  ? 'bg-white border-neutral-200 shadow-sm hover:border-neutral-300' 
                  : isCobalt 
                    ? 'bg-white border-blue-105 shadow-sm shadow-blue-500/5 hover:border-blue-200' 
                    : 'bg-gradient-to-b from-white/[0.025] to-white/[0.012] hover:from-white/[0.04] border border-white/5 hover:border-white/10'
              }`}>
                <div className="flex items-center justify-between">
                  <div className={`h-5 w-5 rounded-lg flex items-center justify-center border ${isLight ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60' : 'bg-[#10b981]/10 text-emerald-450 border border-emerald-500/20'}`}>
                    <Sparkles className="h-3 w-3" />
                  </div>
                  <span className={`text-[7px] font-mono uppercase tracking-widest font-bold ${isLight ? 'text-neutral-450' : 'text-slate-500'}`}>Компонент 0{i+1}</span>
                </div>
                <div>
                  {parsed.label ? (
                    <h4 className={`text-[9.5px] font-display font-black uppercase tracking-tight mb-0.5 ${isLight ? 'text-neutral-950' : isCobalt ? 'text-slate-900' : 'text-white'}`}>{parsed.label}</h4>
                  ) : null}
                  <p className={`text-[9.5px] leading-snug font-sans ${isLight ? 'text-neutral-600' : isCobalt ? 'text-slate-655' : 'text-slate-350'}`}>
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
              <img src={slide.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={slide.imageDescription || "Solution Illustration"} />
              {slide.imageDescription && (
                <div className="absolute bottom-1 left-1 right-1 bg-black/75 backdrop-blur-sm p-1 rounded text-[7px] text-white truncate text-center leading-none">
                  {slide.imageDescription}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={`flex items-center space-x-2 border p-1.5 rounded-lg text-left ${isLight ? 'bg-emerald-50/20 border-emerald-200/50' : 'bg-[#10b981]/5 border border-[#10b981]/15'}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse"></span>
          <span className={`text-[8.5px] tracking-wide font-sans truncate ${isLight ? 'text-neutral-700 font-medium' : 'text-emerald-300'}`}>Инновационный технологический подход заменяет недели сложной мануальной настройки.</span>
        </div>
      </div>
    );
  }

  // 4. MARKET SIZE (Index 3 or type === 'market')
  if (index === 3 || type === "market") {
    const isLight = selectedStyle === 'clean-light';
    const isCobalt = selectedStyle === 'cobalt';
    return (
      <div className="flex flex-col justify-between h-full py-1">
        <div className="flex items-center justify-between border-b pb-1.5 text-left" style={{ borderColor: isLight ? "rgba(0,0,0,0.06)" : isCobalt ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)" }}>
          <div className="space-y-0.5">
            {T(slide.sectionLabel || "👥 РАЗДЕЛ 04 • ЦЕЛЕВОЙ РЫНОК", "sectionLabel", `text-[7px] font-mono uppercase tracking-widest font-extrabold ${isLight ? 'text-blue-600' : 'text-[#3b82f6]'}`)}
            {T(title, "title", `text-xs sm:text-sm md:text-md lg:text-md font-extrabold tracking-tight uppercase leading-none font-display ${theme.titleColor}`, "h2")}
          </div>
          {subtitle && T(
            subtitle,
            "subtitle",
            `hidden sm:inline-block border text-[7px] font-mono py-0.5 px-2 rounded-full uppercase tracking-wider font-semibold ${isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : isCobalt ? 'bg-blue-500/10 text-[#004de6] border-blue-200' : 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20'}`
          )}
        </div>

        {/* Elegant bento stats block */}
        <div className="grid grid-cols-3 gap-3 my-auto">
          {content.slice(0, slide.image ? 2 : 3).map((item, i) => {
            const parsed = parseBullet(item);
            const extractedNum = extractNumber(item);
            const labelText = parsed.label || `Сегмент 0${i + 1}`;
            const descText = parsed.detail || item;

            // Color configuration based on theme and index
            let cardBg = isLight 
              ? 'bg-white border-neutral-200 shadow-sm hover:border-neutral-300' 
              : isCobalt 
                ? 'bg-white border-blue-105 shadow-sm shadow-blue-500/5 hover:border-blue-200' 
                : 'bg-gradient-to-b from-white/[0.025] to-white/[0.012] border-white/5 hover:border-white/10';
            let accentColor = [
              { pill: isLight ? "bg-blue-50 text-blue-750 border-blue-150" : "bg-blue-500/10 text-blue-400 border-blue-500/20", num: isLight ? "text-blue-700" : isCobalt ? "text-[#004de6]" : "text-blue-400" },
              { pill: isLight ? "bg-indigo-50 text-indigo-750 border-indigo-150" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", num: isLight ? "text-indigo-700" : isCobalt ? "text-indigo-600" : "text-indigo-400" },
              { pill: isLight ? "bg-sky-50 text-sky-750 border-sky-150" : "bg-sky-500/10 text-sky-450 border-sky-500/20", num: isLight ? "text-sky-700" : isCobalt ? "text-sky-600" : "text-sky-400" }
            ][i] || { pill: "bg-white/5 text-white/80 border-white/10", num: "text-white" };

            return (
              <div key={i} className={`rounded-xl p-3 text-left flex flex-col justify-between space-y-2 relative overflow-hidden transition-all border ${cardBg}`}>
                <div className="flex items-center justify-between relative z-10">
                  <span className={`text-[7.5px] font-mono py-0.5 px-1.5 rounded uppercase tracking-widest font-extrabold border ${accentColor.pill}`}>
                    {labelText}
                  </span>
                  <span className={`text-[7.5px] font-mono ${isLight ? 'text-neutral-450' : 'text-slate-500'}`}>0{i+1}</span>
                </div>
                
                <div className="space-y-1 relative z-10">
                  {extractedNum ? (
                    <div className={`text-md sm:text-lg md:text-xl font-display font-black tracking-tighter ${accentColor.num}`}>
                      {extractedNum}
                    </div>
                  ) : null}
                  <p className={`text-[9.5px] leading-snug font-sans line-clamp-3 ${isLight ? 'text-neutral-600' : isCobalt ? 'text-slate-655' : 'text-slate-350'}`}>
                    {extractedNum ? descText.replace(extractedNum, "").replace(/^[:-]\s*/, "").trim() : descText}
                  </p>
                </div>

                {/* Decorative structural background badge */}
                <div className="absolute -bottom-4 -right-4 h-8 w-8 rounded-full opacity-[0.03] bg-current pointer-events-none" style={{ color: isLight ? '#004de6' : '#10b981' }}></div>
              </div>
            );
          })}
          {slide.image && (
            <div 
              className="rounded-xl overflow-hidden border border-white/10 relative flex flex-col justify-between bg-black/20"
              style={{ minHeight: '80px', height: '100%' }}
            >
              <img src={slide.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={slide.imageDescription || "Market Illustration"} />
              {slide.imageDescription && (
                <div className="absolute bottom-1 left-1 right-1 bg-black/75 backdrop-blur-sm p-1 rounded text-[7px] text-white truncate text-center leading-none">
                  {slide.imageDescription}
                </div>
              )}
            </div>
          )}
        </div>

        {content[3] ? (
          <div className={`text-[9.5px] border-t pt-1.5 flex items-center justify-between ${isLight ? 'border-neutral-200 text-neutral-600' : isCobalt ? 'border-blue-105 text-slate-600' : 'border-white/5 text-slate-400'}`}>
            <span className={`font-mono text-[7.5px] uppercase tracking-wider font-extrabold ${isLight ? 'text-blue-600' : 'text-indigo-400'}`}>🔥 ТРЕНДЫ РЫНКА:</span>
            <span className="italic block truncate max-w-lg text-right font-medium">{content[3]}</span>
          </div>
        ) : (
          <p className={`text-[8px] italic text-left ${isLight ? 'text-neutral-400' : 'text-slate-500'} border-t pt-1.5`} style={{ borderColor: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.03)" }}>
            * TAM и SAM рассчитываются на основе отраслевой аналитики по нашему цифровому сектору.
          </p>
        )}
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
                ? 'bg-blue-50/55 border-blue-400 shadow-md ring-2 ring-blue-500/10 text-slate-850'
                : 'bg-white border-blue-100 shadow-sm text-slate-850';
            } else {
              cardClass = isHighlight 
                ? 'bg-amber-500/[0.04] border-amber-500/40 shadow-inner' 
                : 'bg-white/[0.02] border-white/5 text-slate-350';
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
          <div className={`border p-1.5 rounded-lg flex justify-between items-center text-[8px] ${isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-800' : isCobalt ? 'bg-blue-50/40 border-blue-100 text-slate-800' : 'bg-white/[0.02] border-white/5 text-slate-350'}`}>
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
                        ? 'bg-white border-blue-105 shadow-none text-slate-800' 
                        : 'bg-white/[0.012] border-white/5'
                  }`}>
                    <span className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${isLight ? 'bg-purple-600' : 'bg-purple-500'}`}></span>
                    <div className="space-y-0.5">
                      {parsed.label ? (
                        <h4 className={`text-[8.5px] font-extrabold uppercase font-mono ${isLight ? 'text-purple-700' : isCobalt ? 'text-slate-900' : 'text-slate-300'}`}>{parsed.label}</h4>
                      ) : null}
                      <p className={`text-[9.5px] leading-snug font-sans ${isLight ? 'text-neutral-600' : isCobalt ? 'text-slate-655' : 'text-slate-400'}`}>
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
              cardBg = 'bg-white border-blue-105 shadow-sm shadow-blue-500/5';
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
                  <p className={`text-[9.5px] leading-snug font-sans line-clamp-3 ${isLight ? 'text-neutral-600' : isCobalt ? 'text-slate-650' : 'text-slate-400'}`}>
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
              cardBg = 'bg-white border-blue-105 shadow-sm shadow-blue-500/5';
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
                  <p className={`text-[9.5px] leading-snug font-sans ${isLight ? 'text-neutral-600' : isCobalt ? 'text-slate-655' : 'text-slate-400'}`}>
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
          <div className={`border p-2 rounded-lg text-left text-[9px] font-medium ${isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : isCobalt ? 'bg-blue-50/50 border-blue-100 text-slate-850' : 'bg-amber-955/15 border-amber-500/15 text-amber-300'}`}>
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
                ? 'bg-slate-50 border-slate-200 text-slate-850' 
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
            <div 
              className="rounded-xl overflow-hidden border border-white/10 relative flex flex-col justify-between bg-black/20"
              style={{ minHeight: '80px', height: '100%' }}
            >
              <img src={slide.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={slide.imageDescription || "Ask Illustration"} />
              {slide.imageDescription && (
                <div className="absolute bottom-1 left-1 right-1 bg-black/75 backdrop-blur-sm p-1 rounded text-[7px] text-white truncate text-center leading-none">
                  {slide.imageDescription}
                </div>
              )}
            </div>
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
