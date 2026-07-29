import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Maximize2, Minimize2, FlaskConical } from "lucide-react";
import { SlideRenderer } from "../components/SlideRenderer";
import {
  TEMPLATE_CATALOG,
  getTemplateFrameAppearance,
  type DeckTemplateId,
  type TemplateFrameAppearance,
} from "../lib/deckTheme";
import {
  DESIGN_LAB_TEMPLATES,
  buildDesignLabDeck,
  getDesignLabMeta,
} from "../lib/designLabFixture";

function SlideFrameDecorations({ frame }: { frame: TemplateFrameAppearance }) {
  return (
    <>
      {frame.ambientLayers?.map((layer, index) => (
        <div
          key={`ambient-${index}`}
          className={`absolute inset-0 pointer-events-none ${layer.className || "z-[1]"}`}
          style={layer.style}
        />
      ))}
      {frame.gridBg && frame.gridBg !== "none" && (
        <div
          className="absolute inset-0 pointer-events-none z-[2]"
          style={{
            backgroundImage: frame.gridBg,
            backgroundSize: frame.gridBgSize,
          }}
        />
      )}
      {frame.showGlowBlobs && (
        <>
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/12 blur-[90px] pointer-events-none z-[2]" />
          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-sky-500/10 blur-[90px] pointer-events-none z-[2]" />
          <div className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/7 blur-[100px] pointer-events-none z-[2]" />
        </>
      )}
    </>
  );
}

interface DesignLabPageProps {
  onBack: () => void;
}

export const DesignLabPage: React.FC<DesignLabPageProps> = ({ onBack }) => {
  const [templateId, setTemplateId] = useState<DeckTemplateId>("apex");
  const [slideIndex, setSlideIndex] = useState(0);
  const [focusMode, setFocusMode] = useState(false);

  const deck = useMemo(() => buildDesignLabDeck(templateId), [templateId]);
  const meta = getDesignLabMeta(templateId);
  const style = meta.selectedStyle;
  const slide = deck.slides[slideIndex];
  const isTitle = slideIndex === 0 || slide?.type === "title";
  const frame = getTemplateFrameAppearance(templateId, style, isTitle);
  const frameClass = `aspect-video w-full rounded-2xl p-5 sm:p-7 md:p-8 relative overflow-hidden flex flex-col justify-between shadow-2xl border ${frame.frameBorderClass}`;

  useEffect(() => {
    setSlideIndex(0);
  }, [templateId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSlideIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setSlideIndex((i) => Math.min(deck.slides.length - 1, i + 1));
      } else if (e.key === "Escape" && focusMode) {
        setFocusMode(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deck.slides.length, focusMode]);

  const slideType = slide?.type || "";
  const variant = slide?.visualData?.variant || "—";

  return (
    <div className={focusMode ? "fixed inset-0 z-[180] bg-[#050506] flex flex-col" : "space-y-5"}>
      {!focusMode && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-amber-400/90 mb-1">
              <FlaskConical className="h-3.5 w-3.5" />
              Design Lab · тест дизайнов
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Одна презентация на каждый шаблон
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Одинаковый контент (NordFlow). Переключай шаблон слева, слайды снизу. Пиши, что править — правим по одному дизайну.
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider border border-white/10 text-slate-400 hover:text-white cursor-pointer bg-white/5"
          >
            Назад
          </button>
        </div>
      )}

      <div className={focusMode ? "flex-1 min-h-0 flex flex-col" : "grid lg:grid-cols-12 gap-5 items-start"}>
        {!focusMode && (
          <aside className="lg:col-span-3 space-y-2">
            <p className="text-[9px] font-mono uppercase tracking-widest text-slate-500 px-1">
              Шаблоны · {DESIGN_LAB_TEMPLATES.length}
            </p>
            {DESIGN_LAB_TEMPLATES.map((id) => {
              const t = TEMPLATE_CATALOG[id];
              const active = id === templateId;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTemplateId(id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
                    active
                      ? "bg-white/10 border-white/25 text-white"
                      : "bg-[#0D0D0F] border-white/8 text-slate-400 hover:text-white hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ background: t.accent }}
                    />
                    <span className="text-xs font-bold uppercase tracking-wide">{t.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-snug">{t.description}</p>
                  <p className="text-[9px] font-mono text-slate-600 mt-1">engine: {t.layoutEngine}</p>
                </button>
              );
            })}
          </aside>
        )}

        <div className={focusMode ? "flex-1 min-h-0 flex flex-col px-4 sm:px-8 py-4" : "lg:col-span-9 space-y-3"}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-white truncate">
                {meta.name}
                <span className="text-slate-500 font-normal"> · {deck.title}</span>
              </p>
              <p className="text-[10px] font-mono text-slate-500 truncate">
                слайд {slideIndex + 1}/{deck.slides.length} · type={slideType} · variant={variant}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFocusMode((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider border border-emerald-400/30 text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer"
            >
              {focusMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              {focusMode ? "Свернуть" : "Крупнее"}
            </button>
          </div>

          <div className={focusMode ? "flex-1 min-h-0 flex items-center justify-center" : ""}>
            <div className={focusMode ? "w-full max-w-[min(100%,calc((100vh-9rem)*16/9))]" : "w-full"}>
              <div className={frameClass} style={frame.frameStyle}>
                {frame.overlayStyle && (
                  <div className="absolute inset-0 pointer-events-none z-[1]" style={frame.overlayStyle} />
                )}
                <SlideFrameDecorations frame={frame} />

                <div className={frame.headerClass}>
                  <span className={`${frame.titleHeaderClass} truncate max-w-[55%]`}>{deck.title}</span>
                  <span>
                    СЛАЙД {slideIndex + 1} ИЗ {deck.slides.length}
                  </span>
                </div>

                <div className="relative z-10 flex-1 min-h-0 py-2 flex flex-col justify-stretch">
                  {slide && (
                    <SlideRenderer
                      slide={slide}
                      index={slideIndex}
                      selectedStyle={style}
                      forExport={false}
                    />
                  )}
                </div>

                <div className={frame.footerClass}>
                  <span className="truncate max-w-[50%]">© {deck.title} · Seed Round</span>
                  <span className="flex items-center gap-1 truncate max-w-[45%]">
                    <span className="h-1 w-1 rounded-full bg-emerald-500" />
                    Design Lab · {meta.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 bg-[#0D0D0F] border border-white/10 rounded-xl p-2.5">
            <button
              type="button"
              disabled={slideIndex === 0}
              onClick={() => setSlideIndex((i) => i - 1)}
              className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 text-slate-300 flex items-center justify-center cursor-pointer disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex flex-wrap justify-center gap-1 overflow-x-auto max-w-[calc(100%-6rem)]">
              {deck.slides.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSlideIndex(i)}
                  title={`${s.type}: ${s.title}`}
                  className={`h-7 min-w-7 px-1.5 rounded-md text-[9px] font-mono font-bold cursor-pointer ${
                    i === slideIndex
                      ? "bg-white text-black"
                      : "bg-white/5 text-slate-500 border border-white/10 hover:text-white"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={slideIndex >= deck.slides.length - 1}
              onClick={() => setSlideIndex((i) => i + 1)}
              className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 text-slate-300 flex items-center justify-center cursor-pointer disabled:opacity-30"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {!focusMode && (
            <p className="text-[10px] text-slate-600 font-mono">
              ← → листать · напиши в чат: шаблон + номер слайда + что не так
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
