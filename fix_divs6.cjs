const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsPanelTabs/SettingsEstilo.tsx', 'utf8');

// The block for 'livro' is:
const livroStart = content.indexOf(`{/* PÁGINA: LIVRO DE VISITANTES */}`);
const linksStart = content.indexOf(`{/* PÁGINA: LINKS / RECURSOS */}`);
const cabecalhoStart = content.indexOf(`{/* CABEÇALHOS & NOME DO SITE */}`);

const correctLivro = `{/* PÁGINA: LIVRO DE VISITANTES */}
      {activeSubTab === 'livro' && (
        <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
          <div className="border-b border-[#f0ece5] pb-4">
            <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
              <BookOpen size={20} className="text-[#8e8a82]" /> Estilos da Página Livro de Visitas
            </h2>
            <p className="text-xs text-[#8e8a82] font-sans mt-1">Configure o título ("Livro de Visitas") e o subtítulo/contador ("REGISTOS DE VISITANTES").</p>
          </div>
          {/* Título Principal */}
          <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">1. Título Principal (ex: Livro de Visitas)</span>
            <SettingRow
              label="TEXTO DO TÍTULO"
              name="guestbookSectionTitle"
              value={settings.guestbookSectionTitle || 'Livro de Visitas'}
              onChange={handleChange}
              placeholder="ex: Livro de Visitas"
            />
          </div>
          {/* Subtítulo */}
          <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">2. Subtítulo / Estatística (ex: REGISTOS DE VISITANTES)</span>
            <SettingRow
              label="TEXTO DO SUBTÍTULO"
              name="guestbookSectionSubtitle"
              value={settings.guestbookSectionSubtitle || 'REGISTOS DE VISITANTES'}
              onChange={handleChange}
              placeholder="ex: REGISTOS DE VISITANTES"
            />
          </div>
        </div>
      )}
      
      `;

const correctLinks = `{/* PÁGINA: LINKS / RECURSOS */}
      {activeSubTab === 'links' && (
        <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
          <div className="border-b border-[#f0ece5] pb-4">
            <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
              <Link size={20} className="text-[#8e8a82]" /> Estilos da Página Links & Recursos
            </h2>
            <p className="text-xs text-[#8e8a82] font-sans mt-1">Configure o título ("Links") e o subtítulo ("RECURSOS").</p>
          </div>
          {/* Título Principal */}
          <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">1. Título Principal (ex: Links)</span>
            <SettingRow
              label="TEXTO DO TÍTULO"
              name="linksSectionTitle"
              value={settings.linksSectionTitle || 'Links'}
              onChange={handleChange}
              placeholder="ex: Links"
            />
          </div>
          {/* Subtítulo */}
          <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">2. Subtítulo (ex: RECURSOS)</span>
            <SettingRow
              label="TEXTO DO SUBTÍTULO"
              name="linksSectionSubtitle"
              value={settings.linksSectionSubtitle || 'RECURSOS'}
              onChange={handleChange}
              placeholder="ex: RECURSOS"
            />
          </div>
        </div>
      )}
      
      `;

content = content.substring(0, livroStart) + correctLivro + correctLinks + content.substring(cabecalhoStart);
fs.writeFileSync('src/components/SettingsPanelTabs/SettingsEstilo.tsx', content);
