// scripts/setup-pdftron.js
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

async function setupPDFTron() {
  try {
    // Path to the WebViewer files
    const webviewerPath = path.join(projectRoot, 'node_modules', '@pdftron', 'webviewer', 'public');
    const libPath = path.join(projectRoot, 'public', 'lib');
    const corePath = path.join(libPath, 'core');

    // Clean existing directories
    await fs.remove(libPath);

    // Create fresh directories
    await fs.ensureDir(libPath);
    await fs.ensureDir(corePath);

    // Copy WebViewer files
    await fs.copy(webviewerPath, libPath);

    // Ensure worker files are in the correct location
    const workerFiles = [
      'pdf.worker.min.js',
      'pdf.worker.min.js.map',
      'webviewer-core.min.js',
      'webviewer-core.min.js.map'
    ];

    for (const file of workerFiles) {
      const sourcePath = path.join(webviewerPath, 'core', file);
      const targetPath = path.join(corePath, file);
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, targetPath);
      }
    }

    console.log('Successfully set up WebViewer files');
  } catch (err) {
    console.error('Error setting up WebViewer:', err);
    process.exit(1);
  }
}

setupPDFTron();