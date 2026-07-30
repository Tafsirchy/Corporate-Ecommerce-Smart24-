const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let modified = false;

      // regex to match <img ... /> or <img ... >
      const imgRegex = /<img\s([^>]*?)(\/?)>/gi;
      
      if (imgRegex.test(content)) {
        // Prepend import if missing
        if (!content.includes('OptimizedImage')) {
           const importStmt = `import { OptimizedImage } from '@/components/ui/OptimizedImage';\n`;
           // Insert after the last import, or at the top
           // A safe bet is right at the top, or after 'use client'
           if (content.startsWith("'use client'") || content.startsWith('"use client"')) {
             content = content.replace(/('use client';?|"use client";?)/, `$1\n${importStmt}`);
           } else {
             content = importStmt + content;
           }
        }

        content = content.replace(imgRegex, (match, p1) => {
           // p1 is the props inside the tag
           // ensure it closes properly
           return `<OptimizedImage ${p1.trim()} />`;
        });
        
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir('src');
