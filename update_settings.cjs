const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsPanelTabs/SettingsEstilo.tsx', 'utf8');

const target = `<div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">2. Subtítulo / Estatística (ex: REGISTOS DE VISITANTES)</span>
            <SettingRow
              label="TEXTO DO SUBTÍTULO"
              name="guestbookSectionSubtitle"
              value={settings.guestbookSectionSubtitle || 'REGISTOS DE VISITANTES'}
              onChange={handleChange}
              placeholder="ex: REGISTOS DE VISITANTES"
            />
          </div>`;

const injection = `<div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">2. Subtítulo / Estatística</span>
            
            <div className="space-y-3 pb-3">
              <label className="text-[10px] uppercase font-bold text-[#4a4a4a] block mb-2 tracking-wider">MODO DE EXIBIÇÃO</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-xs text-[#4a4a4a] cursor-pointer">
                  <input
                    type="radio"
                    name="guestbookSubtitleMode"
                    value="both"
                    checked={!settings.guestbookSubtitleMode || settings.guestbookSubtitleMode === 'both'}
                    onChange={handleChange as any}
                    className="accent-[#1a1a1a]"
                  />
                  Mostrar Subtítulo + Contador de Mensagens (ex: VISITANTES - 4 registos)
                </label>
                <label className="flex items-center gap-2 text-xs text-[#4a4a4a] cursor-pointer">
                  <input
                    type="radio"
                    name="guestbookSubtitleMode"
                    value="subtitle_only"
                    checked={settings.guestbookSubtitleMode === 'subtitle_only'}
                    onChange={handleChange as any}
                    className="accent-[#1a1a1a]"
                  />
                  Mostrar Apenas Subtítulo (ex: VISITANTES)
                </label>
                <label className="flex items-center gap-2 text-xs text-[#4a4a4a] cursor-pointer">
                  <input
                    type="radio"
                    name="guestbookSubtitleMode"
                    value="count_only"
                    checked={settings.guestbookSubtitleMode === 'count_only'}
                    onChange={handleChange as any}
                    className="accent-[#1a1a1a]"
                  />
                  Mostrar Apenas Contador de Mensagens (ex: 4 registos)
                </label>
              </div>
            </div>

            {(!settings.guestbookSubtitleMode || settings.guestbookSubtitleMode !== 'count_only') && (
              <SettingRow
                label="TEXTO DO SUBTÍTULO"
                name="guestbookSectionSubtitle"
                value={settings.guestbookSectionSubtitle || 'REGISTOS DE VISITANTES'}
                onChange={handleChange}
                placeholder="ex: REGISTOS DE VISITANTES"
              />
            )}
          </div>`;

content = content.replace(target, injection);
fs.writeFileSync('src/components/SettingsPanelTabs/SettingsEstilo.tsx', content);
