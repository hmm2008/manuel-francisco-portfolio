const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsPanelTabs/SettingsEstilo.tsx', 'utf8');

content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*}\)/g, '</div>\n          </div>\n        </div>\n      )}');
content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*}\)/g, '</div>\n        </div>\n      )}');

content = content.replace(/<\/div>\s*<\/div>\s*{\/\* Subtítulo \*\//g, '</div>\n          {/* Subtítulo */'); // Guestbook uses just {/* Subtítulo */}

fs.writeFileSync('src/components/SettingsPanelTabs/SettingsEstilo.tsx', content);
