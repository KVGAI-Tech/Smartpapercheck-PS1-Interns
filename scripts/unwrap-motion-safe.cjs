const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/LandingPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// The regex will match the exact block:
const motionRegex = /<motion\.div\s+initial=\{\{\s*opacity:\s*0,\s*y:\s*20\s*\}\}\s+whileInView=\{\{\s*opacity:\s*1,\s*y:\s*0\s*\}\}\s+transition=\{\{\s*duration:\s*0\.6\s*\}\}\s+viewport=\{\{\s*once:\s*true,\s*(?:margin:\s*"-[0-9]+px"|amount:\s*0\.2)\s*\}\}\s*(ref=\{[^}]+\}\s*)?(data-section="[^"]+"\s*)?>\s*(<[A-Za-z0-9_]+\s*(?:[^>]+)?\/>)\s*<\/motion\.div>/g;

content = content.replace(motionRegex, (match, p1, p2, p3) => {
  let wrapperProps = '';
  if (p1) wrapperProps += ` ${p1.trim()}`;
  if (p2) wrapperProps += ` ${p2.trim()}`;
  
  if (wrapperProps) {
    return `<div${wrapperProps}>\n        ${p3}\n      </div>`;
  } else {
    return p3; // Just the inner component
  }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Cleaned up LandingPage.jsx wrappers safely');
