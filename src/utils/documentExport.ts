import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const PAGE_MARGIN_MM = 8;

/**
 * Renders an HTML element to a high-resolution canvas.
 * Uses html2canvas-pro which supports Tailwind v4 oklch colors.
 */
async function captureElement(element: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });
}

/**
 * Slices a captured canvas into A4 page-sized chunks so that tall documents
 * (many line items) are never cut off — each chunk maps exactly to the
 * printable area of one A4 page (210mm x 297mm minus margins).
 */
function sliceCanvasToA4Pages(canvas: HTMLCanvasElement): { dataUrl: string; heightMm: number }[] {
  const usableWidthMm = A4_WIDTH_MM - PAGE_MARGIN_MM * 2;
  const usableHeightMm = A4_HEIGHT_MM - PAGE_MARGIN_MM * 2;
  const pxPerMm = canvas.width / usableWidthMm;
  const maxSliceHeightPx = Math.floor(pxPerMm * usableHeightMm);

  const pages: { dataUrl: string; heightMm: number }[] = [];
  let offset = 0;

  while (offset < canvas.height) {
    const sliceHeightPx = Math.min(maxSliceHeightPx, canvas.height - offset);
    const slice = document.createElement('canvas');
    slice.width = canvas.width;
    slice.height = sliceHeightPx;
    const ctx = slice.getContext('2d');
    if (!ctx) break;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, offset, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);

    pages.push({
      dataUrl: slice.toDataURL('image/jpeg', 0.95),
      heightMm: sliceHeightPx / pxPerMm,
    });
    offset += sliceHeightPx;
  }

  return pages;
}

/** Exports the element as a PNG image download. */
export async function exportElementAsImage(element: HTMLElement, filename: string): Promise<void> {
  const canvas = await captureElement(element);
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** Exports the element as an A4 (multi-page aware) PDF download. */
export async function exportElementAsPdf(element: HTMLElement, filename: string): Promise<void> {
  const canvas = await captureElement(element);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const pages = sliceCanvasToA4Pages(canvas);
  const usableWidthMm = A4_WIDTH_MM - PAGE_MARGIN_MM * 2;

  pages.forEach((page, index) => {
    if (index > 0) pdf.addPage();
    pdf.addImage(page.dataUrl, 'JPEG', PAGE_MARGIN_MM, PAGE_MARGIN_MM, usableWidthMm, page.heightMm);
  });

  pdf.save(filename);
}

/**
 * Prints the element to exact A4 pages via a dedicated print window.
 * Each captured page slice maps 1:1 to an A4 sheet, so no details are cut off.
 * Falls back to stylesheet-based printing if popups are blocked.
 */
export async function printElement(element: HTMLElement, docTitle: string): Promise<void> {
  const canvas = await captureElement(element);
  const pages = sliceCanvasToA4Pages(canvas);

  const printWindow = window.open('', '_blank', 'width=920,height=1040');
  if (!printWindow) {
    window.print(); // Popup blocked — fall back to @media print stylesheet rules
    return;
  }

  const safeTitle = docTitle.replace(/[<>&"]/g, '');
  const images = pages.map((p) => `<img src="${p.dataUrl}" />`).join('');

  printWindow.document.open();
  printWindow.document.write(
    `<!DOCTYPE html><html><head><title>${safeTitle}</title><style>` +
      `@page{size:A4 portrait;margin:8mm}` +
      `html,body{margin:0;padding:0;background:#ffffff}` +
      `img{display:block;width:100%;page-break-after:always;page-break-inside:avoid}` +
      `img:last-child{page-break-after:auto}` +
      `</style></head><body>${images}` +
      `<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},300);};<\/script>` +
      `</body></html>`
  );
  printWindow.document.close();
}