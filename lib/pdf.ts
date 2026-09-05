import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function invoiceElementToPdf(el: HTMLElement, filename: string) {
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#f4efe6",
    logging: false,
  });

  const img = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;
  pdf.addImage(img, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
  heightLeft -= pageHeight;

  while (heightLeft > 8) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(img, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
  return pdf.output("blob");
}

export function invoiceShareUrl(invoiceId: string) {
  if (typeof window === "undefined") return `/i/${invoiceId}`;
  return `${window.location.origin}/i/${invoiceId}`;
}

export async function shareInvoiceLink(opts: {
  url: string;
  title: string;
  text?: string;
  file?: File;
}) {
  const { url, title, text, file } = opts;
  const payload: ShareData = { title, text: text || title, url };

  if (file && navigator.canShare?.({ files: [file] })) {
    payload.files = [file];
  }

  if (navigator.share && navigator.canShare?.(payload)) {
    await navigator.share(payload);
    return "shared";
  }

  await navigator.clipboard.writeText(url);
  return "copied";
}
