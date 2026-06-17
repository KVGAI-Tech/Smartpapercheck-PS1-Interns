import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Standard A4 dimensions
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;

/**
 * Exports a DOM element to PDF by generating canvas page-by-page.
 * This prevents the "blank/black" canvas issue caused by browser height limits
 * when capturing very tall scroll containers.
 */
export async function exportDomToPdf(elementId, fileName = 'Examination_Paper.pdf') {
  const originalElement = document.getElementById(elementId);
  if (!originalElement) {
    throw new Error(`Preview element #${elementId} not found. Please ensure the preview is visible.`);
  }

  console.log('[PDF Export] Step 1: Wait for full rendering...');
  // Ensure fonts are fully loaded
  await document.fonts.ready;
  
  // Ensure all images are fully loaded
  const images = originalElement.querySelectorAll('img');
  await Promise.all(Array.from(images).map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve; // Continue even if error to prevent hanging
    });
  }));

  console.log('[PDF Export] Step 2: Measuring total DOM height...');
  // Clone to measure the full unconstrained height
  const measureClone = originalElement.cloneNode(true);
  measureClone.style.height = 'auto';
  measureClone.style.maxHeight = 'none';
  measureClone.style.overflow = 'visible';
  measureClone.style.margin = '0';
  measureClone.style.boxShadow = 'none';
  
  const measureWrapper = document.createElement('div');
  measureWrapper.style.width = `${A4_WIDTH_PX}px`;
  measureWrapper.style.position = 'absolute';
  measureWrapper.style.top = '-9999px';
  measureWrapper.style.left = '-9999px';
  measureWrapper.style.visibility = 'hidden';
  measureWrapper.style.background = 'white';
  measureWrapper.appendChild(measureClone);
  document.body.appendChild(measureWrapper);

  const totalHeight = measureWrapper.scrollHeight;
  const totalPages = Math.ceil(totalHeight / A4_HEIGHT_PX);
  
  document.body.removeChild(measureWrapper);

  console.log(`[PDF Export] Dimensions: ${A4_WIDTH_PX}x${totalHeight}px. Total Pages: ${totalPages}`);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  // Step 3 & 4: Generate canvas separately and export page-by-page
  for (let i = 0; i < totalPages; i++) {
    console.log(`[PDF Export] Step 3: Generating Canvas for Page ${i + 1} of ${totalPages}`);
    
    // Create an explicit A4 wrapper
    const pageWrapper = document.createElement('div');
    pageWrapper.style.width = `${A4_WIDTH_PX}px`;
    pageWrapper.style.height = `${A4_HEIGHT_PX}px`;
    pageWrapper.style.overflow = 'hidden'; // Key to preventing massive canvas
    pageWrapper.style.position = 'absolute';
    pageWrapper.style.top = '-9999px';
    pageWrapper.style.left = '-9999px';
    pageWrapper.style.background = 'white';

    const pageClone = originalElement.cloneNode(true);
    pageClone.style.borderRadius = '0';
    pageClone.style.boxShadow = 'none';
    pageClone.style.margin = '0';
    pageClone.style.height = 'auto';
    pageClone.style.maxHeight = 'none';
    // Shift the content up by the current page index height
    pageClone.style.marginTop = `-${i * A4_HEIGHT_PX}px`;

    pageWrapper.appendChild(pageClone);
    document.body.appendChild(pageWrapper);

    const canvas = await html2canvas(pageWrapper, {
      scale: 2, // High resolution
      useCORS: true, // Fix CORS issues with S3
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false, // Set to true if deep debugging is needed
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    if (i > 0) {
      pdf.addPage();
    }
    
    console.log(`[PDF Export] Step 4: Adding Canvas to PDF Page ${i + 1}`);
    pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_PT, A4_HEIGHT_PT);

    document.body.removeChild(pageWrapper);
  }

  console.log('[PDF Export] Step 5: File download');
  pdf.save(fileName);
}
