import React, { useState } from "react";
import {
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { motion } from "motion/react";
import {
  buildLocalWordDocument,
  downloadWordDocument,
  type WordDocStyle,
  type WordDocumentData,
} from "../lib/docxExport";

const DOC_STYLES: { id: WordDocStyle; label: string; hint: string }[] = [
  { id: "business", label: "Деловой", hint: "Отчёты, письма, memo" },
  { id: "proposal", label: "Предложение", hint: "Коммерческие офферы" },
  { id: "report", label: "Аналитика", hint: "Исследования, обзоры" },
  { id: "article", label: "Статья", hint: "Блог, медиа, контент" },
];

interface WordGeneratorPageProps {
  authToken: string | null;
  onOpenAuth: () => void;
  onBack?: () => void;
}

export const WordGeneratorPage: React.FC<WordGeneratorPageProps> = ({
  authToken,
  onOpenAuth,
  onBack,
}) => {
  const [rawText, setRawText] = useState("");
  const [docStyle, setDocStyle] = useState<WordDocStyle>("business");
  const [docTitle, setDocTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<WordDocumentData | null>(null);

  const handleGenerate = async () => {
    if (!rawText.trim() || rawText.trim().length < 30) {
      setError("Вставьте текст минимум из 30 символов.");
      return;
    }
    if (!authToken) {
      onOpenAuth();
      return;
    }

    setIsGenerating(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/generate_word", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          text: rawText.trim(),
          style: docStyle,
          title: docTitle.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Не удалось улучшить текст.");
      }

      setResult(data.document as WordDocumentData);
    } catch (err: any) {
      setError(err.message || "Ошибка генерации. Попробуйте ещё раз.");
      setResult(buildLocalWordDocument(rawText, docStyle));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    setIsDownloading(true);
    try {
      await downloadWordDocument(result, docStyle, result.title);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      id="screen-word"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mb-3 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Назад
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Word Generator</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Вставьте черновик — нейросеть улучшит текст и соберёт красивый .docx
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#111114] p-4 sm:p-5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2 block">
              Исходный текст
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Вставьте черновик: статью, отчёт, коммерческое предложение, описание продукта..."
              rows={14}
              disabled={isGenerating}
              className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 resize-y min-h-[220px] leading-relaxed"
            />
            <div className="flex items-center justify-between mt-2 text-[10px] text-slate-600 font-mono">
              <span>{rawText.trim().length} символов</span>
              <span>мин. 30</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111114] p-4 sm:p-5 space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2 block">
                Название документа (опционально)
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="Например: Коммерческое предложение для..."
                className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2 block">
                Стиль оформления
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DOC_STYLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setDocStyle(s.id)}
                    className={`text-left rounded-xl border px-3 py-2.5 transition-all cursor-pointer ${
                      docStyle === s.id
                        ? "border-blue-500/40 bg-blue-500/10 text-white"
                        : "border-white/10 bg-[#0A0A0C] text-slate-400 hover:border-white/20 hover:text-slate-200"
                    }`}
                  >
                    <div className="text-xs font-semibold">{s.label}</div>
                    <div className="text-[10px] mt-0.5 opacity-70">{s.hint}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || rawText.trim().length < 30}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-black py-3 text-sm font-bold uppercase tracking-wider hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer border-none"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Улучшаем текст...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Улучшить и собрать
                </>
              )}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111114] p-4 sm:p-5 flex flex-col min-h-[420px]">
          <div className="flex items-center justify-between mb-4">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Предпросмотр
            </label>
            {result && (
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider hover:bg-emerald-500/25 transition-colors cursor-pointer disabled:opacity-40"
              >
                {isDownloading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                Скачать .docx
              </button>
            )}
          </div>

          {!result && !isGenerating && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-slate-500" />
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Здесь появится структура документа: заголовок, разделы, списки — после обработки нейросетью.
              </p>
            </div>
          )}

          {isGenerating && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              <p className="text-sm text-slate-400">Структурируем и улучшаем текст...</p>
            </div>
          )}

          {result && !isGenerating && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="rounded-xl border border-white/10 bg-[#0A0A0C] p-4">
                <h2 className="text-lg font-bold text-white leading-tight">{result.title}</h2>
                {result.subtitle && (
                  <p className="text-sm text-slate-400 mt-1">{result.subtitle}</p>
                )}
                {result.summary && (
                  <p className="text-xs text-slate-500 mt-3 leading-relaxed border-l-2 border-blue-500/40 pl-3 italic">
                    {result.summary}
                  </p>
                )}
              </div>

              {result.sections.map((section, i) => (
                <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <h3 className="text-sm font-semibold text-blue-300 mb-2">{section.heading}</h3>
                  {section.paragraphs?.map((p, j) => (
                    <p key={j} className="text-xs text-slate-400 leading-relaxed mb-2 last:mb-0">
                      {p}
                    </p>
                  ))}
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="mt-1 space-y-1">
                      {section.bullets.map((b, j) => (
                        <li key={j} className="text-xs text-slate-400 flex gap-2">
                          <span className="text-blue-400 shrink-0">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
