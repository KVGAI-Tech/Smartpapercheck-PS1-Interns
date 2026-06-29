const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/components/LandingPage');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.push('../LandingPage.jsx'); // Also include the main LandingPage.jsx if it has animations

let updatedCount = 0;

files.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Standardize viewport
  content = content.replace(/viewport=\{\{\s*once:\s*true\s*\}\}/g, 'viewport={{ once: true, margin: "-50px" }}');
  content = content.replace(/viewport=\{\{\s*once:\s*true\s*,\s*amount:\s*[\d.]+\s*\}\}/g, 'viewport={{ once: true, margin: "-50px" }}');
  content = content.replace(/viewport=\{\{\s*once:\s*true\s*,\s*margin:\s*"-[0-9]+px"\s*\}\}/g, 'viewport={{ once: true, margin: "-50px" }}');
  
  // 2. Standardize initial for slide-up fades
  content = content.replace(/initial=\{\{\s*opacity:\s*0\s*,\s*y:\s*[\d-]+\s*\}\}/g, 'initial={{ opacity: 0, y: 20 }}');
  content = content.replace(/initial=\{\{\s*opacity:\s*0\s*\}\}/g, 'initial={{ opacity: 0, y: 20 }}');

  // 3. Standardize whileInView for slide-up fades
  content = content.replace(/whileInView=\{\{\s*opacity:\s*1\s*\}\}/g, 'whileInView={{ opacity: 1, y: 0 }}');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
    updatedCount++;
  }
});

console.log(`Done. Updated ${updatedCount} files.`);
