import React from "react";
import { ArrowRight, Bot, Brain, Compass, Flame, Megaphone, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
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
      className="w-full relative space-y-10 pb-24"
    >
      {/* Quiet AI workspace ambience */}
      <div className="absolute -top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-white/[0.045] blur-[120px] pointer-events-none" />
      <div className="absolute top-28 right-8 h-72 w-72 rounded-full bg-emerald-500/[0.055] blur-[140px] pointer-events-none" />

      {/* Minimal AI agent landing */}
      <div className="max-w-5xl mx-auto w-full grid lg:grid-cols-[1fr_320px] gap-6 pt-6 sm:pt-12 pb-6 px-2 relative z-10">
        
        <div className="space-y-7">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-white/[0.04] border border-white/10 shadow-md px-3 py-1.5 rounded-full text-slate-400 text-xs font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-white font-bold uppercase tracking-wider text-[10px]">Decksy Agent online</span>
              <span className="text-slate-600">/</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">Pitch deck co-pilot</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl sm:text-6xl font-sans font-black tracking-tight text-white leading-[0.95]">
                Опишите идею.
                <br />
                Агент соберёт питч.
              </h2>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl font-sans leading-relaxed">
                Decksy Agent задаёт точные вопросы, держит контекст проекта в памяти и превращает сырой замысел в структурированную презентацию для инвестора.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-px bg-gradient-to-br from-white/18 via-white/5 to-emerald-500/10 rounded-[28px] blur-sm opacity-70"></div>
            <div className="relative bg-[#111113]/95 border border-white/10 rounded-[28px] p-5 sm:p-6 space-y-5 shadow-2xl text-left">
            
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block font-bold">Новая задача для агента</label>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Ready</span>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="Например: AI-платформа для автоматического анализа договоров и поиска рисков для малого бизнеса..."
                  className="w-full h-36 bg-[#0A0A0B] border border-white/10 rounded-2xl px-4 py-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 resize-none font-sans leading-relaxed transition-all"
                />
                <div className="absolute bottom-3 right-4 text-[10px] font-mono text-slate-600 select-none">
                  {idea.length} символов
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Prompt examples</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setIdea(sug)}
                    className="w-full text-left text-[11px] text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/15 rounded-xl p-3 transition-all block truncate cursor-pointer font-sans"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-1 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block font-bold">
                  Режим агента
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-extrabold bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded-full">
                  {mode === 'quick' ? "Fast draft" : mode === 'investor' ? "Balanced review" : "Hard critique"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setMode('quick')}
                  className={`py-2 px-1 rounded-sm text-[10px] font-bold uppercase transition-all flex flex-col items-center justify-center space-y-1 cursor-pointer border ${
                    mode === 'quick'
                      ? 'bg-white text-black border-white'
                      : 'bg-white/[0.03] border-white/5 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <TrendingUp className={`h-3.5 w-3.5 ${mode === 'quick' ? 'text-black' : 'text-slate-500'}`} />
                  <span>Fast</span>
                </button>

                <button
                  onClick={() => setMode('investor')}
                  className={`py-2 px-1 rounded-sm text-[10px] font-bold uppercase transition-all flex flex-col items-center justify-center space-y-1 cursor-pointer border ${
                    mode === 'investor'
                      ? 'bg-white text-black border-white'
                      : 'bg-white/[0.03] border-white/5 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <ShieldAlert className={`h-3.5 w-3.5 ${mode === 'investor' ? 'text-black' : 'text-slate-500'}`} />
                  <span>Agent</span>
                </button>

                <button
                  onClick={() => setMode('shark')}
                  className={`py-2 px-1 rounded-sm text-[10px] font-bold uppercase transition-all flex flex-col items-center justify-center space-y-1 cursor-pointer border ${
                    mode === 'shark'
                      ? 'bg-white text-black border-white'
                      : 'bg-white/[0.03] border-white/5 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Flame className={`h-3.5 w-3.5 ${mode === 'shark' ? 'text-black' : 'text-slate-500'}`} />
                  <span>Sharp</span>
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-4 pt-3 border-t border-white/[0.06]">
              <button
                onClick={handleStartInterview}
                disabled={isLoading || !idea.trim()}
                className="w-full bg-white hover:bg-slate-200 text-black font-extrabold uppercase text-[11px] py-3.5 px-4 rounded-2xl cursor-pointer disabled:opacity-30 transition-all tracking-widest flex items-center justify-center space-x-2 shadow-[0_14px_40px_rgba(255,255,255,0.08)] transform active:scale-[0.98]"
              >
                <Compass className="h-4 w-4" />
                <span>{isLoading ? "Agent thinking..." : "Запустить Decksy Agent"}</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-white/5" />
                <span className="flex-shrink mx-3 text-[9px] font-mono text-slate-600 uppercase tracking-widest font-bold">или быстрый output</span>
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
                  className="bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08] font-bold uppercase text-[9px] py-3 rounded-xl transition-all flex items-center justify-center cursor-pointer font-sans"
                  title="Кобальт"
                >
                  <span>Cobalt</span>
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
                  <span>Light</span>
                </button>
                <button
                  onClick={() => {
                    const testIdea = idea.trim() || "Telegram-бот для автоматической транскрипции голосовых сообщений";
                    setSelectedStyle('cosmic-dark');
                    handleFastGenerateDeck(testIdea);
                  }}
                  disabled={isLoading}
                  className="bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08] font-bold uppercase text-[9px] py-3 rounded-xl transition-all flex items-center justify-center cursor-pointer font-sans"
                  title="Тёмная"
                >
                  <span>Dark</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        </div>

        <div className="relative z-10 space-y-4">
          <div className="bg-[#111113]/90 border border-white/10 rounded-[28px] p-5 shadow-2xl">
            <div className="flex items-center gap-3 pb-5 border-b border-white/8">
              <div className="h-11 w-11 rounded-2xl bg-white text-black flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Decksy Agent</h3>
                <p className="text-[11px] text-emerald-400 font-mono uppercase tracking-widest">Available now</p>
              </div>
            </div>
            <div className="space-y-3 pt-5">
              {[
                ["Context", "Извлекает рынок, ЦА, продукт и бизнес-модель из текста."],
                ["Questions", "Дозадаёт вопросы как аналитик, пока не хватает данных."],
                ["Output", "Собирает структуру pitch deck и готовит слайды к экспорту."],
              ].map(([label, text]) => (
                <div key={label} className="rounded-2xl bg-white/[0.035] border border-white/6 p-3">
                  <div className="text-[9px] text-slate-500 font-mono uppercase tracking-widest mb-1">{label}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#111113]/80 border border-white/10 rounded-2xl p-4">
              <Brain className="h-4 w-4 text-slate-400 mb-3" />
              <div className="text-xl font-black text-white">7</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Agent steps</div>
            </div>
            <div className="bg-[#111113]/80 border border-white/10 rounded-2xl p-4">
              <Sparkles className="h-4 w-4 text-slate-400 mb-3" />
              <div className="text-xl font-black text-white">PPTX</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Final output</div>
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
