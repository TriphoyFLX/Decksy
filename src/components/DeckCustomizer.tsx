import React from "react";
import { Palette, RotateCcw, Sparkles } from "lucide-react";
import type { DeckThemeCustom } from "../lib/deckTheme";
import { DEFAULT_CUSTOM_THEMES, type StyleKey } from "../lib/deckTheme";

interface DeckCustomizerProps {
  selectedStyle: StyleKey;
  customTheme: DeckThemeCustom;
  useCustomBranding?: boolean;
  onToggleBranding?: (v: boolean) => void;
  onChange: (theme: DeckThemeCustom) => void;
  onReset: () => void;
  isPro: boolean;
}

const FIELDS: { key: keyof DeckThemeCustom; label: string; hint?: string }[] = [
  { key: "primary", label: "Основной цвет", hint: "Заголовки, акценты" },
  { key: "accent", label: "Акцент", hint: "Метрики, кнопки" },
  { key: "background", label: "Фон слайда" },
  { key: "surface", label: "Фон карточек" },
  { key: "text", label: "Текст" },
  { key: "textMuted", label: "Вторичный текст" },
];

export const DeckCustomizer: React.FC<DeckCustomizerProps> = ({
  selectedStyle,
  customTheme,
  useCustomBranding = false,
  onToggleBranding,
  onChange,
  onReset,
  isPro,
}) => {
  if (!isPro) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-left">
        <div className="flex items-center gap-2 text-amber-400 mb-2">
          <Palette className="h-4 w-4" />
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Кастомизация — Pro</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          На тарифе Pro вы сможете менять цвета, фон и стиль каждой презентации под свой бренд.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#0D0D0F] p-4 space-y-4 text-left">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-white">
            Брендинг презентации
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onToggleBranding && (
            <label className="flex items-center gap-1.5 text-[9px] text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={useCustomBranding}
                onChange={(e) => onToggleBranding(e.target.checked)}
                className="rounded border-white/20"
              />
              Свои цвета
            </label>
          )}
          <button
          type="button"
          onClick={onReset}
          className="text-[9px] text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded border border-white/10 cursor-pointer bg-transparent"
        >
          <RotateCcw className="h-3 w-3" />
          Сброс
        </button>
        </div>
      </div>

      {!useCustomBranding && (
        <p className="text-[10px] text-slate-500">
          Используются цвета шаблона ({selectedStyle}). Включите «Свои цвета» для ручной настройки.
        </p>
      )}

      <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${!useCustomBranding ? "opacity-40 pointer-events-none" : ""}`}>
        {FIELDS.map(({ key, label, hint }) => (
          <label key={key} className="space-y-1.5 block">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono block">{label}</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customTheme[key] || DEFAULT_CUSTOM_THEMES[selectedStyle][key]}
                onChange={(e) => onChange({ ...customTheme, [key]: e.target.value })}
                className="h-8 w-10 rounded border border-white/10 bg-transparent cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={customTheme[key] || ""}
                onChange={(e) => onChange({ ...customTheme, [key]: e.target.value })}
                className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded px-2 py-1.5 text-[10px] text-white font-mono focus:outline-none focus:border-violet-400/50"
              />
            </div>
            {hint && <span className="text-[8px] text-slate-600">{hint}</span>}
          </label>
        ))}
      </div>

      <div
        className="rounded-lg p-3 border border-white/10 text-center"
        style={{
          background: `linear-gradient(135deg, ${customTheme.background} 0%, ${customTheme.surface} 100%)`,
          borderColor: customTheme.primary + "33",
        }}
      >
        <p className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: customTheme.textMuted }}>
          Превью
        </p>
        <p className="text-sm font-black uppercase" style={{ color: customTheme.text }}>
          Заголовок слайда
        </p>
        <p className="text-[10px] mt-1" style={{ color: customTheme.textMuted }}>
          Текст и метрики
        </p>
        <span
          className="inline-block mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: customTheme.primary + "22", color: customTheme.primary }}
        >
          Акцент
        </span>
      </div>
    </div>
  );
};
