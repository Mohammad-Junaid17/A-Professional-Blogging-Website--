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

  // 1. Fix API routes:
  // export async function GET(req: Request, { params }: { params: { id: string } })
  // becomes:
  // export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  //   const params = await props.params;
  //   const { id } = params;
  
  if (file.includes('route.ts') && content.includes('params')) {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    methods.forEach(method => {
      // We will match exactly the signature used in the codebase
      // e.g. export async function PUT(req: Request, { params }: { params: { id: string } }) {
      
      const regex = new RegExp(`export async function ${method}\\(([^,]+),\\s*{\\s*params\\s*}:\\s*{\\s*params:\\s*{\\s*([^}]+)\\s*}\\s*}\\s*\\)\\s*{`, 'g');
      content = content.replace(regex, (match, reqArg, paramType) => {
        return `export async function ${method}(${reqArg}, props: { params: Promise<{ ${paramType} }> }) {\n  const params = await props.params;\n  const { ${paramType.split(':')[0].trim()} } = params;`;
      });
    });
  }

  // 2. Fix dynamic Pages:
  // export default function Page({ params }: { params: { slug: string } })
  // export default async function Page({ params }: { params: { slug: string } })
  if (file.includes('page.tsx') && content.includes('params')) {
    // Some pages might not be async, Next15 requires them to be async to await params
    content = content.replace(/export default function/g, 'export default async function');
    
    // export default async function Page({ params }: { params: { slug: string } }) {
    const regex = /export default async function ([^\(]+)\(\s*{\\n?\s*params,?\\n?\s*}:\s*{\\n?\s*params:\s*{\\n?\s*([^}]+)\\n?\s*}\\n?\s*},?\\n?\s*\)\s*{/g;
    
    // Some are formatted in one line or multiple lines. Let's just use a more robust regex or simple string replacement.
    // Instead of regex, let's do a simpler replacement if it matches the standard format.
    
    // We will find `{ params }` and `params: {` and manually replace.
    // Actually, doing a custom regex is fine:
    const regex2 = /export default async function (\w+)\(\s*{\s*params\s*,?(?:\s*searchParams,?)?\s*}:\s*{\s*params:\s*{\s*([^}]+)\s*}(?:\s*,\s*searchParams:\s*{[^}]+})?\s*}\s*\)\s*{/g;
    content = content.replace(regex2, (match, funcName, paramType) => {
      // If there's searchParams involved, it's more complex, but we know our app mostly has `params: { slug: string }` or `id: string`
      return `export default async function ${funcName}(props: { params: Promise<{ ${paramType} }> }) {\n  const params = await props.params;`;
    });
    
    // Let's also do a simpler catch-all for the exact multi-line signature common in Next.js
    const multilineRegex = /export default async function (\w+)\(\s*{\s*params\s*,\s*}:\s*{\s*params:\s*{\s*([^}]+)\s*}\s*;\s*}\s*\)\s*{/g;
    content = content.replace(multilineRegex, (match, funcName, paramType) => {
      return `export default async function ${funcName}(props: { params: Promise<{ ${paramType} }> }) {\n  const params = await props.params;`;
    });
  }
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
