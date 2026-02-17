import * as mupdf from 'mupdf';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const pdfPath = 'Gosta2026_katalog_final_optimized.pdf';
const outputDir = 'scripts/pdf-pages';

mkdirSync(outputDir, { recursive: true });

const data = readFileSync(pdfPath);
const doc = mupdf.Document.openDocument(data, 'application/pdf');

const numPages = doc.countPages();
console.log(`PDF has ${numPages} pages`);

for (let i = 0; i < numPages; i++) {
  try {
    const page = doc.loadPage(i);
    const pixmap = page.toPixmap(
      mupdf.Matrix.scale(2, 2), // 2x scale for readability
      mupdf.ColorSpace.DeviceRGB,
      false, // no alpha
      true   // annots
    );
    const pngData = pixmap.asPNG();
    const filename = `${outputDir}/page-${String(i + 1).padStart(2, '0')}.png`;
    writeFileSync(filename, pngData);
    console.log(`Rendered page ${i + 1}/${numPages} (${Math.round(pngData.length / 1024)}KB)`);
  } catch (err) {
    console.error(`Error on page ${i + 1}:`, err.message);
  }
}

console.log('Done!');
