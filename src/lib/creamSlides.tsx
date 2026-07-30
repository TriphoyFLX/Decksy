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
          <div className={`w-9 h-9 rounded-full ${creamCardClass} flex items-center justify-center`} style={creamStrongStyle(forExport)}>
            <User className={`h-4 w-4 ${glass.mutedClass}`} />
          </div>
          <div>
            <div className={`text-[10px] font-medium ${glass.titleClass}`}>{founderText}</div>
            <div className={`text-[8px] ${glass.mutedClass}`}>{roleText}</div>
          </div>
        </div>
      </div>
      {image ? (
        <div className={`${creamCardClass} p-1.5 overflow-hidden aspect-square md:aspect-[4/5] max-h-full`} style={creamCardStyle(forExport)}>
          <PremiumImage src={image} variant="hero" className="!rounded-xl !min-h-[120px]" />
        </div>
      ) : (
        <div
          className={`${creamCardClass} aspect-square md:aspect-[4/5] flex items-center justify-center relative overflow-hidden`}
          style={creamCardStyle(forExport)}
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
            <div className={`${creamCardClass} p-3 flex flex-col justify-center gap-1`} style={creamCardStyle(forExport)}>
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
            <div className={`${creamCardClass} p-3 flex flex-col justify-center gap-1`} style={creamStrongStyle(forExport)}>
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
        <div key={i} className={`${creamCardClass} p-4 flex flex-col`} style={creamCardStyle(forExport)}>
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
              className={`${creamCardClass} p-3 flex flex-col min-h-0 h-full`}
              style={i === 0 ? creamStrongStyle(forExport) : creamCardStyle(forExport)}
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
          className={`${creamCardClass} p-3.5 flex flex-col justify-between min-h-0`}
          style={{ ...creamStrongStyle(forExport), gridColumn: "1", gridRow: "1 / span 2" }}
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
              className={`${creamCardClass} p-3 flex flex-col min-h-0 gap-1.5`}
              style={{
                ...creamCardStyle(forExport),
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
          className={`${creamCardClass} px-3 py-2 flex items-center gap-2 shrink-0`}
          style={creamStrongStyle(forExport)}
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
              className={`${creamCardClass} p-3 flex flex-col justify-between min-h-0 flex-1`}
              style={m.highlight ? creamStrongStyle(forExport) : creamCardStyle(forExport)}
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
          <div className={`${creamCardClass} p-3.5 flex-1 min-h-0 flex flex-col`} style={creamStrongStyle(forExport)}>
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
              <div key={s.k} className={`${creamCardClass} px-2.5 py-2 text-center`} style={creamCardStyle(forExport)}>
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
  content: string[];
  competitors?: SlideVisualData["competitors"];
  parseBullet: (s: string) => { label: string; detail: string };
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, competitors, parseBullet, glass, forExport }) => {
  const rows = competitors?.length
    ? competitors.slice(0, 3).map((c) => ({ label: c.label, us: c.ours ? "✓" : "–", a: "–", b: c.ours ? "–" : "✓" }))
    : parseItems(content, parseBullet)
        .slice(0, 3)
        .map((item, i) => ({ label: item.label, us: "✓", a: i === 0 ? "–" : "✓", b: i === 2 ? "✓" : "–" }));

  return (
    <div className={`${creamCardClass} overflow-hidden my-auto font-[Manrope,sans-serif]`} style={creamCardStyle(forExport)}>
      <div className="grid grid-cols-4 text-[8px]">
        <div className="p-3 font-mono uppercase tracking-wider text-white/35">Критерий</div>
        <div className="p-3 font-semibold text-center border-l border-white/10 bg-white/[0.05]">Мы</div>
        <div className="p-3 text-center border-l border-white/10 text-white/45">Конк. A</div>
        <div className="p-3 text-center border-l border-white/10 text-white/45">Конк. B</div>
        {rows.map((row, i) => (
          <React.Fragment key={i}>
            <div className="p-3 border-t border-white/10 text-white/55">{row.label}</div>
            <div className="p-3 text-center border-t border-l border-white/10 bg-white/[0.05]" style={{ color: glass.accent }}>
              {row.us}
            </div>
            <div className="p-3 text-center border-t border-l border-white/10 text-white/30">{row.a}</div>
            <div className="p-3 text-center border-t border-l border-white/10 text-white/30">{row.b}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const CreamBizSplit: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  extractNumber: (s: string) => string;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, parseBullet, extractNumber, renderLabel, glass, forExport }) => {
  const streams = parseItems(content, parseBullet).slice(0, 3);
  const unitLabels = ["LTV", "CAC", "LTV:CAC", "Retention"];
  const unitItems = content.slice(3, 7).length
    ? parseItems(content.slice(3, 7), parseBullet)
    : [
        { label: "LTV", number: "$XXX", detail: "" },
        { label: "CAC", number: "$XX", detail: "" },
        { label: "LTV:CAC", number: "3.0x", detail: "" },
        { label: "Retention", number: "XX%", detail: "" },
      ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-auto min-h-0 flex-1 font-[Manrope,sans-serif]">
      <div>
        <h3 className={`text-sm font-extrabold mb-3 ${glass.titleClass}`}>Как мы зарабатываем</h3>
        <div className="space-y-2">
          {streams.map((item, i) => (
            <div key={i} className={`${creamCardClass} p-3 flex items-center justify-between gap-2`} style={creamStrongStyle(forExport)}>
              <div className="min-w-0">
                <div className={`text-[10px] font-semibold ${glass.titleClass}`}>
                  {renderLabel ? renderLabel(item.label, i, "") : item.label}
                </div>
                <div className={`text-[7px] mt-0.5 line-clamp-1 ${glass.mutedClass}`}>{item.detail}</div>
              </div>
              <div className="font-extrabold text-lg shrink-0" style={{ color: glass.accent }}>
                {extractNumber(item.raw) || ["60%", "30%", "10%"][i]}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className={`text-sm font-extrabold mb-3 ${glass.titleClass}`}>Unit economics</h3>
        <div className="grid grid-cols-2 gap-2">
          {unitItems.slice(0, 4).map((item, i) => (
            <div key={i} className={`${creamCardClass} p-3`} style={creamCardStyle(forExport)}>
              <CreamChip glass={glass}>{unitLabels[i] || item.label}</CreamChip>
              <div className="font-extrabold text-xl mt-2" style={{ color: glass.accent }}>
                {"raw" in item ? extractNumber(item.raw) || item.number : item.number}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CreamTractionBoard: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  extractNumber: (s: string) => string;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, parseBullet, extractNumber, renderLabel, glass, forExport }) => {
  const items = parseItems(content, parseBullet).slice(0, 4);
  return (
    <div className="flex flex-col justify-center my-auto min-h-0 flex-1 font-[Manrope,sans-serif]">
      <div
        className={`${creamCardClass} h-24 mb-3 flex items-center justify-center gap-2`}
        style={creamCardStyle(forExport)}
      >
        <BarChart3 className="h-5 w-5" style={{ color: alpha(glass.secondary, "cc") }} />
        <span className="text-[8px] font-mono uppercase tracking-widest text-white/30">Динамика по кварталам</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item, i) => (
          <div key={i}>
            <div className="font-extrabold text-lg" style={{ color: glass.accent }}>
              {extractNumber(item.raw) || item.number || ["$XXK", "XX K", "+XX%", "XX"][i]}
            </div>
            <div className={`text-[7px] mt-1 uppercase tracking-wider ${glass.mutedClass}`}>
              {renderLabel ? renderLabel(item.label, i, "") : item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CreamTeamRow: React.FC<{
  content: string[];
  teamMembers?: SlideVisualData["teamMembers"];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, teamMembers, parseBullet, renderBullet, glass, forExport }) => {
  const members =
    teamMembers?.slice(0, 4) ||
    parseItems(content, parseBullet)
      .slice(0, 4)
      .map((item) => ({ name: item.label, role: item.number || "Role", image: "" }));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-auto min-h-0 flex-1 font-[Manrope,sans-serif]">
      {members.map((m, i) => (
        <div key={i} className={`${creamCardClass} p-3 text-center`} style={creamCardStyle(forExport)}>
          {m.image ? (
            <div className="w-12 h-12 rounded-full overflow-hidden mx-auto mb-2">
              <PremiumImage src={m.image} variant="thumb" className="!w-full !h-full !rounded-full" />
            </div>
          ) : (
            <div className={`w-12 h-12 rounded-full mx-auto mb-2 ${creamCardClass}`} style={creamStrongStyle(forExport)} />
          )}
          <div className={`text-[10px] font-semibold ${glass.titleClass}`}>{m.name}</div>
          <div className={`text-[7px] mb-2 ${glass.mutedClass}`}>{m.role}</div>
          <p className={`text-[7.5px] leading-snug line-clamp-3 ${glass.mutedClass}`}>
            {renderBullet(parseItems(content, parseBullet)[i]?.detail || content[i] || "", i, "")}
          </p>
        </div>
      ))}
    </div>
  );
};

export const CreamRoadmapTimeline: React.FC<{
  content: string[];
  timeline?: SlideVisualData["timeline"];
  parseBullet: (s: string) => { label: string; detail: string };
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, timeline, parseBullet, renderLabel, glass, forExport }) => {
  const items = timeline?.slice(0, 4) || parseItems(content, parseBullet).slice(0, 4);
  return (
    <div className="relative my-auto min-h-0 flex-1 font-[Manrope,sans-serif]">
      <div className="absolute left-0 right-0 top-5 h-px bg-white/10" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8">
        {items.map((item, i) => {
          const label = "label" in item ? item.label : (item as { label: string }).label;
          const detail = "detail" in item ? item.detail : (item as { detail: string }).detail;
          const title = "title" in item ? (item as { title?: string }).title : label;
          return (
            <div key={i} className="relative pt-2">
              <div
                className="absolute left-0 top-0 w-2.5 h-2.5 rounded-full"
                style={{ background: glass.warning }}
              />
              <CreamChip glass={glass}>{title || `Q${i + 1}`}</CreamChip>
              <p className={`text-[8.5px] mt-2 leading-relaxed ${glass.mutedClass}`}>
                {renderLabel ? renderLabel(label, i, "") : detail || label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
