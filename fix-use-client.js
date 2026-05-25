const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Move "use client" to the absolute top
  if (content.includes('"use client"') || content.includes("'use client'")) {
    // Remove all instances of use client
    content = content.replace(/["']use client["'];?\n?/g, '');
    
    // Sometimes eslint-disable might be at the top, it's safer to put use client at the top, or right after eslint-disable.
    // Let's just put it at the very top.
    content = '"use client";\n' + content;
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated client directive: ${file}`);
  }
});
