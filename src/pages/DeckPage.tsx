import React from "react";
import { 
  AlertTriangle, 
  Award, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Volume2, 
  Image, 
  Save, 
  Flame, 
  ShieldAlert, 
  CheckCircle2, 
  Upload,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Slide, PitchDeck } from "../types";
import { SlideRenderer } from "../components/SlideRenderer";

interface DeckPageProps {
  deck: PitchDeck;
  activeSlideIndex: number;
  setActiveSlideIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedStyle: 'cobalt' | 'clean-light' | 'cosmic-dark';
  setSelectedStyle: (style: 'cobalt' | 'clean-light' | 'cosmic-dark') => void;
  updateSlide: (index: number, patch: Partial<Slide>) => void;
  updateSlideBullets: (index: number, bullets: string[]) => void;
  isWatermarkRemoved: boolean;
  setScreen: (screen: string) => void;
  user: any;
  saveDeckToDatabase: (deck: PitchDeck) => void;
  saveInProgress: boolean;
  lastSavedDeckId: string | null;
  handleDownloadPPTX: () => void;
  handleDownloadPDF: () => void;
  handleShareDeck: () => void;
  handleDownloadZIP: () => void;
  handleDownloadPythonScript: () => void;
  shareSuccess: boolean;
  roastActive: boolean;
  setRoastActive: (v: boolean) => void;
  setRoasted: (v: boolean) => void;
  handleSpeakSpeech: (text?: string) => void;
  handleCopySpeech: (text: string | undefined, idx: number) => void;
  handleRewriteSlideWithAI: (idx: number, desc: string) => void;
  isRewritingSlide: boolean;
  rewriteError: string | null;
}

export const DeckPage: React.FC<DeckPageProps> = ({
  deck,
  activeSlideIndex,
  setActiveSlideIndex,
  selectedStyle,
  setSelectedStyle,
  updateSlide,
  updateSlideBullets,
  isWatermarkRemoved,
  setScreen,
  user,
  saveDeckToDatabase,
  saveInProgress,
  lastSavedDeckId,
  handleDownloadPPTX,
  handleDownloadPDF,
  handleShareDeck,
  handleDownloadZIP,
  handleDownloadPythonScript,
  shareSuccess,
  roastActive,
  setRoastActive,
  setRoasted,
  handleSpeakSpeech,
  handleCopySpeech,
  handleRewriteSlideWithAI,
  isRewritingSlide,
  rewriteError,
}) => {
  const isThemeLight = selectedStyle === 'clean-light';
  const isThemeCobalt = selectedStyle === 'cobalt';
  const activeSlideType = deck.slides[activeSlideIndex]?.type || '';
  const isTitleSlide = activeSlideIndex === 0 || activeSlideType === 'title';

  // Visual frames style mapping
  let frameClass = "aspect-video w-full rounded-2xl p-5 sm:p-7 md:p-8 relative overflow-hidden flex flex-col justify-between shadow-2xl transition-all border ";
  let frameStyle: React.CSSProperties = {};
  let headerClass = "flex items-center justify-between text-[8px] sm:text-[9px] font-mono pb-2 relative z-10 border-b ";
  let footerClass = "pt-2 flex items-center justify-between text-[7px] sm:text-[8px] font-mono uppercase tracking-widest relative z-10 border-t ";
  let gridBg = "";
  let gridBgSize = "40px 40px";

  if (isThemeLight) {
    frameClass += "border-neutral-200/95";
    frameStyle = { background: 'linear-gradient(to bottom, #ffffff, #fafafa)' };
    headerClass += "border-neutral-200/60 text-neutral-400";
    footerClass += "border-neutral-200/60 text-neutral-400";
    gridBg = "linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px)";
    gridBgSize = "30px 30px";
  } else if (isThemeCobalt) {
    if (isTitleSlide) {
      frameClass += "border-white/10";
      frameStyle = { background: 'linear-gradient(to bottom right, #0b45cf, #001f7a)' };
      headerClass += "border-white/10 text-blue-200/65";
      footerClass += "border-white/10 text-blue-200/65";
      gridBg = "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)";
      gridBgSize = "35px 35px";
    } else {
      frameClass += "border-blue-100/50";
      frameStyle = { background: 'linear-gradient(to bottom, #ffffff, #f7faf5)' };
      headerClass += "border-blue-100/50 text-slate-400";
      footerClass += "border-blue-100/50 text-slate-400";
      gridBg = "linear-gradient(rgba(0,77,230,0.008) 1px, transparent 1px), linear-gradient(90deg, rgba(0,77,230,0.008) 1px, transparent 1px)";
      gridBgSize = "45px 45px";
    }
  } else {
    frameClass += "border-white/5 hover:border-white/8";
    frameStyle = { background: 'linear-gradient(to bottom, #09090b, #040405)' };
    headerClass += "border-white/5 text-slate-500";
    footerClass += "border-white/5 text-slate-500";
    gridBg = "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)";
    gridBgSize = "40px 40px";
  }

  return (
    <motion.div 
      id="screen-deck"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Watermark Notice */}
      {!isWatermarkRemoved && (
        <div className="bg-gradient-to-br from-[#161618] to-[#0D0D0F] border border-white/10 rounded-lg p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center space-x-3.5 text-left">
            <div className="h-9 w-9 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0 border border-amber-500/20">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold text-white font-mono">Бесплатный тарифный план</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-1">На скачанных PPTX слайдах нанесен водяной знак «AI Generated». Уберите водяной знак, чтобы получить готовый для фондов PPTX-архив.</p>
            </div>
          </div>
          <button
            id="unlock-premium-btn"
            onClick={() => setScreen('plans')}
            className="bg-gradient-to-r from-purple-500 to-[#FF5D44] text-white font-extrabold uppercase tracking-widest text-[10px] px-5 py-3 rounded-sm transition-all cursor-pointer flex-shrink-0 animate-pulse"
          >
            Выбрать тариф и убрать знак
          </button>
        </div>
      )}

      {isWatermarkRemoved && (
        <div className="bg-gradient-to-br from-[#161618] to-[#0D0D0F] border border-green-500/20 p-5 rounded-lg flex items-center space-x-3.5 text-left">
          <div className="h-9 w-9 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/25">
            <Award className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold text-white font-mono">Версия PRO активирована</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Водяной знак убран. Наслаждайтесь премиальным экспортом в PowerPoint и оригинальной версткой.</p>
          </div>
        </div>
      )}

      {/* Dynamic Slogan Title */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-sky-950/20 border border-sky-500/20 rounded-lg px-4 py-2.5 text-[11px] text-sky-300 flex items-center">
          <span>✎ Нажмите на текст в слайде, чтобы изм. Скачать PDF/PPTX — справа.</span>
        </div>
        
        <div className="flex items-center justify-between bg-[#0D0D0F] border border-white/10 px-3 py-1.5 rounded-lg">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-cyan-400 animate-pulse" />
            Стиль темы:
          </span>
          <div className="flex items-center space-x-1 bg-white/5 p-0.5 rounded border border-white/5">
            <button
              onClick={() => setSelectedStyle('cobalt')}
              className={`px-2 py-1 rounded text-[9px] font-mono uppercase tracking-widest cursor-pointer transition-all ${
                selectedStyle === 'cobalt'
                  ? 'bg-[#004de6] text-white font-bold shadow-inner'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Кобальт
            </button>
            <button
              onClick={() => setSelectedStyle('clean-light')}
              className={`px-2 py-1 rounded text-[9px] font-mono uppercase tracking-widest cursor-pointer transition-all ${
                selectedStyle === 'clean-light'
                  ? 'bg-white text-black font-bold shadow-inner'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Светлая
            </button>
            <button
              onClick={() => setSelectedStyle('cosmic-dark')}
              className={`px-2 py-1 rounded text-[9px] font-mono uppercase tracking-widest cursor-pointer transition-all ${
                selectedStyle === 'cosmic-dark'
                  ? 'bg-emerald-600 text-white font-bold shadow-inner'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Темная
            </button>
          </div>
        </div>
      </div>

      <div className="text-center sm:text-left space-y-1">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight flex flex-col sm:flex-row sm:items-center sm:space-x-3 justify-center sm:justify-start">
          <span>{deck.title}</span>
          <span className="text-[9px] font-mono bg-white/5 text-slate-400 border border-white/10 px-2 py-0.5 rounded uppercase self-center mt-1 sm:mt-0 font-bold tracking-widest font-bold">PITCH DECK</span>
        </h2>
        <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">{deck.subtitle}</p>
      </div>

      {/* PRESENTATION WORKSPACE: GRID MAIN */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: THE ACTIVE SLIDE ASPECT (16:9 VIEW) + SPEAK PLAYS (7 COLS) */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className={frameClass} style={frameStyle}>
            {/* Decorative grid pattern */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: gridBg,
                backgroundSize: gridBgSize
              }}
            />
            
            {!isThemeLight && !isThemeCobalt && (
              <>
                {/* Premium glow blobs */}
                <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none"></div>
                <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-blue-500/8 blur-[80px] pointer-events-none"></div>
              </>
            )}

            {/* Header bar */}
            <div className={headerClass}>
              <span className={`${isThemeLight ? "text-neutral-900 font-bold" : isThemeCobalt && isTitleSlide ? "text-white font-bold" : isThemeCobalt ? "text-[#004de6] font-bold" : "text-white"} uppercase tracking-widest font-bold`}>{deck.title}</span>
              <span>СЛАЙД {activeSlideIndex + 1} ИЗ {deck.slides.length}</span>
            </div>

            {/* Centered actual layout content inside */}
            <div className="my-auto relative z-10 h-[74%] flex flex-col justify-stretch">
              <SlideRenderer
                slide={deck.slides[activeSlideIndex]}
                index={activeSlideIndex}
                selectedStyle={selectedStyle}
                forExport={false}
                onUpdate={(patch) => updateSlide(activeSlideIndex, patch)}
              />
            </div>

            {/* Footer bar */}
            <div className={footerClass}>
              <span>© {deck.title} • Seedsdfsdf Round</span>
              <span className="flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
                {isWatermarkRemoved ? `Проект: ${deck.title}` : "Сгенерировано Decksy.ai"}
              </span>
            </div>
          </div>

          {/* SLIDE CONTROL SELECTOR CAROUSEL */}
          <div className="flex items-center justify-between bg-[#0D0D0F] border border-white/10 rounded-md p-3">
            <button
              id="prev-slide-btn"
              disabled={activeSlideIndex === 0}
              onClick={() => setActiveSlideIndex(prev => prev - 1)}
              className="h-9 w-9 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-md flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group transition-colors"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            <div className="flex space-x-1.5 overflow-x-auto px-2 py-1 select-none max-w-[280px] sm:max-w-md md:max-w-lg scrollbar-none">
              {deck.slides.map((_, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => setActiveSlideIndex(sIdx)}
                  className={`h-7 w-7 text-xs font-mono font-bold rounded flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer ${
                    activeSlideIndex === sIdx
                      ? 'bg-white text-black font-extrabold'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {sIdx + 1}
                </button>
              ))}
            </div>

            <button
              id="next-slide-btn"
              disabled={activeSlideIndex === deck.slides.length - 1}
              onClick={() => setActiveSlideIndex(prev => prev + 1)}
              className="h-9 w-9 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-md flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group transition-colors"
            >
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* ORATOR SPEECH SCRIPT AUDIO SPEAKER notes per slide */}
          <div className="bg-[#0D0D0F] border border-white/10 rounded-md p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="h-8 w-8 rounded-sm bg-white/5 flex items-center justify-center text-white border border-white/10 flex-shrink-0">
                  <Volume2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Шпаргалка спикера (Текст питча)</h4>
                  <p className="text-[10px] text-slate-500">Читайте этот text во время демонстрации этого слайда:</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSpeakSpeech(deck.slides[activeSlideIndex]?.speechScript)}
                  className="text-[9px] uppercase tracking-wider font-extrabold bg-white/5 text-white border border-white/10 hover:bg-white/10 px-3 py-1.5 rounded-sm cursor-pointer transition-colors"
                >
                  Озвучить (TTS)
                </button>
                <button
                  onClick={() => handleCopySpeech(deck.slides[activeSlideIndex]?.speechScript, activeSlideIndex)}
                  className="text-[9px] uppercase tracking-wider font-extrabold bg-white/5 text-white border border-white/10 hover:bg-white/10 px-3 py-1.5 rounded-sm cursor-pointer transition-colors"
                >
                  Копировать речь
                </button>
              </div>
            </div>

            <textarea
              value={deck.slides[activeSlideIndex]?.speechScript || ""}
              onChange={(e) =>
                updateSlide(activeSlideIndex, { speechScript: e.target.value })
              }
              rows={5}
              className="w-full text-xs text-slate-300 leading-relaxed font-sans bg-black/40 p-4 rounded border border-white/5 resize-y focus:outline-none focus:border-sky-400/40"
              placeholder="Текст, который вы говорите на этом слайде..."
            />
          </div>

          {/* Inline slide editor */}
          <div className="bg-[#0D0D0F] border border-sky-500/20 rounded-md p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h4 className="text-[10px] font-mono text-sky-400 uppercase tracking-wider">
                ✎ Редактирование слайда {activeSlideIndex + 1}
              </h4>
              <span className="text-[9px] text-slate-500">Кликните на текст в слайде или меняйте здесь</span>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Заголовок</label>
              <input
                value={deck.slides[activeSlideIndex]?.title || ""}
                onChange={(e) => updateSlide(activeSlideIndex, { title: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Подзаголовок</label>
              <input
                value={deck.slides[activeSlideIndex]?.subtitle || ""}
                onChange={(e) => updateSlide(activeSlideIndex, { subtitle: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Пункты (каждый с новой строки)</label>
              <textarea
                value={(deck.slides[activeSlideIndex]?.content || []).join("\n")}
                onChange={(e) => updateSlideBullets(activeSlideIndex, e.target.value.split("\n"))}
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400/40 resize-y font-sans"
              />
            </div>

            {/* Image uploading feature with AI understanding */}
            <div className="border-t border-white/5 pt-3 mt-3 space-y-3">
              <div className="flex items-center space-x-1.5 text-sky-400">
                <Image className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Изображение слайда с AI</span>
              </div>

              {deck.slides[activeSlideIndex]?.image ? (
                <div className="space-y-3 bg-black/30 p-2.5 rounded border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Изображение прикреплено
                    </span>
                    <button
                      type="button"
                      onClick={() => updateSlide(activeSlideIndex, { image: undefined, imageDescription: undefined })}
                      className="text-[9px] text-red-400 hover:text-red-300 font-mono cursor-pointer transition-colors"
                    >
                      ✖ Удалить изображение
                    </button>
                  </div>

                  <div className="h-20 w-full overflow-hidden rounded border border-white/10 bg-black/40 flex items-center justify-center">
                    <img 
                      src={deck.slides[activeSlideIndex]?.image} 
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover" 
                      alt="Uploaded slide layout" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-400 uppercase tracking-wider font-mono block">Что изображено на картинке? (для AI)</label>
                    <textarea
                      value={deck.slides[activeSlideIndex]?.imageDescription || ""}
                      onChange={(e) => updateSlide(activeSlideIndex, { imageDescription: e.target.value })}
                      placeholder="Опишите тему изображения (например: Смартфон с открытым графиком прибыли и клиентом в кофейне)"
                      rows={2}
                      className="w-full bg-black/50 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400/40 font-sans"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRewriteSlideWithAI(activeSlideIndex, deck.slides[activeSlideIndex]?.imageDescription || "")}
                    disabled={isRewritingSlide}
                    className="w-full h-8 text-[10px] font-mono uppercase tracking-widest font-extrabold flex items-center justify-center space-x-1.5 bg-gradient-to-r from-sky-500/15 via-blue-500/15 to-indigo-500/15 border border-sky-400/30 hover:border-sky-400/60 text-sky-300 hover:text-sky-200 rounded cursor-pointer transition-all disabled:opacity-50 disabled:cursor-wait"
                  >
                    {isRewritingSlide ? (
                      <>
                        <span className="h-2.5 w-2.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></span>
                        <span>Переписываем слайд через ИИ...</span>
                      </>
                    ) : (
                      <>
                        <span>✨ Переписать слайд под картинку (ИИ)</span>
                      </>
                    )}
                  </button>
                  {rewriteError && (
                    <p className="text-[10px] text-red-400 text-center font-mono">{rewriteError}</p>
                  )}
                </div>
              ) : (
                <div className="bg-[#121214] p-3 rounded border border-dashed border-white/10 space-y-3">
                  <p className="text-[9.5px] text-slate-400 leading-normal text-center">
                    Вы можете загрузить изображение, чтобы придать визуальный стиль слайду (доступно для всех слайдов).
                  </p>

                  <div className="grid grid-cols-1 gap-2">
                    <label className="w-full h-9 flex items-center justify-center space-x-1.5 border border-white/10 rounded cursor-pointer bg-black/40 hover:bg-white/[0.03] transition-colors">
                      <Upload className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-[11px] text-slate-300 font-medium">Загрузить файл картинки</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                updateSlide(activeSlideIndex, { 
                                  image: reader.result,
                                  imageDescription: "Изображение к проекту"
                                });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    <div className="flex items-center space-x-2 text-[9px] text-slate-500">
                      <span className="h-px bg-white/5 flex-grow"></span>
                      <span>Или вставить URL</span>
                      <span className="h-px bg-white/5 flex-grow"></span>
                    </div>

                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Вставьте ссылку на изображение..."
                        className="flex-grow bg-black/40 border border-white/10 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-sky-400/40"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const target = e.currentTarget;
                            if (target.value.trim()) {
                              updateSlide(activeSlideIndex, {
                                image: target.value.trim(),
                                imageDescription: "Иллюстрация к слайду"
                              });
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.currentTarget.previousSibling as HTMLInputElement;
                          if (input && input.value.trim()) {
                            updateSlide(activeSlideIndex, {
                              image: input.value.trim(),
                              imageDescription: "Иллюстрация к слайду"
                            });
                          }
                        }}
                        className="bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 px-2.5 rounded text-[10px] text-sky-400 cursor-pointer"
                      >
                        ОК
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: ACTIONS + INTENSE VC ROAST PANELS (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-[#0D0D0F] border border-white/10 rounded-md p-5 space-y-4 shadow-xl">
            <h3 className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold mb-2">Операции с презентацией</h3>
            
            <div className="grid grid-cols-1 gap-2">
              
              {user && (
                <button
                  onClick={() => saveDeckToDatabase(deck)}
                  disabled={saveInProgress}
                  className={`w-full font-extrabold uppercase tracking-widest text-[9.5px] py-3.5 px-4 rounded-sm flex items-center justify-between cursor-pointer border transition-all ${
                    saveInProgress
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-550 shrink-0 cursor-wait"
                      : lastSavedDeckId === deck.id
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
                        : "bg-[#161618] hover:bg-white/5 border-amber-500/30 text-[#F59E0B]"
                  }`}
                >
                  <div className="flex items-center space-x-1.5 leading-none">
                    <Save className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {saveInProgress
                        ? "Сохранение презентации в облаке..."
                        : lastSavedDeckId === deck.id
                          ? "Сохранено в облако DECKSY"
                          : "Сохранить изменения в БД"}
                    </span>
                  </div>
                  {lastSavedDeckId === deck.id && (
                    <span className="text-[8px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1 rounded uppercase font-mono font-bold leading-none py-0.5">
                      Синхронизировано
                    </span>
                  )}
                </button>
              )}
              
              <button
                id="export-pptx-btn"
                onClick={handleDownloadPPTX}
                className="w-full bg-white text-black hover:bg-slate-200 font-extrabold uppercase tracking-widest text-[9px] py-3.5 px-4 rounded-sm flex items-center justify-between cursor-pointer transition-all"
              >
                <span>Скачать презентацию PPTX (Widescreen)</span>
                {!isWatermarkRemoved && <span className="text-[8px] bg-amber-500/20 text-amber-500 border border-amber-500/30 px-1 rounded uppercase font-bold">Watermark</span>}
              </button>

              <button
                id="print-pdf-btn"
                onClick={handleDownloadPDF}
                className="w-full bg-[#161618] hover:bg-white/5 border border-white/10 font-bold uppercase tracking-widest text-[9px] py-3.5 px-4 rounded-sm flex items-center justify-between text-slate-200 cursor-pointer transition-all"
              >
                <span>Скачать презентацию PDF</span>
                {!isWatermarkRemoved && <span className="text-[8px] bg-amber-500/20 text-amber-500 border border-amber-500/30 px-1 rounded uppercase font-bold">Watermark</span>}
              </button>

              <button
                id="share-deck-link-btn"
                onClick={handleShareDeck}
                className="w-full bg-[#161618] hover:bg-white/5 border border-white/10 font-bold uppercase tracking-widest text-[9px] py-3.5 px-4 rounded-sm flex items-center justify-between text-slate-200 cursor-pointer transition-all"
              >
                <span>Поделиться ссылкой с инвестором</span>
              </button>

              <button
                id="download-jpeg-zip-btn"
                onClick={handleDownloadZIP}
                className="w-full bg-[#161618] hover:bg-white/5 border border-white/10 font-bold uppercase tracking-widest text-[9px] py-3.5 px-4 rounded-sm flex items-center justify-between text-slate-200 cursor-pointer transition-all"
              >
                <span>Скачать архив JPEG-картинок (ZIP)</span>
                <span className="text-[8px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded uppercase font-bold">100% Reliable</span>
              </button>

              <button
                id="download-python-script-btn"
                onClick={handleDownloadPythonScript}
                className="w-full bg-[#161618] hover:bg-slate-900 border border-[#3b82f6]/20 font-bold uppercase tracking-widest text-[9px] py-3.5 px-4 rounded-sm flex items-center justify-between text-blue-400 cursor-pointer transition-all"
              >
                <span>Получить код Python (python-pptx)</span>
                <span className="text-[8px] bg-blue-500/15 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded uppercase font-bold">Python Code</span>
              </button>

            </div>

            {shareSuccess && (
               <div className="p-2.5 bg-green-950/20 border border-green-500/30 rounded text-[10px] text-green-400 font-mono text-center uppercase tracking-wider animate-fade-in">
                 Ссылка скопирована в буфер обмена!
               </div>
            )}
          </div>

          {/* THE VC ROAST BUTTON PANEL */}
          <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-5 space-y-4 shadow-xl">
            
            {!roastActive ? (
              <div className="text-center space-y-3.5 py-2">
                <div className="h-10 w-10 mx-auto rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                  <Flame className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Жесткий инвесторский Roast?</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">Получите разгромную и честную критику слабых мест вашего стартапа, чтобы защитить проект от реальных скептиков.</p>
                </div>
                <button
                  id="start-roast-btn"
                  onClick={() => {
                    setRoastActive(true);
                    setRoasted(true);
                  }}
                  className="w-full bg-red-950/20 hover:bg-red-900/30 border border-red-500/30 text-red-400 font-extrabold uppercase tracking-widest text-[9px] py-3 px-4 rounded-sm transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Flame className="h-3.5 w-3.5 animate-pulse" />
                  <span>Начать разгром</span>
                </button>
              </div>
            ) : (
              deck.roast && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4 text-left"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <h4 className="text-[9px] uppercase font-mono text-red-400 font-extrabold tracking-wider flex items-center space-x-1.5 font-bold">
                      <Flame className="h-3.5 w-3.5" />
                      <span>Критика ИИ-Инвестора (ROASTED)</span>
                    </h4>
                    <button 
                      onClick={() => setRoastActive(false)}
                      className="text-[9px] uppercase tracking-wider font-bold text-slate-500 hover:text-slate-300 font-mono cursor-pointer"
                    >
                      Свернуть
                    </button>
                  </div>

                  {/* Circular Score and Verdict */}
                  <div className="bg-black/40 p-4 rounded border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-[#475569] uppercase font-mono tracking-widest font-bold">ВЕРДИКТ ИНВЕСТОРА:</span>
                      <h5 className="text-xs font-bold text-red-500 uppercase font-sans mt-0.5">{deck.roast.verdict}</h5>
                    </div>
                    
                    <div className="relative h-12 w-12 flex-shrink-0">
                      <svg className="h-full w-full" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/5" strokeWidth="3" />
                        <circle 
                          cx="18" cy="18" r="16" fill="none" 
                          className="stroke-red-500" 
                          strokeWidth="3" 
                          strokeDasharray={`${deck.roast.score}, 100`} 
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] font-bold text-red-500">
                        {deck.roast.score}%
                      </span>
                    </div>
                  </div>

                  {/* Roast brutal speech text */}
                  <p className="text-xs text-slate-300 italic leading-relaxed bg-red-955/5 border-l border-red-500 pl-3.5 py-1.5 font-sans">
                    {deck.roast.roastText}
                  </p>

                  {/* Weak Spots */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-red-400 uppercase font-mono tracking-widest flex items-center space-x-1 font-extrabold">
                      <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
                      <span>Красные флаги проекта:</span>
                    </span>
                    <ul className="text-[10px] text-slate-400 space-y-1 bg-black/30 p-3 rounded border border-white/5 list-none">
                      {deck.roast.weakSpots.map((spot, sIdx) => (
                        <li key={sIdx} className="flex items-start">
                          <span className="text-red-500 mr-2 font-bold">•</span>
                          <span>{spot}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations on how to solve */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-green-500 uppercase font-mono tracking-widest flex items-center space-x-1 font-extrabold">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      <span>План устранения уязвимостей:</span>
                    </span>
                    <ul className="text-[10px] text-slate-400 space-y-1 bg-black/30 p-3 rounded border border-white/5 list-none">
                      {deck.roast.recommendations.map((rec, rIdx) => (
                        <li key={rIdx} className="flex items-start">
                          <span className="text-green-500 mr-2 font-bold">✓</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </motion.div>
              )
            )}

          </div>

        </div>

      </div>

    </motion.div>
  );
};
