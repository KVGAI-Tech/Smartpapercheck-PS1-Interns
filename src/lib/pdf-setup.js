import { GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf';
const workerSrc = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.min.js',
  import.meta.url
);
GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.js';
export const setupPdfWorker = () => {
  if (typeof window !== 'undefined') {
    GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.js';
  }
};
