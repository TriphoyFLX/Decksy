import React from "react";
import { BarChart3, Clock, TrendingUp, User, Zap } from "lucide-react";
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
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ title, content, image, parseBullet, renderBullet, renderLabel, glass, forExport }) => {
  const lead = parseItems(content, parseBullet)[0];
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 my-auto items-center min-h-0 flex-1 overflow-hidden font-[Manrope,sans-serif]">
      <div className="md:col-span-3 min-w-0">
        <CreamChip glass={glass}>Проблема</CreamChip>
        <h2
          className={`font-extrabold leading-[1.02] tracking-tight mt-3 ${glass.titleClass}`}
          style={{ fontSize: forExport ? "1.5rem" : "clamp(1rem, 2.8vw, 1.35rem)" }}
        >
          {title}
        </h2>
        <p className={`mt-3 text-[9px] sm:text-[10px] leading-relaxed max-w-lg ${glass.mutedClass}`}>
          {lead?.detail ? renderBullet(lead.detail, 0, "") : renderBullet(content[0] || "", 0, "")}
        </p>
        {content.slice(1, 3).map((item, i) => (
          <p key={i} className={`mt-2 text-[8.5px] leading-relaxed ${glass.bodyClass}`}>
            {renderLabel ? renderLabel(parseBullet(item).label, i + 1, "") : renderBullet(item, i + 1, "")}
          </p>
        ))}
      </div>
      {image ? (
        <div className={`md:col-span-2 ${creamCardClass} p-1.5 aspect-[4/5] max-h-full`} style={creamCardStyle(forExport)}>
          <PremiumImage src={image} variant="hero" className="!rounded-xl !min-h-full" />
        </div>
      ) : (
        <div
          className={`md:col-span-2 ${creamCardClass} aspect-[4/5] flex items-center justify-center`}
          style={creamCardStyle(forExport)}
        >
          <span className="text-[8px] font-mono uppercase tracking-widest text-white/30">Иллюстрация</span>
        </div>
      )}
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
  content: string[];
  cardImages?: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, cardImages, parseBullet, renderBullet, renderLabel, glass, forExport }) => {
  const items = parseItems(content, parseBullet).slice(0, 3);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-auto min-h-0 flex-1 font-[Manrope,sans-serif]">
      {items.map((item, i) => (
        <div key={i} className="min-w-0">
          {cardImages?.[i] ? (
            <div className={`${creamCardClass} mb-2 overflow-hidden aspect-[4/5] max-h-28`} style={creamCardStyle(forExport)}>
              <PremiumImage src={cardImages[i]} variant="thumb" className="!min-h-full !rounded-xl" />
            </div>
          ) : (
            <div
              className={`${creamCardClass} mb-2 aspect-[4/5] max-h-28 flex items-center justify-center`}
              style={creamCardStyle(forExport)}
            >
              <span className="text-[7px] font-mono uppercase tracking-widest text-white/30">Шаг {i + 1}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[8px] text-white/35">{String(i + 1).padStart(2, "0")}</span>
            <h3 className={`text-[10px] font-semibold ${glass.titleClass}`}>
              {renderLabel ? renderLabel(item.label, i, "") : item.label}
            </h3>
          </div>
          <p className={`text-[8.5px] mt-1 leading-relaxed line-clamp-3 ${glass.mutedClass}`}>
            {renderBullet(item.detail, i, "")}
          </p>
        </div>
      ))}
    </div>
  );
};

export const CreamFeatureCards: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, parseBullet, renderBullet, renderLabel, glass, forExport }) => {
  const icons = [Zap, Clock, TrendingUp];
  const items = parseItems(content, parseBullet).slice(0, 3);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-auto min-h-0 flex-1 font-[Manrope,sans-serif]">
      {items.map((item, i) => {
        const Icon = icons[i] || Zap;
        return (
          <div key={i} className={`${creamCardClass} p-4 flex flex-col`} style={creamCardStyle(forExport)}>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ ...creamStrongStyle(forExport), color: glass.accent }}
            >
              <Icon className="h-4 w-4" strokeWidth={1.6} />
            </div>
            <h3 className={`text-[11px] font-semibold mb-1 ${glass.titleClass}`}>
              {renderLabel ? renderLabel(item.label, i, "") : item.label}
            </h3>
            <p className={`text-[8.5px] leading-relaxed line-clamp-4 ${glass.mutedClass}`}>
              {renderBullet(item.detail, i, "")}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export const CreamMarketStack: React.FC<{
  content: string[];
  metrics?: SlideVisualData["metrics"];
  parseBullet: (s: string) => { label: string; detail: string };
  extractNumber: (s: string) => string;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, metrics, parseBullet, extractNumber, renderLabel, glass, forExport }) => {
  const tamLabels = ["TAM", "SAM", "SOM"];
  const metricItems =
    metrics?.slice(0, 3) ||
    parseItems(content, parseBullet)
      .slice(0, 3)
      .map((item, i) => ({
        label: tamLabels[i] || item.label,
        value: extractNumber(item.raw) || item.number || "$X.X B",
        highlight: i === 2,
      }));
  const drivers = parseItems(content, parseBullet).slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 my-auto items-center min-h-0 flex-1 font-[Manrope,sans-serif]">
      <div className="md:col-span-2 flex flex-col gap-2">
        {metricItems.map((m, i) => (
          <div key={i} className={`${creamCardClass} p-3`} style={creamStrongStyle(forExport)}>
            <CreamChip glass={glass}>{m.label}</CreamChip>
            <div className="font-extrabold text-xl mt-2" style={{ color: glass.accent }}>
              {m.value}
            </div>
          </div>
        ))}
      </div>
      <div className="md:col-span-3 min-w-0">
        <h3 className={`text-sm font-extrabold mb-3 ${glass.titleClass}`}>Большой и растущий рынок</h3>
        <div className="space-y-2">
          {drivers.map((item, i) => (
            <React.Fragment key={i}>
              <div className="flex items-start gap-3">
                <span className="font-mono text-[7px] mt-0.5 text-white/35">{["CAGR", "РЕГ", "ТЕХ"][i]}</span>
                <p className={`text-[8.5px] leading-relaxed ${glass.mutedClass}`}>
                  {renderLabel ? renderLabel(item.label, i, "") : item.detail}
                </p>
              </div>
              {i < drivers.length - 1 && <div className="h-px bg-white/10" />}
            </React.Fragment>
          ))}
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
