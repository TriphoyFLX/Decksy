import React from "react";
import { Compass, ShieldAlert, Flame, TrendingUp, Megaphone, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Mode } from "../types";

interface IntroPageProps {
  idea: string;
  setIdea: (value: string) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
  suggestions: string[];
  isLoading: boolean;
  handleStartInterview: () => void;
  setSelectedStyle: (style: 'cobalt' | 'clean-light' | 'cosmic-dark') => void;
  handleFastGenerateDeck: (idea: string) => void;
  activeAds: any[];
}

export const IntroPage: React.FC<IntroPageProps> = ({
  idea,
  setIdea,
  mode,
  setMode,
  suggestions,
  isLoading,
  handleStartInterview,
  setSelectedStyle,
  handleFastGenerateDeck,
  activeAds,
}) => {
  return (
    <motion.div 
      id="screen-intro"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full relative space-y-16 pb-24"
    >
      {/* Ambient blur lights */}
      <div className="absolute -top-12 -left-20 w-80 h-80 bg-[#FF5D44]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-[#FF5D44]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* CHATGPT-STYLE CENTERED LAYOUT */}
      <div className="max-w-3xl mx-auto w-full flex flex-col items-center justify-center pt-6 sm:pt-12 pb-6 px-2 text-center relative z-10 space-y-8">
        
        {/* Tech tag */}
        <div className="inline-flex items-center space-x-2 bg-[#161616] border border-white/5 shadow-md px-3 py-1.5 rounded-full text-slate-400 text-xs font-mono">
          <div className="h-1.5 w-1.5 rounded-full bg-[#FF5D44] animate-pulse"></div>
          <span className="text-white font-bold uppercase tracking-wider text-[10px]">🎯 DECKSY VENTURE LAB</span>
          <span className="text-zinc-650">•</span>
          <span className="text-[10px] text-zinc-400 uppercase tracking-wide">АНАЛИЗ И ГЕНЕРАЦИЯ ДЕКОВ</span>
        </div>

        {/* Chat-prompt Greeting like ChatGPT / Gemini */}
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-white uppercase leading-tight">
            С чего начнем проработку <br className="hidden sm:inline" />
            вашего <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5D44] via-rose-500 to-white">стартапа?</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto font-sans font-normal leading-relaxed">
            ИИ-инвестор проанализирует вашу идею в форме интерактивного интервью и мгновенно сгенерирует полноценный питч-дек по стандартам Y Combinator.
          </p>
        </div>

        {/* Centered ChatGPT Prompt Box Container */}
        <div className="w-full relative">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-[#FF5D44]/30 to-violet-500/10 rounded-2xl blur opacity-25"></div>
          <div className="relative bg-[#161616] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-6 shadow-2xl text-left">
            
            {/* Glowing thin ribbon */}
            <div className="absolute top-0 inset-x-12 h-[2.5px] bg-gradient-to-r from-transparent via-[#FF5D44] to-transparent animate-pulse" />

            {/* Main Idea Input area */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block font-bold">Опишите концепт стартапа, как в ChatGPT:</label>
              <div className="relative">
                <textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="Например: Платформа на базе искусственного интеллекта для мгновенного подбора и анализа коммерческой недвижимости..."
                  className="w-full h-32 bg-[#0F0F10] border border-white/5 rounded-xl px-4 py-3.5 text-sm text-slate-200 placeholder-zinc-600 focus:outline-none focus:border-[#FF5D44]/60 focus:ring-1 focus:ring-[#FF5D44]/20 resize-none font-sans leading-relaxed transition-all"
                />
                <div className="absolute bottom-2.5 right-3 text-[10px] font-mono text-zinc-550 select-none">
                  {idea.length} символов
                </div>
              </div>
            </div>

            {/* Fast templates & suggestion pills - horizontally scrollable or wrapped */}
            <div className="space-y-2">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Выберите пример для быстрого старта:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setIdea(sug)}
                    className="w-full text-left text-[11px] text-zinc-400 hover:text-[#FF5D44] bg-[#0F0F10] hover:bg-[#FF5D44]/5 border border-white/5 hover:border-[#FF5D44]/20 rounded-lg p-2.5 transition-all block truncate cursor-pointer font-sans"
                  >
                    ✦ {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Hardiness Level selector */}
            <div className="space-y-3 pt-1 border-t border-white/[0.03]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block font-bold">
                  Характер ИИ-интервьюера:
                </span>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-extrabold bg-[#0F0F10] border border-white/5 px-2 py-0.5 rounded">
                  {mode === 'quick' ? "⚡ Быстрый набросок" : mode === 'investor' ? "💼 Обычный инвестор" : "🦈 Акула венчура"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setMode('quick')}
                  className={`py-2 px-1 rounded-sm text-[10px] font-bold uppercase transition-all flex flex-col items-center justify-center space-y-1 cursor-pointer border ${
                    mode === 'quick'
                      ? 'bg-[#FF5D44]/10 border-[#FF5D44] text-white'
                      : 'bg-[#0F0F10] border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <TrendingUp className={`h-3.5 w-3.5 ${mode === 'quick' ? 'text-[#FF5D44]' : 'text-zinc-500'}`} />
                  <span>Мини</span>
                </button>

                <button
                  onClick={() => setMode('investor')}
                  className={`py-2 px-1 rounded-sm text-[10px] font-bold uppercase transition-all flex flex-col items-center justify-center space-y-1 cursor-pointer border ${
                    mode === 'investor'
                      ? 'bg-[#FF5D44]/10 border-[#FF5D44] text-white'
                      : 'bg-[#0F0F10] border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <ShieldAlert className={`h-3.5 w-3.5 ${mode === 'investor' ? 'text-[#FF5D44]' : 'text-zinc-500'}`} />
                  <span>Мидл</span>
                </button>

                <button
                  onClick={() => setMode('shark')}
                  className={`py-2 px-1 rounded-sm text-[10px] font-bold uppercase transition-all flex flex-col items-center justify-center space-y-1 cursor-pointer border ${
                    mode === 'shark'
                      ? 'bg-red-500/15 border-[#FF5D44] text-white shadow-[0_0_12px_rgba(255,93,68,0.2)]'
                      : 'bg-[#0F0F10] border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Flame className={`h-3.5 w-3.5 ${mode === 'shark' ? 'text-[#FF5D44]' : 'text-[#FF5D44]/40'}`} />
                  <span>Акула</span>
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-4 pt-3 border-t border-white/[0.03]">
              <button
                onClick={handleStartInterview}
                disabled={isLoading || !idea.trim()}
                className="w-full bg-[#FF5D44] hover:bg-red-500 text-white font-extrabold uppercase text-[11px] py-3.5 px-4 rounded-xl cursor-pointer disabled:opacity-30 transition-all tracking-widest flex items-center justify-center space-x-2 shadow-[0_4px_20px_rgba(255,93,68,0.3)] hover:shadow-[0_4px_24px_rgba(255,93,68,0.5)] transform active:scale-[0.98]"
              >
                <Compass className="h-4 w-4" />
                <span>{isLoading ? "Обработка..." : "Запустить ИИ-интервью"}</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-white/5" />
                <span className="flex-shrink mx-3 text-[9px] font-mono text-zinc-550 uppercase tracking-widest font-bold">ИЛИ СГЕНЕРИРОВАТЬ СРАЗУ</span>
                <div className="flex-grow border-t border-white/5" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    const testIdea = idea.trim() || "ИИ-советник для автоматического аудита юридических контрактов";
                    setSelectedStyle('cobalt');
                    handleFastGenerateDeck(testIdea);
                  }}
                  disabled={isLoading}
                  className="bg-[#FF5D44]/5 border border-[#FF5D44]/35 text-white hover:bg-[#FF5D44]/10 font-bold uppercase text-[9px] py-3 rounded-xl transition-all flex items-center justify-center cursor-pointer font-sans"
                  title="Кобальт"
                >
                  <span>Кобальт</span>
                </button>
                <button
                  onClick={() => {
                    const testIdea = idea.trim() || "ИИ-советник для автоматического аудита юридических контрактов";
                    setSelectedStyle('clean-light');
                    handleFastGenerateDeck(testIdea);
                  }}
                  disabled={isLoading}
                  className="bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 font-bold uppercase text-[9px] py-3 rounded-xl transition-all flex items-center justify-center cursor-pointer font-sans"
                  title="Светлая"
                >
                  <span>Светлая</span>
                </button>
                <button
                  onClick={() => {
                    const testIdea = idea.trim() || "Telegram-бот для автоматической транскрипции голосовых сообщений";
                    setSelectedStyle('cosmic-dark');
                    handleFastGenerateDeck(testIdea);
                  }}
                  disabled={isLoading}
                  className="bg-[#0F0F10] border border-white/5 text-slate-300 hover:bg-white/5 font-bold uppercase text-[9px] py-3 rounded-xl transition-all flex items-center justify-center cursor-pointer font-sans"
                  title="Тёмная"
                >
                  <span>Тёмная</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* SPONSORED PROMOTION BOX */}
      {activeAds && activeAds.length > 0 && (
        <div className="relative z-10 w-full max-w-3xl mx-auto bg-[#161619] border border-white/5 rounded-xl p-6 shadow-xl overflow-hidden">
          {/* Visual strip indicator */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FF5D44] to-transparent" />
          
          {/* Header text */}
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
            <div className="flex items-center gap-1.5 font-mono text-[9px] font-black uppercase text-[#FF5D44] tracking-widest">
              <span className="p-0.5 bg-[#FF5D44]/10 rounded border border-[#FF5D44]/20">
                <Megaphone className="h-3 w-3" />
              </span>
              ПАРТНЕРСКИЕ ПРОЕКТЫ И ПРЕДЛОЖЕНИЯ
            </div>
            <span className="text-[8px] font-mono text-[#FF5D44] tracking-widest uppercase font-extrabold pb-0.5 border-b border-[#FF5D44]/30 animate-pulse">РЕКЛАМА</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeAds.map((ad: any) => (
              <div key={ad.id} className="bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 p-4 rounded-lg flex flex-col justify-between transition-all group">
                <div className="space-y-2">
                  {ad.imageUrl && (
                    <div className="w-full h-24 mb-2.5 rounded-md overflow-hidden bg-zinc-950 flex items-center justify-center">
                      <img 
                        src={ad.imageUrl} 
                        alt={ad.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    </div>
                  )}
                  <h4 className="text-xs font-mono font-bold text-white uppercase group-hover:text-[#FF5D44] transition-colors">{ad.title}</h4>
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed font-normal">{ad.content}</p>
                </div>

                {ad.link && (
                  <div className="pt-3 mt-2 border-t border-white/[0.03] text-right">
                    <a 
                      href={ad.link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-[10px] uppercase font-mono font-bold text-[#FF5D44] hover:text-[#FF5D44]/85 transition-colors"
                    >
                      <span>Подробнее</span>
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </motion.div>
  );
};
