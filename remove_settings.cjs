const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsPanelTabs/SettingsEstilo.tsx', 'utf8');

const removes = [
  {
    regex: /<SettingRow\s+label="ESPAÇAMENTO ENTRE TÍTULO E SUBTÍTULO \(px\)"\s+name="biographyTitleSubtitleSpacing"[\s\S]*?<\/div>\s*<\/div>/,
    replace: '</div>'
  },
  {
    regex: /<div className="grid grid-cols-1 md:grid-cols-2 gap-6">\s*<SettingSelect\s+label="FONTE DO SUBTÍTULO"\s+name="biographySubtitleFont"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
    replace: '</div>\n            </div>'
  },
  {
    regex: /<SettingRow\s+label="ESPAÇAMENTO ENTRE TÍTULO E SUBTÍTULO \(px\)"\s+name="contactTitleSubtitleSpacing"[\s\S]*?<\/div>\s*<\/div>/,
    replace: '</div>'
  },
  {
    regex: /<div className="grid grid-cols-1 md:grid-cols-2 gap-6">\s*<SettingSelect\s+label="FONTE DO SUBTÍTULO"\s+name="contactSubtitleFont"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
    replace: '</div>\n            </div>'
  },
  {
    regex: /<SettingRow\s+label="ESPAÇAMENTO ENTRE TÍTULO E SUBTÍTULO \(px\)"\s+name="guestbookTitleSubtitleSpacing"[\s\S]*?<\/div>\s*<\/div>/,
    replace: '</div>'
  },
  {
    regex: /<div className="grid grid-cols-1 md:grid-cols-2 gap-6">\s*<SettingSelect\s+label="FONTE DO SUBTÍTULO"\s+name="guestbookSubtitleFont"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
    replace: '</div>\n            </div>'
  },
  {
    regex: /<SettingRow\s+label="ESPAÇAMENTO ENTRE TÍTULO E SUBTÍTULO \(px\)"\s+name="linksTitleSubtitleSpacing"[\s\S]*?<\/div>\s*<\/div>/,
    replace: '</div>'
  },
  {
    regex: /<div className="grid grid-cols-1 md:grid-cols-2 gap-6">\s*<SettingSelect\s+label="FONTE DO SUBTÍTULO"\s+name="linksSubtitleFont"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
    replace: '</div>\n            </div>'
  }
];

let newContent = content;
removes.forEach(r => {
  newContent = newContent.replace(r.regex, r.replace);
});

fs.writeFileSync('src/components/SettingsPanelTabs/SettingsEstilo.tsx', newContent);
console.log("Done");
