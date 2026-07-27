const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsPanelTabs/SettingsEstilo.tsx', 'utf8');

// We want to remove all styling fields for titles and subtitles across all pages.
// But it's easier to just do regex replacements or write a specific script.
