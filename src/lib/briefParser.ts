import mammoth from "mammoth";
import * as XLSX from "xlsx";

// pdf-parse/index.js runs debug self-test on ESM import — use lib directly
import pdfParse from "pdf-parse/lib/pdf-parse.js";

function stripDataUrl(base64: string): string {
  return base64.replace(/^data:[^;]+;base64,/, "").trim();
}

function toBuffer(base64: string): Buffer {
  return Buffer.from(stripDataUrl(base64), "base64");
}

export async function extractDocxText(base64: string): Promise<string> {
  const result = await mammoth.extractRawText({ buffer: toBuffer(base64) });
  return result.value.replace(/\n{3,}/g, "\n\n").trim();
}

export async function extractPdfText(base64: string): Promise<string> {
  const parsed = await pdfParse(toBuffer(base64));
  return String(parsed.text || "")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function extractSpreadsheetText(base64: string): string {
  const workbook = XLSX.read(toBuffer(base64), { type: "buffer" });
  const parts: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
    if (csv.trim()) {
      parts.push(`=== Лист «${sheetName}» ===\n${csv.trim()}`);
    }
  }

  return parts.join("\n\n");
}

/** @deprecated use extractSpreadsheetText */
export const extractXlsxText = extractSpreadsheetText;

export async function extractBriefDocuments(
  docxBase64?: string,
  xlsxBase64?: string,
  pdfBase64?: string,
): Promise<string> {
  const chunks: string[] = [];

  if (docxBase64) {
    const docText = await extractDocxText(docxBase64);
    if (docText) chunks.push(`=== Word-документ ===\n${docText}`);
  }

  if (pdfBase64) {
    const pdfText = await extractPdfText(pdfBase64);
    if (pdfText) chunks.push(`=== PDF-документ ===\n${pdfText}`);
  }

  if (xlsxBase64) {
    const sheetText = extractSpreadsheetText(xlsxBase64);
    if (sheetText) chunks.push(`=== Таблицы (Excel / ODS) ===\n${sheetText}`);
  }

  return chunks.join("\n\n").slice(0, 24000);
}
