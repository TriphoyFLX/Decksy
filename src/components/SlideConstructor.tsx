import React, { useCallback, useRef, useState } from "react";
import { Move, LayoutGrid } from "lucide-react";
import type { SlideConstructorLayout, ConstructorElementPos } from "../types";

type ElementId = keyof NonNullable<SlideConstructorLayout["positions"]>;

const DEFAULT_POSITIONS: NonNullable<SlideConstructorLayout["positions"]> = {
  logo: { x: 6, y: 12, w: 14, h: 18 },
  title: { x: 6, y: 34, w: 52, h: 14 },
  subtitle: { x: 6, y: 50, w: 50, h: 10 },
  founder: { x: 6, y: 64, w: 40, h: 12 },
  quote: { x: 6, y: 78, w: 48, h: 14 },
};

interface SlideConstructorProps {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  layout?: SlideConstructorLayout;
  onLayoutChange: (layout: SlideConstructorLayout) => void;
  children: React.ReactNode;
  isPro: boolean;
}

export const SlideConstructor: React.FC<SlideConstructorProps> = ({
  enabled,
  onToggle,
  layout,
  onLayoutChange,
  children,
  isPro,
}) => {
  if (!isPro) return <>{children}</>;

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-0 right-0 z-30 flex gap-1">
        <button
          type="button"
          onClick={() => onToggle(!enabled)}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-mono uppercase tracking-wider border cursor-pointer ${
            enabled
              ? "bg-violet-500/20 border-violet-400/40 text-violet-200"
              : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
          }`}
        >
          <LayoutGrid className="h-3 w-3" />
          {enabled ? "Конструктор вкл" : "Конструктор"}
        </button>
      </div>
      {enabled ? (
        <ConstructorOverlay layout={layout} onLayoutChange={onLayoutChange}>
          {children}
        </ConstructorOverlay>
      ) : (
        children
      )}
    </div>
  );
};

const ConstructorOverlay: React.FC<{
  layout?: SlideConstructorLayout;
  onLayoutChange: (l: SlideConstructorLayout) => void;
  children: React.ReactNode;
}> = ({ layout, onLayoutChange, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const positions = { ...DEFAULT_POSITIONS, ...layout?.positions };
  const [dragging, setDragging] = useState<ElementId | null>(null);

  const startDrag = useCallback(
    (id: ElementId, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const startX = e.clientX;
      const startY = e.clientY;
      const pos = positions[id] || DEFAULT_POSITIONS[id]!;
      const originX = pos.x;
      const originY = pos.y;

      const onMove = (ev: MouseEvent) => {
        const dx = ((ev.clientX - startX) / rect.width) * 100;
        const dy = ((ev.clientY - startY) / rect.height) * 100;
        onLayoutChange({
          enabled: true,
          positions: {
            ...positions,
            [id]: {
              ...pos,
              x: Math.min(85, Math.max(2, originX + dx)),
              y: Math.min(88, Math.max(2, originY + dy)),
            },
          },
        });
      };
      const onUp = () => {
        setDragging(null);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      setDragging(id);
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [onLayoutChange, positions]
  );

  const labels: Record<ElementId, string> = {
    logo: "Логотип",
    title: "Название",
    subtitle: "Подзаголовок",
    founder: "Владелец",
    quote: "Цитата",
  };

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <div className="absolute inset-0 pointer-events-none opacity-[0.15] z-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(139,92,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.4) 1px, transparent 1px)",
          backgroundSize: "8% 8%",
        }}
      />
      {(Object.keys(DEFAULT_POSITIONS) as ElementId[]).map((id) => {
        const pos = positions[id] || DEFAULT_POSITIONS[id]!;
        return (
          <div
            key={id}
            className={`absolute z-25 border-2 border-dashed rounded-lg flex items-start gap-1 px-1 py-0.5 cursor-move select-none ${
              dragging === id ? "border-violet-400 bg-violet-500/15" : "border-violet-400/50 bg-violet-500/5"
            }`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: `${pos.w || 20}%`,
              minHeight: `${pos.h || 10}%`,
              pointerEvents: "auto",
            }}
            onMouseDown={(e) => startDrag(id, e)}
          >
            <Move className="h-3 w-3 text-violet-300 shrink-0 mt-0.5" />
            <span className="text-[7px] font-mono uppercase text-violet-200/90">{labels[id]}</span>
          </div>
        );
      })}
      <div className="relative z-10 h-full pointer-events-none [&_*]:pointer-events-auto">{children}</div>
    </div>
  );
};

export function getConstructorStyle(
  id: ElementId,
  layout?: SlideConstructorLayout
): React.CSSProperties | undefined {
  if (!layout?.enabled || !layout.positions?.[id]) return undefined;
  const pos = layout.positions[id]!;
  return {
    position: "absolute",
    left: `${pos.x}%`,
    top: `${pos.y}%`,
    width: pos.w ? `${pos.w}%` : undefined,
    maxWidth: pos.w ? `${pos.w}%` : "90%",
  };
}
