import React, { useRef, useEffect, useState } from "react";
import { ArrowUp, FileSpreadsheet, FileText, Paperclip, X } from "lucide-react";
import { motion } from "motion/react";

interface IntroPageProps {
  idea: string;
  setIdea: (value: string) => void;
  suggestions: string[];
  isLoading: boolean;
  handleStartInterview: () => void;
  handleImportBrief?: (planFile: File | null, xlsxFile: File | null) => void;
  isPro?: boolean;
  importError?: string;
  userName?: string | null;
  activeAds: any[];
}

export const IntroPage: React.FC<IntroPageProps> = ({
  idea,
  setIdea,
  suggestions,
  isLoading,
  handleStartInterview,
  handleImportBrief,
  isPro,
  importError,
  userName,
  activeAds,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const planInputRef = useRef<HTMLInputElement>(null);
  const xlsxInputRef = useRef<HTMLInputElement>(null);
  const [planFile, setPlanFile] = useState<File | null>(null);
  const [xlsxFile, setXlsxFile] = useState<File | null>(null);

  const displayName = userName?.trim() || null;
  const canImport = Boolean(isPro && handleImportBrief);
  const ideaReady = idea.trim().length >= 15;
  const hasFiles = Boolean(planFile || xlsxFile);
  const willImport = canImport && hasFiles;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [idea]);

  const handleSubmit = () => {
    if (isLoading) return;
    if (willImport) {
      if (!ideaReady) return;
      handleImportBrief!(planFile, xlsxFile);
      return;
    }
    if (!idea.trim()) return;
    handleStartInterview();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePlanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && !/\.(docx|pdf)$/i.test(file.name)) {
      return;
    }
    setPlanFile(file);
  };

  const handleXlsxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && !/\.(xlsx|xls|ods|csv)$/i.test(file.name)) {
      return;
    }
    setXlsxFile(file);
  };

  const submitDisabled =
    isLoading ||
    (willImport ? !ideaReady || !hasFiles : !idea.trim());

  const submitLabel = isLoading
    ? willImport
      ? "Разбираю документы..."
      : "Запуск..."
    : willImport
      ? "Отправить с файлами"
      : "Начать";

  return (
    <motion.div
      id="screen-intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full flex flex-col min-h-[calc(100dvh-10rem)] max-w-3xl mx-auto px-4 sm:px-6"
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center py-8 sm:py-12">
        <h1 className="text-2xl sm:text-[2rem] font-normal text-white tracking-tight leading-snug">
          {displayName ? (
            <>
              Здравствуйте, {displayName}.
              <br />
              Что создаём сегодня?
            </>
          ) : (
            <>
              Здравствуйте.
              <br />
              Что создаём сегодня?
            </>
          )}
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-400 font-normal">
          Опишите идею или прикрепите бизнес-план — и нажмите отправить.
        </p>
      </div>

      <div className="w-full pb-6 sm:pb-8 space-y-3 shrink-0">
        <div className="rounded-[1.75rem] border border-white/10 bg-[#2a2a2c] shadow-lg shadow-black/20 focus-within:border-white/20 transition-colors overflow-hidden">
          {(planFile || xlsxFile) && (
            <div className="flex flex-wrap gap-2 px-4 pt-3">
              {planFile && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-1 text-[11px] text-sky-200 max-w-full">
                  <FileText className="h-3 w-3 shrink-0" />
                  <span className="truncate max-w-[180px]">{planFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setPlanFile(null)}
                    className="text-sky-300/70 hover:text-white bg-transparent border-none cursor-pointer p-0"
                    aria-label="Убрать файл"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {xlsxFile && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-200 max-w-full">
                  <FileSpreadsheet className="h-3 w-3 shrink-0" />
                  <span className="truncate max-w-[180px]">{xlsxFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setXlsxFile(null)}
                    className="text-emerald-300/70 hover:text-white bg-transparent border-none cursor-pointer p-0"
                    aria-label="Убрать таблицу"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          <div className="relative flex items-end">
            <div className="flex items-end gap-1 pl-3 pb-2.5 shrink-0">
              {canImport && (
                <>
                  <button
                    type="button"
                    onClick={() => planInputRef.current?.click()}
                    disabled={isLoading}
                    title="Прикрепить Word или PDF"
                    className="h-9 w-9 rounded-full text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer border-none bg-transparent disabled:opacity-40"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => xlsxInputRef.current?.click()}
                    disabled={isLoading}
                    title="Прикрепить Excel или ODS"
                    className="h-9 w-9 rounded-full text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer border-none bg-transparent disabled:opacity-40"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                  </button>
                </>
              )}
              {!canImport && (
                <div className="h-9 w-9 flex items-center justify-center text-slate-600" title="Pro: импорт документов">
                  <Paperclip className="h-4 w-4" />
                </div>
              )}
            </div>

            <textarea
              ref={textareaRef}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Презентация или «Сделай проект docx про робототехнику»..."
              rows={1}
              disabled={isLoading}
              className="flex-1 min-h-[52px] max-h-[200px] bg-transparent border-none px-2 py-4 pr-14 text-[15px] text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none leading-relaxed"
            />

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitDisabled}
              title={willImport ? "Разобрать прикреплённые файлы" : "Начать"}
              className="absolute right-2.5 bottom-2.5 h-9 w-9 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-25 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors cursor-pointer border-none"
              aria-label={submitLabel}
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>

          <input
            ref={planInputRef}
            type="file"
            accept=".docx,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
            className="hidden"
            onChange={handlePlanChange}
          />
          <input
            ref={xlsxInputRef}
            type="file"
            accept=".xlsx,.xls,.ods,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.oasis.opendocument.spreadsheet"
            className="hidden"
            onChange={handleXlsxChange}
          />
        </div>

        {canImport && hasFiles && !ideaReady && (
          <p className="text-[11px] text-amber-400/90 text-center px-2">
            Добавьте краткое описание идеи (минимум 15 символов) и нажмите отправить.
          </p>
        )}

        {canImport && !hasFiles && (
          <p className="text-[11px] text-slate-500 text-center px-2">
            Pro: прикрепите .docx / .pdf / .xlsx / .ods — отправка через ту же кнопку ↑
          </p>
        )}

        {importError && (
          <p className="text-[11px] text-red-400 text-center">{importError}</p>
        )}

        {suggestions.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.slice(0, 3).map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setIdea(sug)}
                className="text-[13px] text-slate-400 hover:text-slate-200 bg-transparent hover:bg-white/[0.06] border border-white/8 rounded-full px-3.5 py-1.5 transition-colors cursor-pointer truncate max-w-full"
              >
                {sug.length > 48 ? `${sug.slice(0, 48)}…` : sug}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeAds && activeAds.length > 0 && (
        <div className="pb-8 space-y-3 opacity-70 hover:opacity-100 transition-opacity">
          {activeAds.slice(0, 2).map((ad: any) => (
            <a
              key={ad.id}
              href={ad.link || "#"}
              target={ad.link ? "_blank" : undefined}
              rel={ad.link ? "noreferrer" : undefined}
              onClick={(e) => {
                if (!ad.link) e.preventDefault();
              }}
              className="block rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-center no-underline hover:bg-white/[0.05] transition-colors"
            >
              {ad.imageUrl && (
                <img
                  src={ad.imageUrl}
                  alt=""
                  className="mx-auto mb-2 max-h-10 object-contain"
                />
              )}
              <span className="block text-[11px] font-semibold text-slate-300">{ad.title}</span>
              {ad.content && (
                <span className="block text-[10px] text-slate-500 mt-1 leading-snug">{ad.content}</span>
              )}
            </a>
          ))}
        </div>
      )}
    </motion.div>
  );
};
