import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

function canvasToPdf(canvas: HTMLCanvasElement): jsPDF {
  const imgData = canvas.toDataURL("image/jpeg", 0.92);
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;

  let heightLeft = imgH;
  let position = 0;

  pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
  heightLeft -= pageH;

  while (heightLeft > 0) {
    position = heightLeft - imgH;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
    heightLeft -= pageH;
  }

  return pdf;
}

/**
 * Renders a DOM node (npr. ceo planer grid sa karticom + sidebarom) u višestranični A4 PDF.
 * Koristi vizuelni izgled stranice (fontovi, boje, kartice) kao na ekranu.
 * Elementi označeni sa `[data-pdf-hide]` se ne crtaju (CTA, dugmad, affiliate linkovi).
 */
export async function renderPlannerSectionToPdfBlob(
  element: HTMLElement,
): Promise<Blob> {
  element.scrollIntoView({ block: "nearest", behavior: "instant" });
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

  const canvas = await html2canvas(element, {
    scale: Math.min(2, window.devicePixelRatio || 2),
    useCORS: true,
    allowTaint: false,
    logging: false,
    backgroundColor: "#f8f5f2",
    onclone: (_doc, cloned) => {
      cloned.querySelectorAll("[data-pdf-hide]").forEach((el) => {
        (el as HTMLElement).style.setProperty("display", "none", "important");
      });
    },
  });

  return canvasToPdf(canvas).output("blob");
}

export async function downloadPlannerSectionAsPdf(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const blob = await renderPlannerSectionToPdfBlob(element);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
