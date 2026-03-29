import {
  Document as DocxDocument,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { ProjectDocument } from "./generateProjectDocs";

function txtFilenameToDocx(filename: string): string {
  return filename.replace(/\.txt$/i, ".docx");
}

function extractBoqNoteLine(body: string): string | undefined {
  const lines = body.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const l = lines[i].trim();
    if (
      l.startsWith("Napomena") ||
      l.startsWith("Note:") ||
      l.startsWith("Примечание")
    ) {
      return lines[i].trim();
    }
  }
  return undefined;
}

/** Tekst pre prvog bloka sa ── (naslov predmera + meta). */
function boqPreambleText(body: string): string {
  const idx = body.indexOf("\n──");
  if (idx === -1) return body;
  return body.slice(0, idx).trim();
}

function bodyToParagraphs(text: string): Paragraph[] {
  const out: Paragraph[] = [];
  const chunks = text.split(/\n+/);
  for (const chunk of chunks) {
    const t = chunk.trim();
    if (!t) continue;
    out.push(
      new Paragraph({
        children: [new TextRun({ text: t })],
        spacing: { after: 120 },
      }),
    );
  }
  return out;
}

function buildTable(boq: { headers: string[]; rows: string[][] }): Table {
  const headerRow = new TableRow({
    tableHeader: true,
    children: boq.headers.map(
      (h) =>
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: h, bold: true })],
            }),
          ],
        }),
    ),
  });

  const dataRows = boq.rows.map(
    (row) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: cell || "—" })],
                }),
              ],
            }),
        ),
      }),
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

function buildProjectDocumentFile(doc: ProjectDocument): DocxDocument {
  const children: (Paragraph | Table)[] = [];

  children.push(
    new Paragraph({
      text: doc.title,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 240 },
    }),
  );

  if (doc.id === "boq" && doc.boqTable && doc.boqTable.rows.length > 0) {
    const preamble = boqPreambleText(doc.body);
    children.push(...bodyToParagraphs(preamble));
    children.push(buildTable(doc.boqTable));
    const note = extractBoqNoteLine(doc.body);
    if (note) {
      children.push(
        new Paragraph({
          spacing: { before: 200 },
          children: [new TextRun({ text: note, italics: true })],
        }),
      );
    }
  } else {
    children.push(...bodyToParagraphs(doc.body));
  }

  return new DocxDocument({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });
}

export async function buildProjectDocumentDocxBlob(
  doc: ProjectDocument,
): Promise<Blob> {
  return Packer.toBlob(buildProjectDocumentFile(doc));
}

export async function downloadProjectDocumentDocx(
  doc: ProjectDocument,
): Promise<void> {
  const blob = await buildProjectDocumentDocxBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = txtFilenameToDocx(doc.filename);
  a.click();
  URL.revokeObjectURL(url);
}
