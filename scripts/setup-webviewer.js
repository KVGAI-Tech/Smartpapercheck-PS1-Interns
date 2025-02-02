import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function copyWebViewerFiles() {
  try {
    const source = path.join(__dirname, '../node_modules/@pdftron/webviewer/public');
    const destination = path.join(__dirname, '../public/lib');

    // Ensure the destination directory exists
    await fs.ensureDir(destination);

    // Copy files
    await fs.copy(source, destination);
    
    console.log('WebViewer files copied successfully');
  } catch (err) {
    console.error('Error copying WebViewer files:', err);
  }
}

copyWebViewerFiles();