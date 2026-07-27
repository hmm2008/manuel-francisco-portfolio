const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsPanelTabs/SettingsEstilo.tsx', 'utf8');

// Just fix that specific line
content = content.replace(/{\/\* Subtítulo \*\//g, '{/* Subtítulo */}');

fs.writeFileSync('src/components/SettingsPanelTabs/SettingsEstilo.tsx', content);
