import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

export type WordDocStyle = "business" | "article" | "proposal" | "report";

export interface WordDocumentSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface WordDocumentData {
  title: string;
  subtitle?: string;
  author?: string;
  summary?: string;
  sections: WordDocumentSection[];
}

const STYLE_ACCENTS: Record<WordDocStyle, { primary: string; secondary: string }> = {
  business: { primary: "1F4E79", secondary: "2E75B6" },
  article: { primary: "374151", secondary: "6B7280" },
  proposal: { primary: "065F46", secondary: "059669" },
  report: { primary: "4338CA", secondary: "6366F1" },
};

function accent(style: WordDocStyle) {
  return STYLE_ACCENTS[style] || STYLE_ACCENTS.business;
}

function headingParagraph(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel], color: string) {
  return new Paragraph({
    heading: level,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 0 : 320, after: 160 },
    children: [
      new TextRun({
        text,
        bold: true,
        color,
        size: level === HeadingLevel.HEADING_1 ? 36 : level === HeadingLevel.HEADING_2 ? 28 : 24,
        font: "Calibri",
      }),
    ],
  });
}

function bodyParagraph(text: string, opts?: { italic?: boolean; color?: string; spacingAfter?: number }) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: opts?.spacingAfter ?? 200, line: 276 },
    children: [
      new TextRun({
        text,
        size: 22,
        font: "Calibri",
        color: opts?.color ?? "1F2937",
        italics: opts?.italic,
      }),
    ],
  });
}

function bulletParagraph(text: string, color: string) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 120 },
    children: [
      new TextRun({
        text,
        size: 22,
        font: "Calibri",
        color,
      }),
    ],
  });
}

function coverBlock(title: string, subtitle: string | undefined, author: string | undefined, colors: { primary: string; secondary: string }) {
  const rows: Paragraph[] = [
    new Paragraph({ spacing: { before: 1200 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 52,
          color: colors.primary,
          font: "Calibri Light",
        }),
      ],
    }),
  ];

  if (subtitle) {
    rows.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [
          new TextRun({
            text: subtitle,
            size: 26,
            color: colors.secondary,
            font: "Calibri",
          }),
        ],
      })
    );
  }

  if (author) {
    rows.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 600 },
        children: [
          new TextRun({
            text: author,
            size: 22,
            color: "6B7280",
            font: "Calibri",
          }),
        ],
      })
    );
  }

  rows.push(
    new Paragraph({
      spacing: { before: 800 },
      border: {
        bottom: { color: colors.primary, size: 12, style: BorderStyle.SINGLE },
      },
    })
  );

  return rows;
}

function summaryBox(summary: string, color: string) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: "F3F4F6", type: ShadingType.CLEAR },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
              left: { style: BorderStyle.SINGLE, size: 8, color },
              right: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
            },
            children: [
              new Paragraph({
                spacing: { before: 120, after: 80 },
                children: [
                  new TextRun({ text: "Краткое содержание", bold: true, size: 20, color, font: "Calibri" }),
                ],
              }),
              bodyParagraph(summary, { spacingAfter: 120 }),
            ],
          }),
        ],
      }),
    ],
  });
}

export function buildWordDocument(data: WordDocumentData, style: WordDocStyle = "business"): Document {
  const colors = accent(style);
  const children: (Paragraph | Table)[] = [
    ...coverBlock(data.title, data.subtitle, data.author, colors),
  ];

  if (data.summary?.trim()) {
    children.push(new Paragraph({ spacing: { before: 400 } }));
    children.push(summaryBox(data.summary.trim(), colors.primary));
  }

  for (const section of data.sections) {
    if (!section.heading?.trim()) continue;

    children.push(headingParagraph(section.heading.trim(), HeadingLevel.HEADING_2, colors.primary));

    for (const p of section.paragraphs || []) {
      if (p.trim()) children.push(bodyParagraph(p.trim()));
    }

    for (const b of section.bullets || []) {
      if (b.trim()) children.push(bulletParagraph(b.trim(), "374151"));
    }
  }

  children.push(
    new Paragraph({ spacing: { before: 600 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Создано в Decksy.ai",
          size: 18,
          color: "9CA3AF",
          italics: true,
          font: "Calibri",
        }),
      ],
    })
  );

  return new Document({
    creator: "Decksy",
    title: data.title,
    description: data.subtitle || data.summary,
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Стр. ", size: 18, color: "9CA3AF" }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "9CA3AF" }),
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

export async function downloadWordDocument(
  data: WordDocumentData,
  style: WordDocStyle = "business",
  filename?: string
): Promise<void> {
  const doc = buildWordDocument(data, style);
  const blob = await Packer.toBlob(doc);
  const safeName = (filename || data.title || "document")
    .replace(/[^\w\u0400-\u04FF\s-]/gi, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 80) || "document";

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function buildLocalWordDocument(rawText: string, docStyle: WordDocStyle): WordDocumentData {
  const trimmed = rawText.trim();
  const blocks = trimmed.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const firstLine = blocks[0]?.split("\n")[0]?.trim() || "Документ";
  const title = firstLine.length > 80 ? firstLine.slice(0, 77) + "…" : firstLine;

  const sections: WordDocumentSection[] = blocks.slice(1).map((block, i) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const bullets = lines.filter((l) => /^[-•*]\s/.test(l)).map((l) => l.replace(/^[-•*]\s*/, ""));
    const paragraphs = lines.filter((l) => !/^[-•*]\s/.test(l));

    return {
      heading: paragraphs.shift() || `Раздел ${i + 1}`,
      paragraphs: paragraphs.length ? paragraphs : undefined,
      bullets: bullets.length ? bullets : undefined,
    };
  });

  if (sections.length === 0) {
    sections.push({
      heading: "Основной текст",
      paragraphs: trimmed.split("\n").filter(Boolean),
    });
  }

  return {
    title,
    subtitle: "Подготовлено Decksy",
    summary: trimmed.slice(0, 280) + (trimmed.length > 280 ? "…" : ""),
    sections,
  };
}
