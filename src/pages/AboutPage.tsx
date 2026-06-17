import React from "react";
import { Compass, ShieldAlert, Database, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Slide } from "../types";

export interface ExampleDeck {
  id: string;
  title: string;
  subtitle: string;
  idea: string;
  mode: any;
  style: 'cosmic-dark' | 'cobalt' | 'clean-light';
  industry: string;
  description: string;
  slides: Slide[];
}

interface AboutPageProps {
  onBackToGenerator: () => void;
  loadExampleDeck: (deck: ExampleDeck) => void;
  exampleDecks: ExampleDeck[];
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onBackToGenerator,
  loadExampleDeck,
  exampleDecks,
}) => {
  return (
    <motion.div
      id="screen-about"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-4xl mx-auto relative space-y-10 pb-20 pt-4 sm:pt-8"
    >
      {/* Elegant Background ambient glows */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#FF5D44]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="space-y-6">
        <button 
          onClick={onBackToGenerator}
          className="inline-flex items-center space-x-2 text-xs font-mono uppercase text-purple-400 hover:text-purple-300 transition-colors bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-sm cursor-pointer"
        >
          <span>← Вернуться к генерации</span>
        </button>

        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 bg-purple-950/20 border border-purple-500/25 px-3 py-1 rounded-full text-purple-400 text-[10px] font-mono uppercase font-bold">
            ✦ О ПРОЕКТЕ DECKSY.AI
          </div>
          <h2 className="text-4xl sm:text-5xl font-sans font-black tracking-tight text-white uppercase leading-none">
            Умная платформа <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-rose-400 to-[#FF5D44]">
              ВЕНЧУРНОГО МОДЕЛИРОВАНИЯ
            </span>
          </h2>
          <p className="text-sm leading-relaxed text-slate-300 max-w-3xl font-sans">
            DECKSY — это инновационный интерактивный инструмент для технологических фаундеров, объединяющий ИИ-экспертизу с признанными мировыми методологиями анализа стартапов. Мы помогаем структурировать хаотичные идеи в выверенные презентации, готовые к венчурным питчам.
          </p>
        </div>
      </div>

      {/* Visual Bento Grid of Capabilities */}
      <div className="grid sm:grid-cols-2 gap-6 pt-4">
        <div className="bg-[#121214] border border-white/5 hover:border-purple-500/20 p-6 rounded-2xl space-y-4 transition-all">
          <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Compass className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold uppercase text-white font-mono tracking-wider">ИИ-АССИСТЕНТ И ИНТЕРВЬЮ</h3>
          <p className="text-xs text-slate-400 leading-normal font-sans">
            Вместо заполнения длинных опросных анкет вы ведете живой диалог с ИИ-партнером в чате. Скептик-инвестор прощупывает жизнеспособность вашей идеи с разных ракурсов.
          </p>
        </div>

        <div className="bg-[#121214] border border-white/5 hover:border-purple-500/20 p-6 rounded-2xl space-y-4 transition-all">
          <div className="h-10 w-10 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold uppercase text-white font-mono tracking-wider">СТАТУС И УРОВЕНЬ ЖЕСТКОСТИ</h3>
          <p className="text-xs text-slate-400 leading-normal font-sans">
            Выбирайте подходящий режим взаимодействия: от дружелюбного быстрого сбора параметров («Мини») до жесткого стресс-теста от профессионального инвестора («Акула венчура»).
          </p>
        </div>

        <div className="bg-[#121214] border border-white/5 hover:border-purple-500/20 p-6 rounded-2xl space-y-4 transition-all">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Database className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold uppercase text-white font-mono tracking-wider">КОБАЛЬТОВАЯ И СВЕТЛАЯ СТИЛИСТИКИ</h3>
          <p className="text-xs text-slate-400 leading-normal font-sans">
            Наш генератор слайдов не использует шаблонные решения. Слайды собираются динамически по изящным дизайн-системам (Cobalt Slate, Space Cosmic, Light Clean).
          </p>
        </div>

        <div className="bg-[#121214] border border-white/5 hover:border-purple-500/20 p-6 rounded-2xl space-y-4 transition-all">
          <div className="h-10 w-10 rounded-lg bg-[#FF5D44]/10 border border-[#FF5D44]/20 flex items-center justify-center text-[#FF5D44]">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold uppercase text-white font-mono tracking-wider">ЭКСПОРТ И ПЕРСОНАЛИЗАЦИЯ</h3>
          <p className="text-xs text-slate-400 leading-normal font-sans">
            Каждый сгенерированный слайд доступен для интерактивного изменения, быстрого копирования текста или экспорта всей презентации в PPTX/PDF форматы без водяных знаков для PRO-пользователей.
          </p>
        </div>
      </div>

      {/* EXAMPLES OF PRESENTATIONS SECTION */}
      <div className="space-y-6 pt-4 relative z-10">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-emerald-950/20 border border-emerald-500/25 px-3 py-1 rounded-full text-emerald-400 text-[10px] font-mono uppercase font-bold text-emerald-400">
            ✦ ИНТЕРАКТИВНЫЕ ШАБЛОНЫ
          </div>
          <h3 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white uppercase">
            Примеры презентаций
          </h3>
          <p className="text-xs text-slate-400 font-sans max-w-2xl text-slate-400">
            Выберите любой из готовых прекрасных примеров ниже, чтобы мгновенно загрузить его в интерактивный редактор слайдов. Вы сможете полностью отредактировать любой текст, изменить дизайн-систему или протестировать речь спикера.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {exampleDecks.map((exDeck) => {
            return (
              <div 
                key={exDeck.id}
                className="bg-[#121214] border border-white/5 hover:border-emerald-500/20 rounded-2xl p-6 flex flex-col justify-between transition-all relative overflow-hidden group space-y-4"
              >
                {/* Ambient background accent based on suggested style */}
                {exDeck.style === 'cosmic-dark' && <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />}
                {exDeck.style === 'cobalt' && <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-blue-500/5 blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />}
                {exDeck.style === 'clean-light' && <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-purple-500/5 blur-2xl group-hover:bg-purple-500/10 transition-colors pointer-events-none" />}

                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                      {exDeck.industry}
                    </span>
                    <span className={`text-[8px] font-mono uppercase font-extrabold tracking-widest ${
                      exDeck.style === 'cosmic-dark' ? 'text-emerald-400' : exDeck.style === 'cobalt' ? 'text-blue-400' : 'text-purple-400'
                    }`}>
                      {exDeck.style === 'cosmic-dark' ? '🟢 COSMIC SLATE' : exDeck.style === 'cobalt' ? '🔷 COBALT SLATE' : '⚪ SWISS LIGHT'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-white uppercase group-hover:text-emerald-400 transition-colors">
                      {exDeck.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {exDeck.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 font-sans leading-normal">
                    {exDeck.description}
                  </p>

                  {/* Slide previews indicators */}
                  <div className="space-y-2 pt-1">
                    <p className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-semibold">Состав презентации:</p>
                    <div className="flex gap-1">
                      {exDeck.slides.map((s, idx) => (
                        <div 
                          key={idx} 
                          className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 p-2 rounded text-center transition-all cursor-default"
                        >
                          <p className="text-[7px] font-mono uppercase font-bold text-slate-400 leading-none">Слайд {idx + 1}</p>
                          <p className="text-[8px] text-white truncate font-bold mt-1 uppercase tracking-tight">
                            {idx === 0 ? "Введение" : idx === 1 ? "Решение" : "Рынок"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 relative z-10">
                  <button
                    onClick={() => loadExampleDeck(exDeck)}
                    className="w-full bg-white text-black hover:bg-emerald-400 hover:text-black font-extrabold uppercase text-[10px] tracking-widest py-3 rounded-lg cursor-pointer transition-all flex items-center justify-center space-x-1 border border-transparent shadow-md"
                  >
                    <span>Редактировать шаблон →</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team or vision stat row */}
      <div className="p-6 bg-purple-950/10 border border-purple-500/10 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h4 className="text-xs font-mono font-bold text-white uppercase font-bold">Наша Миссия</h4>
          <p className="text-xs text-slate-350 leading-normal font-sans max-w-xl">
            Демократизировать доступ к качественному венчурному консалтингу. Позволить каждому основателю упаковать свою мысль так же красиво и дорого, как это делают агентства с крупными бюджетами.
          </p>
        </div>
        <button 
          onClick={onBackToGenerator}
          className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold uppercase text-[10px] tracking-widest px-6 py-3 rounded-lg cursor-pointer transition-all self-start md:self-auto shrink-0 border-transparent border"
        >
          Создать Питч-Дек →
        </button>
      </div>
    </motion.div>
  );
};
