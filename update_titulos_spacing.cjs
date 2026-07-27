const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsPanelTabs/SettingsEstilo.tsx', 'utf8');

const target = `<SettingRow
                label="ESPAÇAMENTO ATÉ AO SUBTÍTULO (px)"
                name="pageTitleSubtitleSpacing"
                type="number"
                value={settings.pageTitleSubtitleSpacing ?? 12}
                onChange={handleChange}
                placeholder="ex: 12"
              />`;

const replacement = `<RangeSlider
                label="DISTÂNCIA ENTRE TÍTULO E SUBTÍTULO"
                name="pageTitleSubtitleSpacing"
                value={settings.pageTitleSubtitleSpacing !== undefined ? Number(settings.pageTitleSubtitleSpacing) : 12}
                min={0}
                max={100}
                step={1}
                unit="px"
                onChange={handleRangeChange}
              />`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/SettingsPanelTabs/SettingsEstilo.tsx', content);
