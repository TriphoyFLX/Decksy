import React from "react";
import { ArrowRight, ChevronLeft, Check, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { TEMPLATE_CATALOG, type DeckTemplateId } from "../lib/deckTheme";

interface TemplatePickerPageProps {
  selectedTemplate: DeckTemplateId;
  onSelect: (id: DeckTemplateId) => void;
  onBack: () => void;
  onGenerate: () => void;
  isLoading: boolean;
  slideCount: number;
}

function TemplatePreview({ id }: { id: DeckTemplateId }) {
  const t = TEMPLATE_CATALOG[id];

  if (t.backgroundImage) {
    return (
      <div
        className="h-full w-full relative overflow-hidden"
        style={{
          backgroundImage: `url(${t.backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: t.isLightBackground ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)" }}
        />
        <div className="relative z-10 h-full flex flex-col justify-end p-3">
          <div
            className={`h-1.5 w-14 rounded mb-1 ${t.isLightBackground ? "bg-neutral-800/70" : "bg-white/80"}`}
          />
          <div className={`h-1 w-10 rounded ${t.isLightBackground ? "bg-neutral-600/40" : "bg-white/30"}`} />
        </div>
      </div>
    );
  }

  if (id === "apex") {
    return (
      <div className="h-full w-full rounded-lg overflow-hidden flex flex-col items-center justify-center p-3" style={{ background: t.frameGradient }}>
        <div className="w-8 h-8 rounded-xl bg-[#0071e3] text-white text-xs font-bold flex items-center justify-center mb-2">A</div>
        <div className="h-1.5 w-16 bg-white/80 rounded mb-1" />
        <div className="h-1 w-12 bg-white/30 rounded" />
        <div className="grid grid-cols-3 gap-1 mt-3 w-full px-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 rounded bg-white/[0.06] border border-white/10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-lg overflow-hidden p-3 flex flex-col gap-2" style={{ background: t.frameGradient }}>
      <div className="h-2 w-14 bg-white/70 rounded" />
      <div className="grid grid-cols-3 gap-1 flex-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg bg-white/[0.04] border border-white/[0.07] p-1">
            <div className="h-1 w-4 bg-red-400/40 rounded mb-1" />
            <div className="h-0.5 w-full bg-white/20 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export const TemplatePickerPage: React.FC<TemplatePickerPageProps> = ({
  selectedTemplate,
  onSelect,
  onBack,
  onGenerate,
  isLoading,
  slideCount,
}) => {
  const templates = Object.values(TEMPLATE_CATALOG);
  const activeAccent = TEMPLATE_CATALOG[selectedTemplate].accent;

  return (
    <motion.div
      id="screen-templates"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto pb-24"
    >
      <button
        type="button"
        onClick={onBack}
        className="text-slate-400 hover:text-white flex items-center gap-1 text-xs mb-4 cursor-pointer bg-transparent border-none"
      >
        <ChevronLeft className="h-4 w-4" />
        К плану
      </button>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">Шаг 4 · Шаблон</p>
            <h1 className="text-2xl font-semibold text-white">Template preview</h1>
            <p className="text-sm text-slate-400 mt-1">
              {TEMPLATE_CATALOG[selectedTemplate].name} · {TEMPLATE_CATALOG[selectedTemplate].source}
            </p>
          </div>

          <div className="aspect-video rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <TemplatePreview id={selectedTemplate} />
          </div>

          <p className="text-sm text-slate-500">
            12 слайдов investor pitch · фон из PresentationBack
          </p>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-lg font-medium text-white">Choose template</h2>
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {templates.map((tpl) => {
              const active = selectedTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => onSelect(tpl.id)}
                  className={`w-full text-left rounded-xl border p-2 transition-all cursor-pointer ${
                    active
                      ? "ring-2 bg-white/[0.04]"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                  style={
                    active
                      ? { borderColor: tpl.accent, boxShadow: `0 0 0 1px ${tpl.accent}33` }
                      : undefined
                  }
                >
                  <div className="aspect-video rounded-lg overflow-hidden mb-2 h-24">
                    <TemplatePreview id={tpl.id} />
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <p className="text-sm font-medium text-white">{tpl.name}</p>
                      <p className="text-[10px] text-slate-500">{tpl.description}</p>
                    </div>
                    {active && <Check className="h-4 w-4" style={{ color: activeAccent }} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-[#0D0D0F] to-transparent">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#161618]/95 backdrop-blur-md px-5 py-3">
          <span className="text-sm text-slate-400 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-400" />
            {slideCount} slides · {TEMPLATE_CATALOG[selectedTemplate].name}
          </span>
          <button
            type="button"
            onClick={onGenerate}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-slate-200 disabled:opacity-40 cursor-pointer border-none flex items-center gap-2"
          >
            {isLoading ? "Генерация..." : "Generate presentation"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
