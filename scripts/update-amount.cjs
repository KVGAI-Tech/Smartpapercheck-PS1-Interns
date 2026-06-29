const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/components/LandingPage');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.push('../LandingPage.jsx');

let updatedCount = 0;

files.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Swap margin: "-50px" to amount: 0.2 for better consistency on first load
  content = content.replace(/margin:\s*"-[0-9]+px"/g, 'amount: 0.2');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
    updatedCount++;
  }
});

console.log(`Done. Updated ${updatedCount} files.`);
