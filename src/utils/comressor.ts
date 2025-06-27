import { PDFDocument } from "pdf-lib";

export async function compressPDF(buffer: Buffer): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(buffer);
  const compressedPDF = await pdfDoc.save();
  return Buffer.from(compressedPDF);
}
