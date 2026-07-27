const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsPanelTabs/SettingsEstilo.tsx', 'utf8');

// Replace the double closing div with a single closing div at the end of the sections
content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*}\)/g, '</div>\n        </div>\n      )}');

// And remove any double `}}`
content = content.replace(/{\/\* Subtítulo \*\/}}/g, '{/* Subtítulo */}');

fs.writeFileSync('src/components/SettingsPanelTabs/SettingsEstilo.tsx', content);
