import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Download,
  FileText,
  GraduationCap,
  Loader2,
  LockKeyhole,
  Sparkles,
  Type,
  Wand2,
} from "lucide-react";
import { motion } from "motion/react";
import {
  WORD_DESIGN_PRESETS,
  WORD_FONT_CATALOG,
  buildLocalWordDocument,
  clampExportOptionsForPro,
  downloadWordDocument,
  getDefaultFontForStyle,
  isSchoolDocStyle,
  type WordDesignPreset,
  type WordDocStyle,
  type WordDocumentData,
  type WordDocumentMeta,
  type WordExportOptions,
  type WordFontId,
} from "../lib/docxExport";

type StyleCategory = "school" | "other";

const SCHOOL_STYLES: { id: WordDocStyle; label: string; hint: string }[] = [
  { id: "school_project", label: "Школьный проект", hint: "Исследование, цель, задачи, выводы" },
  { id: "referat", label: "Реферат", hint: "По предмету с источниками" },
  { id: "essay", label: "Сочинение", hint: "ЕГЭ, ОГЭ, литература" },
  { id: "homework", label: "Домашка / ДЗ", hint: "Ответы на задания, контрольная" },
];

const OTHER_STYLES: { id: WordDocStyle; label: string; hint: string }[] = [
  { id: "business", label: "Деловой", hint: "Отчёты, письма, memo" },
  { id: "proposal", label: "Предложение", hint: "Коммерческие офферы" },
  { id: "report", label: "Аналитика", hint: "Исследования, обзоры" },
  { id: "article", label: "Статья", hint: "Блог, медиа, контент" },
];

const SCHOOL_EXAMPLES: { label: string; style: WordDocStyle; text: string }[] = [
  {
    label: "Проект по биологии",
    style: "school_project",
    text: `Влияние музыки на рост растений

Тема: как классическая и рок-музыка влияет на рост фасоли.
Цель: выяснить, ускоряет ли музыка прорастание семян.
Задачи: посадить 3 группы семян, включать разную музыку, измерять рост 2 недели.
Гипотеза: растения под классикой растут быстрее.
Материалы: горшки, земля, семена фасоли, колонки.
Ход работы: каждый день полив, замеры высоты, фото.
Результаты: группа с классикой выросла на 4 см больше.
Вывод: мягкая музыка положительно влияет на рост.`,
  },
  {
    label: "Реферат по истории",
    style: "referat",
    text: `Куликовская битва 1380 года

1380 год. Дмитрий Донской против Mamai. Русские войска заняли высоту. Использовали засадный полк. Победа объединила земли. Начало освобождения от орды. Последствия для Московского княжества.`,
  },
  {
    label: "Сочинение",
    style: "essay",
    text: `Что значит быть настоящим другом?

Дружба это когда человек рядом в трудную минуту. Настоящий друг не предаст и не осудит. В повести Толstogo дети учатся дружбе через поступки. Я думаю дружба строится на доверии и уважении.`,
  },
];

function RichTextPreview({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const pattern = /(\*\*(.+?)\*\*|==(.+?)==|\*(.+?)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }
    if (match[2]) {
      parts.push(
        <strong key={key++} className="text-white font-semibold">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      parts.push(
        <mark key={key++} className="bg-amber-500/25 text-amber-100 px-0.5 rounded not-italic">
          {match[3]}
        </mark>
      );
    } else if (match[4]) {
      parts.push(
        <em key={key++} className="text-slate-300 italic">
          {match[4]}
        </em>
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);

  return <>{parts.length ? parts : text}</>;
}

interface WordGeneratorPageProps {
  authToken: string | null;
  isPro?: boolean;
  onOpenAuth: () => void;
  onOpenPlans?: () => void;
  onBack?: () => void;
}

export const WordGeneratorPage: React.FC<WordGeneratorPageProps> = ({
  authToken,
  isPro = false,
  onOpenAuth,
  onOpenPlans,
  onBack,
}) => {
  const [category, setCategory] = useState<StyleCategory>("school");
  const [rawText, setRawText] = useState("");
  const [docStyle, setDocStyle] = useState<WordDocStyle>("school_project");
  const [docTitle, setDocTitle] = useState("");
  const [fontId, setFontId] = useState<WordFontId>("times");
  const [design, setDesign] = useState<WordDesignPreset>("standard");
  const [meta, setMeta] = useState<WordDocumentMeta>({
    subject: "",
    grade: "",
    studentName: "",
    teacherName: "",
    schoolName: "",
    city: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<WordDocumentData | null>(null);

  const activeStyles = category === "school" ? SCHOOL_STYLES : OTHER_STYLES;

  const exportOptions: WordExportOptions = useMemo(
    () => clampExportOptionsForPro(docStyle, { fontId, design }, isPro),
    [docStyle, fontId, design, isPro]
  );

  const handleCategoryChange = (next: StyleCategory) => {
    setCategory(next);
    const nextStyle = next === "school" ? "school_project" : "business";
    setDocStyle(nextStyle);
    setFontId(getDefaultFontForStyle(nextStyle));
    setResult(null);
  };

  const handleStyleChange = (style: WordDocStyle) => {
    setDocStyle(style);
    if (!isPro) setFontId(getDefaultFontForStyle(style));
    setResult(null);
  };

  const trySelectFont = (id: WordFontId, locked: boolean) => {
    if (locked) {
      onOpenPlans?.();
      return;
    }
    setFontId(id);
  };

  const trySelectDesign = (id: WordDesignPreset, locked: boolean) => {
    if (locked) {
      onOpenPlans?.();
      return;
    }
    setDesign(id);
  };

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

    const cleanMeta = Object.fromEntries(
      Object.entries(meta).filter(([, v]) => String(v || "").trim())
    ) as WordDocumentMeta;

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
          meta: Object.keys(cleanMeta).length ? cleanMeta : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Не удалось улучшить текст.");
      }

      setResult(data.document as WordDocumentData);
    } catch (err: any) {
      setError(err.message || "Ошибка генерации. Попробуйте ещё раз.");
      const local = buildLocalWordDocument(rawText, docStyle);
      if (Object.keys(cleanMeta).length) local.meta = cleanMeta;
      setResult(local);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    setIsDownloading(true);
    try {
      await downloadWordDocument(result, docStyle, result.title, exportOptions);
    } finally {
      setIsDownloading(false);
    }
  };

  const applyExample = (example: (typeof SCHOOL_EXAMPLES)[number]) => {
    setCategory("school");
    setDocStyle(example.style);
    setFontId(getDefaultFontForStyle(example.style));
    setRawText(example.text);
    setDocTitle(example.text.split("\n")[0]?.trim() || "");
    setResult(null);
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
            <div className="h-11 w-11 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <FileText className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Word Generator</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Красивое оформление, выделения текста и шрифты — PRO открывает полный дизайн
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#111114] p-4 sm:p-5">
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => handleCategoryChange("school")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  category === "school"
                    ? "border-violet-500/40 bg-violet-500/10 text-white"
                    : "border-white/10 bg-[#0A0A0C] text-slate-400 hover:text-slate-200"
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                Школа
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange("other")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  category === "other"
                    ? "border-blue-500/40 bg-blue-500/10 text-white"
                    : "border-white/10 bg-[#0A0A0C] text-slate-400 hover:text-slate-200"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                Работа / учёба
              </button>
            </div>

            {category === "school" && (
              <div className="flex flex-wrap gap-2 mb-4">
                {SCHOOL_EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    onClick={() => applyExample(ex)}
                    className="text-[10px] rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-300 px-3 py-1 hover:bg-violet-500/20 transition-colors cursor-pointer"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            )}

            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2 block">
              Исходный текст
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={
                category === "school"
                  ? "Черновик: тема проекта, тезисы реферата, план сочинения или ответы на домашку..."
                  : "Черновик: статья, отчёт, коммерческое предложение..."
              }
              rows={10}
              disabled={isGenerating}
              className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/40 resize-y min-h-[180px] leading-relaxed"
            />
            <div className="flex items-center justify-between mt-2 text-[10px] text-slate-600 font-mono">
              <span>{rawText.trim().length} символов</span>
              <span>мин. 30</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111114] p-4 sm:p-5 space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2 block">
                Название / тема
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder={
                  category === "school"
                    ? "Например: Влияние музыки на рост растений"
                    : "Например: Коммерческое предложение для..."
                }
                className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/40"
              />
            </div>

            {category === "school" && (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "subject", label: "Предмет", placeholder: "Биология" },
                  { key: "grade", label: "Класс", placeholder: "9 «А»" },
                  { key: "studentName", label: "ФИО ученика", placeholder: "Иванов Иван" },
                  { key: "teacherName", label: "Учитель", placeholder: "Петрова А.С." },
                  { key: "schoolName", label: "Школа", placeholder: "МБОУ СОШ №12" },
                  { key: "city", label: "Город", placeholder: "г. Москва" },
                ].map((field) => (
                  <div key={field.key} className={field.key === "schoolName" ? "col-span-2" : ""}>
                    <label className="text-[9px] font-mono uppercase tracking-widest text-slate-600 mb-1 block">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={meta[field.key as keyof WordDocumentMeta] || ""}
                      onChange={(e) => setMeta((m) => ({ ...m, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/30"
                    />
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2 block">
                Тип документа
              </label>
              <div className="grid grid-cols-2 gap-2">
                {activeStyles.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleStyleChange(s.id)}
                    className={`text-left rounded-xl border px-3 py-2.5 transition-all cursor-pointer ${
                      docStyle === s.id
                        ? category === "school"
                          ? "border-violet-500/40 bg-violet-500/10 text-white"
                          : "border-blue-500/40 bg-blue-500/10 text-white"
                        : "border-white/10 bg-[#0A0A0C] text-slate-400 hover:border-white/20 hover:text-slate-200"
                    }`}
                  >
                    <div className="text-xs font-semibold">{s.label}</div>
                    <div className="text-[10px] mt-0.5 opacity-70">{s.hint}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* PRO: Design & Fonts */}
            <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-emerald-400" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-bold">
                    Оформление документа
                  </span>
                </div>
                {!isPro && (
                  <span className="text-[8px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
                    PRO
                  </span>
                )}
              </div>

              <div>
                <label className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1.5 block">
                  Стиль макета
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {WORD_DESIGN_PRESETS.map((preset) => {
                    const locked = preset.pro && !isPro;
                    const active = exportOptions.design === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => trySelectDesign(preset.id, locked)}
                        className={`text-left rounded-lg border px-2.5 py-2 transition-all cursor-pointer relative ${
                          active
                            ? "border-emerald-500/40 bg-emerald-500/10 text-white"
                            : locked
                              ? "border-white/5 bg-black/20 text-slate-500"
                              : "border-white/10 bg-[#0A0A0C] text-slate-400 hover:border-white/20"
                        }`}
                      >
                        {locked && <LockKeyhole className="h-3 w-3 absolute top-2 right-2 text-amber-500/70" />}
                        <div className="text-[11px] font-semibold pr-4">{preset.label}</div>
                        <div className="text-[9px] opacity-70 mt-0.5">{preset.hint}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1.5 block">
                  Шрифт
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {WORD_FONT_CATALOG.map((font) => {
                    const locked = font.pro && !isPro;
                    const active = exportOptions.fontId === font.id;
                    return (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => trySelectFont(font.id, locked)}
                        className={`text-left rounded-lg border px-2.5 py-2 transition-all cursor-pointer relative ${
                          active
                            ? "border-emerald-500/40 bg-emerald-500/10 text-white"
                            : locked
                              ? "border-white/5 bg-black/20 text-slate-500"
                              : "border-white/10 bg-[#0A0A0C] text-slate-400 hover:border-white/20"
                        }`}
                        style={{ fontFamily: locked ? undefined : font.family }}
                      >
                        {locked && <LockKeyhole className="h-3 w-3 absolute top-2 right-2 text-amber-500/70" />}
                        <div className="text-[11px] font-semibold pr-4">{font.label}</div>
                        <div className="text-[9px] opacity-70 mt-0.5">{font.sample}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {!isPro && (
                <button
                  type="button"
                  onClick={onOpenPlans}
                  className="w-full text-[10px] uppercase tracking-wider font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer border-none bg-transparent"
                >
                  Открыть все шрифты и стили → Upgrade PRO
                </button>
              )}
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
                  {category === "school" ? "Собрать школьный документ" : "Улучшить и собрать"}
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
              <div className="h-14 w-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-violet-400" />
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                AI выделит ключевые термины **жирным**, факты ==маркером==, важные разделы — цветным блоком.
              </p>
            </div>
          )}

          {isGenerating && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
              <p className="text-sm text-slate-400">
                {isSchoolDocStyle(docStyle) ? "Оформляем школьный документ..." : "Структурируем и улучшаем текст..."}
              </p>
            </div>
          )}

          {result && !isGenerating && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="rounded-xl border border-white/10 bg-[#0A0A0C] p-4">
                {isSchoolDocStyle(docStyle) && (
                  <p className="text-[9px] uppercase tracking-widest text-violet-400 mb-2 font-mono">
                    Титульный лист
                  </p>
                )}
                <h2 className="text-lg font-bold text-white leading-tight">{result.title}</h2>
                {result.subtitle && (
                  <p className="text-sm text-slate-400 mt-1">{result.subtitle}</p>
                )}
                {result.meta?.subject && (
                  <p className="text-xs text-slate-500 mt-2">Предмет: {result.meta.subject}</p>
                )}
                {(result.meta?.studentName || result.meta?.grade) && (
                  <p className="text-xs text-slate-500">
                    {result.meta.grade ? `${result.meta.grade} класс · ` : ""}
                    {result.meta.studentName}
                  </p>
                )}
                {result.summary && (
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed border-l-2 border-violet-500/40 pl-3 italic bg-violet-500/5 rounded-r-lg py-2">
                    <RichTextPreview text={result.summary} />
                  </p>
                )}
              </div>

              {result.sections.map((section, i) => {
                const isKey =
                  section.importance === "key" ||
                  section.importance === "conclusion" ||
                  /цель|вывод|заключение/i.test(section.heading);
                return (
                  <div
                    key={i}
                    className={`rounded-xl border p-3 ${
                      isKey
                        ? "border-violet-500/25 bg-violet-500/[0.06]"
                        : "border-white/5 bg-white/[0.02]"
                    }`}
                  >
                    <h3
                      className={`text-sm font-semibold mb-2 ${
                        isKey ? "text-violet-200 border-b border-violet-500/20 pb-1.5" : "text-violet-300"
                      }`}
                    >
                      {section.heading}
                    </h3>
                    {section.paragraphs?.map((p, j) => (
                      <p key={j} className="text-xs text-slate-400 leading-relaxed mb-2 last:mb-0">
                        <RichTextPreview text={p} />
                      </p>
                    ))}
                    {section.bullets && section.bullets.length > 0 && (
                      <ul className="mt-1 space-y-1">
                        {section.bullets.map((b, j) => (
                          <li key={j} className="text-xs text-slate-400 flex gap-2">
                            <span className="text-violet-400 shrink-0">•</span>
                            <span>
                              <RichTextPreview text={b} />
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}

              <p className="text-[9px] text-slate-600 text-center font-mono">
                Шрифт: {WORD_FONT_CATALOG.find((f) => f.id === exportOptions.fontId)?.label} ·{" "}
                {WORD_DESIGN_PRESETS.find((d) => d.id === exportOptions.design)?.label}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
