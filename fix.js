const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/admin/**/\\[id\\]/edit/page.tsx');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Change type from { params: { id: string } } to { params: Promise<{ id: string }> }
  content = content.replace(/\{ params \}: \{ params: \{ id: string \} \}/g, '{ params }: { params: Promise<{ id: string }> }');

  // Add React import if missing
  if (!content.includes('import React') && !content.includes('import * as React')) {
    if (content.includes('import { useState')) {
      content = content.replace(/import \{.*?\} from \"react\";/, (match) => {
        return 'import React, ' + match.replace('import ', '');
      });
    } else {
      content = 'import React from "react";\n' + content;
    }
  }

  // Inject const { id } = React.use(params); at the start of the function body
  content = content.replace(/export default function .*?\(\{ params \}: \{ params: Promise<\{ id: string \}> \}\) \{/, (match) => {
    return match + '\n  const { id } = React.use(params);';
  });

  // Replace params.id with id
  content = content.replace(/params\.id/g, 'id');

  fs.writeFileSync(file, content);
}

// Fix books/[slug]/page.tsx
const bookFile = 'src/app/books/[slug]/page.tsx';
if (fs.existsSync(bookFile)) {
    let content = fs.readFileSync(bookFile, 'utf8');
    content = content.replace(/\{ params \}: \{ params: \{ slug: string \} \}/g, '{ params }: { params: Promise<{ slug: string }> }');
    if (!content.includes('import React')) {
        content = 'import React from "react";\n' + content;
    }
    content = content.replace(/export default async function BookDetailPage\(\{ params \}: \{ params: Promise<\{ slug: string \}> \}\) \{/, (match) => {
        return match + '\n  const { slug } = React.use(params);';
    });
    content = content.replace(/params\.slug/g, 'slug');
    fs.writeFileSync(bookFile, content);
}
console.log("Fixed params unwrapping!");
