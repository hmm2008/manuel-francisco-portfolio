const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsPanelTabs/SettingsEstilo.tsx', 'utf8');

const target = `<User size={14} /> Biografia
          </button>`;
const injection = `
          <button
            type="button"
            onClick={() => setActiveSubTab('galeria')}
            className={\`px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1.5 \${
              activeSubTab === 'galeria'
                ? 'bg-[#1a1a1a] text-white shadow-sm'
                : 'bg-[#f8f7f5] text-[#4a4a4a] hover:bg-[#e8e4dc]'
            }\`}
          >
            <Image size={14} /> Galeria
          </button>`;

content = content.replace(target, target + injection);
fs.writeFileSync('src/components/SettingsPanelTabs/SettingsEstilo.tsx', content);
