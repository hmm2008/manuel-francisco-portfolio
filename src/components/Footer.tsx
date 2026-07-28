import React, { useState, useEffect } from 'react';

interface FooterProps {
  activeView: string;
  setActiveView: (view: any) => void;
  settings: any;
  onOpenTerms: () => void;
}

function Footer({ activeView, setActiveView, settings, onOpenTerms }: FooterProps) {
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window !== 'undefined') {
        const isL = window.innerWidth > window.innerHeight && window.innerHeight < 600;
        setIsMobileLandscape(isL);
      }
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const footerItems = [
    { id: 'inicio', label: 'INÍCIO' },
    { id: 'galeria', label: 'GALERIA' },
    { id: 'biografia', label: 'BIOGRAFIA' },
    { id: 'livro', label: 'LIVRO DE VISITAS' },
    { id: 'contacto', label: 'CONTACTO' },
    { id: 'links', label: 'LINKS' },
  ];

  // Filter out the current active view from the footer links
  const filteredItems = footerItems.filter(item => item.id !== activeView);

  const bottomSpacing = settings?.footerBottomSpacing !== undefined ? settings.footerBottomSpacing : 24;

  return (
    <footer 
      className={`w-full flex-shrink-0 flex flex-col items-center justify-center bg-transparent transition-all duration-200 ${
        isMobileLandscape ? 'pt-2' : 'pt-3'
      }`}
      style={{ paddingBottom: `${bottomSpacing}px` }}
    >
      {/* Navigation Links */}
      <div className={`flex flex-wrap justify-center items-center px-4 ${
        isMobileLandscape ? 'gap-x-4 gap-y-2' : 'gap-x-8 gap-y-3'
      }`}>
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`font-sans uppercase font-medium text-[#7a7a7a]/70 hover:text-[#4a4a4a] transition-colors duration-200 cursor-pointer ${
              isMobileLandscape ? 'text-[10px] tracking-[0.15em]' : 'text-[11px] tracking-[0.2em]'
            }`}
          >
            {item.label}
          </button>
        ))}
        {/* Always show TERMOS & INSTALAR APP link in the footer */}
        <button
          onClick={onOpenTerms}
          className={`font-sans uppercase font-medium text-[#7a7a7a]/70 hover:text-[#4a4a4a] transition-colors duration-200 cursor-pointer ${
            isMobileLandscape ? 'text-[10px] tracking-[0.15em]' : 'text-[11px] tracking-[0.2em]'
          }`}
        >
          TERMOS
        </button>
      </div>
    </footer>
  );
}

export default React.memo(Footer);

