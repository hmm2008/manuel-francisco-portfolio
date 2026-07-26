import React from 'react';
import { motion } from 'motion/react';
import Footer from './Footer';
import { getFontFamily, getTextStyleProps } from '../utils/fontUtils';
// @ts-ignore
import fallbackPortrait from '../assets/images/photographer_portrait_1784841967018.jpg';

const DEFAULT_BIO = 'Nasceu a 26 de Fevereiro de 1962 em Coimbra. Enfermeiro de profissão. O gosto pela fotografia surgiu em 1982, quando frequentava o Curso de Enfermagem, tendo realizado um curso de iniciação à fotografia leccionado por um professor da escola. Em colaboração com outros colegas e a Associação de Estudantes, reabriram uma câmara escura existente nas instalações da referida Escola. Teve a sua primeira câmara reflex analógica, como presente, uma Minolta X-700, que o passa a acompanhar para todo o lado.';

const DEFAULT_PUBLISHED_WORKS = '1985 — Revista "Mais" no espaço as suas fotos\n1988 — Anuário Português de Fotografia\n2006 — Foto Plus\n2006 — Participação numa brochura para uma agência de turismo.';

const DEFAULT_EXHIBITIONS = 'Março 2005 — "Encontro de olhares" - Fórum Cultural de Ermesinde\nJaneiro 2006 — "Encontro de olhares" - Paços do concelho - Pinheiro da Bemposta\nFevereiro 2006 — "Encontro de Olhares" - Biblioteca Municipal da Covilhã\nFevereiro 2006 — "Sensibilidades" - Integrada no projecto Photographyaproject2006\nMarço 2006 — "Encontro de Olhares" - Cine-Teatro Caracas - Oliveira de Azeméis\nMaio 2006 — "Rostos da Raia" - integrada num trabalho realizado para a Adraces - Casa de Artes e Cultura do Tejo - Vila Velha de Rodão';

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
          <h2 
            className="font-medium text-xl md:text-2xl text-[#4a4a4a] mb-1"
            style={{
              fontFamily: getFontFamily(settings?.biographyTitleFont || settings?.biographyFont || settings?.globalFont),
              fontSize: settings?.biographyTitleFontSize
                ? (settings.biographyTitleFontSize.includes('px') || settings.biographyTitleFontSize.includes('rem') ? settings.biographyTitleFontSize : `${settings.biographyTitleFontSize}px`)
                : undefined,
              color: settings?.biographyTitleColor || '#4a4a4a',
              letterSpacing: settings?.biographyTitleLetterSpacing || '1px',
              ...getTextStyleProps(settings?.biographyTitleStyle)
            }}
          >
            {settings?.biographySectionTitle || 'Biografia'}
          </h2>
          <p 
            className="uppercase font-light"
            style={{
              fontFamily: getFontFamily(settings?.biographySubtitleFont || settings?.biographyFont || settings?.globalFont),
              fontSize: settings?.biographySubtitleFontSize
                ? (settings.biographySubtitleFontSize.includes('px') || settings.biographySubtitleFontSize.includes('rem') ? settings.biographySubtitleFontSize : `${settings.biographySubtitleFontSize}px`)
                : undefined,
              color: settings?.biographySubtitleColor || '#7a7a7a',
              letterSpacing: settings?.biographySubtitleLetterSpacing || '2px',
              ...getTextStyleProps(settings?.biographySubtitleStyle)
            }}
          >
            {settings?.biographySectionSubtitle || 'Sobre o Fotógrafo'}
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
              <div 
                className="leading-relaxed text-justify whitespace-pre-line"
                style={{
                  fontFamily: getFontFamily(settings?.biographyFont || settings?.globalFont),
                  fontSize: settings?.biographyFontSize 
                    ? (settings.biographyFontSize.includes('px') || settings.biographyFontSize.includes('rem') ? settings.biographyFontSize : `${settings.biographyFontSize}px`)
                    : '15px',
                  color: settings?.biographyColor || settings?.globalColor || '#4a4a4a',
                  letterSpacing: settings?.biographyLetterSpacing || '0px',
                  ...getTextStyleProps(settings?.biographyStyle)
                }}
              >
                {settings?.biography || DEFAULT_BIO}
              </div>
            </section>

            {/* Published Works */}
            <section>
              <h3 
                className="text-[11px] tracking-[0.2em] uppercase mb-4 border-b border-[#4a4a4a]/10 pb-2 inline-block font-semibold"
                style={{
                  fontFamily: getFontFamily(settings?.publishedWorksFont || settings?.biographyFont || settings?.globalFont),
                  color: settings?.publishedWorksColor || settings?.biographyColor || settings?.globalColor || '#7a7a7a',
                }}
              >
                {settings?.publishedWorksSectionTitle || 'Trabalhos Publicados'}
              </h3>
              <div 
                className="leading-relaxed whitespace-pre-line"
                style={{
                  fontFamily: getFontFamily(settings?.publishedWorksFont || settings?.biographyFont || settings?.globalFont),
                  fontSize: settings?.publishedWorksFontSize
                    ? (settings.publishedWorksFontSize.includes('px') || settings.publishedWorksFontSize.includes('rem') ? settings.publishedWorksFontSize : `${settings.publishedWorksFontSize}px`)
                    : '13px',
                  color: settings?.publishedWorksColor || settings?.biographyColor || settings?.globalColor || '#4a4a4a',
                  letterSpacing: settings?.publishedWorksLetterSpacing || '0px',
                  ...getTextStyleProps(settings?.publishedWorksStyle)
                }}
              >
                {settings?.publishedWorks ?? DEFAULT_PUBLISHED_WORKS}
              </div>
            </section>

            {/* Exhibitions */}
            <section>
              <h3 
                className="text-[11px] tracking-[0.2em] uppercase mb-4 border-b border-[#4a4a4a]/10 pb-2 inline-block font-semibold"
                style={{
                  fontFamily: getFontFamily(settings?.exhibitionsFont || settings?.biographyFont || settings?.globalFont),
                  color: settings?.exhibitionsColor || settings?.biographyColor || settings?.globalColor || '#7a7a7a',
                }}
              >
                {settings?.exhibitionsSectionTitle || 'Exposições'}
              </h3>
              <div 
                className="leading-relaxed whitespace-pre-line"
                style={{
                  fontFamily: getFontFamily(settings?.exhibitionsFont || settings?.biographyFont || settings?.globalFont),
                  fontSize: settings?.exhibitionsFontSize
                    ? (settings.exhibitionsFontSize.includes('px') || settings.exhibitionsFontSize.includes('rem') ? settings.exhibitionsFontSize : `${settings.exhibitionsFontSize}px`)
                    : '13px',
                  color: settings?.exhibitionsColor || settings?.biographyColor || settings?.globalColor || '#4a4a4a',
                  letterSpacing: settings?.exhibitionsLetterSpacing || '0px',
                  ...getTextStyleProps(settings?.exhibitionsStyle)
                }}
              >
                {settings?.exhibitions ?? DEFAULT_EXHIBITIONS}
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
