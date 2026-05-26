const fs = require('fs');
const path = require('path');

const adminApiDir = path.join(__dirname, 'src/app/api/admin');

function updateFile(filePath, section) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/verifyAdmin\(\)/g, `verifyAdmin(false, '${section}')`);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath} with section ${section}`);
}

const sections = [
  'articles', 'books', 'categories', 'comments', 'contentions', 
  'lectures', 'newsletter', 'proofs', 'qa', 'quotes', 'scholars'
];

sections.forEach(section => {
  const sectionDir = path.join(adminApiDir, section);
  
  // Update index route
  const indexRoute = path.join(sectionDir, 'route.ts');
  if (fs.existsSync(indexRoute)) {
    updateFile(indexRoute, section);
  }

  // Update id route
  const idRoute = path.join(sectionDir, '[id]', 'route.ts');
  if (fs.existsSync(idRoute)) {
    updateFile(idRoute, section);
  }
});
