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
  let changed = false;

  // Fix createClient calls for server components/routes
  if (content.includes('import { createClient } from "@/lib/supabase/server"')) {
    if (content.includes('const supabase = createClient();')) {
      content = content.replace(/const supabase = createClient\(\);/g, 'const supabase = await createClient();');
      changed = true;
    }
  }
  
  // Fix searchParams and params for Next.js 15
  // Examples:
  // export default async function QAPage({ searchParams }: { searchParams: { category?: string; q?: string } })
  // export default async function Page({ params }: { params: { slug: string } })
  
  // A simple regex approach for the page/route signatures that we know are breaking:
  
  // Fix searchParams destructured in args
  if (content.includes('searchParams') && content.match(/{\s*searchParams\s*}/)) {
    // We will do a generic replace: just replace searchParams everywhere they are destructured in the signature
    // Actually, it's safer to just fix the specific files we know are breaking: qa/page.tsx for now.
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
