import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  LevelFormat,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableOfContents,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
  convertInchesToTwip,
} from "docx";

/* =========================================================================
 * Public types
 * ======================================================================= */

export type WordDocStyle =
  | "business"
  | "article"
  | "proposal"
  | "report"
  | "school_project"
  | "referat"
  | "essay"
  | "homework";

export type WordFontId =
  | "times"
  | "calibri"
  | "arial"
  | "georgia"
  | "garamond"
  | "cambria"
  | "constantia";

export type WordDesignPreset = "standard" | "modern" | "academic" | "expressive";

export interface WordFontOption {
  id: WordFontId;
  label: string;
  family: string;
  pro: boolean;
  sample: string;
}

export interface WordExportOptions {
  fontId?: WordFontId;
  design?: WordDesignPreset;
}

export interface WordDocumentMeta {
  subject?: string;
  grade?: string;
  studentName?: string;
  teacherName?: string;
  schoolName?: string;
  city?: string;
  year?: string;
}

export interface WordDocumentTable {
  title?: string;
  headers?: string[];
  rows: string[][];
}

export interface WordDocumentSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  tables?: WordDocumentTable[];
  importance?: "normal" | "key" | "conclusion";
}

export interface WordDocumentData {
  title: string;
  subtitle?: string;
  /** Explicit flag: render the subtitle on the cover. Avoids fragile string-matching against default copy. */
  showSubtitleOnCover?: boolean;
  author?: string;
  summary?: string;
  meta?: WordDocumentMeta;
  sections: WordDocumentSection[];
}

/* =========================================================================
 * Catalogs / constants
 * ======================================================================= */

export const WORD_FONT_CATALOG: WordFontOption[] = [
  { id: "times", label: "Times New Roman", family: "Times New Roman", pro: false, sample: "Классика для школы" },
  { id: "calibri", label: "Calibri", family: "Calibri", pro: false, sample: "Современный офис" },
  { id: "arial", label: "Arial", family: "Arial", pro: true, sample: "Чистый sans-serif" },
  { id: "georgia", label: "Georgia", family: "Georgia", pro: true, sample: "Мягкий serif" },
  { id: "garamond", label: "Garamond", family: "Garamond", pro: true, sample: "Книжная эстетика" },
  { id: "cambria", label: "Cambria", family: "Cambria", pro: true, sample: "Для длинных текстов" },
  { id: "constantia", label: "Constantia", family: "Constantia", pro: true, sample: "Элегантный serif" },
];

export const WORD_DESIGN_PRESETS: { id: WordDesignPreset; label: string; hint: string; pro: boolean }[] = [
  { id: "standard", label: "Стандарт", hint: "Сбалансированное оформление", pro: false },
  { id: "modern", label: "Современный", hint: "Акцентные линии и воздух", pro: true },
  { id: "academic", label: "Академический", hint: "Строгие отступы, минимализм", pro: true },
  { id: "expressive", label: "Выразительный", hint: "Выделения, блоки, цвет", pro: true },
];

export const SCHOOL_DOC_STYLES: WordDocStyle[] = ["school_project", "referat", "essay", "homework"];

/** Centralised typography/spacing scale — single source of truth instead of scattered magic numbers. */
const TYPE_SCALE = {
  body: 24, // 12pt
  heading: 28, // 14pt
  title: 44, // 22pt
  subtitle: 24,
  caption: 18,
  meta: 22,
} as const;

const SPACING = {
  paragraphAfter: 200,
  paragraphAfterTight: 120,
  sectionBefore: 280,
  sectionAfter: 120,
  lineSchool: 360, // 1.5 line spacing (ГОСТ requirement for school docs)
  lineStandard: 276,
  firstLineIndent: 720, // 1.25cm, ГОСТ-style paragraph indent
} as const;

const MARGINS = {
  standard: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
  // GOST 7.32 school-document margins: left wider for binding.
  school: { top: 1134, right: 850, bottom: 1134, left: 1701 },
} as const;

const RU_LANG = { value: "ru-RU" } as const;
const BULLET_LIST_REFERENCE = "decksy-bullet-list";

const STYLE_ACCENTS: Record<WordDocStyle, { primary: string; secondary: string; highlight: string }> = {
  business: { primary: "1F4E79", secondary: "2E75B6", highlight: "DBEAFE" },
  article: { primary: "374151", secondary: "6B7280", highlight: "F3F4F6" },
  proposal: { primary: "065F46", secondary: "059669", highlight: "D1FAE5" },
  report: { primary: "4338CA", secondary: "6366F1", highlight: "E0E7FF" },
  school_project: { primary: "7C3AED", secondary: "8B5CF6", highlight: "EDE9FE" },
  referat: { primary: "0369A1", secondary: "0284C7", highlight: "E0F2FE" },
  essay: { primary: "B45309", secondary: "D97706", highlight: "FEF3C7" },
  homework: { primary: "047857", secondary: "059669", highlight: "D1FAE5" },
};

const DOC_TYPE_LABELS: Record<WordDocStyle, string> = {
  business: "Деловой документ",
  article: "Статья",
  proposal: "Коммерческое предложение",
  report: "Аналитический отчёт",
  school_project: "Исследовательский проект",
  referat: "Реферат",
  essay: "Сочинение",
  homework: "Домашнее задание",
};

const LOCAL_SCHOOL_SECTIONS: Partial<Record<WordDocStyle, string[]>> = {
  school_project: ["Введение", "Цель и задачи", "Основная часть", "Заключение", "Список литературы"],
  referat: ["Введение", "Основная часть", "Заключение", "Список использованных источников"],
  essay: ["Вступление", "Основная часть", "Заключение"],
  homework: ["Задание 1", "Задание 2", "Задание 3"],
};

const KEY_SECTION_PATTERN = /цель|задач|вывод|заключение|итог|важно|результат|summary|key/i;
/** Bold (**x**), highlight (==x==), italic (*x*) inline markers. Compiled once, not per call. */
const RICH_TEXT_PATTERN = /(\*\*(.+?)\*\*|==(.+?)==|\*(.+?)\*)/g;

/* =========================================================================
 * Pure helpers (style resolution, classification)
 * ======================================================================= */

export function isSchoolDocStyle(style: WordDocStyle): boolean {
  return SCHOOL_DOC_STYLES.includes(style);
}

export function inferSchoolDocStyle(text: string): WordDocStyle {
  const t = text.toLowerCase();
  if (/задание\s*\d|домашн|контрольн|\bдз\b|упражнени|решите|вычислите/.test(t)) return "homework";
  if (/сочинен|рассужден|эссе|мнение автора|герой|мораль|дружб/.test(t)) return "essay";
  if (/реферат/.test(t) && !/проект/.test(t)) return "referat";
  if (
    /цель:|задачи:|гипотез|эксперимент|опыт|лаборатор|исследован|материал/.test(t) ||
    /(?:сделай|напиши|создай|составь).{0,40}(?:проект|исследов)/.test(t) ||
    /\bпроект\b/.test(t)
  ) {
    return "school_project";
  }
  if (/(?:сделай|напиши|составь).{0,40}реферат/.test(t)) return "referat";
  if (/(?:сделай|напиши|составь).{0,40}сочинен/.test(t)) return "essay";
  return "referat";
}

export function getDefaultFontForStyle(style: WordDocStyle): WordFontId {
  return isSchoolDocStyle(style) ? "times" : "calibri";
}

export function resolveWordFont(style: WordDocStyle, options?: WordExportOptions): string {
  const requested = options?.fontId ? WORD_FONT_CATALOG.find((f) => f.id === options.fontId) : undefined;
  if (requested) return requested.family;
  return isSchoolDocStyle(style) ? "Times New Roman" : "Calibri";
}

export function resolveWordDesign(options?: WordExportOptions): WordDesignPreset {
  return options?.design || "standard";
}

export function clampExportOptionsForPro(
  style: WordDocStyle,
  options: WordExportOptions,
  isPro: boolean
): WordExportOptions {
  if (isPro) return options;
  const requestedFont = WORD_FONT_CATALOG.find((f) => f.id === (options.fontId || getDefaultFontForStyle(style)));
  return {
    fontId: requestedFont && !requestedFont.pro ? requestedFont.id : getDefaultFontForStyle(style),
    design: "standard",
  };
}

function accentFor(style: WordDocStyle) {
  return STYLE_ACCENTS[style] ?? STYLE_ACCENTS.business;
}

function docTypeLabel(style: WordDocStyle): string {
  return DOC_TYPE_LABELS[style];
}

function summaryLabel(style: WordDocStyle): string {
  if (style === "essay") return "Краткая аннотация";
  if (isSchoolDocStyle(style)) return "Введение";
  return "Краткое содержание";
}

function isKeySection(heading: string, importance?: WordDocumentSection["importance"]): boolean {
  if (importance === "key" || importance === "conclusion") return true;
  return KEY_SECTION_PATTERN.test(heading);
}

function normalizeTable(table: WordDocumentTable | undefined): WordDocumentTable | null {
  if (!table || !Array.isArray(table.rows)) return null;
  const headers = Array.isArray(table.headers) ? table.headers.map((h) => String(h || "").trim()).filter(Boolean) : [];
  const rows = table.rows
    .map((row) => (Array.isArray(row) ? row.map((cell) => String(cell ?? "").trim()) : []))
    .filter((row) => row.some(Boolean));

  if (rows.length === 0) return null;

  const columnCount = Math.max(headers.length, ...rows.map((row) => row.length), 1);
  const pad = (row: string[]) => Array.from({ length: columnCount }, (_, i) => row[i] || "");

  return {
    title: table.title ? String(table.title).trim() : undefined,
    headers: headers.length ? pad(headers) : undefined,
    rows: rows.map(pad),
  };
}

function extractMarkdownTables(lines: string[]): { textLines: string[]; tables: WordDocumentTable[] } {
  const textLines: string[] = [];
  const tables: WordDocumentTable[] = [];
  let i = 0;

  const isTableLine = (line: string) => /^\s*\|.+\|\s*$/.test(line);
  const isSeparator = (line: string) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
  const splitRow = (line: string) =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());

  while (i < lines.length) {
    if (isTableLine(lines[i]) && i + 1 < lines.length && isSeparator(lines[i + 1])) {
      const headers = splitRow(lines[i]);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && isTableLine(lines[i])) {
        rows.push(splitRow(lines[i]));
        i += 1;
      }
      const normalized = normalizeTable({ headers, rows });
      if (normalized) tables.push(normalized);
      continue;
    }
    textLines.push(lines[i]);
    i += 1;
  }

  return { textLines, tables };
}

/* =========================================================================
 * Rich text parsing
 * ======================================================================= */

interface RichTextColors {
  base: string;
  accent: string;
  highlight: string;
}

/** Parse **bold**, *italic*, ==highlight== inline markers into Word runs. */
export function parseRichTextRuns(text: string, font: string, colors: RichTextColors): TextRun[] {
  const runs: TextRun[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  RICH_TEXT_PATTERN.lastIndex = 0; // defensive: pattern is module-level and shared

  const pushPlain = (chunk: string) => {
    if (!chunk) return;
    runs.push(new TextRun({ text: chunk, font, size: TYPE_SCALE.body, color: colors.base, language: RU_LANG }));
  };

  while ((match = RICH_TEXT_PATTERN.exec(text)) !== null) {
    pushPlain(text.slice(lastIndex, match.index));
    if (match[2]) {
      runs.push(
        new TextRun({ text: match[2], font, size: TYPE_SCALE.body, color: colors.accent, bold: true, language: RU_LANG })
      );
    } else if (match[3]) {
      runs.push(
        new TextRun({
          text: match[3],
          font,
          size: TYPE_SCALE.body,
          color: colors.base,
          shading: { fill: colors.highlight, type: ShadingType.CLEAR },
          language: RU_LANG,
        })
      );
    } else if (match[4]) {
      runs.push(
        new TextRun({ text: match[4], font, size: TYPE_SCALE.body, color: colors.base, italics: true, language: RU_LANG })
      );
    }
    lastIndex = match.index + match[0].length;
  }
  pushPlain(text.slice(lastIndex));

  if (runs.length === 0) {
    runs.push(new TextRun({ text, font, size: TYPE_SCALE.body, color: colors.base, language: RU_LANG }));
  }
  return runs;
}

/* =========================================================================
 * Paragraph builders
 * ======================================================================= */

function bodyParagraph(
  text: string,
  font: string,
  themeColors: { primary: string; highlight: string },
  opts: { school: boolean; design: WordDesignPreset; spacingAfter?: number }
): Paragraph {
  const { school, design } = opts;
  const useRichFormatting = !school && (design === "expressive" || design === "modern");
  const baseColor = school ? "000000" : "1F2937";

  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: {
      after: opts.spacingAfter ?? SPACING.paragraphAfter,
      line: school || design === "academic" ? SPACING.lineSchool : SPACING.lineStandard,
    },
    indent: school || design === "academic" ? { firstLine: SPACING.firstLineIndent } : undefined,
    children: useRichFormatting
      ? parseRichTextRuns(text, font, { base: baseColor, accent: themeColors.primary, highlight: themeColors.highlight })
      : [new TextRun({ text, font, size: TYPE_SCALE.body, color: baseColor, language: RU_LANG })],
  });
}

/**
 * Section heading. Uses a real Word "Heading" style (not just bold text) so that:
 *  - Word's native navigation pane / outline view works
 *  - the auto-generated Table of Contents can pick up sections
 *  - the heading carries the document's accent color instead of being permanently black
 */
function headingParagraph(text: string, font: string, themeColor: string, school: boolean): Paragraph {
  // GOST-style school documents: headings are centered, uppercase, no accent color.
  if (school) {
    return new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: SPACING.sectionBefore, after: SPACING.sectionAfter },
      children: [new TextRun({ text: text.toUpperCase(), bold: true, size: TYPE_SCALE.heading, color: "000000", font, language: RU_LANG })],
    });
  }
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: SPACING.sectionBefore, after: SPACING.sectionAfter },
    children: [new TextRun({ text, bold: true, size: TYPE_SCALE.heading, color: themeColor, font, language: RU_LANG })],
  });
}

function bulletParagraph(text: string, font: string): Paragraph {
  return new Paragraph({
    numbering: { reference: BULLET_LIST_REFERENCE, level: 0 },
    spacing: { after: SPACING.paragraphAfterTight },
    children: parseRichTextRuns(text.replace(/^[-•*]\s*/, ""), font, {
      base: "000000",
      accent: "000000",
      highlight: "E5E7EB",
    }),
  });
}

function tableCellParagraph(
  text: string,
  font: string,
  colors: RichTextColors,
  opts?: { bold?: boolean; center?: boolean; size?: number; color?: string }
): Paragraph {
  const children = opts?.bold
    ? [new TextRun({ text, font, size: opts.size ?? TYPE_SCALE.body, bold: true, color: opts.color || colors.base, language: RU_LANG })]
    : parseRichTextRuns(text, font, {
        base: opts?.color || colors.base,
        accent: colors.accent,
        highlight: colors.highlight,
      });

  return new Paragraph({
    alignment: opts?.center ? AlignmentType.CENTER : AlignmentType.LEFT,
    spacing: { before: 0, after: 0, line: SPACING.lineStandard },
    children,
  });
}

function tableBlock(
  table: WordDocumentTable,
  font: string,
  theme: { primary: string; secondary: string; highlight: string },
  school: boolean,
  design: WordDesignPreset
): (Paragraph | Table)[] {
  const normalized = normalizeTable(table);
  if (!normalized) return [];

  const baseColors: RichTextColors = {
    base: school ? "000000" : "1F2937",
    accent: theme.primary,
    highlight: theme.highlight,
  };
  const borderColor = school || design === "academic" ? "9CA3AF" : theme.secondary;
  const cellMargins = { top: 100, bottom: 100, left: 120, right: 120 };

  const makeCell = (text: string, opts?: { header?: boolean; center?: boolean; zebra?: boolean }) =>
    new TableCell({
      verticalAlign: VerticalAlign.CENTER,
      margins: cellMargins,
      shading: opts?.header
        ? { type: ShadingType.CLEAR, fill: school ? "E5E7EB" : theme.primary }
        : opts?.zebra
          ? { type: ShadingType.CLEAR, fill: school || design === "academic" ? "F9FAFB" : "F8FAFC" }
          : undefined,
      children: [
        tableCellParagraph(text || " ", font, baseColors, {
          bold: opts?.header,
          center: opts?.center,
          size: opts?.header ? 22 : 20,
          color: opts?.header && !school ? "FFFFFF" : baseColors.base,
        }),
      ],
    });

  const rows: TableRow[] = [];
  if (normalized.headers?.length) {
    rows.push(new TableRow({ tableHeader: true, children: normalized.headers.map((cell) => makeCell(cell, { header: true, center: true })) }));
  }
  normalized.rows.forEach((row, rowIndex) => {
    rows.push(new TableRow({ children: row.map((cell) => makeCell(cell, { zebra: rowIndex % 2 === 1 })) }));
  });

  return [
    ...(normalized.title
      ? [
          new Paragraph({
            spacing: { before: 120, after: 80 },
            children: [new TextRun({ text: normalized.title, bold: true, size: 22, color: school ? "000000" : theme.primary, font, language: RU_LANG })],
          }),
        ]
      : []),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        left: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        right: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
      },
      rows,
    }),
    new Paragraph({ spacing: { after: SPACING.paragraphAfterTight } }),
  ];
}

function calloutBlock(
  heading: string,
  paragraphs: string[],
  bullets: string[] | undefined,
  font: string,
  theme: { primary: string; highlight: string }
): Paragraph[] {
  const blocks: Paragraph[] = [
    headingParagraph(heading, font, theme.primary, false),
    ...paragraphs.map((p) =>
      bodyParagraph(p, font, theme, { school: false, design: "expressive", spacingAfter: SPACING.paragraphAfterTight })
    ),
  ];
  for (const b of bullets ?? []) {
    blocks.push(bulletParagraph(b, font));
  }
  return blocks;
}

function centeredLine(
  text: string,
  font: string,
  opts?: { bold?: boolean; size?: number; color?: string; spacingBefore?: number; spacingAfter?: number }
): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: opts?.spacingBefore ?? 0, after: opts?.spacingAfter ?? 120 },
    children: [
      new TextRun({
        text,
        bold: opts?.bold,
        size: opts?.size ?? TYPE_SCALE.body,
        color: opts?.color ?? "1F2937",
        font,
        language: RU_LANG,
      }),
    ],
  });
}

function rightAlignedLine(text: string, font: string, opts?: { size?: number; spacingBefore?: number }): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { before: opts?.spacingBefore ?? 0, after: 80 },
    children: [new TextRun({ text, size: opts?.size ?? TYPE_SCALE.body, font, color: "1F2937", language: RU_LANG })],
  });
}

/* =========================================================================
 * Cover pages
 * ======================================================================= */

function schoolCoverBlock(style: WordDocStyle, title: string, meta: WordDocumentMeta | undefined, font: string): Paragraph[] {
  const typeName = docTypeLabel(style).toUpperCase();
  const year = meta?.year?.trim() || new Date().getFullYear().toString();
  const city = meta?.city?.trim() || "г. ________";
  const rows: Paragraph[] = [new Paragraph({ spacing: { before: 480 } })];

  if (meta?.schoolName) {
    rows.push(centeredLine(meta.schoolName, font, { size: TYPE_SCALE.meta, spacingAfter: 160 }));
  }

  rows.push(centeredLine(typeName, font, { bold: true, size: 32, color: "000000", spacingBefore: 240, spacingAfter: 120 }));

  if (style === "school_project" || style === "referat" || style === "essay") {
    rows.push(centeredLine(`на тему: «${title}»`, font, { bold: true, size: 26, color: "000000", spacingAfter: 160 }));
  } else if (style === "homework") {
    rows.push(centeredLine(title, font, { bold: true, size: 26, color: "000000", spacingAfter: 160 }));
  }

  if (meta?.subject) {
    rows.push(centeredLine(`по предмету: ${meta.subject}`, font, { size: TYPE_SCALE.body, color: "000000", spacingAfter: 240 }));
  }

  if (meta?.studentName) {
    rows.push(rightAlignedLine("Выполнил(а):", font, { spacingBefore: 360 }));
    const studentLine = meta.grade ? `ученик(ца) ${meta.grade} класса` : meta.studentName;
    rows.push(rightAlignedLine(studentLine, font));
    if (meta.grade) rows.push(rightAlignedLine(meta.studentName, font));
  }

  if (meta?.teacherName) {
    rows.push(rightAlignedLine("Проверил(а):", font, { spacingBefore: 160 }));
    rows.push(rightAlignedLine(meta.teacherName, font));
  }

  rows.push(
    centeredLine(`${city}, ${year}`, font, { spacingBefore: 480, spacingAfter: 240 }),
    new Paragraph({ children: [new PageBreak()] })
  );

  return rows;
}

function coverBlock(
  title: string,
  subtitle: string | undefined,
  author: string | undefined,
  colors: { primary: string; secondary: string },
  font: string
): Paragraph[] {
  const rows: Paragraph[] = [
    new Paragraph({ spacing: { before: 400 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
      children: [new TextRun({ text: title, bold: true, size: TYPE_SCALE.title, color: colors.primary, font, language: RU_LANG })],
    }),
  ];

  if (subtitle) {
    rows.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [new TextRun({ text: subtitle, size: TYPE_SCALE.subtitle, color: colors.secondary, font, language: RU_LANG })],
      })
    );
  }

  if (author) {
    rows.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 240 },
        children: [new TextRun({ text: author, size: TYPE_SCALE.meta, color: "6B7280", font, italics: true, language: RU_LANG })],
      })
    );
  }

  rows.push(new Paragraph({ children: [new PageBreak()] }));
  return rows;
}

function summaryBlock(
  summary: string,
  font: string,
  label: string,
  school: boolean,
  design: WordDesignPreset,
  theme: { primary: string; highlight: string }
): Paragraph[] {
  return [
    headingParagraph(label, font, theme.primary, school),
    bodyParagraph(summary, font, theme, { school, design, spacingAfter: SPACING.paragraphAfter }),
  ];
}

/** Auto-generated, navigable Table of Contents (real Word field, updates on open/F9). */
function tableOfContentsBlock(font: string, school: boolean): (Paragraph | TableOfContents)[] {
  return [
    headingParagraph("Содержание", font, "000000", school),
    new TableOfContents("Содержание", { hyperlink: true, headingStyleRange: "1-1" }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

/* =========================================================================
 * Document assembly
 * ======================================================================= */

export function buildWordDocument(data: WordDocumentData, style: WordDocStyle = "business", options?: WordExportOptions): Document {
  const theme = accentFor(style);
  const school = isSchoolDocStyle(style);
  const font = resolveWordFont(style, options);
  const design = resolveWordDesign(options);

  const children: (Paragraph | TableOfContents | Table)[] = school
    ? schoolCoverBlock(style, data.title, data.meta, font)
    : coverBlock(data.title, data.showSubtitleOnCover ? data.subtitle : undefined, data.author || data.meta?.studentName, theme, font);

  // Long, multi-section documents benefit from a navigable TOC; short ones (e.g. homework) don't need one.
  const sectionCount = data.sections.filter((s) => s.heading?.trim()).length;
  if (school && sectionCount >= 3) {
    children.push(...tableOfContentsBlock(font, school));
  }

  if (data.summary?.trim() && style !== "homework") {
    children.push(...summaryBlock(data.summary.trim(), font, summaryLabel(style), school, design, theme));
  }

  for (const section of data.sections) {
    if (!section.heading?.trim()) continue;
    const heading = section.heading.trim();
    const paragraphs = (section.paragraphs ?? []).filter((p) => p.trim());
    const bullets = (section.bullets ?? []).filter((b) => b.trim());
    const tables = (section.tables ?? []).map(normalizeTable).filter(Boolean) as WordDocumentTable[];

    if (!school && design === "expressive" && isKeySection(heading, section.importance)) {
      children.push(...calloutBlock(heading, paragraphs, bullets.length ? bullets : undefined, font, theme));
      for (const table of tables) {
        children.push(...tableBlock(table, font, theme, school, design));
      }
      continue;
    }

    children.push(headingParagraph(heading, font, theme.primary, school));
    for (const p of paragraphs) {
      children.push(bodyParagraph(p, font, theme, { school, design }));
    }
    for (const b of bullets) {
      children.push(bulletParagraph(b, font));
    }
    for (const table of tables) {
      children.push(...tableBlock(table, font, theme, school, design));
    }
  }

  children.push(
    new Paragraph({ spacing: { before: 400 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Создано в Decksy.ai", size: TYPE_SCALE.caption, color: "9CA3AF", italics: true, font, language: RU_LANG })],
    })
  );

  const margins = school || design === "academic" ? MARGINS.school : MARGINS.standard;

  return new Document({
    creator: "Decksy",
    title: data.title,
    description: data.subtitle || data.summary,
    numbering: {
      config: [
        {
          reference: BULLET_LIST_REFERENCE,
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "\u2022",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: { page: { margin: margins } },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Стр. ", size: TYPE_SCALE.caption, color: "9CA3AF", font, language: RU_LANG }),
                  new TextRun({ children: [PageNumber.CURRENT], size: TYPE_SCALE.caption, color: "9CA3AF", font, language: RU_LANG }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });
}

/** Builds the safe download filename. Pulled out so it's independently testable. */
export function buildSafeFilename(filename: string | undefined, title: string): string {
  const safe = (filename || title || "document")
    .replace(/[^\w\u0400-\u04FF\s-]/gi, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 80);
  return safe || "document";
}

export async function downloadWordDocument(
  data: WordDocumentData,
  style: WordDocStyle = "business",
  filename?: string,
  options?: WordExportOptions
): Promise<void> {
  let blob: Blob;
  try {
    const doc = buildWordDocument(data, style, options);
    blob = await Packer.toBlob(doc);
  } catch (error) {
    // Surface a clear, actionable error instead of an unhandled rejection / opaque docx internal error.
    throw new Error(`Не удалось сформировать .docx документ: ${error instanceof Error ? error.message : String(error)}`);
  }

  const safeName = buildSafeFilename(filename, data.title);
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeName}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* =========================================================================
 * Local (offline) document builder — turns raw text into structured data
 * ======================================================================= */

export function buildLocalWordDocument(rawText: string, docStyle: WordDocStyle): WordDocumentData {
  const trimmed = rawText.trim();
  const blocks = trimmed.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const firstLine = blocks[0]?.split("\n")[0]?.trim() || "Документ";
  const title = firstLine.length > 80 ? firstLine.slice(0, 77) + "…" : firstLine;

  let sections: WordDocumentSection[] = blocks.slice(1).map((block, i) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const { textLines, tables } = extractMarkdownTables(lines);
    const bullets = textLines.filter((l) => /^[-•*]\s/.test(l)).map((l) => l.replace(/^[-•*]\s*/, ""));
    const paragraphs = textLines.filter((l) => !/^[-•*]\s/.test(l));
    const heading = paragraphs.shift() || `Раздел ${i + 1}`;
    return {
      heading,
      paragraphs: paragraphs.length ? paragraphs : undefined,
      bullets: bullets.length ? bullets : undefined,
      tables: tables.length ? tables : undefined,
      importance: KEY_SECTION_PATTERN.test(heading) ? "key" : "normal",
    };
  });

  if (sections.length === 0) {
    const template = LOCAL_SCHOOL_SECTIONS[docStyle];
    if (template && isSchoolDocStyle(docStyle)) {
      const lines = trimmed.split("\n").filter(Boolean);
      const body = lines.length > 1 ? lines.slice(1) : lines;
      const chunk = Math.max(1, Math.ceil(body.length / template.length));
      sections = template.map((heading, i) => ({
        heading,
        paragraphs: body.slice(i * chunk, (i + 1) * chunk).length ? body.slice(i * chunk, (i + 1) * chunk) : undefined,
        importance: KEY_SECTION_PATTERN.test(heading) ? "key" : "normal",
      }));
    } else {
      const { textLines, tables } = extractMarkdownTables(trimmed.split("\n").map((l) => l.trim()).filter(Boolean));
      sections.push({
        heading: "Основной текст",
        paragraphs: textLines.length ? textLines : undefined,
        tables: tables.length ? tables : undefined,
      });
    }
  }

  return {
    title,
    subtitle: isSchoolDocStyle(docStyle) ? undefined : docTypeLabel(docStyle),
    showSubtitleOnCover: !isSchoolDocStyle(docStyle),
    summary: trimmed.slice(0, 280) + (trimmed.length > 280 ? "…" : ""),
    sections,
  };
}