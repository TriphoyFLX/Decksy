import React from "react";
import {
  BarChart3,
  Clock,
  TrendingUp,
  User,
  Zap,
  Wallet,
  Shield,
  Smartphone,
  Gift,
  Check,
  Search,
  CalendarCheck,
  QrCode,
  Camera,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import type { SlideVisualData } from "../types";
import { PremiumImage } from "./slideVisuals";
import type { GlassSurface } from "./apexSlides";

type InlineRenderer = (text: string, index: number, className: string, Tag?: React.ElementType) => React.ReactNode;

const creamCardClass = "rounded-2xl border backdrop-blur-[18px]";
const apexTileClass = "rounded-[1.75rem] border-0 overflow-hidden relative";

const creamCardStyle = (forExport?: boolean): React.CSSProperties => ({
  background: forExport ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.045)",
  borderColor: "rgba(255,255,255,0.14)",
  boxShadow: forExport ? undefined : "inset 0 1px 0 rgba(255,255,255,0.06)",
  backdropFilter: forExport ? undefined : "blur(18px)",
  WebkitBackdropFilter: forExport ? undefined : "blur(18px)",
});

const creamStrongStyle = (forExport?: boolean): React.CSSProperties => ({
  ...creamCardStyle(forExport),
  background: forExport ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.08)",
});

function alpha(hex: string, opacity: string): string {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return `${hex}${opacity}`;
  return `#${normalized}${opacity}`;
}

function tileClass(glass: GlassSurface) {
  return glass.creamGlass ? creamCardClass : apexTileClass;
}

function tileStyle(glass: GlassSurface, forExport?: boolean, strong = false): React.CSSProperties {
  if (glass.creamGlass) {
    return strong ? creamStrongStyle(forExport) : creamCardStyle(forExport);
  }
  if (strong) {
    return {
      background: glass.hasImageBg
        ? `linear-gradient(145deg, ${alpha(glass.accent, "40")}, rgba(12,12,18,0.78))`
        : `linear-gradient(145deg, ${alpha(glass.accent, "33")}, #1a1520)`,
      borderColor: "transparent",
      boxShadow: "0 18px 44px rgba(0,0,0,0.4)",
      backdropFilter: forExport || !glass.hasImageBg ? undefined : "blur(28px)",
      WebkitBackdropFilter: forExport || !glass.hasImageBg ? undefined : "blur(28px)",
    };
  }
  return {
    background: glass.hasImageBg ? "rgba(14, 14, 20, 0.74)" : "#141416",
    borderColor: "transparent",
    boxShadow: "0 16px 40px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.07)",
    backdropFilter: forExport || !glass.hasImageBg ? undefined : "blur(28px)",
    WebkitBackdropFilter: forExport || !glass.hasImageBg ? undefined : "blur(28px)",
  };
}

function parseItems(content: string[], parseBullet: (s: string) => { label: string; detail: string }) {
  return content.map((item, i) => {
    const parsed = parseBullet(item);
    return {
      raw: item,
      label: parsed.label || `Пункт ${i + 1}`,
      detail: parsed.detail || item,
      number: item.match(/(?:\$|₽)?[\d,.]+\s*(?:%|x|млрд|млн|тыс|B|M|K|₽)?/i)?.[0] || "",
    };
  });
}

export const CreamChip: React.FC<{ children: React.ReactNode; glass: GlassSurface }> = ({ children, glass }) => (
  <span
    className="inline-flex items-center gap-1.5 text-[7px] sm:text-[8px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-full border font-mono"
    style={{ borderColor: "rgba(255,255,255,0.14)", color: glass.mutedClass.includes("f5f3ee") ? "rgba(245,243,238,0.62)" : undefined }}
  >
    {children}
  </span>
);

export const CreamHero: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  content: string[];
  image?: string;
  founderName?: React.ReactNode;
  founderRole?: string;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ title, subtitle, content, image, founderName, founderRole, glass, forExport }) => {
  const founderText =
    typeof founderName === "string"
      ? founderName
      : content.find((c) => /основатель|ceo|founder|владелец/i.test(c))?.replace(/^[^:]+:\s*/i, "") || "Имя Фамилия";
  const roleText = founderRole || "Founder & CEO";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-auto items-center min-h-0 flex-1 overflow-hidden font-[Manrope,sans-serif]">
      <div className="text-left min-w-0">
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-full shrink-0"
            style={{ background: "linear-gradient(135deg,#eae6db,#b9b2a1)" }}
          />
          <span className={`text-[10px] font-bold tracking-tight ${glass.titleClass}`}>LOGO</span>
        </div>
        <h1
          className={`font-extrabold leading-[0.95] tracking-tight ${glass.titleClass}`}
          style={{ fontSize: forExport ? "2.4rem" : "clamp(1.35rem, 4vw, 2rem)" }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p className={`mt-3 text-[10px] sm:text-xs leading-relaxed max-w-md ${glass.mutedClass}`}>{subtitle}</p>
        ) : (
          <p className={`mt-3 text-[10px] italic ${glass.mutedClass}`}>Слоган в одно предложение</p>
        )}
        <div className="mt-5 flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-full ${tileClass(glass)} flex items-center justify-center`} style={tileStyle(glass, forExport, true)}>
            <User className={`h-4 w-4 ${glass.mutedClass}`} />
          </div>
          <div>
            <div className={`text-[10px] font-medium ${glass.titleClass}`}>{founderText}</div>
            <div className={`text-[8px] ${glass.mutedClass}`}>{roleText}</div>
          </div>
        </div>
      </div>
      {image ? (
        <div className={`${tileClass(glass)} p-1.5 overflow-hidden aspect-square md:aspect-[4/5] max-h-full`} style={tileStyle(glass, forExport)}>
          <PremiumImage src={image} variant="hero" className="!rounded-xl !min-h-[120px]" />
        </div>
      ) : (
        <div
          className={`${tileClass(glass)} aspect-square md:aspect-[4/5] flex items-center justify-center relative overflow-hidden`}
          style={tileStyle(glass, forExport)}
        >
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <span className="relative z-10 text-[8px] font-mono uppercase tracking-widest text-white/35">Изображение продукта</span>
        </div>
      )}
    </div>
  );
};

export const CreamProblemStatement: React.FC<{
  title: React.ReactNode;
  content: string[];
  image?: string;
  problemSolutions?: SlideVisualData["problemSolutions"];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, problemSolutions, parseBullet, renderBullet, renderLabel, glass, forExport }) => {
  const pairs = (() => {
    if (problemSolutions?.length) {
      return problemSolutions.slice(0, 4).map((p, i) => {
        const left = parseBullet(p.problem);
        const right = parseBullet(p.solution);
        return {
          problemLabel: p.problemLabel || left.label || `Боль ${i + 1}`,
          problem: left.detail || p.problem,
          solutionLabel: p.solutionLabel || right.label || "Решение",
          solution: right.detail || p.solution,
        };
      });
    }
    return content.slice(0, 4).map((raw, i) => {
      const parts = raw.split(/\s*(?:→|->|—\s*решение|\/\s*решение)\s*/i);
      if (parts.length >= 2 && parts[1]?.trim()) {
        const left = parseBullet(parts[0]);
        const right = parseBullet(parts[1]);
        return {
          problemLabel: left.label || `Боль ${i + 1}`,
          problem: left.detail || parts[0],
          solutionLabel: right.label || "Решение",
          solution: right.detail || parts[1],
        };
      }
      const parsed = parseBullet(raw);
      return {
        problemLabel: parsed.label || `Боль ${i + 1}`,
        problem: parsed.detail || raw,
        solutionLabel: "Решение",
        solution: "Закрываем эту боль продуктом и процессом",
      };
    });
  })();

  const rows = Math.min(Math.max(pairs.length, 1), 4);

  return (
    <div className="flex flex-col gap-2.5 my-auto min-h-0 flex-1 overflow-hidden font-[Manrope,sans-serif]">
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 px-0.5 shrink-0">
        <CreamChip glass={glass}>Проблема</CreamChip>
        <span className={`text-[8px] self-center ${glass.mutedClass}`}>→</span>
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-wide w-fit"
          style={{ background: alpha(glass.success, "28"), color: glass.success }}
        >
          Как решаем
        </span>
      </div>

      <div className="grid flex-1 min-h-0 gap-2" style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}>
        {pairs.map((pair, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto_1fr] gap-2 items-stretch min-h-0">
            <div className={`${tileClass(glass)} p-3 flex flex-col justify-center gap-1`} style={tileStyle(glass, forExport)}>
              <p className={`text-[9px] font-bold line-clamp-1 ${glass.titleClass}`}>
                {renderLabel ? renderLabel(pair.problemLabel, i, "") : pair.problemLabel}
              </p>
              <p className={`text-[8.5px] leading-snug line-clamp-3 ${glass.mutedClass}`}>
                {renderBullet(pair.problem, i, "")}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <span
                className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: alpha(glass.accent, "33"), color: glass.accent }}
              >
                →
              </span>
            </div>
            <div className={`${tileClass(glass)} p-3 flex flex-col justify-center gap-1`} style={tileStyle(glass, forExport, true)}>
              <p className="text-[9px] font-bold line-clamp-1" style={{ color: glass.success }}>
                {renderLabel ? renderLabel(pair.solutionLabel, i + 10, "") : pair.solutionLabel}
              </p>
              <p className={`text-[8.5px] leading-snug line-clamp-3 ${glass.bodyClass}`}>
                {renderBullet(pair.solution, i + 10, "")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CreamStatTriplet: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  extractNumber: (s: string) => string;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, parseBullet, extractNumber, renderLabel, glass, forExport }) => {
  const items = parseItems(content, parseBullet).slice(0, 3);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-auto min-h-0 flex-1 font-[Manrope,sans-serif]">
      {items.map((item, i) => (
        <div key={i} className={`${tileClass(glass)} p-4 flex flex-col`} style={tileStyle(glass, forExport)}>
          <div className="font-extrabold text-2xl sm:text-3xl tracking-tight" style={{ color: glass.accent }}>
            {extractNumber(item.raw) || item.number || ["70%", "$1.2B", "3x"][i]}
          </div>
          <p className={`mt-2 text-[8.5px] leading-relaxed flex-1 ${glass.mutedClass}`}>{item.detail}</p>
          <div className="h-px my-3 bg-white/10" />
          <CreamChip glass={glass}>
            {renderLabel ? renderLabel(item.label, i, "") : item.label || `Источник ${i + 1}`}
          </CreamChip>
        </div>
      ))}
    </div>
  );
};

export const CreamProductSteps: React.FC<{
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  content: string[];
  cardImages?: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ title, subtitle, content, cardImages, parseBullet, renderBullet, renderLabel, glass, forExport }) => {
  const stepIcons: LucideIcon[] = [Search, CalendarCheck, QrCode, Camera];
  const stepHints = [
    ["Геофильтр", "Тип техники", "Цена/час"],
    ["Слот онлайн", "Мгновенно", "Предоплата"],
    ["QR на объекте", "Страховка", "Договор"],
    ["Фото-отчёт", "Авто-закрытие", "Рейтинг"],
  ];
  const items = parseItems(content, parseBullet).slice(0, 4);
  while (items.length < 4) {
    const n = items.length + 1;
    items.push({
      raw: "",
      label: `Шаг ${n}`,
      detail: "Ключевой этап пользовательского пути",
      number: "",
    });
  }

  return (
    <div className="flex flex-col gap-2.5 my-auto min-h-0 flex-1 overflow-hidden font-[Manrope,sans-serif]">
      <div className="shrink-0 flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <CreamChip glass={glass}>Продукт · Journey</CreamChip>
          {title && (
            <h2
              className={`font-extrabold tracking-tight leading-[1.05] mt-2 ${glass.titleClass}`}
              style={{ fontSize: forExport ? "1.35rem" : "clamp(1rem, 2.4vw, 1.3rem)" }}
            >
              {title}
            </h2>
          )}
          {subtitle && <p className={`text-[9px] mt-1 line-clamp-1 ${glass.mutedClass}`}>{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1.5">
          {items.map((_, i) => (
            <React.Fragment key={i}>
              <span
                className="h-6 min-w-6 px-1.5 rounded-full text-[8px] font-bold flex items-center justify-center"
                style={{
                  background: i === 0 ? glass.accent : alpha(glass.accent, "22"),
                  color: i === 0 ? "#1a120c" : glass.accent,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {i < items.length - 1 && (
                <ArrowRight className="h-3 w-3 text-white/25" strokeWidth={2} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div
        className="grid flex-1 min-h-0 gap-2.5"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item, i) => {
          const Icon = stepIcons[i] || Zap;
          const hints = stepHints[i] || ["Готово", "Быстро", "Надёжно"];
          const hasImg = Boolean(cardImages?.[i]);
          return (
            <div
              key={i}
              className={`${tileClass(glass)} p-3 flex flex-col min-h-0 h-full`}
              style={i === 0 ? tileStyle(glass, forExport, true) : tileStyle(glass, forExport)}
            >
              {hasImg ? (
                <div className="rounded-xl overflow-hidden h-16 shrink-0 mb-2.5">
                  <PremiumImage src={cardImages![i]} variant="thumb" className="!min-h-16 !h-16 !rounded-xl" />
                </div>
              ) : (
                <div
                  className="relative rounded-xl h-16 shrink-0 mb-2.5 overflow-hidden flex items-center justify-center"
                  style={{
                    background: `linear-gradient(145deg, ${alpha(glass.accent, "33")}, rgba(255,255,255,0.04) 55%, ${alpha(glass.secondary || glass.accent, "22")})`,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.18), transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.08), transparent 45%)",
                    }}
                  />
                  <div
                    className="relative w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "rgba(0,0,0,0.35)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: glass.accent,
                    }}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </div>
                  <span
                    className="absolute top-1.5 left-1.5 text-[7px] font-mono font-bold px-1.5 py-0.5 rounded-md"
                    style={{ background: "rgba(0,0,0,0.45)", color: "rgba(245,243,238,0.75)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[8px] font-mono font-bold" style={{ color: glass.accent }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className={`text-[11px] font-bold leading-tight line-clamp-1 ${glass.titleClass}`}>
                  {renderLabel ? renderLabel(item.label, i, "") : item.label}
                </h3>
              </div>

              <p className={`text-[8.5px] mt-1.5 leading-snug line-clamp-3 flex-1 ${glass.mutedClass}`}>
                {renderBullet(item.detail, i, "")}
              </p>

              <div className="mt-2 pt-2 border-t border-white/10 space-y-1 shrink-0">
                {hints.map((hint) => (
                  <div key={hint} className="flex items-center gap-1.5 text-[8px] text-white/70">
                    <Check className="h-2.5 w-2.5 shrink-0" style={{ color: glass.success }} strokeWidth={3} />
                    <span className="line-clamp-1">{hint}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const CreamFeatureCards: React.FC<{
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ title, subtitle, content, parseBullet, renderBullet, renderLabel, glass, forExport }) => {
  const icons: LucideIcon[] = [Wallet, TrendingUp, Gift, Smartphone, Shield, Zap, Clock];
  const items = parseItems(content, parseBullet).slice(0, 4);
  while (items.length < 4) {
    items.push({
      raw: "",
      label: `Фича ${items.length + 1}`,
      detail: "Ключевое преимущество продукта",
      number: "",
    });
  }

  const [hero, ...rest] = items;
  const HeroIcon = icons[0];

  const pointsFor = (detail: string): string[] => {
    const parts = detail
      .split(/[,;•|]/)
      .map((s) => s.replace(/^[\s\-–—]+/, "").trim())
      .filter((s) => s.length > 2);
    if (parts.length >= 2) return parts.slice(0, 3);
    return [detail].filter(Boolean).slice(0, 1);
  };

  return (
    <div className="flex flex-col gap-2.5 my-auto min-h-0 flex-1 overflow-hidden font-[Manrope,sans-serif]">
      <div className="shrink-0 flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <CreamChip glass={glass}>Решение</CreamChip>
          {title && (
            <h2
              className={`font-extrabold tracking-tight leading-[1.05] mt-2 ${glass.titleClass}`}
              style={{ fontSize: forExport ? "1.35rem" : "clamp(1rem, 2.4vw, 1.3rem)" }}
            >
              {title}
            </h2>
          )}
          {subtitle && <p className={`text-[9px] mt-1 line-clamp-1 ${glass.mutedClass}`}>{subtitle}</p>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["Без покупки", "Онлайн", "SLA"].map((t) => (
            <span
              key={t}
              className="text-[7px] uppercase tracking-wider font-bold px-2 py-1 rounded-full"
              style={{ background: alpha(glass.accent, "28"), color: glass.accent }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div
        className="grid flex-1 min-h-0 gap-2.5"
        style={{
          gridTemplateColumns: "1.15fr 1fr 1fr",
          gridTemplateRows: "1.2fr 1fr",
        }}
      >
        {/* Hero feature */}
        <div
          className={`${tileClass(glass)} p-3.5 flex flex-col justify-between min-h-0`}
          style={{ ...tileStyle(glass, forExport, true), gridColumn: "1", gridRow: "1 / span 2" }}
        >
          <div className="flex items-start justify-between gap-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: alpha(glass.accent, "28"), color: glass.accent }}
            >
              <HeroIcon className="h-5 w-5" strokeWidth={1.6} />
            </div>
            {hero.number && (
              <span className="text-2xl font-black tracking-tight leading-none" style={{ color: glass.accent }}>
                {hero.number}
              </span>
            )}
          </div>
          <div className="mt-3 min-h-0">
            <h3 className={`text-[13px] font-bold leading-tight ${glass.titleClass}`}>
              {renderLabel ? renderLabel(hero.label, 0, "") : hero.label}
            </h3>
            <p className={`text-[9px] mt-1.5 leading-relaxed line-clamp-3 ${glass.mutedClass}`}>
              {renderBullet(hero.detail, 0, "")}
            </p>
            <ul className="mt-3 space-y-1.5">
              {pointsFor(hero.detail).map((pt, pi) => (
                <li key={pi} className={`flex gap-1.5 text-[8.5px] leading-snug ${glass.bodyClass}`}>
                  <Check className="h-3 w-3 shrink-0 mt-0.5" style={{ color: glass.success }} strokeWidth={2.5} />
                  <span className="line-clamp-2">{pt}</span>
                </li>
              ))}
              {pointsFor(hero.detail).length < 2 && (
                <>
                  <li className={`flex gap-1.5 text-[8.5px] ${glass.bodyClass}`}>
                    <Check className="h-3 w-3 shrink-0 mt-0.5" style={{ color: glass.success }} strokeWidth={2.5} />
                    Прозрачный тариф без скрытых платежей
                  </li>
                  <li className={`flex gap-1.5 text-[8.5px] ${glass.bodyClass}`}>
                    <Check className="h-3 w-3 shrink-0 mt-0.5" style={{ color: glass.success }} strokeWidth={2.5} />
                    Оплата и договор в одном потоке
                  </li>
                </>
              )}
            </ul>
          </div>
          <div className="mt-3 pt-2 border-t border-white/10 flex flex-wrap gap-1">
            {["Цена", "Скорость", "Доверие"].map((chip) => (
              <span
                key={chip}
                className="text-[7px] px-1.5 py-0.5 rounded-md font-medium"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(245,243,238,0.7)" }}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        {rest.slice(0, 3).map((item, i) => {
          const Icon = icons[i + 1] || Zap;
          const idx = i + 1;
          const points = pointsFor(item.detail);
          return (
            <div
              key={idx}
              className={`${tileClass(glass)} p-3 flex flex-col min-h-0 gap-1.5`}
              style={{
                ...tileStyle(glass, forExport),
                gridColumn: i === 2 ? "2 / span 2" : String(i + 2),
                gridRow: i < 2 ? "1" : "2",
              }}
            >
              <div className="flex items-center justify-between gap-2 shrink-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: alpha(glass.accent, "22"), color: glass.accent }}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.7} />
                </div>
                {item.number ? (
                  <span className="text-lg font-black tracking-tight" style={{ color: glass.accent }}>
                    {item.number}
                  </span>
                ) : (
                  <span className="text-[8px] font-mono text-white/35">{String(idx + 1).padStart(2, "0")}</span>
                )}
              </div>
              <h3 className={`text-[11px] font-bold leading-tight line-clamp-1 ${glass.titleClass}`}>
                {renderLabel ? renderLabel(item.label, idx, "") : item.label}
              </h3>
              <p className={`text-[8.5px] leading-snug line-clamp-2 ${glass.mutedClass}`}>
                {renderBullet(item.detail, idx, "")}
              </p>
              <ul className="mt-auto space-y-1 pt-1">
                {(points.length > 1 ? points.slice(0, 2) : [`${item.label}: готово к продакшену`, "Встроено в продукт"]).map(
                  (pt, pi) => (
                    <li key={pi} className="flex gap-1.5 text-[8px] leading-snug text-white/65">
                      <span style={{ color: glass.success }}>✓</span>
                      <span className="line-clamp-1">{pt}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const CreamMarketStack: React.FC<{
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  content: string[];
  metrics?: SlideVisualData["metrics"];
  parseBullet: (s: string) => { label: string; detail: string };
  extractNumber: (s: string) => string;
  renderBullet?: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({
  title,
  subtitle,
  content,
  metrics,
  parseBullet,
  extractNumber,
  renderBullet,
  renderLabel,
  glass,
  forExport,
}) => {
  const parsed = parseItems(content, parseBullet);
  const tamLabels = ["TAM", "SAM", "SOM"];
  const widths = ["100%", "62%", "28%"];
  const scopes = ["Весь рынок РФ", "Города-миллионники", "Пилот 24 мес"];

  const metricItems = tamLabels.map((label, i) => {
    const fromMetrics = metrics?.[i];
    const fromContent = parsed.find((p) => p.label.toUpperCase() === label) || parsed[i];
    const value =
      fromMetrics?.value ||
      (fromContent ? extractNumber(fromContent.raw) || fromContent.number : "") ||
      ["10 млрд ₽", "1.2 млрд ₽", "80 млн ₽"][i];
    const detail =
      fromContent?.detail?.replace(value, "").replace(/^[\s—\-–:]+/, "").trim() ||
      [
        "Рынок аренды спецтехники",
        "B2B подрядчики в миллионниках",
        "Цель выручки в 3 городах",
      ][i];
    return {
      label: fromMetrics?.label || label,
      value,
      detail,
      highlight: Boolean(fromMetrics?.highlight) || i === 2,
      width: widths[i],
      scope: scopes[i],
    };
  });

  const growthItem =
    parsed.find((p) => /рост|cagr|yoy|\+/i.test(`${p.label} ${p.detail} ${p.raw}`)) || parsed[3];
  const growthValue =
    (growthItem && (extractNumber(growthItem.raw) || growthItem.number)) || "+12% YoY";
  const growthDetail =
    growthItem?.detail ||
    growthItem?.raw ||
    "Рынок аренды растёт на фоне удорожания техники и нехватки парка";

  const drivers = [
    {
      tag: "CAGR",
      title: growthValue,
      text: growthDetail.replace(growthValue, "").replace(/^[\s—\-–:]+/, "").trim() || growthDetail,
    },
    {
      tag: "ФОКУС",
      title: "B2B подрядчики",
      text: metricItems[1]?.detail || "Города-миллионники, сезонные и разовые работы",
    },
    {
      tag: "ВЕДЖ",
      title: metricItems[2]?.value || "80 млн ₽",
      text: metricItems[2]?.detail || "Пилот в 3 городах за 24 месяца",
    },
  ];

  return (
    <div className="flex flex-col gap-2.5 my-auto min-h-0 flex-1 overflow-hidden font-[Manrope,sans-serif]">
      <div className="shrink-0 flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <CreamChip glass={glass}>Рынок · TAM / SAM / SOM</CreamChip>
          {title && (
            <h2
              className={`font-extrabold tracking-tight leading-[1.05] mt-2 ${glass.titleClass}`}
              style={{ fontSize: forExport ? "1.35rem" : "clamp(1rem, 2.4vw, 1.3rem)" }}
            >
              {title}
            </h2>
          )}
          {subtitle && <p className={`text-[9px] mt-1 line-clamp-1 ${glass.mutedClass}`}>{subtitle}</p>}
        </div>
        <div
          className={`${tileClass(glass)} px-3 py-2 flex items-center gap-2 shrink-0`}
          style={tileStyle(glass, forExport, true)}
        >
          <TrendingUp className="h-3.5 w-3.5" style={{ color: glass.accent }} strokeWidth={2} />
          <div>
            <p className="text-[7px] uppercase tracking-wider text-white/40 font-mono">Рост рынка</p>
            <p className="text-[12px] font-black leading-none" style={{ color: glass.accent }}>
              {growthValue}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1.05fr_1.2fr] gap-2.5 flex-1 min-h-0">
        {/* Funnel metrics */}
        <div className="flex flex-col gap-2 min-h-0">
          {metricItems.map((m, i) => (
            <div
              key={m.label}
              className={`${tileClass(glass)} p-3 flex flex-col justify-between min-h-0 flex-1`}
              style={m.highlight ? tileStyle(glass, forExport, true) : tileStyle(glass, forExport)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <CreamChip glass={glass}>{m.label}</CreamChip>
                  <span className="text-[7px] text-white/35 font-mono">{m.scope}</span>
                </div>
                <BarChart3 className="h-3.5 w-3.5 text-white/25" strokeWidth={1.5} />
              </div>
              <div className="mt-1.5">
                <div className="font-extrabold text-xl sm:text-2xl tracking-tight leading-none" style={{ color: glass.accent }}>
                  {m.value}
                </div>
                <p className={`text-[8px] mt-1.5 leading-snug line-clamp-2 ${glass.mutedClass}`}>
                  {renderBullet ? renderBullet(m.detail, i, "") : m.detail}
                </p>
              </div>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden bg-white/8">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: m.width,
                    background: `linear-gradient(90deg, ${glass.accent}, ${alpha(glass.accent, "66")})`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Drivers + narrative */}
        <div className="flex flex-col gap-2 min-h-0">
          <div className={`${tileClass(glass)} p-3.5 flex-1 min-h-0 flex flex-col`} style={tileStyle(glass, forExport, true)}>
            <h3 className={`text-[12px] font-extrabold ${glass.titleClass}`}>Большой и растущий рынок</h3>
            <p className={`text-[8.5px] mt-1.5 leading-relaxed line-clamp-3 ${glass.mutedClass}`}>
              Воронка от всего рынка аренды к реалистичному wedge за 24 месяца — без раздутого TAM.
            </p>
            <div className="mt-3 space-y-0 flex-1 min-h-0 flex flex-col justify-between">
              {drivers.map((d, i) => (
                <div key={d.tag} className="min-h-0">
                  {i > 0 && <div className="h-px bg-white/10 mb-2" />}
                  <div className="flex items-start gap-2.5">
                    <span
                      className="text-[7px] font-mono font-bold px-1.5 py-1 rounded-md shrink-0 mt-0.5"
                      style={{ background: alpha(glass.accent, "22"), color: glass.accent }}
                    >
                      {d.tag}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-[10px] font-bold leading-tight ${glass.titleClass}`}>
                        {renderLabel ? renderLabel(d.title, i + 10, "") : d.title}
                      </p>
                      <p className={`text-[8px] mt-0.5 leading-snug line-clamp-2 ${glass.mutedClass}`}>
                        {renderBullet ? renderBullet(d.text, i + 10, "") : d.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 shrink-0">
            {[
              { k: "Доля SAM", v: "~12%" },
              { k: "Wedge SOM", v: "~7%" },
              { k: "Горизонт", v: "24 мес" },
            ].map((s) => (
              <div key={s.k} className={`${tileClass(glass)} px-2.5 py-2 text-center`} style={tileStyle(glass, forExport)}>
                <p className="text-[7px] uppercase tracking-wider text-white/40">{s.k}</p>
                <p className="text-[11px] font-black mt-0.5" style={{ color: glass.accent }}>
                  {s.v}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CreamCompareMatrix: React.FC<{
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  content: string[];
  competitors?: SlideVisualData["competitors"];
  compareFeatures?: SlideVisualData["compareFeatures"];
  parseBullet: (s: string) => { label: string; detail: string };
  glass: GlassSurface;
  forExport?: boolean;
  editable?: boolean;
  onCompetitorsChange?: (competitors: NonNullable<SlideVisualData["competitors"]>) => void;
}> = ({
  title,
  subtitle,
  content,
  competitors,
  compareFeatures,
  parseBullet,
  glass,
  forExport,
  editable,
  onCompetitorsChange,
}) => {
  const players: NonNullable<SlideVisualData["competitors"]> = (() => {
    if (competitors?.length) {
      return competitors.slice(0, 4).map((c, i) => ({
        ...c,
        label: c.label || `Игрок ${i + 1}`,
        detail: c.detail || "",
        advantages: (c.advantages || []).slice(0, 4),
        rating: typeof c.rating === "number" ? c.rating : c.ours ? 9 : 4 + i,
      }));
    }
    return parseItems(content, parseBullet)
      .slice(0, 4)
      .map((item, i, arr) => {
        const ours = /наш|мы|nordflow|отлич/i.test(`${item.label} ${item.detail}`) || i === arr.length - 1;
        return {
          label: item.label,
          detail: item.detail,
          ours,
          rating: ours ? 9 : 4 + i,
          advantages: item.detail
            .split(/[,;•]/)
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 3),
        };
      });
  })();

  const cols = Math.min(Math.max(players.length, 2), 4);

  const featurePool = [
    "Почасовая аренда",
    "Онлайн-бронь",
    "Страховка / SLA",
    "Рейтинг",
    "Ассортимент",
    "Аналитика",
    "B2B контракты",
  ];

  const features =
    compareFeatures?.length
      ? compareFeatures.slice(0, 7).map((f) => ({
          label: f.label,
          scores: players.map((_, i) => f.scores[i] ?? false),
        }))
      : featurePool.slice(0, 6).map((label, fi) => ({
          label,
          scores: players.map((p) => {
            if (p.ours) return true;
            if (fi === 0) return "partial" as const;
            return fi % (players.indexOf(p) + 2) === 0 ? ("partial" as const) : false;
          }),
        }));

  const scoreNode = (value: boolean | "partial") => {
    if (value === true) {
      return (
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-black"
          style={{ background: alpha(glass.success, "28"), color: glass.success }}
        >
          ✓
        </span>
      );
    }
    if (value === "partial") {
      return (
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
          style={{ background: alpha(glass.warning, "28"), color: glass.warning }}
        >
          ~
        </span>
      );
    }
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[12px] text-white/25 bg-white/[0.04]">
        ✕
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-2.5 my-auto min-h-0 flex-1 overflow-hidden font-[Manrope,sans-serif]">
      <div className="shrink-0 flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <CreamChip glass={glass}>Конкуренция · почему мы</CreamChip>
          {title && (
            <h2
              className={`font-extrabold tracking-tight leading-[1.05] mt-2 ${glass.titleClass}`}
              style={{ fontSize: forExport ? "1.35rem" : "clamp(1rem, 2.4vw, 1.3rem)" }}
            >
              {title}
            </h2>
          )}
          {subtitle && <p className={`text-[9px] mt-1 line-clamp-1 ${glass.mutedClass}`}>{subtitle}</p>}
        </div>
        <div className="flex gap-1.5 text-[8px] items-center">
          <span className="flex items-center gap-1 text-white/55">
            <span className="h-4 w-4 rounded-full flex items-center justify-center text-[9px]" style={{ background: alpha(glass.success, "28"), color: glass.success }}>✓</span>
            есть
          </span>
          <span className="flex items-center gap-1 text-white/55">
            <span className="h-4 w-4 rounded-full flex items-center justify-center text-[9px]" style={{ background: alpha(glass.warning, "28"), color: glass.warning }}>~</span>
            частично
          </span>
          <span className="flex items-center gap-1 text-white/45">
            <span className="h-4 w-4 rounded-full flex items-center justify-center text-[9px] bg-white/[0.06]">✕</span>
            нет
          </span>
        </div>
      </div>

      {/* Player cards */}
      <div className="grid gap-2 shrink-0" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {players.map((p, i) => {
          const rating = p.rating ?? (p.ours ? 9 : 5);
          return (
            <div
              key={i}
              className={`${tileClass(glass)} p-2.5 flex flex-col gap-1.5 min-h-0`}
              style={p.ours ? tileStyle(glass, forExport, true) : tileStyle(glass, forExport)}
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!editable || forExport}
                  onClick={() => {
                    if (!editable || forExport) return;
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = () => {
                      const file = input.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result !== "string") return;
                        const next = players.map((row, idx) => (idx === i ? { ...row, logo: reader.result as string } : row));
                        onCompetitorsChange?.(next);
                      };
                      reader.readAsDataURL(file);
                    };
                    input.click();
                  }}
                  className={`h-10 w-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border ${
                    editable && !forExport ? "cursor-pointer" : "cursor-default"
                  }`}
                  style={{
                    borderColor: p.ours ? alpha(glass.accent, "55") : "rgba(255,255,255,0.12)",
                    background: p.ours ? alpha(glass.accent, "22") : "rgba(255,255,255,0.05)",
                  }}
                  title={editable ? "Загрузить лого" : p.label}
                >
                  {p.logo ? (
                    <img src={p.logo} alt={p.label} className="h-full w-full object-cover" />
                  ) : (
                    <span className={`text-sm font-black ${glass.titleClass}`}>{(p.label || "?").charAt(0)}</span>
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className={`text-[11px] font-bold truncate ${glass.titleClass}`}>{p.label}</p>
                    {p.ours && (
                      <span
                        className="text-[7px] uppercase font-bold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: glass.accent, color: "#1a120c" }}
                      >
                        мы
                      </span>
                    )}
                  </div>
                  <p className={`text-[8px] line-clamp-1 ${glass.mutedClass}`}>{p.tagline || p.detail}</p>
                </div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden bg-white/8">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${rating * 10}%`, background: p.ours ? glass.accent : "rgba(255,255,255,0.25)" }}
                />
              </div>
              {(p.advantages || []).slice(0, 2).map((adv, ai) => (
                <p key={ai} className="text-[8px] text-white/65 line-clamp-1 flex gap-1">
                  <span style={{ color: p.ours ? glass.success : "rgba(255,255,255,0.3)" }}>{p.ours ? "✓" : "·"}</span>
                  {adv}
                </p>
              ))}
            </div>
          );
        })}
      </div>

      {/* Feature matrix */}
      <div className={`${tileClass(glass)} flex-1 min-h-0 overflow-hidden flex flex-col`} style={tileStyle(glass, forExport)}>
        <div
          className="grid gap-0 px-3 py-2.5 border-b border-white/10 shrink-0 items-center"
          style={{
            gridTemplateColumns: `minmax(120px, 1.4fr) repeat(${cols}, minmax(0, 1fr))`,
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <span className="text-[9px] uppercase tracking-[0.14em] font-bold" style={{ color: glass.accent }}>
            Преимущество
          </span>
          {players.map((p, i) => (
            <span
              key={i}
              className={`text-[10px] font-bold text-center truncate px-1 ${p.ours ? "" : "text-white/50"}`}
              style={p.ours ? { color: glass.accent } : undefined}
            >
              {p.label}
            </span>
          ))}
        </div>
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {features.map((feat, fi) => (
            <div
              key={fi}
              className="grid gap-0 px-3 py-1.5 flex-1 items-center min-h-0 border-b border-white/[0.06] last:border-b-0"
              style={{
                gridTemplateColumns: `minmax(120px, 1.4fr) repeat(${cols}, minmax(0, 1fr))`,
                background: fi % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
              }}
            >
              <span className={`text-[11px] font-medium leading-snug line-clamp-2 pr-2 ${glass.bodyClass}`}>
                {feat.label}
              </span>
              {players.map((_, pi) => (
                <div key={pi} className="flex justify-center">
                  {scoreNode(feat.scores[pi] ?? false)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CreamBizSplit: React.FC<{
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  content: string[];
  pricing?: SlideVisualData["pricing"];
  parseBullet: (s: string) => { label: string; detail: string };
  extractNumber: (s: string) => string;
  renderBullet?: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ title, subtitle, content, pricing, parseBullet, extractNumber, renderBullet, renderLabel, glass, forExport }) => {
  const parsed = parseItems(content, parseBullet);
  const tiers =
    pricing?.slice(0, 3) ||
    [
      { label: "Старт", price: "100 ₽/ч", detail: "Лёгкий инструмент", featured: false },
      { label: "Про", price: "250 ₽/ч", detail: "Средний класс", featured: true },
      { label: "Хэви", price: "450 ₽/ч", detail: "Тяжёлая техника", featured: false },
    ];

  const commission = parsed.find((p) => /комисс/i.test(p.label + p.raw)) || parsed[2];
  const ltv = parsed.find((p) => /ltv|cac/i.test(p.label + p.raw)) || parsed[1];
  const loyalty = parsed.find((p) => /лояль|подписк/i.test(p.label + p.raw)) || parsed[3];
  const priceLine = parsed.find((p) => /цена/i.test(p.label)) || parsed[0];

  const unitCards = [
    {
      label: "Комиссия",
      value: (commission && (extractNumber(commission.raw) || commission.number)) || "18%",
      detail: commission?.detail || "с заказа владельцу парка",
    },
    {
      label: "LTV:CAC",
      value: (ltv && (extractNumber(ltv.raw) || ltv.number)) || "3x",
      detail: ltv?.detail || "цель после валидации каналов",
    },
    {
      label: "Загрузка",
      value: "40%",
      detail: "точка сходимости unit-экономики",
    },
    {
      label: "Подписка",
      value: (loyalty && (extractNumber(loyalty.raw) || "−10%")) || "−10%",
      detail: loyalty?.detail || "приоритет слотов для подрядчиков",
    },
  ];

  return (
    <div className="flex flex-col gap-2.5 my-auto min-h-0 flex-1 overflow-hidden font-[Manrope,sans-serif]">
      <div className="shrink-0 flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <CreamChip glass={glass}>Бизнес-модель</CreamChip>
          {title && (
            <h2 className={`font-extrabold tracking-tight leading-[1.05] mt-2 ${glass.titleClass}`} style={{ fontSize: forExport ? "1.35rem" : "clamp(1rem, 2.4vw, 1.3rem)" }}>
              {title}
            </h2>
          )}
          {subtitle && <p className={`text-[9px] mt-1 line-clamp-1 ${glass.mutedClass}`}>{subtitle}</p>}
        </div>
        <p className={`text-[9px] max-w-[40%] text-right line-clamp-2 ${glass.mutedClass}`}>
          {priceLine?.detail || "Почасовая аренда + комиссия маркетплейса"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2.5 shrink-0">
        {tiers.map((t, i) => (
          <div key={i} className={`${tileClass(glass)} p-3.5 flex flex-col gap-1.5`} style={t.featured ? tileStyle(glass, forExport, true) : tileStyle(glass, forExport)}>
            <div className="flex items-center justify-between">
              <CreamChip glass={glass}>{t.label}</CreamChip>
              {t.featured && (
                <span className="text-[7px] font-bold uppercase px-1.5 py-0.5 rounded-full" style={{ background: glass.accent, color: "#1a120c" }}>
                  hit
                </span>
              )}
            </div>
            <div className="text-2xl font-black tracking-tight" style={{ color: glass.accent }}>
              {t.price}
            </div>
            <p className={`text-[9px] leading-snug ${glass.mutedClass}`}>{t.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2 flex-1 min-h-0">
        {unitCards.map((u, i) => (
          <div key={u.label} className={`${tileClass(glass)} p-3 flex flex-col justify-between min-h-0`} style={tileStyle(glass, forExport)}>
            <CreamChip glass={glass}>{u.label}</CreamChip>
            <div className="text-xl font-black mt-2" style={{ color: glass.accent }}>
              {renderLabel ? renderLabel(u.value, i, "") : u.value}
            </div>
            <p className={`text-[8.5px] mt-1 leading-snug line-clamp-3 ${glass.mutedClass}`}>
              {renderBullet ? renderBullet(u.detail, i, "") : u.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CreamTractionBoard: React.FC<{
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  extractNumber: (s: string) => string;
  renderBullet?: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ title, subtitle, content, parseBullet, extractNumber, renderBullet, renderLabel, glass, forExport }) => {
  const items = parseItems(content, parseBullet).slice(0, 4);
  while (items.length < 4) {
    items.push({ raw: "", label: `Метрика ${items.length + 1}`, detail: "Сигнал спроса", number: "" });
  }
  const bars = [42, 68, 55, 82];
  const [hero, ...rest] = items;

  return (
    <div className="flex flex-col gap-2.5 my-auto min-h-0 flex-1 overflow-hidden font-[Manrope,sans-serif]">
      <div className="shrink-0 flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <CreamChip glass={glass}>Traction · early signals</CreamChip>
          {title && (
            <h2 className={`font-extrabold tracking-tight leading-[1.05] mt-2 ${glass.titleClass}`} style={{ fontSize: forExport ? "1.35rem" : "clamp(1rem, 2.4vw, 1.3rem)" }}>
              {title}
            </h2>
          )}
          {subtitle && <p className={`text-[9px] mt-1 line-clamp-1 ${glass.mutedClass}`}>{subtitle}</p>}
        </div>
      </div>

      <div className="grid grid-cols-[1.2fr_1fr] gap-2.5 flex-1 min-h-0">
        <div className={`${tileClass(glass)} p-4 flex flex-col justify-between min-h-0`} style={tileStyle(glass, forExport, true)}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[8px] uppercase tracking-wider text-white/40 font-mono">Hero metric</p>
              <p className={`text-[13px] font-bold mt-1 ${glass.titleClass}`}>
                {renderLabel ? renderLabel(hero.label, 0, "") : hero.label}
              </p>
            </div>
            <TrendingUp className="h-4 w-4" style={{ color: glass.accent }} />
          </div>
          <div className="text-4xl font-black tracking-tight" style={{ color: glass.accent }}>
            {extractNumber(hero.raw) || hero.number || "12"}
          </div>
          <p className={`text-[10px] leading-relaxed line-clamp-3 ${glass.mutedClass}`}>
            {renderBullet ? renderBullet(hero.detail, 0, "") : hero.detail}
          </p>
          <div className="mt-2 flex items-end gap-1.5 h-14">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%`, background: i === bars.length - 1 ? glass.accent : alpha(glass.accent, "44") }} />
            ))}
          </div>
        </div>

        <div className="grid grid-rows-3 gap-2 min-h-0">
          {rest.map((item, i) => (
            <div key={i} className={`${tileClass(glass)} p-3 flex items-center justify-between gap-2 min-h-0`} style={tileStyle(glass, forExport)}>
              <div className="min-w-0">
                <p className={`text-[11px] font-bold line-clamp-1 ${glass.titleClass}`}>
                  {renderLabel ? renderLabel(item.label, i + 1, "") : item.label}
                </p>
                <p className={`text-[8.5px] mt-0.5 line-clamp-2 ${glass.mutedClass}`}>
                  {renderBullet ? renderBullet(item.detail, i + 1, "") : item.detail}
                </p>
              </div>
              <div className="text-xl font-black shrink-0" style={{ color: glass.accent }}>
                {extractNumber(item.raw) || item.number || ["28%", "62", "50"][i]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CreamTeamRow: React.FC<{
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  content: string[];
  teamMembers?: SlideVisualData["teamMembers"];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ title, subtitle, content, teamMembers, parseBullet, renderBullet, glass, forExport }) => {
  const parsed = parseItems(content, parseBullet);
  const members = (teamMembers?.length ? teamMembers : parsed.map((item) => ({ name: item.label, role: "Role", image: "" }))).slice(0, 4);

  return (
    <div className="flex flex-col gap-2.5 my-auto min-h-0 flex-1 overflow-hidden font-[Manrope,sans-serif]">
      <div className="shrink-0">
        <CreamChip glass={glass}>Команда</CreamChip>
        {title && (
          <h2 className={`font-extrabold tracking-tight leading-[1.05] mt-2 ${glass.titleClass}`} style={{ fontSize: forExport ? "1.35rem" : "clamp(1rem, 2.4vw, 1.3rem)" }}>
            {title}
          </h2>
        )}
        {subtitle && <p className={`text-[9px] mt-1 line-clamp-1 ${glass.mutedClass}`}>{subtitle}</p>}
      </div>

      <div className="grid gap-2.5 flex-1 min-h-0" style={{ gridTemplateColumns: `repeat(${Math.max(members.length, 1)}, minmax(0, 1fr))` }}>
        {members.map((m, i) => {
          const bio = parsed[i]?.detail || content[i] || m.role;
          const initial = (m.name || "?").trim().charAt(0).toUpperCase();
          return (
            <div key={i} className={`${tileClass(glass)} p-3.5 flex flex-col min-h-0 h-full`} style={i === 0 ? tileStyle(glass, forExport, true) : tileStyle(glass, forExport)}>
              <div
                className="relative rounded-2xl h-20 shrink-0 mb-3 overflow-hidden flex items-center justify-center"
                style={{
                  background: `linear-gradient(145deg, ${alpha(glass.accent, "33")}, rgba(255,255,255,0.05) 60%, ${alpha(glass.secondary || glass.accent, "22")})`,
                }}
              >
                {m.image ? (
                  <PremiumImage src={m.image} variant="thumb" className="!absolute !inset-0 !min-h-full !rounded-2xl object-cover" />
                ) : (
                  <span className="text-3xl font-black text-white/80">{initial}</span>
                )}
                <span
                  className="absolute bottom-2 left-2 text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                  style={{ background: "rgba(0,0,0,0.45)", color: glass.accent }}
                >
                  {m.role}
                </span>
              </div>
              <p className={`text-[12px] font-bold leading-tight ${glass.titleClass}`}>{m.name}</p>
              <p className="text-[9px] mt-0.5" style={{ color: glass.accent }}>{m.role}</p>
              <p className={`text-[9px] mt-2 leading-snug line-clamp-4 flex-1 ${glass.mutedClass}`}>
                {renderBullet(bio, i, "")}
              </p>
              <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap gap-1">
                {["Ops", "Product", "Network"].slice(0, 2 + (i % 2)).map((tag) => (
                  <span key={tag} className="text-[7px] px-1.5 py-0.5 rounded-md bg-white/[0.06] text-white/55">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const CreamRoadmapTimeline: React.FC<{
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  content: string[];
  timeline?: SlideVisualData["timeline"];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet?: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ title, subtitle, content, timeline, parseBullet, renderBullet, renderLabel, glass, forExport }) => {
  const parsed = parseItems(content, parseBullet);
  const items = (
    timeline?.length
      ? timeline.slice(0, 4).map((t, i) => ({
          label: t.label,
          title: t.title,
          detail: t.detail || parsed[i]?.detail || "",
        }))
      : parsed.slice(0, 4).map((p, i) => ({
          label: p.label || `Q${i + 1}`,
          title: p.label,
          detail: p.detail,
        }))
  );

  while (items.length < 4) {
    const n = items.length + 1;
    items.push({ label: `Q${n}`, title: `Этап ${n}`, detail: "Milestone" });
  }

  return (
    <div className="flex flex-col gap-2.5 my-auto min-h-0 flex-1 overflow-hidden font-[Manrope,sans-serif]">
      <div className="shrink-0 flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <CreamChip glass={glass}>Go-to-market · 12 месяцев</CreamChip>
          {title && (
            <h2 className={`font-extrabold tracking-tight leading-[1.05] mt-2 ${glass.titleClass}`} style={{ fontSize: forExport ? "1.35rem" : "clamp(1rem, 2.4vw, 1.3rem)" }}>
              {title}
            </h2>
          )}
          {subtitle && <p className={`text-[9px] mt-1 line-clamp-1 ${glass.mutedClass}`}>{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1">
          {items.map((it, i) => (
            <React.Fragment key={i}>
              <span
                className="h-6 px-2 rounded-full text-[8px] font-bold flex items-center"
                style={{
                  background: i === 0 ? glass.accent : alpha(glass.accent, "22"),
                  color: i === 0 ? "#1a120c" : glass.accent,
                }}
              >
                {it.label}
              </span>
              {i < items.length - 1 && <ArrowRight className="h-3 w-3 text-white/25" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2.5 flex-1 min-h-0">
        {items.map((item, i) => (
          <div key={i} className={`${tileClass(glass)} p-3.5 flex flex-col min-h-0 h-full`} style={i === 0 ? tileStyle(glass, forExport, true) : tileStyle(glass, forExport)}>
            <div className="flex items-center justify-between shrink-0">
              <span className="text-[10px] font-mono font-bold" style={{ color: glass.accent }}>
                {item.label}
              </span>
              <span className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-white/[0.06] text-white/50">
                {i + 1}
              </span>
            </div>
            <h3 className={`text-[12px] font-bold mt-2 leading-tight line-clamp-2 ${glass.titleClass}`}>
              {renderLabel ? renderLabel(item.title || item.label, i, "") : item.title || item.label}
            </h3>
            <p className={`text-[9px] mt-2 leading-snug line-clamp-5 flex-1 ${glass.mutedClass}`}>
              {renderBullet ? renderBullet(item.detail || "", i, "") : item.detail}
            </p>
            <div className="mt-auto pt-2 border-t border-white/10">
              <div className="h-1.5 rounded-full overflow-hidden bg-white/8">
                <div className="h-full rounded-full" style={{ width: `${25 + i * 22}%`, background: glass.accent }} />
              </div>
              <p className="text-[7px] mt-1 text-white/40 uppercase tracking-wider">прогресс плана</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CreamAskSlide: React.FC<{
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  extractNumber: (s: string) => string;
  renderBullet?: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ title, subtitle, content, parseBullet, extractNumber, renderBullet, renderLabel, glass, forExport }) => {
  const parsed = parseItems(content, parseBullet);
  const ask = parsed.find((p) => /раунд|ask|seed|млн/i.test(p.label + p.raw)) || parsed[0];
  const askValue = (ask && (extractNumber(ask.raw) || ask.number)) || "25 млн ₽";
  const use = parsed.find((p) => /use|funds|распред|supply|product|growth/i.test(p.label + p.detail + p.raw)) || parsed[1];
  const goal = parsed.find((p) => /цель|goal|город/i.test(p.label + p.detail)) || parsed[2];
  const contact = parsed.find((p) => /контакт|@|mail/i.test(p.label + p.detail + p.raw)) || parsed[3];

  const splits = [
    { label: "Supply", pct: "45%", detail: "Парки и onboarding" },
    { label: "Product", pct: "30%", detail: "App, payments, SLA" },
    { label: "Growth", pct: "25%", detail: "Performance + B2B" },
  ];

  return (
    <div className="flex flex-col gap-2.5 my-auto min-h-0 flex-1 overflow-hidden font-[Manrope,sans-serif]">
      <div className="shrink-0">
        <CreamChip glass={glass}>Seed ask</CreamChip>
        {title && (
          <h2 className={`font-extrabold tracking-tight leading-[1.05] mt-2 ${glass.titleClass}`} style={{ fontSize: forExport ? "1.35rem" : "clamp(1rem, 2.4vw, 1.3rem)" }}>
            {title}
          </h2>
        )}
        {subtitle && <p className={`text-[9px] mt-1 line-clamp-1 ${glass.mutedClass}`}>{subtitle}</p>}
      </div>

      <div className="grid grid-cols-[1.15fr_1fr] gap-2.5 flex-1 min-h-0">
        <div className={`${tileClass(glass)} p-5 flex flex-col justify-between min-h-0`} style={tileStyle(glass, forExport, true)}>
          <div>
            <p className="text-[8px] uppercase tracking-[0.16em] text-white/45 font-mono">Раунд</p>
            <div className="text-4xl sm:text-5xl font-black tracking-tight mt-2" style={{ color: glass.accent }}>
              {askValue}
            </div>
            <p className={`text-[11px] mt-2 leading-relaxed ${glass.mutedClass}`}>
              {renderBullet ? renderBullet(ask?.detail || "Seed round на масштабирование", 0, "") : ask?.detail || "Seed round на масштабирование"}
            </p>
          </div>
          <div className="pt-3 border-t border-white/10">
            <p className={`text-[10px] font-bold ${glass.titleClass}`}>
              {renderLabel ? renderLabel(goal?.label || "Цель", 2, "") : goal?.label || "Цель"}
            </p>
            <p className={`text-[9px] mt-1 line-clamp-2 ${glass.mutedClass}`}>
              {renderBullet ? renderBullet(goal?.detail || "3 города, 50 парков, unit-экономика в плюс", 2, "") : goal?.detail}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 min-h-0">
          <div className={`${tileClass(glass)} p-3.5 flex-1 min-h-0 flex flex-col`} style={tileStyle(glass, forExport)}>
            <p className={`text-[11px] font-bold mb-2 ${glass.titleClass}`}>Use of funds</p>
            <div className="space-y-2 flex-1 flex flex-col justify-center">
              {splits.map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between text-[9px] mb-1">
                    <span className={glass.titleClass}>{s.label}</span>
                    <span className="font-black" style={{ color: glass.accent }}>{s.pct}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden bg-white/8">
                    <div className="h-full rounded-full" style={{ width: s.pct, background: glass.accent }} />
                  </div>
                  <p className="text-[8px] mt-0.5 text-white/45">{s.detail}</p>
                </div>
              ))}
            </div>
            {use?.detail && (
              <p className={`text-[8px] mt-2 pt-2 border-t border-white/10 line-clamp-2 ${glass.mutedClass}`}>
                {renderBullet ? renderBullet(use.detail, 1, "") : use.detail}
              </p>
            )}
          </div>
          <div className={`${tileClass(glass)} px-3.5 py-3 flex items-center justify-between gap-2`} style={tileStyle(glass, forExport, true)}>
            <div className="min-w-0">
              <p className="text-[7px] uppercase tracking-wider text-white/40">Контакт</p>
              <p className={`text-[11px] font-bold truncate ${glass.titleClass}`}>
                {contact?.detail || contact?.raw || "alexey@nordflow.ru"}
              </p>
            </div>
            <span className="text-[8px] font-bold px-2.5 py-1 rounded-full shrink-0" style={{ background: glass.accent, color: "#1a120c" }}>
              Write →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CreamVisionMap: React.FC<{
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ title, subtitle, content, parseBullet, renderBullet, renderLabel, glass, forExport }) => {
  const items = parseItems(content, parseBullet).slice(0, 4);
  while (items.length < 4) {
    items.push({ raw: "", label: `Направление ${items.length + 1}`, detail: "Долгосрочный вектор", number: "" });
  }

  return (
    <div className="flex flex-col gap-2.5 my-auto min-h-0 flex-1 overflow-hidden font-[Manrope,sans-serif]">
      <div className="shrink-0">
        <CreamChip glass={glass}>Vision · 5 лет</CreamChip>
        {title && (
          <h2
            className={`font-extrabold tracking-tight leading-[1.05] mt-2 ${glass.titleClass}`}
            style={{ fontSize: forExport ? "1.35rem" : "clamp(1rem, 2.4vw, 1.3rem)" }}
          >
            {title}
          </h2>
        )}
        {subtitle && <p className={`text-[9px] mt-1 line-clamp-1 ${glass.mutedClass}`}>{subtitle}</p>}
      </div>

      <div className="grid grid-cols-2 grid-rows-2 gap-2.5 flex-1 min-h-0">
        {items.map((item, i) => (
          <div
            key={i}
            className={`${tileClass(glass)} p-3.5 flex flex-col justify-between min-h-0`}
            style={i === 0 ? tileStyle(glass, forExport, true) : tileStyle(glass, forExport)}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] font-mono font-bold" style={{ color: glass.accent }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <Zap className="h-3.5 w-3.5 text-white/25" />
            </div>
            <div className="mt-2 flex-1 min-h-0">
              <h3 className={`text-[13px] font-bold leading-tight ${glass.titleClass}`}>
                {renderLabel ? renderLabel(item.label, i, "") : item.label}
              </h3>
              <p className={`text-[9.5px] mt-2 leading-relaxed line-clamp-4 ${glass.mutedClass}`}>
                {renderBullet(item.detail, i, "")}
              </p>
            </div>
            {i === 0 && (
              <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap gap-1.5">
                {["СНГ", "Данные", "B2B"].map((t) => (
                  <span
                    key={t}
                    className="text-[8px] px-2 py-1 rounded-full font-bold"
                    style={{ background: alpha(glass.accent, "28"), color: glass.accent }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

