import React from "react";
import { GripVertical, Plus, RefreshCw, ArrowRight, ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import type { OutlineSlide, PresentationOutline } from "../lib/outlineBuilder";
import type { ProjectBranding } from "../types";
import { SLIDE_TYPES } from "../lib/deckBuilder";

interface OutlinePageProps {
  idea: string;
  setIdea: (v: string) => void;
  branding: ProjectBranding;
  onBrandingChange: (patch: Partial<ProjectBranding>) => void;
  onLogoUpload: (file: File) => void;
  outline: PresentationOutline | null;
  isLoading: boolean;
  onRegenerate: () => void;
  onUpdateSlide: (index: number, patch: Partial<OutlineSlide>) => void;
  onAddSlide: () => void;
  onRemoveSlide: (index: number) => void;
  onContinue: () => void;
  onBack: () => void;
  isPro?: boolean;
}

export const OutlinePage: React.FC<OutlinePageProps> = ({
  idea,
  setIdea,
  branding,
  onBrandingChange,
  onLogoUpload,
  outline,
  isLoading,
  onRegenerate,
  onUpdateSlide,
  onAddSlide,
  onRemoveSlide,
  onContinue,
  onBack,
  isPro = false,
}) => {
  return (
    <motion.div
      id="screen-outline"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto space-y-6 pb-24"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-slate-400 hover:text-white flex items-center gap-1 text-xs cursor-pointer bg-transparent border-none"
        >
          <ChevronLeft className="h-4 w-4" />
          Назад
        </button>
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
          Шаг 3 · План презентации
        </span>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Presentation outline</h1>
        <p className="text-sm text-slate-400">
          Investor pitch: 12 слайдов. Данные из интервью — можно поправить перед генерацией.
        </p>
      </div>

      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-3">
        <p className="text-[10px] font-mono uppercase tracking-widest text-violet-300 font-bold">
          Брендинг из интервью
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500">Название компании / кофейни *</label>
            <input
              value={branding.companyName}
              onChange={(e) => onBrandingChange({ companyName: e.target.value })}
              placeholder="Например: Coffee Point"
              className="w-full rounded-lg border border-white/10 bg-[#1a1a1c] px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-400/40"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500">Подзаголовок / слоган</label>
            <input
              value={branding.tagline}
              onChange={(e) => onBrandingChange({ tagline: e.target.value })}
              placeholder="Быстрый утренний ритуал для района"
              className="w-full rounded-lg border border-white/10 bg-[#1a1a1c] px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-400/40"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500">Имя владельца / основателя *</label>
            <input
              value={branding.founderName}
              onChange={(e) => onBrandingChange({ founderName: e.target.value })}
              placeholder="Иван Петров"
              className="w-full rounded-lg border border-white/10 bg-[#1a1a1c] px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-400/40"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500">Роль</label>
            <input
              value={branding.founderRole}
              onChange={(e) => onBrandingChange({ founderRole: e.target.value })}
              placeholder="Основатель"
              className="w-full rounded-lg border border-white/10 bg-[#1a1a1c] px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-400/40"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-slate-500">Цитата / фраза бренда (для титульного слайда)</label>
          <input
            value={branding.quote}
            onChange={(e) => onBrandingChange({ quote: e.target.value })}
            placeholder="Кофе, который объединяет соседей"
            className="w-full rounded-lg border border-white/10 bg-[#1a1a1c] px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-400/40"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-slate-500">Пожелания по слайдам</label>
          <textarea
            value={branding.slideNotes || ""}
            onChange={(e) => onBrandingChange({ slideNotes: e.target.value })}
            placeholder="Например: на слайде команды — фото основателя, на продукте — скриншот приложения"
            rows={2}
            className="w-full rounded-lg border border-white/10 bg-[#1a1a1c] px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-400/40 resize-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-[10px] text-slate-500 shrink-0">Логотип</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onLogoUpload(f);
            }}
            className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-white/10 file:text-slate-200"
          />
          {branding.logoImage && (
            <img src={branding.logoImage} alt="logo" className="h-8 w-8 rounded-lg object-cover border border-white/10" />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
          Outline prompt
        </label>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-white/10 bg-[#1a1a1c] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-white/25 resize-none"
          placeholder="Опишите стартап или продукт..."
        />
        <p className="text-[10px] text-slate-600">Minimum 15 characters</p>
      </div>

      <button
        type="button"
        onClick={onRegenerate}
        disabled={isLoading || idea.trim().length < 15}
        className="w-full py-3 rounded-xl border border-white/15 bg-white/[0.03] text-sm text-slate-200 hover:bg-white/[0.06] disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        {isLoading ? "Генерирую план..." : "Regenerate outline"}
      </button>

      <div className="space-y-3">
        {isLoading && !outline && (
          <div className="text-center py-12 text-slate-500 text-sm">Собираю бизнес-план слайдов...</div>
        )}
        {outline?.slides.map((slide, index) => (
          <div
            key={slide.id}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex gap-3 group"
          >
            <div className="flex flex-col items-center gap-1 pt-1 text-slate-600">
              <GripVertical className="h-4 w-4 opacity-40" />
              <span className="text-xs font-mono font-bold text-slate-500">{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <input
                value={slide.title}
                onChange={(e) => onUpdateSlide(index, { title: e.target.value })}
                className="w-full bg-transparent border-none text-base font-medium text-white focus:outline-none"
              />
              {slide.bullets.length > 0 && (
                <ul className="space-y-1.5">
                  {slide.bullets.map((b, bi) => (
                    <li key={bi} className="flex gap-2">
                      <span className="text-slate-600 shrink-0">•</span>
                      <input
                        value={b}
                        onChange={(e) => {
                          const bullets = [...slide.bullets];
                          bullets[bi] = e.target.value;
                          onUpdateSlide(index, { bullets });
                        }}
                        className="flex-1 bg-transparent border-none text-sm text-slate-400 focus:outline-none focus:text-slate-200"
                      />
                    </li>
                  ))}
                </ul>
              )}
              {outline.slides.length > 10 && index >= 10 && (
                <button
                  type="button"
                  onClick={() => onRemoveSlide(index)}
                  className="text-[10px] text-red-400/80 hover:text-red-400 cursor-pointer bg-transparent border-none"
                >
                  Удалить слайд
                </button>
              )}
            </div>
            <div className="w-16 h-12 rounded-lg border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 shrink-0 hidden sm:block" />
          </div>
        ))}
      </div>

      {outline && isPro && outline.slides.length < 14 && (
        <button
          type="button"
          onClick={onAddSlide}
          className="text-sm text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
        >
          <Plus className="h-4 w-4" />
          Add slide
        </button>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-[#0D0D0F] via-[#0D0D0F] to-transparent">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#161618]/95 backdrop-blur-md px-5 py-3">
          <span className="text-sm text-slate-400">
            {outline?.slides.length ?? 0} slides total
          </span>
          <button
            type="button"
            onClick={onContinue}
            disabled={!outline || isLoading}
            className="px-6 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-slate-200 disabled:opacity-40 cursor-pointer border-none flex items-center gap-2"
          >
            Choose template
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
