// html2pdf.js ships without a TypeScript declaration in some installations.
declare module "html2pdf.js" {
  const html2pdf: any;
  export default html2pdf;
}
