import React from 'react';
import { motion } from 'motion/react';
import Footer from './Footer';

interface BiographyProps {
  settings: any;
  setActiveView: (view: any) => void;
  onOpenTerms: () => void;
}

export default function Biography({ settings, setActiveView, onOpenTerms }: BiographyProps) {
  return (
    <div className="w-full h-full overflow-y-auto p-6 md:p-10 flex flex-col items-center">
      {/* Header Section (Same as Gallery) */}
      <div className="text-center mb-10 w-full max-w-5xl mx-auto flex-shrink-0">
        <div className="border-y border-[#4a4a4a]/10 py-4 mb-4">
          <h1 className="font-sans text-lg md:text-xl text-[#4a4a4a] tracking-widest uppercase font-semibold">
            {settings?.siteName || 'Manuel Francisco Fotografia'}
          </h1>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-20">
        {/* Left Side: Image */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative pt-0"
        >
            <div className="aspect-square overflow-hidden bg-[#dcd7cf] shadow-sm">
            <img 
              src={settings?.profilePhoto || "/src/assets/images/photographer_portrait_1784841967018.jpg"} 
              alt="Manuel Francisco" 
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Right Side: Text Sections */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col pt-0"
        >
          <div className="space-y-12">
            {/* Bio Text */}
            <section className="space-y-6">
              <div className="text-left mb-6">
                <h2 className="font-sans font-medium text-xl md:text-2xl text-[#4a4a4a] tracking-wide mb-1">
                  Biografia
                </h2>
                <p className="font-sans text-xs md:text-sm text-[#7a7a7a]/50 tracking-[0.2em] uppercase font-light">
                  Sobre o Fotógrafo
                </p>
              </div>
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

      {/* Footer */}
      <div className="w-full max-w-5xl">
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
