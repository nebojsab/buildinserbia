import JSZip from "jszip";
import { buildProjectDocumentDocxBlob } from "./exportDocx";
import type { ProjectDocument } from "./generateProjectDocs";
import { renderPlannerSectionToPdfBlob } from "./exportPlannerPdf";

const PLAN_PREFIX = "BuildInSerbia-plan";

/** ZIP: PDF plana (bez web CTA) + svi generisani .docx dokumenti. */
export async function downloadPlanZip(
  element: HTMLElement,
  projectDocs: ProjectDocument[],
): Promise<void> {
  const zip = new JSZip();
  const pdfBlob = await renderPlannerSectionToPdfBlob(element);
  zip.file(`${PLAN_PREFIX}.pdf`, pdfBlob);

  for (const doc of projectDocs) {
    const blob = await buildProjectDocumentDocxBlob(doc);
    const name = doc.filename.replace(/\.txt$/i, ".docx");
    zip.file(name, blob);
  }

  const out = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
  });
  const url = URL.createObjectURL(out);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${PLAN_PREFIX}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
