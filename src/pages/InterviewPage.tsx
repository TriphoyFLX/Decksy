import React, { useEffect, useRef, useState } from "react";
import { ArrowUp, Brain, CheckCircle2, ChevronDown, ChevronUp, ImagePlus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Message, PitchCanvas, Mode } from "../types";

interface InterviewPageProps {
  mode: Mode;
  underlyingThoughts: string;
  currentSentiment: { bg: string; label: string };
  messages: Message[];
  isLoading: boolean;
  inputMessage: string;
  setInputMessage: (value: string) => void;
  handleSendMessage: () => void;
  sessionImages: any[];
  setSessionImages: React.Dispatch<React.SetStateAction<any[]>>;
  handleGenerateDeck: () => void;
  canvas: PitchCanvas;
}

export const InterviewPage: React.FC<InterviewPageProps> = ({
  mode,
  underlyingThoughts,
  currentSentiment,
  messages,
  isLoading,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  sessionImages,
  setSessionImages,
  handleGenerateDeck,
  canvas,
}) => {
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [showMemory, setShowMemory] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const compiledCount = Object.values(canvas).filter(
    (c): c is PitchCanvas[keyof PitchCanvas] & { status: "compiled" } =>
      Boolean(c && typeof c === "object" && "status" in c && c.status === "compiled")
  ).length;

  return (
    <motion.div
      id="screen-interview"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col w-full max-w-4xl mx-auto h-[calc(100dvh-8rem)] min-h-[520px]"
    >
      {/* Minimal top bar */}
      <div className="flex items-center justify-between px-1 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-300">Интервью</span>
          <span className="text-[10px] text-slate-500 font-mono uppercase px-2 py-0.5 rounded-full border border-white/10">
            Шаг 1
          </span>
          <span className="text-[10px] text-slate-500 font-mono uppercase px-2 py-0.5 rounded-full border border-white/10">
            {mode}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMemory((v) => !v)}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/5 transition-colors cursor-pointer bg-transparent"
          >
            <Brain className="h-3.5 w-3.5" />
            Память {compiledCount}/8
            {showMemory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          <span className={`text-[10px] border px-2.5 py-1 rounded-full font-mono hidden sm:inline ${currentSentiment.bg}`}>
            {currentSentiment.label}
          </span>
        </div>
      </div>

      {/* Collapsible memory panel */}
      <AnimatePresence>
        {showMemory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden shrink-0 mb-3"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-2xl border border-white/10 bg-white/[0.03] max-h-48 overflow-y-auto">
              {(Object.entries(canvas) as [string, any][]).map(([key, item]) => (
                <div
                  key={key}
                  className={`rounded-xl p-2.5 border text-left ${
                    item.status === "compiled"
                      ? "bg-white/[0.06] border-white/15"
                      : item.status === "thinking"
                        ? "bg-white/[0.04] border-white/10 animate-pulse"
                        : "bg-transparent border-white/5 opacity-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] font-semibold text-slate-300 truncate">{item.title}</span>
                    {item.status === "compiled" && <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />}
                  </div>
                  <p className="text-[9px] text-slate-500 line-clamp-2 leading-snug">
                    {item.status === "compiled" ? item.summary : item.status === "thinking" ? "Анализирую..." : "Ожидание"}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat — takes all available space */}
      <div className="flex-1 flex flex-col min-h-0 rounded-2xl border border-white/10 bg-[#141416]/80 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-6">
          {messages.length === 0 && (
            <p className="text-center text-slate-500 text-sm py-12">Начните диалог — агент задаст вопросы по бизнесу</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[92%] sm:max-w-[85%] ${m.sender === "user" ? "text-right" : "text-left"}`}>
                <div
                  className={`inline-block text-left px-4 py-3.5 rounded-2xl text-[15px] leading-relaxed whitespace-pre-line ${
                    m.sender === "user"
                      ? "bg-white text-black rounded-br-md"
                      : "bg-white/[0.07] text-slate-100 border border-white/8 rounded-bl-md"
                  }`}
                >
                  {m.text}
                </div>
                <div className={`text-[10px] text-slate-600 mt-1.5 font-mono ${m.sender === "user" ? "text-right" : ""}`}>
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-slate-500 text-sm pl-1">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{underlyingThoughts || "Думаю..."}</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input area — ChatGPT style */}
        <div className="shrink-0 border-t border-white/10 p-3 sm:p-4 space-y-3 bg-[#0d0d0f]/90">
          <div className="relative flex items-end rounded-[1.5rem] border border-white/12 bg-[#2a2a2c] focus-within:border-white/25 transition-colors">
            <textarea
              id="interview-answer-input"
              rows={3}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ответьте подробно: клиент, боль, продукт, как работает, цифры, конкуренты..."
              className="w-full min-h-[72px] max-h-[200px] bg-transparent border-none rounded-[1.5rem] px-5 py-4 pr-14 text-[15px] text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none leading-relaxed"
            />
            <button
              id="send-answer-btn"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="absolute right-2.5 bottom-2.5 h-9 w-9 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-30 hover:bg-slate-200 transition-colors cursor-pointer border-none"
              aria-label="Отправить"
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPhotos((v) => !v)}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/5 cursor-pointer bg-transparent"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              Фото {sessionImages.length > 0 ? `(${sessionImages.length})` : ""}
            </button>
            <button
              id="fast-generate-btn"
              onClick={handleGenerateDeck}
              disabled={isLoading}
              className="ml-auto text-[11px] font-semibold px-4 py-2 rounded-full bg-white text-black hover:bg-slate-200 disabled:opacity-40 cursor-pointer border-none transition-colors"
            >
              Собрать план →
            </button>
          </div>

          <AnimatePresence>
            {showPhotos && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-white/10 bg-black/30 p-3 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      ["CEO", "CEO — основатель"],
                      ["Команда", "Фото команды"],
                      ["Продукт", "Скриншот продукта"],
                      ["Лого", "Логотип"],
                    ].map(([label, desc]) => (
                      <label key={label} className="text-[10px] px-2.5 py-1 rounded-full border border-white/10 text-slate-400 hover:text-white cursor-pointer">
                        + {label}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === "string") {
                                setSessionImages((prev) => [
                                  ...prev,
                                  { id: `img_${Date.now()}`, image: reader.result, description: desc },
                                ]);
                              }
                            };
                            reader.readAsDataURL(file);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    ))}
                    <label className="text-[10px] px-2.5 py-1 rounded-full border border-dashed border-white/15 text-slate-500 hover:text-white cursor-pointer">
                      Загрузить файлы
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = e.currentTarget.files;
                          if (!files) return;
                          for (let idx = 0; idx < files.length; idx++) {
                            const file = files.item(idx);
                            if (!file) continue;
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === "string") {
                                setSessionImages((prev) => [
                                  ...prev,
                                  { id: `img_${Date.now()}_${idx}`, image: reader.result, description: "Материал проекта" },
                                ]);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                  {sessionImages.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {sessionImages.map((sImg, sIdx) => (
                        <div key={sImg.id} className="shrink-0 w-24">
                          <div className="relative aspect-square rounded-lg overflow-hidden border border-white/10">
                            <img src={sImg.image} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setSessionImages((prev) => prev.filter((i) => i.id !== sImg.id))}
                              className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/80 text-red-400 text-xs border-none cursor-pointer"
                            >
                              ×
                            </button>
                          </div>
                          <input
                            value={sImg.description}
                            onChange={(e) =>
                              setSessionImages((prev) =>
                                prev.map((i) => (i.id === sImg.id ? { ...i, description: e.target.value } : i))
                              )
                            }
                            className="w-full mt-1 text-[8px] bg-transparent border-none text-slate-400 focus:outline-none"
                            placeholder={`#${sIdx + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
