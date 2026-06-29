const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/LandingPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the motion.div wrappers with simple divs to prevent double animation.
// Since these are multi-line with specific motion properties, we can use a slightly more complex replacement.

// Replace <motion.div ... > with <div ... > where it has these specific motion props
const motionRegex = /<motion\.div\s+initial=\{\{\s*opacity:\s*0,\s*y:\s*20\s*\}\}\s+whileInView=\{\{\s*opacity:\s*1,\s*y:\s*0\s*\}\}\s+transition=\{\{\s*duration:\s*0\.6\s*\}\}\s+viewport=\{\{\s*once:\s*true,\s*amount:\s*0\.2\s*\}\}/g;

content = content.replace(motionRegex, '<div');
content = content.replace(/<\/motion\.div>/g, '</div>');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Cleaned up LandingPage.jsx');
