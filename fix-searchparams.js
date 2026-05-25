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

const files = walk('src/app');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 3. Fix searchParams
  // export default async function Page({ searchParams }: { searchParams: { category?: string; q?: string } })
  if (file.includes('page.tsx') && content.includes('searchParams')) {
    content = content.replace(/export default function/g, 'export default async function');
    
    // We match the signature for searchParams
    const regex = /export default async function (\w+)\(\s*{\s*searchParams\s*,?\s*}\s*:\s*{\s*searchParams\s*:\s*{([^}]+)}\s*;?\s*}\s*\)\s*{/g;
    content = content.replace(regex, (match, funcName, searchParamType) => {
      return `export default async function ${funcName}(props: { searchParams: Promise<{${searchParamType}}> }) {\n  const searchParams = await props.searchParams;`;
    });
    
    // Multiline version
    const regex2 = /export default async function (\w+)\(\s*{\s*searchParams\s*,?\s*}\s*:\s*{\s*searchParams\s*:\s*{\s*([^}]+)\s*}\s*;?\s*}\s*\)\s*{/g;
    content = content.replace(regex2, (match, funcName, searchParamType) => {
      return `export default async function ${funcName}(props: { searchParams: Promise<{${searchParamType}}> }) {\n  const searchParams = await props.searchParams;`;
    });
  }

  // Auth signin route searchParams (if any)
  if (file.includes('signin\\page.tsx') && content.includes('searchParams')) {
      const regexSignin = /export default async function SignIn\(\s*{\s*searchParams\s*,?\s*}\s*:\s*{\s*searchParams\s*:\s*{([^}]+)}\s*;?\s*}\s*\)\s*{/g;
      content = content.replace(regexSignin, (match, searchParamType) => {
        return `export default async function SignIn(props: { searchParams: Promise<{${searchParamType}}> }) {\n  const searchParams = await props.searchParams;`;
      });
  }
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
