import React from "react";
import { Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface GeneratingPageProps {
  generationProgress: number;
}

export const GeneratingPage: React.FC<GeneratingPageProps> = ({ generationProgress }) => {
  return (
    <motion.div 
      id="screen-generating"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center max-w-lg mx-auto space-y-7"
    >
      <div className="relative">
        <div className="h-20 w-20 rounded-full border-2 border-slate-800 border-t-2 border-t-amber-500 animate-spin flex items-center justify-center"></div>
        <Sparkles className="h-8 w-8 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </div>

      <div className="space-y-3 w-full">
        <div className="flex items-center justify-between text-xs font-mono px-1">
          <span className="text-slate-400 uppercase tracking-widest font-bold">Генерируем ваш шедевр...</span>
          <span className="text-amber-400 font-extrabold">{generationProgress}%</span>
        </div>
        
        {/* Outer progress bar track */}
        <div className="h-2 w-full bg-slate-900 border border-white/5 rounded-full overflow-hidden">
          {/* Inner animating fill */}
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-indigo-600 transition-all duration-300 rounded-full shadow-inner shadow-amber-500/20"
            style={{ width: `${generationProgress}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-[#0D0D0F] border border-white/5 p-5 rounded-xl w-full text-left font-mono text-[11px] text-slate-400 space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">ИНСТРУМЕНТЫ DECKSY AI</span>
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className={`h-1.5 w-1.5 rounded-full ${generationProgress >= 25 ? 'bg-emerald-500 shadow-sm shadow-emerald-400' : 'bg-amber-500 animate-pulse'}`}></span>
            <span className={generationProgress >= 25 ? 'text-slate-500 line-through' : 'text-slate-300 font-bold'}>Формулирование Elevator Pitch</span>
          </div>
          <span className="text-[9px] text-slate-500">{generationProgress >= 25 ? 'Готово' : 'В процессе...'}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className={`h-1.5 w-1.5 rounded-full ${
              generationProgress >= 50 
                ? 'bg-emerald-500 shadow-sm shadow-emerald-400' 
                : generationProgress >= 25 
                  ? 'bg-amber-500 animate-pulse' 
                  : 'bg-slate-700'
            }`}></span>
            <span className={generationProgress >= 50 ? 'text-slate-500 line-through' : generationProgress >= 25 ? 'text-slate-200 font-bold' : 'text-slate-500'}>Расчет финансового TAM / SAM / SOM</span>
          </div>
          <span className="text-[9px] text-slate-500">{generationProgress >= 50 ? 'Готово' : generationProgress >= 25 ? 'В процессе...' : 'Ожидание'}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className={`h-1.5 w-1.5 rounded-full ${
              generationProgress >= 75 
                ? 'bg-emerald-500' 
                : generationProgress >= 50 
                  ? 'bg-amber-500 animate-pulse' 
                  : 'bg-slate-700'
            }`}></span>
            <span className={generationProgress >= 75 ? 'text-slate-500 line-through' : generationProgress >= 50 ? 'text-slate-200 font-bold' : 'text-slate-500'}>Дизайн адаптивных стилей (Кобальт/Светлый)</span>
          </div>
          <span className="text-[9px] text-slate-500">{generationProgress >= 75 ? 'Готово' : generationProgress >= 50 ? 'В процессе...' : 'Ожидание'}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className={`h-1.5 w-1.5 rounded-full ${
              generationProgress >= 95 
                ? 'bg-emerald-500' 
                : generationProgress >= 75 
                  ? 'bg-amber-500 animate-pulse' 
                  : 'bg-slate-700'
            }`}></span>
            <span className={generationProgress >= 95 ? 'text-slate-500 line-through' : generationProgress >= 75 ? 'text-slate-200 font-bold' : 'text-slate-500'}>Финальная сборка PPTX-шаблонов</span>
          </div>
          <span className="text-[9px] text-slate-500">{generationProgress >= 95 ? 'Готово' : generationProgress >= 75 ? 'В процессе...' : 'Ожидание'}</span>
        </div>
      </div>
    </motion.div>
  );
};
