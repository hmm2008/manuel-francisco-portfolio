import React from 'react';
import { motion } from 'motion/react';
import Footer from './Footer';
// @ts-ignore
import fallbackPortrait from '../assets/images/photographer_portrait_1784841967018.jpg';

interface BiographyProps {
  settings: any;
  setActiveView: (view: any) => void;
  onOpenTerms: () => void;
}

export default function Biography({ settings, setActiveView, onOpenTerms }: BiographyProps) {
  const content = (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center flex-1">
      {/* Header Section (Same as Gallery) */}
      {(settings?.showPageHeaderTitle !== false || settings?.showPageHeaderLines !== false) && (
        <div 
          className="text-center w-full max-w-5xl mx-auto flex-shrink-0"
          style={{ marginBottom: settings?.mainTitleBottomMargin !== undefined ? `${settings.mainTitleBottomMargin}px` : '40px' }}
        >
          <div className={`py-4 mb-4 ${settings?.showPageHeaderLines !== false ? 'border-y border-[#4a4a4a]/10' : ''}`}>
            {settings?.showPageHeaderTitle !== false && (
              <h1 className="font-sans text-lg md:text-xl text-[#4a4a4a] tracking-widest uppercase font-semibold">
                {settings?.siteName ? settings.siteName.replace('\n', ' ') : 'Manuel Francisco Fotografia'}
              </h1>
            )}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-x-12 lg:gap-x-20 gap-y-6 items-start mb-12">
        {/* Title: On mobile appears first, on desktop sits in column 2, row 1 above the bio text */}
        <div className="lg:col-start-2 lg:row-start-1 text-left">
          <h2 className="font-sans font-medium text-xl md:text-2xl text-[#4a4a4a] tracking-wide mb-1">
            Biografia
          </h2>
          <p className="font-sans text-xs md:text-sm text-[#7a7a7a]/50 tracking-[0.2em] uppercase font-light">
            Sobre o Fotógrafo
          </p>
        </div>

        {/* Left Side: Photo - On desktop sits in column 1, row 2 so top edge aligns with "Nasceu a..." text in column 2, row 2 */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lg:col-start-1 lg:row-start-2 relative"
        >
          <div className="aspect-square overflow-hidden bg-[#dcd7cf] shadow-sm">
            <img 
              src={(settings?.profilePhoto && settings.profilePhoto !== '/src/assets/images/photographer_portrait_1784841967018.jpg') ? settings.profilePhoto : fallbackPortrait} 
              alt="Manuel Francisco" 
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Right Side: Text Sections starting with "Nasceu a..." on row 2 */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-start-2 lg:row-start-2 flex flex-col space-y-12"
        >
          <div className="space-y-12">
            {/* Bio Text */}
            <section className="space-y-6">
              <div className="text-sm md:text-base text-[#4a4a4a]/90 leading-relaxed font-sans text-justify whitespace-pre-line">
                {settings?.biography || `Nasceu a 26 de Fevereiro de 1962 em Coimbra. Enfermeiro de profissão...`}
              </div>
            </section>

            {/* Published Works */}
            <section>
              <h3 className="font-sans text-[11px] tracking-[0.2em] uppercase text-[#7a7a7a] mb-4 border-b border-[#4a4a4a]/10 pb-2 inline-block">
                Trabalhos Publicados
              </h3>
              <div className="space-y-3">
                <p className="text-xs md:text-sm text-[#4a4a4a]/80 leading-relaxed font-sans">
                  <span className="text-[#4a4a4a] font-medium">1985</span> — Revista "Mais" no espaço as suas fotos
                </p>
                <p className="text-xs md:text-sm text-[#4a4a4a]/80 leading-relaxed font-sans">
                  <span className="text-[#4a4a4a] font-medium">1988</span> — Anuário Português de Fotografia
                </p>
                <p className="text-xs md:text-sm text-[#4a4a4a]/80 leading-relaxed font-sans">
                  <span className="text-[#4a4a4a] font-medium">2006</span> — Foto Plus
                </p>
                <p className="text-xs md:text-sm text-[#4a4a4a]/80 leading-relaxed font-sans">
                  <span className="text-[#4a4a4a] font-medium">2006</span> — Participação numa brochura para uma agência de turismo.
                </p>
              </div>
            </section>

            {/* Exhibitions */}
            <section>
              <h3 className="font-sans text-[11px] tracking-[0.2em] uppercase text-[#7a7a7a] mb-4 border-b border-[#4a4a4a]/10 pb-2 inline-block">
                Exposições
              </h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-[#4a4a4a]/80 leading-relaxed font-sans">
                    <span className="text-[#4a4a4a] font-medium">Março 2005</span> — "Encontro de olhares" - Fórum Cultural de Ermesinde
                  </p>
                  <p className="text-xs md:text-sm text-[#4a4a4a]/80 leading-relaxed font-sans">
                    <span className="text-[#4a4a4a] font-medium">Janeiro 2006</span> — "Encontro de olhares" - Paços do concelho - Pinheiro da Bemposta
                  </p>
                  <p className="text-xs md:text-sm text-[#4a4a4a]/80 leading-relaxed font-sans">
                    <span className="text-[#4a4a4a] font-medium">Fevereiro 2006</span> — "Encontro de Olhares" - Biblioteca Municipal da Covilhã
                  </p>
                  <p className="text-xs md:text-sm text-[#4a4a4a]/80 leading-relaxed font-sans">
                    <span className="text-[#4a4a4a] font-medium">Fevereiro 2006</span> — "Sensibilidades" - Integrada no projecto Photographyaproject2006
                  </p>
                  <p className="text-xs md:text-sm text-[#4a4a4a]/80 leading-relaxed font-sans">
                    <span className="text-[#4a4a4a] font-medium">Março 2006</span> — "Encontro de Olhares" - Cine-Teatro Caracas - Oliveira de Azeméis
                  </p>
                  <p className="text-xs md:text-sm text-[#4a4a4a]/80 leading-relaxed font-sans">
                    <span className="text-[#4a4a4a] font-medium">Maio 2006</span> — "Rostos da Raia" - integrada num trabalho realizado para a Adraces - Casa de Artes e Cultura do Tejo - Vila Velha de Rodão
                  </p>
                </div>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );

  if (settings?.separateFooterDiv) {
    return (
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Scrollable upper content container (2-divs mode) */}
        <div 
          className="flex-1 w-full overflow-y-auto px-6 pb-6 md:px-10 md:pb-10 flex flex-col items-center"
          style={{ paddingTop: settings?.mainTitleTopMargin !== undefined ? `${settings.mainTitleTopMargin}px` : '40px' }}
        >
          {content}
        </div>

        {/* Separate fixed bottom Footer div */}
        <div className="w-full flex-shrink-0 border-t border-[#4a4a4a]/10 bg-[#f7f5f0]/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-2.5 z-10">
          <Footer 
            activeView="biografia" 
            setActiveView={setActiveView} 
            settings={settings} 
            onOpenTerms={onOpenTerms} 
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full overflow-y-auto px-6 pb-6 md:px-10 md:pb-10 flex flex-col items-center justify-between"
      style={{ paddingTop: settings?.mainTitleTopMargin !== undefined ? `${settings.mainTitleTopMargin}px` : '40px' }}
    >
      {content}

      {/* Footer inside main scrollable div */}
      <div className="w-full max-w-5xl mt-10 pt-4 border-t border-[#4a4a4a]/10 flex-shrink-0">
        <Footer 
          activeView="biografia" 
          setActiveView={setActiveView} 
          settings={settings} 
          onOpenTerms={onOpenTerms} 
        />
      </div>
    </div>
  );
}
