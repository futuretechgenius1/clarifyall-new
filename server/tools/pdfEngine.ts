// Server-side PDF manipulation engine using pdf-lib
import { PDFDocument } from 'pdf-lib';

export interface PDFProcessResult {
  pdfBase64: string;
  originalSizeBytes: number;
  outputSizeBytes: number;
  pageCount: number;
  reductionPercentage?: number;
}

export class PDFEngine {
  /**
   * Compress PDF by rebuilding the PDF document structure and stripping orphaned streams
   */
  static async compressPdf(buffer: Buffer): Promise<PDFProcessResult> {
    const originalSizeBytes = buffer.length;
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    
    // Create new lean document and copy pages
    const destDoc = await PDFDocument.create();
    const pageCount = srcDoc.getPageCount();
    const pageIndices = Array.from({ length: pageCount }, (_, i) => i);
    const copiedPages = await destDoc.copyPages(srcDoc, pageIndices);
    
    for (const page of copiedPages) {
      destDoc.addPage(page);
    }

    // Set minimal metadata
    destDoc.setProducer('ClarifyAll.com PDF Engine');
    destDoc.setCreator('ClarifyAll.com');
    destDoc.setModificationDate(new Date());

    // Save with useObjectStreams for high compression
    const outputBytes = await destDoc.save({ useObjectStreams: true });
    const outputSizeBytes = outputBytes.length;
    const reductionPercentage = Math.max(0, Math.round(((originalSizeBytes - outputSizeBytes) / originalSizeBytes) * 100));

    return {
      pdfBase64: Buffer.from(outputBytes).toString('base64'),
      originalSizeBytes,
      outputSizeBytes,
      pageCount,
      reductionPercentage,
    };
  }

  /**
   * Merge multiple PDF buffers in specified sequence
   */
  static async mergePdfs(buffers: Buffer[]): Promise<PDFProcessResult> {
    if (buffers.length < 2) {
      throw new Error('At least two PDF files are required to merge.');
    }

    const mergedDoc = await PDFDocument.create();
    let totalOriginalSize = 0;
    let totalPages = 0;

    for (const buf of buffers) {
      totalOriginalSize += buf.length;
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const count = doc.getPageCount();
      totalPages += count;
      const pages = await mergedDoc.copyPages(doc, Array.from({ length: count }, (_, i) => i));
      for (const p of pages) {
        mergedDoc.addPage(p);
      }
    }

    mergedDoc.setProducer('ClarifyAll.com PDF Merger');
    const outputBytes = await mergedDoc.save({ useObjectStreams: true });

    return {
      pdfBase64: Buffer.from(outputBytes).toString('base64'),
      originalSizeBytes: totalOriginalSize,
      outputSizeBytes: outputBytes.length,
      pageCount: totalPages,
    };
  }

  /**
   * Split PDF by selecting specified page ranges (e.g. "1-3, 5")
   */
  static async splitPdf(buffer: Buffer, pageRangeStr: string): Promise<PDFProcessResult> {
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();

    // Parse page ranges (1-indexed input from user converted to 0-indexed)
    const selectedIndices = new Set<number>();
    const tokens = pageRangeStr.split(',').map(t => t.trim()).filter(Boolean);

    for (const token of tokens) {
      if (token.includes('-')) {
        const [startStr, endStr] = token.split('-').map(s => s.trim());
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.max(1, Math.min(start, end));
          const max = Math.min(totalPages, Math.max(start, end));
          for (let p = min; p <= max; p++) {
            selectedIndices.add(p - 1);
          }
        }
      } else {
        const pageNum = parseInt(token, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
          selectedIndices.add(pageNum - 1);
        }
      }
    }

    if (selectedIndices.size === 0) {
      throw new Error(`Invalid page range. Please select pages between 1 and ${totalPages}.`);
    }

    const sortedIndices = Array.from(selectedIndices).sort((a, b) => a - b);
    const splitDoc = await PDFDocument.create();
    const copiedPages = await splitDoc.copyPages(srcDoc, sortedIndices);

    for (const page of copiedPages) {
      splitDoc.addPage(page);
    }

    splitDoc.setProducer('ClarifyAll.com PDF Splitter');
    const outputBytes = await splitDoc.save({ useObjectStreams: true });

    return {
      pdfBase64: Buffer.from(outputBytes).toString('base64'),
      originalSizeBytes: buffer.length,
      outputSizeBytes: outputBytes.length,
      pageCount: sortedIndices.length,
    };
  }
}
