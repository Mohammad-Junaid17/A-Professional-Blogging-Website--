const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'src/app/admin');

const sections = [
  'articles', 'books', 'categories', 'comments', 'contentions', 
  'lectures', 'newsletter', 'proofs', 'qa', 'quotes', 'scholars'
];

sections.forEach(section => {
  const sectionDir = path.join(adminDir, section);
  if (!fs.existsSync(sectionDir)) {
    fs.mkdirSync(sectionDir, { recursive: true });
  }
  
  const layoutPath = path.join(sectionDir, 'layout.tsx');
  
  const layoutContent = `import { verifyAdmin } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function ${section.charAt(0).toUpperCase() + section.slice(1)}Layout({ children }: { children: React.ReactNode }) {
  const session = await verifyAdmin(false, '${section}');
  if (!session) redirect('/admin');
  return <>{children}</>;
}
`;

  fs.writeFileSync(layoutPath, layoutContent, 'utf8');
  console.log(`Created layout for ${section}`);
});
