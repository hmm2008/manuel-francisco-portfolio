const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `>
              Galeria
            </h2>`;
const injection1 = `>
              {siteSettings?.gallerySectionTitle || 'Galeria'}
            </h2>`;

const target2 = `>
              {filteredGallery.length} {filteredGallery.length === 1 ? 'FOTOGRAFIA' : 'FOTOGRAFIAS'}
            </p>`;
const injection2 = `>
              {siteSettings?.gallerySectionSubtitle 
                ? siteSettings.gallerySectionSubtitle 
                : \`\${filteredGallery.length} \${filteredGallery.length === 1 ? 'FOTOGRAFIA' : 'FOTOGRAFIAS'}\`}
            </p>`;

content = content.replace(target1, injection1);
content = content.replace(target2, injection2);
fs.writeFileSync('src/App.tsx', content);
