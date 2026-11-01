// MASAMASA_CLIENT_PDF_V1
// Client-only. No upload and no window.print(). Loaded on demand.
export async function makeTechnologyPdf(sheet: HTMLElement, fileName: string): Promise<File> {
  const module = await import("html2pdf.js");
  const html2pdf = module.default;
  if (typeof html2pdf !== "function") throw new Error("PDF renderer unavailable");

  // Work on an independent DOM copy. The live editable card is never mutated.
  const copy = sheet.cloneNode(true) as HTMLElement;
  copy.classList.add("masamasa-pdf-export");
  copy.style.width = "100%";
  copy.style.maxWidth = "none";
  copy.style.minWidth = "0";
  copy.style.margin = "0";
  copy.style.padding = "16px 22px";
  copy.style.border = "none";
  copy.style.borderRadius = "0";
  copy.style.boxShadow = "none";
  copy.style.backgroundColor = "#fff";
  copy.style.boxSizing = "border-box";

  // Match the printable card: show the finalized durations, not editable fields.
  const overrides = document.createElement("style");
  overrides.textContent = `
    .masamasa-pdf-export { width: 100% !important; max-width: none !important; }
    .masamasa-pdf-export .tech-card-header { flex-direction: row !important; }
    .masamasa-pdf-export .tech-card-conditions { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
    .masamasa-pdf-export .tech-card-duration-fields,
    .masamasa-pdf-export .tech-card-timeline-actions,
    .masamasa-pdf-export .tech-card-setting-time { display: none !important; }
    .masamasa-pdf-export .tech-card-duration-for-print {
      display: block !important; font-weight: 700 !important; font-size: 12px !important;
      color: #213d2d !important; margin: 0 !important; white-space: normal !important;
    }
    .masamasa-pdf-export .tech-card-section,
    .masamasa-pdf-export .tech-card-timeline,
    .masamasa-pdf-export .tech-card-operations { break-inside: auto !important; page-break-inside: auto !important; }
    .masamasa-pdf-export tr,
    .masamasa-pdf-export li,
    .masamasa-pdf-export .tech-card-conditions > div,
    .masamasa-pdf-export .tech-card-header { break-inside: avoid !important; page-break-inside: avoid !important; }
    .masamasa-pdf-export h2,
    .masamasa-pdf-export h3 { break-after: avoid !important; page-break-after: avoid !important; }
  `;
  copy.prepend(overrides);

  // html2pdf.js uses html2canvas + jsPDF. Both execute in the browser; no server.
  // Modest scale reduces canvas-memory failures on mobile Safari for long cards.
  const pdfBlob = await html2pdf().set({
    margin: [9, 8, 9, 8],
    filename: fileName,
    image: { type: "jpeg", quality: 0.96 },
    html2canvas: {
      scale: 1.5,
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollX: 0,
      logging: false,
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait", compress: true },
    pagebreak: {
      mode: ["css", "legacy"],
      avoid: ["tr", "li", ".tech-card-conditions > div", ".tech-card-header"],
    },
  }).from(copy).outputPdf("blob") as Blob;

  if (!(pdfBlob instanceof Blob) || pdfBlob.size < 1024) {
    throw new Error("PDF renderer returned an empty file");
  }
  return new File([pdfBlob], fileName, { type: "application/pdf" });
}
