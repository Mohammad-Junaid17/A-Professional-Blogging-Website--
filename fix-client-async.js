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

  // Fix async client components
  if ((content.includes('"use client"') || content.includes("'use client'")) && content.includes('export default async function')) {
    content = content.replace(/export default async function/g, 'export default function');
    
    // If it was my script that added `const params = await props.params;` in a client component,
    // we need to change it to `const params = React.use(props.params);`
    content = content.replace(/const searchParams = await (props\.)?searchParams;/g, 'const searchParams = React.use($1searchParams);');
    content = content.replace(/const params = await (props\.)?params;/g, 'const params = React.use($1params);');
    
    // Add import React from "react" if not present
    if (!content.includes('import React') && !content.includes('import * as React')) {
      content = 'import React from "react";\n' + content;
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated async client component: ${file}`);
  }
});
