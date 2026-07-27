const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsPanelTabs/SettingsEstilo.tsx', 'utf8');

const target = `{/* PÁGINA: CONTACTOS */}`;
const injection = `{/* PÁGINA: GALERIA */}
      {activeSubTab === 'galeria' && (
        <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
          <div className="border-b border-[#f0ece5] pb-4">
            <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
              <Image size={20} className="text-[#8e8a82]" /> Estilos da Página Galeria
            </h2>
            <p className="text-xs text-[#8e8a82] font-sans mt-1">Configure o título ("Galeria") e o subtítulo ("X FOTOGRAFIAS").</p>
          </div>

          {/* Título Principal */}
          <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">1. Título Principal (ex: Galeria)</span>
            <SettingRow
              label="TEXTO DO TÍTULO"
              name="gallerySectionTitle"
              value={settings.gallerySectionTitle || 'Galeria'}
              onChange={handleChange}
              placeholder="ex: Galeria"
            />
          </div>

          {/* Subtítulo */}
          <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">2. Subtítulo / Contador (ex: X FOTOGRAFIAS)</span>
            <SettingRow
              label="TEXTO DO SUBTÍTULO (DEIXE EM BRANCO PARA MOSTRAR A CONTAGEM PADRÃO)"
              name="gallerySectionSubtitle"
              value={settings.gallerySectionSubtitle || ''}
              onChange={handleChange}
              placeholder="ex: Ver portfólio completo (ou deixe vazio para contagem)"
            />
          </div>
        </div>
      )}

      `;

content = content.replace(target, injection + target);
fs.writeFileSync('src/components/SettingsPanelTabs/SettingsEstilo.tsx', content);
