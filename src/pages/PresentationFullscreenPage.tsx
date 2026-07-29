import React, { useCallback, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Maximize2, Minimize2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { PitchDeck, Slide } from "../types";
import { getDeckDisplayName } from "../lib/projectBranding";
import { formatDeckFrameLabel } from "../lib/slideMetrics";
import { DeckWatermark } from "../components/DeckWatermark";
import {
  getTemplateFrameAppearance,
  type DeckTemplateId,
  type TemplateFrameAppearance,
} from "../lib/deckTheme";

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
      {frame.gridBg && (
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

interface PresentationFullscreenPageProps {
  deck: PitchDeck;
  deckFrameLabel?: string;
  activeSlideIndex: number;
  setActiveSlideIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedTemplate: DeckTemplateId;
  selectedStyle: "cobalt" | "clean-light" | "cosmic-dark";
  isWatermarkRemoved: boolean;
  onExit: () => void;
  renderSlide: (slide: Slide, index: number) => React.ReactNode;
}

export const PresentationFullscreenPage: React.FC<PresentationFullscreenPageProps> = ({
  deck,
  deckFrameLabel,
  activeSlideIndex,
  setActiveSlideIndex,
  selectedTemplate,
  selectedStyle,
  isWatermarkRemoved,
  onExit,
  renderSlide,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = React.useState(false);

  const goPrev = useCallback(() => {
    setActiveSlideIndex((prev) => Math.max(0, prev - 1));
  }, [setActiveSlideIndex]);

  const goNext = useCallback(() => {
    setActiveSlideIndex((prev) => Math.min(deck.slides.length - 1, prev + 1));
  }, [deck.slides.length, setActiveSlideIndex]);

  const toggleBrowserFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.fullscreenElement) {
        onExit();
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "Home") {
        e.preventDefault();
        setActiveSlideIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setActiveSlideIndex(deck.slides.length - 1);
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        void toggleBrowserFullscreen();
      }
    };

    const onFullscreenChange = () => {
      setIsBrowserFullscreen(Boolean(document.fullscreenElement));
    };

    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.body.style.overflow = "";
      if (document.fullscreenElement) {
        void document.exitFullscreen();
      }
    };
  }, [deck.slides.length, goNext, goPrev, onExit, setActiveSlideIndex, toggleBrowserFullscreen]);

  const activeSlide = deck.slides[activeSlideIndex];
  const frameLabel = deckFrameLabel || formatDeckFrameLabel(getDeckDisplayName(deck));
  const activeSlideType = activeSlide?.type || "";
  const isTitleSlide = activeSlideIndex === 0 || activeSlideType === "title";
  const frame = getTemplateFrameAppearance(selectedTemplate, selectedStyle, isTitleSlide);
  const frameClass = `aspect-video w-full max-h-[calc(100vh-8rem)] rounded-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden flex flex-col justify-between shadow-2xl transition-all border ${frame.frameBorderClass}`;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] bg-[#050506] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Режим презентации"
    >
      <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-[#0D0D0F]/95 backdrop-blur-xl">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-[10px] font-mono uppercase tracking-wider cursor-pointer transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Закрыть</span>
          </button>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate uppercase tracking-tight">{frameLabel}</p>
            <p className="text-[10px] text-slate-500 font-mono truncate">{deck.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest hidden sm:inline">
            ← → навигация · Esc выход · F полный экран
          </span>
          <span className="text-[11px] font-mono font-bold text-white bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
            {activeSlideIndex + 1} / {deck.slides.length}
          </span>
          <button
            type="button"
            onClick={() => void toggleBrowserFullscreen()}
            className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            title={isBrowserFullscreen ? "Выйти из полноэкранного режима браузера" : "Полный экран браузера (F)"}
          >
            {isBrowserFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center px-4 sm:px-8 py-4 relative">
        <button
          type="button"
          aria-label="Предыдущий слайд"
          disabled={activeSlideIndex === 0}
          onClick={goPrev}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/50 border border-white/15 text-white/80 hover:text-white hover:bg-black/70 flex items-center justify-center cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="w-full max-w-[min(100%,calc((100vh-10rem)*16/9))] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlideIndex}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className={frameClass}
              style={frame.frameStyle}
            >
              {frame.overlayStyle && (
                <div className="absolute inset-0 pointer-events-none z-[1]" style={frame.overlayStyle} />
              )}
              <SlideFrameDecorations frame={frame} />

              <div className={frame.headerClass}>
                <span className={`${frame.titleHeaderClass} truncate max-w-[55%]`}>{frameLabel}</span>
                <span>
                  СЛАЙД {activeSlideIndex + 1} ИЗ {deck.slides.length}
                </span>
              </div>

              <div className="relative z-10 flex-1 min-h-0 py-1 flex flex-col justify-stretch">
                {activeSlide && renderSlide(activeSlide, activeSlideIndex)}
              </div>

              <div className={frame.footerClass}>
                <span className="truncate max-w-[45%]">© {frameLabel} • Seed Round</span>
                {isWatermarkRemoved ? (
                  <span className="flex items-center gap-1 truncate max-w-[45%]">
                    <span className="h-1 w-1 rounded-full bg-emerald-500" />
                    {`Проект: ${frameLabel}`}
                  </span>
                ) : (
                  <DeckWatermark forExport={false} />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          type="button"
          aria-label="Следующий слайд"
          disabled={activeSlideIndex >= deck.slides.length - 1}
          onClick={goNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/50 border border-white/15 text-white/80 hover:text-white hover:bg-black/70 flex items-center justify-center cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed transition-all"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      <div className="shrink-0 px-4 sm:px-8 pb-4">
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto py-2 scrollbar-none max-w-3xl mx-auto">
          {deck.slides.map((slide, sIdx) => (
            <button
              key={sIdx}
              type="button"
              onClick={() => setActiveSlideIndex(sIdx)}
              className={`shrink-0 h-7 min-w-[1.75rem] px-1.5 rounded-md text-[10px] font-mono font-bold cursor-pointer transition-all ${
                sIdx === activeSlideIndex
                  ? "bg-white text-black"
                  : "bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 border border-white/10"
              }`}
              title={slide.title}
            >
              {sIdx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
