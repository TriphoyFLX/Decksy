import React from "react";
import {
  ArrowRight,
  CalendarCheck,
  Camera,
  Check,
  ChevronRight,
  Gift,
  Layers,
  QrCode,
  Search,
  Shield,
  Smartphone,
  Sparkles,
  TrendingUp,
  User,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { SlideVisualData } from "../types";
import { PremiumImage } from "./slideVisuals";
import type { GlassSurface } from "./apexSlides";
import { APPLE_FONT, APPLE_SYSTEM, appleGroupedStyle, appleSeparatorStyle } from "./appleHIG";

type InlineRenderer = (text: string, index: number, className: string, Tag?: React.ElementType) => React.ReactNode;

const fontStyle = { fontFamily: APPLE_FONT };

function appleAlpha(hex: string, opacity: string): string {
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

function pointsFor(detail: string): string[] {
  const parts = detail
    .split(/[,;•|]/)
    .map((s) => s.replace(/^[\s\-–—]+/, "").trim())
    .filter((s) => s.length > 2);
  if (parts.length >= 2) return parts.slice(0, 3);
  return [detail].filter(Boolean).slice(0, 1);
}

export const AppleChip: React.FC<{ children: React.ReactNode; glass: GlassSurface; accent?: boolean }> = ({
  children,
  glass,
  accent,
}) => (
  <span
    className="inline-flex items-center text-[10px] sm:text-[11px] uppercase tracking-[0.08em] px-2.5 py-1 rounded-full font-semibold"
    style={{
      background: accent ? `${APPLE_SYSTEM.blue}22` : glass.isLight ? "#E5E5EA" : APPLE_SYSTEM.secondaryGroupedDark,
      color: accent ? APPLE_SYSTEM.blue : glass.isLight ? APPLE_SYSTEM.secondaryLabelLight : APPLE_SYSTEM.secondaryLabelDark,
    }}
  >
    {children}
  </span>
);

export const AppleSectionLabel: React.FC<{ children: React.ReactNode; glass: GlassSurface }> = ({
  children,
  glass,
}) => (
  <p
    className="text-[11px] sm:text-[12px] font-normal uppercase tracking-wide mb-2 px-1"
    style={{ ...fontStyle, color: glass.isLight ? APPLE_SYSTEM.secondaryLabelLight : APPLE_SYSTEM.secondaryLabelDark }}
  >
    {children}
  </p>
);

export const AppleHero: React.FC<{
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
      : content.find((c) => /основатель|ceo|founder/i.test(c))?.replace(/^[^:]+:\s*/i, "") || "Имя Фамилия";
  const roleText = founderRole || "Founder & CEO";
  const metrics = parseItems(content, (s) => ({ label: s, detail: s }))
    .filter((item) => item.number)
    .slice(0, 3);
  const highlightMetrics =
    metrics.length >= 2
      ? metrics
      : [
          { label: "Рынок", number: "$1.2B", detail: "TAM" },
          { label: "Рост", number: "+24%", detail: "YoY" },
          { label: "Клиенты", number: "500+", detail: "B2B" },
        ];
  const taglineChips = ["B2B", "SaaS", "Marketplace"].slice(0, 3);

  return (
    <div className="flex flex-col gap-2.5 my-auto min-h-0 flex-1 overflow-hidden" style={fontStyle}>
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-3 flex-1 min-h-0 items-stretch">
        <div className="flex flex-col justify-between min-w-0 min-h-0">
          <div>
            <AppleChip glass={glass} accent>
              Pitch Deck
            </AppleChip>
            <h1
              className={`font-bold tracking-tight leading-[1.05] mt-2 ${glass.titleClass}`}
              style={{ fontSize: forExport ? "2rem" : "clamp(1.25rem, 3.8vw, 1.85rem)", letterSpacing: "-0.02em" }}
            >
              {title}
            </h1>
            {subtitle ? (
              <p className={`mt-2 text-[10px] sm:text-xs leading-relaxed max-w-md font-normal ${glass.mutedClass}`}>
                {subtitle}
              </p>
            ) : (
              <p className={`mt-2 text-[10px] italic ${glass.mutedClass}`}>Слоган в одно предложение</p>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {taglineChips.map((chip) => (
                <AppleChip key={chip} glass={glass} accent>
                  {chip}
                </AppleChip>
              ))}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 shrink-0">
            {highlightMetrics.map((m, i) => (
              <div key={i} className="p-2.5 text-left" style={appleGroupedStyle(glass.isLight, forExport)}>
                <div className="text-base sm:text-lg font-bold tracking-tight" style={{ color: APPLE_SYSTEM.blue }}>
                  {m.number}
                </div>
                <div className={`text-[10px] mt-0.5 uppercase tracking-wide ${glass.mutedClass}`}>{m.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2.5 shrink-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: glass.isLight ? "#E5E5EA" : APPLE_SYSTEM.secondaryGroupedDark }}
            >
              <User className="h-4 w-4" style={{ color: APPLE_SYSTEM.gray }} />
            </div>
            <div>
              <div className={`text-[10px] font-medium ${glass.titleClass}`}>{founderText}</div>
              <div className={`text-[11px] ${glass.mutedClass}`}>{roleText}</div>
            </div>
          </div>
        </div>

        {image ? (
          <div className="rounded-2xl overflow-hidden p-1.5 min-h-0 flex flex-col" style={appleGroupedStyle(glass.isLight, forExport)}>
            <PremiumImage src={image} variant="hero" className="!rounded-xl flex-1 !min-h-[100px]" />
            <div className="mt-2 px-2 py-1.5 rounded-lg" style={{ background: glass.isLight ? "#F2F2F7" : APPLE_SYSTEM.secondaryGroupedDark }}>
              <p className={`text-[11px] leading-snug line-clamp-2 ${glass.mutedClass}`}>
                {content[0] || "Ключевое ценностное предложение продукта"}
              </p>
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl flex flex-col min-h-0 overflow-hidden"
            style={{
              ...appleGroupedStyle(glass.isLight, forExport),
              background: glass.isLight ? "linear-gradient(160deg, #FFFFFF, #F2F2F7)" : "linear-gradient(160deg, #2C2C2E, #1C1C1E)",
            }}
          >
            <div className="flex-1 flex items-center justify-center min-h-[80px]">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: APPLE_SYSTEM.blue, color: "#fff" }}>
                <Sparkles className="h-7 w-7" strokeWidth={1.8} />
              </div>
            </div>
            <div className="px-3 py-2.5 border-t" style={{ borderColor: glass.isLight ? APPLE_SYSTEM.separatorLight : APPLE_SYSTEM.separatorDark }}>
              <p className={`text-[12px] italic leading-snug ${glass.mutedClass}`}>
                «{content[0] || subtitle || "Миссия — решить ключевую проблему рынка"}»
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const AppleProblemSolve: React.FC<{
  title?: React.ReactNode;
  content: string[];
  problemSolutions?: SlideVisualData["problemSolutions"];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ title, content, problemSolutions, parseBullet, renderBullet, renderLabel, glass, forExport }) => {
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
  while (pairs.length < 3) {
    const n = pairs.length + 1;
    pairs.push({
      problemLabel: `Боль ${n}`,
      problem: "Ключевая проблема рынка",
      solutionLabel: "Решение",
      solution: "Закрываем боль продуктом",
    });
  }
  const rows = Math.min(Math.max(pairs.length, 1), 4);

  return (
    <div className="flex flex-col gap-2 my-auto min-h-0 flex-1 overflow-hidden" style={fontStyle}>
      <div className="shrink-0 flex flex-wrap items-end justify-between gap-2">
        <div>
          <AppleChip glass={glass} accent>
            Проблема → Решение
          </AppleChip>
          {title && <h2 className={`text-base sm:text-lg font-bold tracking-tight mt-2 px-0.5 ${glass.titleClass}`}>{title}</h2>}
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <AppleChip glass={glass}>Проблема</AppleChip>
          <span className={glass.mutedClass}>→</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: `${APPLE_SYSTEM.green}22`, color: APPLE_SYSTEM.green }}>
            Как решаем
          </span>
        </div>
      </div>
      <div className="grid flex-1 min-h-0 gap-2" style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}>
        {pairs.map((pair, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto_1fr] gap-2 items-stretch min-h-0">
            <div className="p-3 flex flex-col justify-center gap-1 min-h-0" style={appleGroupedStyle(glass.isLight, forExport)}>
              <p className={`text-[12px] font-semibold line-clamp-1 ${glass.titleClass}`}>
                {renderLabel ? renderLabel(pair.problemLabel, i, "") : pair.problemLabel}
              </p>
              <p className={`text-[12px] leading-snug line-clamp-2 ${glass.mutedClass}`}>{renderBullet(pair.problem, i, "")}</p>
            </div>
            <div className="flex items-center justify-center">
              <span className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: `${APPLE_SYSTEM.blue}22`, color: APPLE_SYSTEM.blue }}>
                →
              </span>
            </div>
            <div className="p-3 flex flex-col justify-center gap-1 min-h-0" style={{ ...appleGroupedStyle(glass.isLight, forExport), borderLeft: `3px solid ${APPLE_SYSTEM.green}` }}>
              <p className="text-[12px] font-semibold line-clamp-1" style={{ color: APPLE_SYSTEM.green }}>
                {renderLabel ? renderLabel(pair.solutionLabel, i + 10, "") : pair.solutionLabel}
              </p>
              <p className={`text-[12px] leading-snug line-clamp-2 ${glass.bodyClass}`}>{renderBullet(pair.solution, i + 10, "")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AppleFeatureBento: React.FC<{
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ title, subtitle, content, parseBullet, renderBullet, renderLabel, glass, forExport }) => {
  const icons: LucideIcon[] = [Wallet, TrendingUp, Gift, Smartphone, Shield, Zap];
  const items = parseItems(content, parseBullet).slice(0, 4);
  while (items.length < 4) {
    items.push({ raw: "", label: `Фича ${items.length + 1}`, detail: "Ключевое преимущество продукта", number: "" });
  }
  const [hero, ...rest] = items;
  const HeroIcon = icons[0];

  return (
    <div className="flex flex-col gap-2 my-auto min-h-0 flex-1 overflow-hidden" style={fontStyle}>
      <div className="shrink-0 flex flex-wrap items-end justify-between gap-2">
        <div>
          <AppleChip glass={glass} accent>Решение</AppleChip>
          {title && <h2 className={`text-base sm:text-lg font-bold tracking-tight mt-2 ${glass.titleClass}`}>{title}</h2>}
          {subtitle && <p className={`text-[12px] mt-0.5 line-clamp-1 ${glass.mutedClass}`}>{subtitle}</p>}
        </div>
        <div className="flex flex-wrap gap-1">
          {["Без покупки", "Онлайн", "SLA"].map((t) => (
            <AppleChip key={t} glass={glass} accent>{t}</AppleChip>
          ))}
        </div>
      </div>
      <div className="grid flex-1 min-h-0 gap-2" style={{ gridTemplateColumns: "1.15fr 1fr 1fr", gridTemplateRows: "1.2fr 1fr" }}>
        <div className="p-3 flex flex-col justify-between min-h-0" style={{ ...appleGroupedStyle(glass.isLight, forExport), gridColumn: "1", gridRow: "1 / span 2" }}>
          <div className="flex items-start justify-between gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${APPLE_SYSTEM.blue}22`, color: APPLE_SYSTEM.blue }}>
              <HeroIcon className="h-4 w-4" strokeWidth={1.6} />
            </div>
            {hero.number && <span className="text-xl font-bold" style={{ color: APPLE_SYSTEM.blue }}>{hero.number}</span>}
          </div>
          <div className="mt-2 min-h-0">
            <h3 className={`text-[12px] font-bold leading-tight ${glass.titleClass}`}>
              {renderLabel ? renderLabel(hero.label, 0, "") : hero.label}
            </h3>
            <p className={`text-[12px] mt-1 leading-relaxed line-clamp-3 ${glass.mutedClass}`}>{renderBullet(hero.detail, 0, "")}</p>
            <ul className="mt-2 space-y-1">
              {pointsFor(hero.detail).map((pt, pi) => (
                <li key={pi} className={`flex gap-1.5 text-[11px] ${glass.bodyClass}`}>
                  <Check className="h-3 w-3 shrink-0" style={{ color: APPLE_SYSTEM.green }} strokeWidth={2.5} />
                  <span className="line-clamp-1">{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {rest.slice(0, 3).map((item, i) => {
          const Icon = icons[i + 1] || Zap;
          const idx = i + 1;
          return (
            <div
              key={idx}
              className="p-2.5 flex flex-col min-h-0 gap-1"
              style={{
                ...appleGroupedStyle(glass.isLight, forExport),
                gridColumn: i === 2 ? "2 / span 2" : String(i + 2),
                gridRow: i < 2 ? "1" : "2",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${APPLE_SYSTEM.blue}18`, color: APPLE_SYSTEM.blue }}>
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.7} />
                </div>
                {item.number ? (
                  <span className="text-base font-bold" style={{ color: APPLE_SYSTEM.blue }}>{item.number}</span>
                ) : (
                  <span className={`text-[11px] ${glass.mutedClass}`}>{String(idx + 1).padStart(2, "0")}</span>
                )}
              </div>
              <h3 className={`text-[10px] font-semibold line-clamp-1 ${glass.titleClass}`}>
                {renderLabel ? renderLabel(item.label, idx, "") : item.label}
              </h3>
              <p className={`text-[11px] leading-snug line-clamp-2 flex-1 ${glass.mutedClass}`}>{renderBullet(item.detail, idx, "")}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const AppleProductSteps: React.FC<{
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  content: string[];
  image?: string;
  cardImages?: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ title, subtitle, content, image, cardImages, parseBullet, renderBullet, renderLabel, glass, forExport }) => {
  const stepIcons: LucideIcon[] = [Search, CalendarCheck, QrCode, Camera];
  const stepHints = [["Геофильтр", "Тип техники"], ["Слот онлайн", "Предоплата"], ["QR на объекте", "Договор"], ["Фото-отчёт", "Рейтинг"]];
  const items = parseItems(content, parseBullet).slice(0, 4);
  while (items.length < 4) {
    const n = items.length + 1;
    items.push({ raw: "", label: `Шаг ${n}`, detail: "Ключевой этап пользовательского пути", number: "" });
  }
  const hero = image || cardImages?.[0];

  return (
    <div className="flex flex-col gap-2 my-auto min-h-0 flex-1 overflow-hidden" style={fontStyle}>
      <div className="shrink-0 flex flex-wrap items-end justify-between gap-2">
        <div>
          <AppleChip glass={glass} accent>Продукт · Journey</AppleChip>
          {title && <h2 className={`text-base sm:text-lg font-bold tracking-tight mt-2 ${glass.titleClass}`}>{title}</h2>}
          {subtitle && <p className={`text-[12px] mt-0.5 line-clamp-1 ${glass.mutedClass}`}>{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1">
          {items.map((_, i) => (
            <React.Fragment key={i}>
              <span className="h-5 min-w-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: i === 0 ? APPLE_SYSTEM.blue : `${APPLE_SYSTEM.blue}22`, color: i === 0 ? "#fff" : APPLE_SYSTEM.blue }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {i < items.length - 1 && <ArrowRight className="h-2.5 w-2.5 opacity-30" />}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="grid flex-1 min-h-0 gap-2" style={{ gridTemplateColumns: "1.2fr repeat(4, 1fr)" }}>
        <div className="rounded-xl p-2 flex flex-col min-h-0 overflow-hidden" style={appleGroupedStyle(glass.isLight, forExport)}>
          {hero ? (
            <PremiumImage src={hero} variant="hero" className="!rounded-lg flex-1 !min-h-[80px]" />
          ) : (
            <div className="flex-1 flex items-center justify-center min-h-[80px]" style={{ background: glass.isLight ? "#F2F2F7" : APPLE_SYSTEM.secondaryGroupedDark }}>
              <Layers className="h-8 w-8" style={{ color: APPLE_SYSTEM.blue }} />
            </div>
          )}
          <p className={`text-[11px] mt-2 px-1 line-clamp-2 ${glass.mutedClass}`}>Product showcase</p>
        </div>
        {items.map((item, i) => {
          const Icon = stepIcons[i] || Zap;
          const hints = stepHints[i] || ["Готово", "Быстро"];
          const hasImg = Boolean(cardImages?.[i]);
          return (
            <div key={i} className="p-2 flex flex-col min-h-0" style={appleGroupedStyle(glass.isLight, forExport)}>
              {hasImg ? (
                <div className="rounded-lg overflow-hidden h-12 shrink-0 mb-1.5">
                  <PremiumImage src={cardImages![i]} variant="thumb" className="!min-h-12 !h-12 !rounded-lg" />
                </div>
              ) : (
                <div className="h-12 shrink-0 mb-1.5 rounded-lg flex items-center justify-center" style={{ background: `${APPLE_SYSTEM.blue}15` }}>
                  <Icon className="h-4 w-4" style={{ color: APPLE_SYSTEM.blue }} strokeWidth={1.6} />
                </div>
              )}
              <span className="text-[10px] font-bold" style={{ color: APPLE_SYSTEM.blue }}>{String(i + 1).padStart(2, "0")}</span>
              <h3 className={`text-[12px] font-semibold line-clamp-1 mt-0.5 ${glass.titleClass}`}>
                {renderLabel ? renderLabel(item.label, i, "") : item.label}
              </h3>
              <p className={`text-[7.5px] mt-0.5 leading-snug line-clamp-2 flex-1 ${glass.mutedClass}`}>{renderBullet(item.detail, i, "")}</p>
              <div className="mt-1 space-y-0.5 shrink-0">
                {hints.map((hint) => (
                  <div key={hint} className="flex items-center gap-1 text-[10px]">
                    <Check className="h-2 w-2 shrink-0" style={{ color: APPLE_SYSTEM.green }} strokeWidth={3} />
                    <span className={`line-clamp-1 ${glass.mutedClass}`}>{hint}</span>
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

export const AppleMarketStack: React.FC<{
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
}> = ({ title, subtitle, content, metrics, parseBullet, extractNumber, renderBullet, renderLabel, glass, forExport }) => {
  const parsed = parseItems(content, parseBullet);
  const tamLabels = ["TAM", "SAM", "SOM"];
  const widths = ["100%", "62%", "28%"];
  const scopes = ["Весь рынок", "Целевой сегмент", "Пилот 24 мес"];
  const metricItems = tamLabels.map((label, i) => {
    const fromMetrics = metrics?.[i];
    const fromContent = parsed.find((p) => p.label.toUpperCase() === label) || parsed[i];
    const value = fromMetrics?.value || (fromContent ? extractNumber(fromContent.raw) || fromContent.number : "") || ["10 млрд ₽", "1.2 млрд ₽", "80 млн ₽"][i];
    const detail = fromContent?.detail?.replace(value, "").replace(/^[\s—\-–:]+/, "").trim() || [
      "весь рынок аренды спецтехники в РФ",
      "города-миллионники, B2B подрядчики",
      "пилот в 3 городах за 24 месяца",
    ][i];
    return { label: fromMetrics?.label || label, value, detail, width: widths[i], scope: scopes[i], highlight: i === 2 };
  });
  const growthItem = parsed.find((p) => /рост|cagr|yoy|\+/i.test(`${p.label} ${p.detail}`)) || parsed[3];
  const growthValue = (growthItem && (extractNumber(growthItem.raw) || growthItem.number)) || "+12% YoY";
  const drivers = [
    {
      tag: "CAGR",
      title: growthValue,
      text: growthItem?.detail || "удорожание техники и нехватка парка",
    },
    {
      tag: "ФОКУС",
      title: "B2B подрядчики",
      text: metricItems[1]?.detail || "города-миллионники, сезонные и разовые работы",
    },
    {
      tag: "WEDGE",
      title: metricItems[2]?.value || "80 млн ₽",
      text: metricItems[2]?.detail || "пилот в 3 городах за 24 месяца",
    },
  ];

  return (
    <div className="flex flex-col gap-2.5 my-auto min-h-0 flex-1 overflow-hidden" style={fontStyle}>
      <div className="shrink-0 flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <AppleChip glass={glass} accent>Рынок · TAM / SAM / SOM</AppleChip>
          {title && (
            <h2
              className={`font-bold tracking-tight mt-2 ${glass.titleClass}`}
              style={{ fontSize: forExport ? "1.4rem" : "clamp(1.1rem, 2.6vw, 1.45rem)" }}
            >
              {title}
            </h2>
          )}
          {subtitle && <p className={`text-[12px] sm:text-[13px] mt-1 line-clamp-2 leading-snug ${glass.mutedClass}`}>{subtitle}</p>}
        </div>
        <div className="px-3.5 py-2.5 flex items-center gap-2.5 rounded-2xl shrink-0" style={appleGroupedStyle(glass.isLight, forExport)}>
          <TrendingUp className="h-5 w-5" style={{ color: APPLE_SYSTEM.blue }} />
          <div>
            <p className={`text-[10px] uppercase tracking-wide ${glass.mutedClass}`}>Рост рынка</p>
            <p className="text-base font-bold leading-none mt-0.5" style={{ color: APPLE_SYSTEM.blue }}>{growthValue}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-[1.05fr_1.2fr] gap-2.5 flex-1 min-h-0">
        <div className="flex flex-col gap-2 min-h-0">
          {metricItems.map((m, i) => (
            <div key={m.label} className="p-3.5 flex flex-col justify-between flex-1 min-h-0" style={appleGroupedStyle(glass.isLight, forExport)}>
              <div className="flex items-center justify-between gap-2">
                <AppleChip glass={glass} accent>{m.label}</AppleChip>
                <span className={`text-[11px] font-medium ${glass.mutedClass}`}>{m.scope}</span>
              </div>
              <div className="mt-1.5">
                <div
                  className="font-bold tracking-tight leading-none"
                  style={{ color: APPLE_SYSTEM.blue, fontSize: forExport ? "1.55rem" : "clamp(1.25rem, 2.8vw, 1.7rem)" }}
                >
                  {m.value}
                </div>
                <p className={`text-[12px] sm:text-[13px] mt-1.5 leading-snug line-clamp-2 ${glass.mutedClass}`}>
                  {renderBullet ? renderBullet(m.detail, i, "") : m.detail}
                </p>
              </div>
              <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: glass.isLight ? "#E5E5EA" : APPLE_SYSTEM.secondaryGroupedDark }}>
                <div className="h-full rounded-full" style={{ width: m.width, background: APPLE_SYSTEM.blue }} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 min-h-0">
          <div className="p-4 flex-1 min-h-0 flex flex-col" style={appleGroupedStyle(glass.isLight, forExport)}>
            <h3 className={`text-[15px] sm:text-base font-bold tracking-tight ${glass.titleClass}`}>Большой и растущий рынок</h3>
            <p className={`text-[12px] sm:text-[13px] mt-1.5 leading-relaxed ${glass.mutedClass}`}>
              Воронка от всего рынка аренды к реалистичному wedge за 24 месяца — без раздутого TAM.
            </p>
            <div className="mt-3 flex-1 min-h-0 flex flex-col justify-between gap-1">
              {drivers.map((d, i) => (
                <div key={d.tag} className="min-h-0">
                  {i > 0 && (
                    <div
                      className="h-px mb-2.5"
                      style={{ background: glass.isLight ? APPLE_SYSTEM.separatorLight : APPLE_SYSTEM.separatorDark }}
                    />
                  )}
                  <div className="flex items-start gap-3">
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-md shrink-0 mt-0.5"
                      style={{ background: `${APPLE_SYSTEM.blue}18`, color: APPLE_SYSTEM.blue }}
                    >
                      {d.tag}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-[13px] sm:text-[14px] font-semibold leading-tight ${glass.titleClass}`}>
                        {renderLabel ? renderLabel(d.title, i + 10, "") : d.title}
                      </p>
                      <p className={`text-[12px] sm:text-[13px] mt-1 leading-snug line-clamp-3 ${glass.mutedClass}`}>
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
              { k: "Wedge", v: "~7%" },
              { k: "Горизонт", v: "24 мес" },
            ].map((s) => (
              <div key={s.k} className="px-2.5 py-2.5 text-center rounded-2xl" style={appleGroupedStyle(glass.isLight, forExport)}>
                <p className={`text-[10px] uppercase tracking-wide ${glass.mutedClass}`}>{s.k}</p>
                <p className="text-[15px] sm:text-base font-bold mt-0.5" style={{ color: APPLE_SYSTEM.blue }}>{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AppleCompareMatrix: React.FC<{
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  content: string[];
  competitors?: SlideVisualData["competitors"];
  compareFeatures?: SlideVisualData["compareFeatures"];
  parseBullet: (s: string) => { label: string; detail: string };
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ title, subtitle, content, competitors, compareFeatures, parseBullet, glass, forExport }) => {
  const fallbackAdvantages = [
    ["Большой трафик", "Низкий порог входа"],
    ["Локальный парк", "Знание района"],
    ["Офлайн-сеть", "Склад и логистика"],
    ["Почасовая бронь", "Страховка и SLA"],
  ];
  const players: NonNullable<SlideVisualData["competitors"]> = (() => {
    if (competitors?.length) {
      return competitors.slice(0, 4).map((c, i) => {
        const adv = (c.advantages || []).filter(Boolean).slice(0, 3);
        return {
          ...c,
          label: c.label || `Игрок ${i + 1}`,
          detail: c.detail || "",
          advantages: adv.length ? adv : fallbackAdvantages[i] || fallbackAdvantages[0],
          rating: typeof c.rating === "number" ? c.rating : c.ours ? 9 : 4 + i,
        };
      });
    }
    return parseItems(content, parseBullet).slice(0, 4).map((item, i, arr) => {
      const ours = /наш|мы|отлич|nordflow/i.test(`${item.label} ${item.detail}`) || i === arr.length - 1;
      const fromDetail = item.detail
        .split(/[,;•]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 2);
      return {
        label: item.label,
        detail: item.detail,
        ours,
        rating: ours ? 9 : 4 + i,
        advantages: fromDetail.length ? fromDetail : fallbackAdvantages[i] || fallbackAdvantages[0],
      };
    });
  })();
  while (players.length < 4) {
    const i = players.length;
    players.push({
      label: ["Авито", "Локальный парк", "СтройПрокат+", "NordFlow"][i],
      detail: "",
      ours: i === 3,
      rating: i === 3 ? 9 : 4 + i,
      advantages: fallbackAdvantages[i],
    });
  }
  const cols = Math.min(Math.max(players.length, 2), 4);
  const featurePool = [
    "Почасовая аренда",
    "Онлайн-бронь и оплата",
    "Страховка / SLA",
    "Рейтинг и отзывы",
    "Широкий ассортимент",
    "Данные / аналитика",
  ];
  const features =
    compareFeatures?.length
      ? compareFeatures.slice(0, 6).map((f) => ({ label: f.label, scores: players.map((_, i) => f.scores[i] ?? false) }))
      : featurePool.map((label, fi) => ({
          label,
          scores: players.map((p, pi) => {
            if (p.ours) return true;
            if (fi === 0) return false;
            if (fi === 1 && pi === 0) return "partial" as const;
            if (fi === 2 && pi === 2) return "partial" as const;
            if (fi === 3 && pi <= 1) return true;
            if (fi === 4 && pi >= 1) return true;
            return false;
          }),
        }));

  const scoreNode = (value: boolean | "partial") => {
    if (value === true)
      return (
        <span
          className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-[14px] sm:text-[15px] font-bold"
          style={{ background: `${APPLE_SYSTEM.green}22`, color: APPLE_SYSTEM.green }}
        >
          ✓
        </span>
      );
    if (value === "partial")
      return (
        <span
          className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-[14px] sm:text-[15px] font-bold"
          style={{ background: `${APPLE_SYSTEM.orange}22`, color: APPLE_SYSTEM.orange }}
        >
          ~
        </span>
      );
    return (
      <span
        className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-[13px] font-bold"
        style={{
          background: glass.isLight ? "#E5E5EA" : APPLE_SYSTEM.secondaryGroupedDark,
          color: glass.isLight ? "rgba(60,60,67,0.45)" : "rgba(235,235,245,0.35)",
        }}
      >
        ✕
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-2.5 my-auto min-h-0 flex-1 overflow-hidden" style={fontStyle}>
      <div className="shrink-0 flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <AppleChip glass={glass} accent>
            Конкуренция
          </AppleChip>
          {title && (
            <h2
              className={`font-bold tracking-tight mt-2 ${glass.titleClass}`}
              style={{ fontSize: forExport ? "1.4rem" : "clamp(1.1rem, 2.6vw, 1.45rem)" }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p className={`text-[13px] sm:text-[14px] mt-1 line-clamp-2 leading-snug ${glass.mutedClass}`}>{subtitle}</p>
          )}
        </div>
        <div className={`flex gap-3 text-[12px] sm:text-[13px] items-center font-medium ${glass.bodyClass}`}>
          <span className="flex items-center gap-1.5">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px]" style={{ background: `${APPLE_SYSTEM.green}22`, color: APPLE_SYSTEM.green }}>
              ✓
            </span>
            есть
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px]" style={{ background: `${APPLE_SYSTEM.orange}22`, color: APPLE_SYSTEM.orange }}>
              ~
            </span>
            частично
          </span>
        </div>
      </div>

      <div className="grid gap-2 shrink-0" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {players.map((p, i) => (
          <div
            key={i}
            className="p-3 flex flex-col gap-2 min-h-[108px]"
            style={{
              ...appleGroupedStyle(glass.isLight, forExport),
              border: p.ours ? `2px solid ${APPLE_SYSTEM.blue}` : undefined,
              boxShadow: p.ours ? "0 8px 24px rgba(0,122,255,0.12)" : appleGroupedStyle(glass.isLight, forExport).boxShadow,
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-base"
                style={{
                  background: p.ours ? APPLE_SYSTEM.blue : glass.isLight ? "#E5E5EA" : APPLE_SYSTEM.secondaryGroupedDark,
                  color: p.ours ? "#fff" : glass.isLight ? "#000" : "#fff",
                }}
              >
                {(p.label || "?").charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className={`text-[13px] sm:text-[14px] font-bold truncate ${glass.titleClass}`}>{p.label}</p>
                  {p.ours && (
                    <span
                      className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0"
                      style={{ background: APPLE_SYSTEM.blue, color: "#fff" }}
                    >
                      мы
                    </span>
                  )}
                </div>
                <div
                  className="mt-1.5 h-1.5 rounded-full overflow-hidden"
                  style={{ background: glass.isLight ? "#E5E5EA" : APPLE_SYSTEM.secondaryGroupedDark }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(p.rating ?? 5) * 10}%`, background: p.ours ? APPLE_SYSTEM.blue : APPLE_SYSTEM.gray }}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1 mt-auto">
              {(p.advantages || []).slice(0, 2).map((adv, ai) => (
                <p key={ai} className={`text-[12px] sm:text-[13px] leading-snug line-clamp-1 ${glass.bodyClass}`}>
                  <span className="font-bold mr-1" style={{ color: p.ours ? APPLE_SYSTEM.green : APPLE_SYSTEM.blue }}>
                    {p.ours ? "✓" : "·"}
                  </span>
                  {adv}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col rounded-2xl" style={appleGroupedStyle(glass.isLight, forExport)}>
        <div
          className="grid px-3.5 py-2.5 shrink-0 items-center border-b"
          style={{
            gridTemplateColumns: `minmax(140px, 1.35fr) repeat(${cols}, minmax(0, 1fr))`,
            borderColor: glass.isLight ? APPLE_SYSTEM.separatorLight : APPLE_SYSTEM.separatorDark,
          }}
        >
          <span className="text-[12px] sm:text-[13px] uppercase tracking-wide font-bold" style={{ color: APPLE_SYSTEM.blue }}>
            Критерий
          </span>
          {players.map((p, i) => (
            <span
              key={i}
              className={`text-[12px] sm:text-[13px] font-bold text-center truncate px-1 ${p.ours ? "" : glass.bodyClass}`}
              style={p.ours ? { color: APPLE_SYSTEM.blue } : undefined}
            >
              {p.label}
            </span>
          ))}
        </div>
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {features.map((feat, fi) => (
            <div
              key={fi}
              className="grid px-3.5 flex-1 items-center min-h-0 border-b last:border-b-0"
              style={{
                gridTemplateColumns: `minmax(140px, 1.35fr) repeat(${cols}, minmax(0, 1fr))`,
                borderColor: glass.isLight ? APPLE_SYSTEM.separatorLight : APPLE_SYSTEM.separatorDark,
                background: fi % 2 ? (glass.isLight ? "#F8F8FA" : "#1C1C1E") : undefined,
              }}
            >
              <span className={`text-[13px] sm:text-[14px] font-semibold leading-snug line-clamp-2 pr-2 ${glass.titleClass}`}>
                {feat.label}
              </span>
              {players.map((_, pi) => (
                <div key={pi} className="flex justify-center py-1">
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

export const AppleBizSplit: React.FC<{
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
  const tiers = pricing?.slice(0, 3) || [
    { label: "Старт", price: "100 ₽/ч", detail: "Лёгкий инструмент", featured: false },
    { label: "Про", price: "250 ₽/ч", detail: "Средний класс", featured: true },
    { label: "Хэви", price: "450 ₽/ч", detail: "Тяжёлая техника", featured: false },
  ];
  const unitCards = [
    { label: "Комиссия", value: extractNumber(parsed[2]?.raw || "") || "18%", detail: parsed[2]?.detail || "с заказа" },
    { label: "LTV:CAC", value: extractNumber(parsed[1]?.raw || "") || "3x", detail: parsed[1]?.detail || "цель unit-экономики" },
    { label: "Загрузка", value: "40%", detail: "точка сходимости" },
    { label: "Подписка", value: "−10%", detail: parsed[3]?.detail || "приоритет слотов" },
  ];
  const streams = parsed.slice(0, 3);
  while (streams.length < 3) streams.push({ raw: "", label: `Поток ${streams.length + 1}`, detail: "Источник выручки", number: ["60%", "30%", "10%"][streams.length] });

  return (
    <div className="flex flex-col gap-2 my-auto min-h-0 flex-1 overflow-hidden" style={fontStyle}>
      <div className="shrink-0 flex flex-wrap items-end justify-between gap-2">
        <div>
          <AppleChip glass={glass} accent>Бизнес-модель</AppleChip>
          {title && <h2 className={`text-base sm:text-lg font-bold tracking-tight mt-2 ${glass.titleClass}`}>{title}</h2>}
          {subtitle && <p className={`text-[12px] mt-0.5 line-clamp-1 ${glass.mutedClass}`}>{subtitle}</p>}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 shrink-0">
        {tiers.map((t, i) => (
          <div key={i} className="p-2.5 flex flex-col gap-1" style={{ ...appleGroupedStyle(glass.isLight, forExport), border: t.featured ? `2px solid ${APPLE_SYSTEM.blue}` : undefined }}>
            <AppleChip glass={glass} accent={t.featured}>{t.label}</AppleChip>
            <div className="text-lg font-bold" style={{ color: APPLE_SYSTEM.blue }}>{t.price}</div>
            <p className={`text-[11px] line-clamp-2 ${glass.mutedClass}`}>{t.detail}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
        <div className="p-2.5 flex flex-col min-h-0" style={appleGroupedStyle(glass.isLight, forExport)}>
          <AppleSectionLabel glass={glass}>Монетизация</AppleSectionLabel>
          {streams.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div style={{ ...appleSeparatorStyle(glass.isLight), marginLeft: 0 }} />}
              <div className="flex items-center justify-between py-2">
                <span className={`text-[12px] font-medium ${glass.titleClass}`}>{renderLabel ? renderLabel(item.label, i, "") : item.label}</span>
                <span className="text-sm font-bold" style={{ color: APPLE_SYSTEM.blue }}>{extractNumber(item.raw) || item.number || ["60%", "30%", "10%"][i]}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1.5 min-h-0">
          {unitCards.map((u, i) => (
            <div key={u.label} className="p-2 flex flex-col justify-between min-h-0" style={appleGroupedStyle(glass.isLight, forExport)}>
              <span className={`text-[10px] uppercase ${glass.mutedClass}`}>{u.label}</span>
              <div className="text-base font-bold" style={{ color: APPLE_SYSTEM.blue }}>{renderLabel ? renderLabel(u.value, i, "") : u.value}</div>
              <p className={`text-[10px] line-clamp-2 ${glass.mutedClass}`}>{renderBullet ? renderBullet(u.detail, i, "") : u.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AppleTractionBoard: React.FC<{
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
  while (items.length < 4) items.push({ raw: "", label: `Метрика ${items.length + 1}`, detail: "Сигнал спроса", number: "" });
  const bars = [42, 68, 55, 82];
  const [hero, ...rest] = items;
  const proofBullets = content.slice(4, 7).length ? content.slice(4, 7) : ["Первые платящие клиенты", "Повторные заказы", "NPS > 50"];

  return (
    <div className="flex flex-col gap-2 my-auto min-h-0 flex-1 overflow-hidden" style={fontStyle}>
      <div className="shrink-0">
        <AppleChip glass={glass} accent>Traction</AppleChip>
        {title && <h2 className={`text-base sm:text-lg font-bold tracking-tight mt-2 ${glass.titleClass}`}>{title}</h2>}
        {subtitle && <p className={`text-[12px] mt-0.5 line-clamp-1 ${glass.mutedClass}`}>{subtitle}</p>}
      </div>
      <div className="grid grid-cols-[1.2fr_1fr] gap-2 flex-1 min-h-0">
        <div className="p-3 flex flex-col justify-between min-h-0" style={appleGroupedStyle(glass.isLight, forExport)}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-[11px] uppercase ${glass.mutedClass}`}>Hero metric</p>
              <p className={`text-[11px] font-bold mt-0.5 ${glass.titleClass}`}>{renderLabel ? renderLabel(hero.label, 0, "") : hero.label}</p>
            </div>
            <TrendingUp className="h-4 w-4" style={{ color: APPLE_SYSTEM.blue }} />
          </div>
          <div className="text-3xl font-bold" style={{ color: APPLE_SYSTEM.blue }}>{extractNumber(hero.raw) || hero.number || "12"}</div>
          <p className={`text-[12px] line-clamp-2 ${glass.mutedClass}`}>{renderBullet ? renderBullet(hero.detail, 0, "") : hero.detail}</p>
          <div className="mt-2 flex items-end gap-1 h-12">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%`, background: i === bars.length - 1 ? APPLE_SYSTEM.blue : appleAlpha(APPLE_SYSTEM.blue, "66") }} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5 min-h-0">
          <div className="grid grid-cols-2 gap-1.5 flex-1 min-h-0">
            {rest.map((item, i) => (
              <div key={i} className="p-2 flex flex-col justify-center min-h-0" style={appleGroupedStyle(glass.isLight, forExport)}>
                <div className="text-base font-bold" style={{ color: APPLE_SYSTEM.blue }}>{extractNumber(item.raw) || item.number || ["28%", "62", "50"][i]}</div>
                <p className={`text-[10px] uppercase mt-0.5 line-clamp-1 ${glass.mutedClass}`}>{renderLabel ? renderLabel(item.label, i + 1, "") : item.label}</p>
              </div>
            ))}
          </div>
          <div className="p-2 shrink-0" style={appleGroupedStyle(glass.isLight, forExport)}>
            {proofBullets.map((bullet, i) => (
              <div key={i} className="flex items-center gap-1.5 py-0.5">
                <Check className="h-3 w-3 shrink-0" style={{ color: APPLE_SYSTEM.green }} strokeWidth={2.5} />
                <span className={`text-[11px] line-clamp-1 ${glass.bodyClass}`}>{bullet}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AppleTeamRow: React.FC<{
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
  const fallbackBios = [
    "8 лет в аренде и логистике B2B — знает unit-экономику парков изнутри",
    "Ex-marketplace, 2 выхода в продукт — строит платформу и data-слой",
    "Сеть из 12 парков уже в пилоте — операционка и onboarding supply",
  ];
  const fallbackNames = ["Алексей Петров", "Мария Ковалёва", "Игорь Семёнов"];
  const fallbackRoles = ["CEO", "CTO", "Ops"];
  const skillSets = [
    ["Аренда", "Логистика", "B2B"],
    ["Marketplace", "Product", "Exits"],
    ["Парки", "Ops", "SLA"],
  ];

  const members = (
    teamMembers?.length
      ? teamMembers
      : parsed.map((item, i) => ({
          name: item.label || fallbackNames[i],
          role: fallbackRoles[i] || "Role",
          image: "",
        }))
  ).slice(0, 3);
  while (members.length < 3) {
    const i = members.length;
    members.push({ name: fallbackNames[i], role: fallbackRoles[i], image: "" });
  }

  const resolveBio = (i: number) => {
    const byRole = parsed.find((p) => new RegExp(members[i].role || "", "i").test(`${p.label} ${p.raw}`));
    return byRole?.detail || parsed[i]?.detail || fallbackBios[i];
  };

  const moatBullets = [
    { label: "Moat", detail: parsed[3]?.detail || "Сеть поставщиков и data flywheel" },
    { label: "Skills", detail: "Ops + Product + GTM в одной команде" },
    { label: "Edge", detail: "Скорость выхода на рынок и SLA" },
  ];

  return (
    <div className="flex flex-col gap-2.5 my-auto min-h-0 flex-1 overflow-hidden" style={fontStyle}>
      <div className="shrink-0 flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <AppleChip glass={glass} accent>
            Команда · Secret sauce
          </AppleChip>
          {title && (
            <h2
              className={`font-bold tracking-tight mt-2 ${glass.titleClass}`}
              style={{ fontSize: forExport ? "1.4rem" : "clamp(1.1rem, 2.6vw, 1.45rem)" }}
            >
              {title}
            </h2>
          )}
          {subtitle && <p className={`text-[13px] mt-1 line-clamp-2 ${glass.mutedClass}`}>{subtitle}</p>}
        </div>
      </div>

      <div className="grid grid-cols-[1.35fr_0.85fr] gap-2.5 flex-1 min-h-0">
        <div className="grid grid-cols-3 gap-2 min-h-0">
          {members.map((m, i) => (
            <div key={i} className="p-3 flex flex-col min-h-0" style={appleGroupedStyle(glass.isLight, forExport)}>
              <div
                className="h-[38%] min-h-[72px] rounded-xl flex items-center justify-center shrink-0 mb-2.5 relative overflow-hidden"
                style={{
                  background: glass.isLight
                    ? `linear-gradient(160deg, ${APPLE_SYSTEM.blue}22, #F2F2F7)`
                    : `linear-gradient(160deg, ${APPLE_SYSTEM.blue}33, #2C2C2E)`,
                }}
              >
                {m.image ? (
                  <PremiumImage src={m.image} variant="thumb" className="!absolute !inset-0 !min-h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold" style={{ color: APPLE_SYSTEM.blue }}>
                    {(m.name || "?").charAt(0)}
                  </span>
                )}
                <span
                  className="absolute bottom-1.5 left-1.5 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                  style={{ background: APPLE_SYSTEM.blue, color: "#fff" }}
                >
                  {m.role}
                </span>
              </div>
              <p className={`text-[14px] font-bold leading-tight ${glass.titleClass}`}>{m.name}</p>
              <p className="text-[12px] mt-1 font-semibold" style={{ color: APPLE_SYSTEM.blue }}>
                {m.role}
              </p>
              <p className={`text-[12px] sm:text-[13px] mt-2 leading-snug line-clamp-4 flex-1 ${glass.bodyClass}`}>
                {renderBullet(resolveBio(i), i, "")}
              </p>
              <div className="mt-auto pt-2 flex flex-wrap gap-1">
                {(skillSets[i] || skillSets[0]).map((tag) => (
                  <AppleChip key={tag} glass={glass}>
                    {tag}
                  </AppleChip>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3.5 flex flex-col gap-2.5 min-h-0" style={appleGroupedStyle(glass.isLight, forExport)}>
          <p className={`text-[13px] font-bold ${glass.titleClass}`}>Moat & Skills</p>
          <div className="flex-1 min-h-0 flex flex-col justify-between gap-2">
            {moatBullets.map((item, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl flex-1 min-h-0"
                style={{ background: glass.isLight ? "#F2F2F7" : APPLE_SYSTEM.secondaryGroupedDark }}
              >
                <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: APPLE_SYSTEM.blue }}>
                  {item.label}
                </p>
                <p className={`text-[13px] mt-1 leading-snug line-clamp-3 ${glass.bodyClass}`}>
                  {renderBullet(item.detail, i + 10, "")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AppleRoadmapTimeline: React.FC<{
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
      ? timeline.slice(0, 4).map((t, i) => ({ label: t.label, title: t.title, detail: t.detail || parsed[i]?.detail || "" }))
      : parsed.slice(0, 4).map((p, i) => ({ label: p.label || `Q${i + 1}`, title: p.label, detail: p.detail }))
  );
  while (items.length < 4) {
    const n = items.length + 1;
    items.push({ label: `Q${n}`, title: `Этап ${n}`, detail: "Milestone" });
  }

  return (
    <div className="flex flex-col gap-2 my-auto min-h-0 flex-1 overflow-hidden" style={fontStyle}>
      <div className="shrink-0 flex flex-wrap items-end justify-between gap-2">
        <div>
          <AppleChip glass={glass} accent>Go-to-market · 12 мес</AppleChip>
          {title && <h2 className={`text-base sm:text-lg font-bold tracking-tight mt-2 ${glass.titleClass}`}>{title}</h2>}
          {subtitle && <p className={`text-[12px] mt-0.5 line-clamp-1 ${glass.mutedClass}`}>{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1">
          {items.map((it, i) => (
            <React.Fragment key={i}>
              <span className="h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center" style={{ background: i === 0 ? APPLE_SYSTEM.blue : `${APPLE_SYSTEM.blue}22`, color: i === 0 ? "#fff" : APPLE_SYSTEM.blue }}>{it.label}</span>
              {i < items.length - 1 && <ArrowRight className="h-2.5 w-2.5 opacity-25" />}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 flex-1 min-h-0">
        {items.map((item, i) => (
          <div key={i} className="p-2.5 flex flex-col min-h-0" style={appleGroupedStyle(glass.isLight, forExport)}>
            <div className="flex items-center justify-between shrink-0">
              <span className="text-[12px] font-bold" style={{ color: APPLE_SYSTEM.blue }}>{item.label}</span>
              <span className="h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: glass.isLight ? "#E5E5EA" : APPLE_SYSTEM.secondaryGroupedDark }}>{i + 1}</span>
            </div>
            <h3 className={`text-[10px] font-semibold mt-1.5 line-clamp-2 ${glass.titleClass}`}>
              {renderLabel ? renderLabel(item.title || item.label, i, "") : item.title || item.label}
            </h3>
            <p className={`text-[11px] mt-1 leading-snug line-clamp-4 flex-1 ${glass.mutedClass}`}>
              {renderBullet ? renderBullet(item.detail || "", i, "") : item.detail}
            </p>
            <div className="mt-auto pt-1.5">
              <div className="h-1 rounded-full overflow-hidden" style={{ background: glass.isLight ? "#E5E5EA" : APPLE_SYSTEM.secondaryGroupedDark }}>
                <div className="h-full rounded-full" style={{ width: `${25 + i * 22}%`, background: APPLE_SYSTEM.blue }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AppleAskSlide: React.FC<{
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
  const askValue = (ask && (extractNumber(ask.raw) || ask.number)) || extractNumber(content[0] || "") || "25 млн ₽";
  const goal = parsed.find((p) => /цель|goal|город/i.test(p.label + p.detail)) || parsed[2];
  const contact = parsed.find((p) => /контакт|@|mail/i.test(p.label + p.detail + p.raw)) || parsed[3];
  const splits = [
    { label: "Supply", pct: "45%", detail: "Парки и onboarding", width: "45%" },
    { label: "Product", pct: "30%", detail: "App, payments, SLA", width: "30%" },
    { label: "Growth", pct: "25%", detail: "Performance + B2B", width: "25%" },
  ];

  return (
    <div className="flex flex-col gap-2 my-auto min-h-0 flex-1 overflow-hidden" style={fontStyle}>
      <div className="shrink-0">
        <AppleChip glass={glass} accent>Seed ask</AppleChip>
        {title && <h2 className={`text-base sm:text-lg font-bold tracking-tight mt-2 ${glass.titleClass}`}>{title}</h2>}
        {subtitle && <p className={`text-[12px] mt-0.5 line-clamp-1 ${glass.mutedClass}`}>{subtitle}</p>}
      </div>
      <div className="grid grid-cols-[1.15fr_1fr] gap-2 flex-1 min-h-0">
        <div className="p-4 flex flex-col justify-between min-h-0" style={appleGroupedStyle(glass.isLight, forExport)}>
          <div>
            <p className={`text-[11px] uppercase ${glass.mutedClass}`}>Раунд</p>
            <div className="text-3xl sm:text-4xl font-bold tracking-tight mt-1" style={{ color: APPLE_SYSTEM.blue }}>{askValue}</div>
            <p className={`text-[10px] mt-2 leading-relaxed ${glass.mutedClass}`}>
              {renderBullet ? renderBullet(ask?.detail || "Seed round на масштабирование", 0, "") : ask?.detail || "Seed round на масштабирование"}
            </p>
          </div>
          <div className="pt-3 border-t" style={{ borderColor: glass.isLight ? APPLE_SYSTEM.separatorLight : APPLE_SYSTEM.separatorDark }}>
            <p className={`text-[10px] font-semibold ${glass.titleClass}`}>{renderLabel ? renderLabel(goal?.label || "Цель", 2, "") : goal?.label || "Цель"}</p>
            <p className={`text-[12px] mt-0.5 line-clamp-2 ${glass.mutedClass}`}>
              {renderBullet ? renderBullet(goal?.detail || "3 города, unit-экономика в плюс", 2, "") : goal?.detail}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 min-h-0">
          <div className="p-3 flex-1 min-h-0 flex flex-col" style={appleGroupedStyle(glass.isLight, forExport)}>
            <p className={`text-[10px] font-semibold mb-2 ${glass.titleClass}`}>Use of funds</p>
            <div className="space-y-2 flex-1 flex flex-col justify-center">
              {splits.map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between text-[12px] mb-0.5">
                    <span className={glass.titleClass}>{s.label}</span>
                    <span className="font-bold" style={{ color: APPLE_SYSTEM.blue }}>{s.pct}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: glass.isLight ? "#E5E5EA" : APPLE_SYSTEM.secondaryGroupedDark }}>
                    <div className="h-full rounded-full" style={{ width: s.width, background: APPLE_SYSTEM.blue }} />
                  </div>
                  <p className={`text-[10px] mt-0.5 ${glass.mutedClass}`}>{s.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="px-3 py-2.5 flex items-center justify-between gap-2" style={appleGroupedStyle(glass.isLight, forExport)}>
            <div className="min-w-0">
              <p className={`text-[10px] uppercase ${glass.mutedClass}`}>Контакт</p>
              <p className={`text-[10px] font-semibold truncate ${glass.titleClass}`}>{contact?.detail || contact?.raw || "hello@company.com"}</p>
            </div>
            <span className="text-[11px] font-semibold px-3 py-1.5 rounded-full text-white shrink-0" style={{ background: APPLE_SYSTEM.blue }}>
              Связаться →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AppleVisionMap: React.FC<{
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
  while (items.length < 4) items.push({ raw: "", label: `Направление ${items.length + 1}`, detail: "Долгосрочный вектор", number: "" });
  const northStar = content.find((c) => c.length > 20) || subtitle || "Стать стандартом категории в регионе";

  return (
    <div className="flex flex-col gap-2 my-auto min-h-0 flex-1 overflow-hidden" style={fontStyle}>
      <div className="shrink-0">
        <AppleChip glass={glass} accent>Vision · 5 лет</AppleChip>
        {title && <h2 className={`text-base sm:text-lg font-bold tracking-tight mt-2 ${glass.titleClass}`}>{title}</h2>}
        {subtitle && <p className={`text-[12px] mt-0.5 line-clamp-1 ${glass.mutedClass}`}>{subtitle}</p>}
      </div>
      <div className="p-3 shrink-0 rounded-xl italic text-center" style={{ ...appleGroupedStyle(glass.isLight, forExport), borderLeft: `4px solid ${APPLE_SYSTEM.blue}` }}>
        <p className={`text-[10px] leading-relaxed ${glass.bodyClass}`}>«{northStar}»</p>
      </div>
      <div className="grid grid-cols-2 grid-rows-2 gap-2 flex-1 min-h-0">
        {items.map((item, i) => (
          <div key={i} className="p-2.5 flex flex-col justify-between min-h-0" style={appleGroupedStyle(glass.isLight, forExport)}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold" style={{ color: APPLE_SYSTEM.blue }}>{String(i + 1).padStart(2, "0")}</span>
              <Zap className="h-3 w-3 opacity-30" />
            </div>
            <div className="mt-1 flex-1 min-h-0">
              <h3 className={`text-[11px] font-semibold leading-tight ${glass.titleClass}`}>
                {renderLabel ? renderLabel(item.label, i, "") : item.label}
              </h3>
              <p className={`text-[12px] mt-1 leading-snug line-clamp-3 ${glass.mutedClass}`}>{renderBullet(item.detail, i, "")}</p>
            </div>
            {i === 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {["СНГ", "Данные", "B2B"].map((t) => (
                  <AppleChip key={t} glass={glass} accent>{t}</AppleChip>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
