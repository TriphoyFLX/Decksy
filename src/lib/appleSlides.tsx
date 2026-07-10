import React from "react";
import {
  BarChart3,
  ChevronRight,
  Layers,
  Shield,
  Sparkles,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import type { SlideVisualData } from "../types";
import { PremiumImage } from "./slideVisuals";
import type { GlassSurface } from "./apexSlides";
import { APPLE_FONT, APPLE_SYSTEM, appleGroupedStyle, appleSeparatorStyle } from "./appleHIG";

type InlineRenderer = (text: string, index: number, className: string, Tag?: React.ElementType) => React.ReactNode;

const fontStyle = { fontFamily: APPLE_FONT };

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

export const AppleSectionLabel: React.FC<{ children: React.ReactNode; glass: GlassSurface }> = ({
  children,
  glass,
}) => (
  <p
    className="text-[8px] sm:text-[9px] font-normal uppercase tracking-wide mb-2 px-1"
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
      : content.find((c) => /основатель|ceo|founder/i.test(c))?.replace(/^[^:]+:\s*/i, "") || "";

  return (
    <div className="flex flex-col md:flex-row gap-5 my-auto items-center min-h-0 flex-1 overflow-hidden" style={fontStyle}>
      <div className="flex-1 text-left min-w-0">
        <p className="text-[9px] sm:text-[10px] font-semibold mb-2" style={{ color: APPLE_SYSTEM.blue }}>
          Pitch Deck
        </p>
        <h1
          className={`font-bold tracking-tight leading-[1.05] ${glass.titleClass}`}
          style={{ fontSize: forExport ? "2rem" : "clamp(1.25rem, 3.8vw, 1.85rem)", letterSpacing: "-0.02em" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className={`mt-2 text-[10px] sm:text-xs leading-relaxed max-w-md font-normal ${glass.mutedClass}`}>
            {subtitle}
          </p>
        )}
        {founderText && (
          <div className="mt-5 flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: glass.isLight ? "#E5E5EA" : APPLE_SYSTEM.secondaryGroupedDark }}
            >
              <User className="h-4 w-4" style={{ color: APPLE_SYSTEM.gray }} />
            </div>
            <div>
              <div className={`text-[10px] font-medium ${glass.titleClass}`}>{founderText}</div>
              <div className={`text-[8px] ${glass.mutedClass}`}>{founderRole || "Founder"}</div>
            </div>
          </div>
        )}
      </div>
      {image ? (
        <div
          className="w-full md:w-[42%] rounded-2xl overflow-hidden p-1 shrink-0"
          style={appleGroupedStyle(glass.isLight, forExport)}
        >
          <PremiumImage src={image} variant="hero" className="!rounded-xl !min-h-[100px]" />
        </div>
      ) : (
        <div
          className="w-full md:w-[38%] aspect-[4/3] rounded-2xl flex items-center justify-center shrink-0"
          style={{
            ...appleGroupedStyle(glass.isLight, forExport),
            background: glass.isLight
              ? "linear-gradient(160deg, #FFFFFF, #F2F2F7)"
              : "linear-gradient(160deg, #2C2C2E, #1C1C1E)",
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: APPLE_SYSTEM.blue, color: "#fff" }}
          >
            <Sparkles className="h-7 w-7" strokeWidth={1.8} />
          </div>
        </div>
      )}
    </div>
  );
};

export const AppleGroupedList: React.FC<{
  title: React.ReactNode;
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ title, content, parseBullet, renderBullet, renderLabel, glass, forExport }) => {
  const items = parseItems(content, parseBullet).slice(0, 4);
  const icons = [Zap, Shield, TrendingUp, Layers];

  return (
    <div className="my-auto min-h-0 flex-1 overflow-hidden" style={fontStyle}>
      <AppleSectionLabel glass={glass}>Проблема</AppleSectionLabel>
      <h2 className={`text-base sm:text-lg font-bold tracking-tight mb-3 px-1 ${glass.titleClass}`}>{title}</h2>
      <div style={appleGroupedStyle(glass.isLight, forExport)}>
        {items.map((item, i) => {
          const Icon = icons[i] || Zap;
          return (
            <React.Fragment key={i}>
              {i > 0 && <div style={appleSeparatorStyle(glass.isLight)} />}
              <div className="flex items-center gap-3 px-3.5 py-2.5 min-h-[44px]">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${APPLE_SYSTEM.blue}22`, color: APPLE_SYSTEM.blue }}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className={`text-[10px] font-medium leading-tight ${glass.titleClass}`}>
                    {renderLabel ? renderLabel(item.label, i, "") : item.label}
                  </div>
                  <p className={`text-[8.5px] leading-snug line-clamp-2 mt-0.5 ${glass.mutedClass}`}>
                    {renderBullet(item.detail, i, "")}
                  </p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-35" />
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export const AppleMetricTiles: React.FC<{
  content: string[];
  metrics?: SlideVisualData["metrics"];
  parseBullet: (s: string) => { label: string; detail: string };
  extractNumber: (s: string) => string;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, metrics, parseBullet, extractNumber, renderLabel, glass, forExport }) => {
  const items =
    metrics?.slice(0, 3) ||
    parseItems(content, parseBullet).slice(0, 3).map((item, i) => ({
      label: item.label,
      value: extractNumber(item.raw) || item.number || ["70%", "$1.2B", "3x"][i],
      highlight: i === 0,
    }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-auto min-h-0 flex-1" style={fontStyle}>
      {items.map((m, i) => (
        <div key={i} className="p-4 text-left" style={appleGroupedStyle(glass.isLight, forExport)}>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: APPLE_SYSTEM.blue }}>
            {"value" in m ? m.value : extractNumber((m as { raw?: string }).raw || "")}
          </div>
          <p className={`text-[8.5px] mt-2 leading-relaxed line-clamp-3 ${glass.mutedClass}`}>
            {renderLabel ? renderLabel(m.label, i, "") : m.label}
          </p>
        </div>
      ))}
    </div>
  );
};

export const AppleFeatureRows: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, parseBullet, renderBullet, renderLabel, glass, forExport }) => {
  const items = parseItems(content, parseBullet).slice(0, 3);
  const icons = [Sparkles, Shield, Zap];

  return (
    <div className="my-auto min-h-0 flex-1" style={fontStyle}>
      <AppleSectionLabel glass={glass}>Преимущества</AppleSectionLabel>
      <div style={appleGroupedStyle(glass.isLight, forExport)}>
        {items.map((item, i) => {
          const Icon = icons[i] || Sparkles;
          return (
            <React.Fragment key={i}>
              {i > 0 && <div style={appleSeparatorStyle(glass.isLight)} />}
              <div className="flex items-start gap-3 px-3.5 py-3">
                <Icon className="h-4 w-4 mt-0.5 shrink-0" style={{ color: APPLE_SYSTEM.blue }} strokeWidth={2} />
                <div className="min-w-0 flex-1">
                  <div className={`text-[10px] font-semibold ${glass.titleClass}`}>
                    {renderLabel ? renderLabel(item.label, i, "") : item.label}
                  </div>
                  <p className={`text-[8.5px] mt-1 leading-relaxed line-clamp-3 ${glass.mutedClass}`}>
                    {renderBullet(item.detail, i, "")}
                  </p>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export const AppleProductShowcase: React.FC<{
  content: string[];
  image?: string;
  cardImages?: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, image, cardImages, parseBullet, renderBullet, renderLabel, glass, forExport }) => {
  const items = parseItems(content, parseBullet).slice(0, 3);
  const hero = image || cardImages?.[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-3 my-auto min-h-0 flex-1 overflow-hidden" style={fontStyle}>
      <div style={appleGroupedStyle(glass.isLight, forExport)}>
        {items.map((item, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div style={appleSeparatorStyle(glass.isLight)} />}
            <div className="flex gap-3 px-3.5 py-2.5">
              <span className="text-[10px] font-semibold w-5 shrink-0" style={{ color: APPLE_SYSTEM.blue }}>
                {i + 1}
              </span>
              <div className="min-w-0">
                <div className={`text-[10px] font-medium ${glass.titleClass}`}>
                  {renderLabel ? renderLabel(item.label, i, "") : item.label}
                </div>
                <p className={`text-[8.5px] mt-0.5 line-clamp-2 ${glass.mutedClass}`}>
                  {renderBullet(item.detail, i, "")}
                </p>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
      <div
        className="rounded-2xl p-2 flex items-center justify-center min-h-[120px] overflow-hidden"
        style={{
          ...appleGroupedStyle(glass.isLight, forExport),
          background: glass.isLight ? "#FFFFFF" : "#2C2C2E",
        }}
      >
        {hero ? (
          <PremiumImage src={hero} variant="hero" className="!rounded-xl !max-h-full" />
        ) : (
          <div className="text-center px-4">
            <div
              className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
              style={{ background: APPLE_SYSTEM.blue, color: "#fff" }}
            >
              <Layers className="h-5 w-5" />
            </div>
            <span className={`text-[8px] ${glass.mutedClass}`}>Product Interface</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const AppleMarketGrouped: React.FC<{
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
    parseItems(content, parseBullet).slice(0, 3).map((item, i) => ({
      label: tamLabels[i],
      value: extractNumber(item.raw) || item.number || "$X.X B",
    }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-auto min-h-0 flex-1" style={fontStyle}>
      <div style={appleGroupedStyle(glass.isLight, forExport)}>
        {metricItems.map((m, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div style={{ ...appleSeparatorStyle(glass.isLight), marginLeft: 16 }} />}
            <div className="flex items-center justify-between px-3.5 py-2.5 min-h-[44px]">
              <span className={`text-[10px] font-medium ${glass.titleClass}`}>{m.label}</span>
              <span className="text-sm font-bold" style={{ color: APPLE_SYSTEM.blue }}>
                {m.value}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
      <div style={appleGroupedStyle(glass.isLight, forExport)}>
        {parseItems(content, parseBullet)
          .slice(0, 3)
          .map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div style={appleSeparatorStyle(glass.isLight)} />}
              <div className="px-3.5 py-2.5">
                <p className={`text-[8.5px] leading-relaxed ${glass.mutedClass}`}>
                  {renderLabel ? renderLabel(item.label, i, "") : item.detail}
                </p>
              </div>
            </React.Fragment>
          ))}
      </div>
    </div>
  );
};

export const AppleCompareTable: React.FC<{
  content: string[];
  competitors?: SlideVisualData["competitors"];
  parseBullet: (s: string) => { label: string; detail: string };
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, competitors, parseBullet, glass, forExport }) => {
  const rows = competitors?.length
    ? competitors.slice(0, 4).map((c) => ({ label: c.label, us: c.ours ? "✓" : "—", them: "—" }))
    : parseItems(content, parseBullet).slice(0, 4).map((item) => ({ label: item.label, us: "✓", them: "—" }));

  return (
    <div className="my-auto min-h-0 flex-1" style={{ ...fontStyle, ...appleGroupedStyle(glass.isLight, forExport) }}>
      <div
        className="grid grid-cols-[1.2fr_0.5fr_0.5fr] px-3.5 py-2 text-[8px] font-medium uppercase tracking-wide"
        style={{ color: glass.isLight ? APPLE_SYSTEM.secondaryLabelLight : APPLE_SYSTEM.secondaryLabelDark }}
      >
        <span>Критерий</span>
        <span className="text-center" style={{ color: APPLE_SYSTEM.blue }}>
          Мы
        </span>
        <span className="text-center">Другие</span>
      </div>
      {rows.map((row, i) => (
        <React.Fragment key={i}>
          <div style={{ ...appleSeparatorStyle(glass.isLight), marginLeft: 0 }} />
          <div className="grid grid-cols-[1.2fr_0.5fr_0.5fr] px-3.5 py-2.5 min-h-[40px] items-center">
            <span className={`text-[9px] ${glass.bodyClass}`}>{row.label}</span>
            <span className="text-center text-sm font-semibold" style={{ color: APPLE_SYSTEM.green }}>
              {row.us}
            </span>
            <span className={`text-center text-sm ${glass.mutedClass}`}>{row.them}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export const AppleBizGrouped: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  extractNumber: (s: string) => string;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, parseBullet, extractNumber, renderLabel, glass, forExport }) => {
  const streams = parseItems(content, parseBullet).slice(0, 3);
  const unitLabels = ["LTV", "CAC", "Ratio", "Retention"];
  const unitItems = parseItems(content.slice(3, 7), parseBullet);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-auto min-h-0 flex-1" style={fontStyle}>
      <div>
        <AppleSectionLabel glass={glass}>Монетизация</AppleSectionLabel>
        <div style={appleGroupedStyle(glass.isLight, forExport)}>
          {streams.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div style={{ ...appleSeparatorStyle(glass.isLight), marginLeft: 16 }} />}
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className={`text-[9px] font-medium ${glass.titleClass}`}>
                  {renderLabel ? renderLabel(item.label, i, "") : item.label}
                </span>
                <span className="text-sm font-bold" style={{ color: APPLE_SYSTEM.blue }}>
                  {extractNumber(item.raw) || ["60%", "30%", "10%"][i]}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
      <div>
        <AppleSectionLabel glass={glass}>Unit economics</AppleSectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {(unitItems.length ? unitItems : streams).slice(0, 4).map((item, i) => (
            <div key={i} className="p-3 text-left" style={appleGroupedStyle(glass.isLight, forExport)}>
              <div className={`text-[8px] mb-1 ${glass.mutedClass}`}>{unitLabels[i]}</div>
              <div className="text-lg font-bold" style={{ color: APPLE_SYSTEM.blue }}>
                {extractNumber(item.raw) || item.number || ["$XXX", "$XX", "3x", "XX%"][i]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AppleTractionBoard: React.FC<{
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  extractNumber: (s: string) => string;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, parseBullet, extractNumber, renderLabel, glass, forExport }) => {
  const items = parseItems(content, parseBullet).slice(0, 4);

  return (
    <div className="my-auto min-h-0 flex-1" style={fontStyle}>
      <div
        className="rounded-xl h-24 mb-3 flex items-center justify-center gap-2"
        style={appleGroupedStyle(glass.isLight, forExport)}
      >
        <BarChart3 className="h-5 w-5" style={{ color: APPLE_SYSTEM.blue }} />
        <span className={`text-[8px] ${glass.mutedClass}`}>Динамика роста</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {items.map((item, i) => (
          <div key={i} className="p-3 text-left" style={appleGroupedStyle(glass.isLight, forExport)}>
            <div className="text-lg font-bold" style={{ color: APPLE_SYSTEM.blue }}>
              {extractNumber(item.raw) || item.number}
            </div>
            <div className={`text-[7px] mt-1 uppercase tracking-wide ${glass.mutedClass}`}>
              {renderLabel ? renderLabel(item.label, i, "") : item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AppleTeamGrouped: React.FC<{
  content: string[];
  teamMembers?: SlideVisualData["teamMembers"];
  parseBullet: (s: string) => { label: string; detail: string };
  renderBullet: (t: string, i: number, cls: string) => React.ReactNode;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, teamMembers, parseBullet, renderBullet, glass, forExport }) => {
  const members =
    teamMembers?.slice(0, 4) ||
    parseItems(content, parseBullet).slice(0, 4).map((item) => ({
      name: item.label,
      role: item.number || "Role",
      image: "",
    }));

  return (
    <div className="my-auto min-h-0 flex-1" style={{ ...fontStyle, ...appleGroupedStyle(glass.isLight, forExport) }}>
      {members.map((m, i) => (
        <React.Fragment key={i}>
          {i > 0 && <div style={appleSeparatorStyle(glass.isLight)} />}
          <div className="flex items-center gap-3 px-3.5 py-2.5 min-h-[52px]">
            {m.image ? (
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                <PremiumImage src={m.image} variant="thumb" className="!w-full !h-full !rounded-full" />
              </div>
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ background: glass.isLight ? "#E5E5EA" : APPLE_SYSTEM.secondaryGroupedDark }}
              >
                <User className="h-4 w-4" style={{ color: APPLE_SYSTEM.gray }} />
              </div>
            )}
            <div className="flex-1 min-w-0 text-left">
              <div className={`text-[10px] font-medium ${glass.titleClass}`}>{m.name}</div>
              <div className={`text-[8px] ${glass.mutedClass}`}>{m.role}</div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 opacity-30 shrink-0" />
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export const AppleTimeline: React.FC<{
  content: string[];
  timeline?: SlideVisualData["timeline"];
  parseBullet: (s: string) => { label: string; detail: string };
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ content, timeline, parseBullet, renderLabel, glass, forExport }) => {
  const items = timeline?.slice(0, 4) || parseItems(content, parseBullet).slice(0, 4);

  return (
    <div className="my-auto min-h-0 flex-1" style={{ ...fontStyle, ...appleGroupedStyle(glass.isLight, forExport) }}>
      {items.map((item, i) => {
        const label = "label" in item ? item.label : (item as { label: string }).label;
        const detail =
          "detail" in item && item.detail
            ? item.detail
            : "title" in item
              ? (item as { title?: string }).title
              : label;
        return (
          <React.Fragment key={i}>
            {i > 0 && <div style={appleSeparatorStyle(glass.isLight)} />}
            <div className="flex items-start gap-3 px-3.5 py-2.5">
              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: APPLE_SYSTEM.blue }} />
              <div className="min-w-0">
                <div className={`text-[10px] font-semibold ${glass.titleClass}`}>
                  {renderLabel ? renderLabel(label, i, "") : label || `Q${i + 1}`}
                </div>
                <p className={`text-[8.5px] mt-0.5 line-clamp-2 ${glass.mutedClass}`}>{detail}</p>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const AppleAskSlide: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  content: string[];
  parseBullet: (s: string) => { label: string; detail: string };
  extractNumber: (s: string) => string;
  renderLabel?: InlineRenderer;
  glass: GlassSurface;
  forExport?: boolean;
}> = ({ title, subtitle, content, parseBullet, extractNumber, renderLabel, glass, forExport }) => {
  const items = parseItems(content, parseBullet).slice(0, 3);
  const askAmount = extractNumber(content[0] || "") || title;

  return (
    <div className="flex flex-col justify-center my-auto min-h-0 flex-1 text-center" style={fontStyle}>
      <div className="text-2xl sm:text-3xl font-bold tracking-tight mb-2" style={{ color: APPLE_SYSTEM.blue }}>
        {askAmount}
      </div>
      {subtitle && <p className={`text-[10px] mb-4 max-w-sm mx-auto ${glass.mutedClass}`}>{subtitle}</p>}
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto w-full mb-4">
        {items.map((item, i) => (
          <div key={i} className="p-2.5" style={appleGroupedStyle(glass.isLight, forExport)}>
            <div className="text-sm font-bold" style={{ color: APPLE_SYSTEM.blue }}>
              {extractNumber(item.raw) || ["40%", "35%", "25%"][i]}
            </div>
            <div className={`text-[7px] mt-1 ${glass.mutedClass}`}>
              {renderLabel ? renderLabel(item.label, i, "") : item.label}
            </div>
          </div>
        ))}
      </div>
      <div
        className="inline-flex mx-auto px-5 py-2 rounded-full text-[9px] font-semibold text-white"
        style={{ background: APPLE_SYSTEM.blue }}
      >
        Связаться с нами
      </div>
    </div>
  );
};
