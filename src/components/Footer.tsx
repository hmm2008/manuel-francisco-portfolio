import React, { useState, useEffect } from 'react';
import { Facebook, Mail } from 'lucide-react';

interface FooterProps {
  activeView: string;
  setActiveView: (view: any) => void;
  settings: any;
  onOpenTerms: () => void;
}

export default function Footer({ activeView, setActiveView, settings, onOpenTerms }: FooterProps) {
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

  const fbUrl = settings?.facebook || 'https://www.facebook.com/manuel.francisco.3701/';
  const emailUrl = settings?.contactEmail ? `mailto:${settings.contactEmail}` : 'mailto:manuel.francisco3@gmail.com';

  return (
    <footer className={`w-full flex-shrink-0 border-t border-[#4a4a4a]/5 flex flex-col items-center justify-center bg-transparent transition-all duration-200 ${
      isMobileLandscape ? 'pt-6 pb-4 mt-4' : 'pt-12 pb-10 mt-12'
    }`}>
      {/* Social Links */}
      <div className={`flex items-center justify-center gap-6 ${isMobileLandscape ? 'mb-3' : 'mb-6'}`}>
        <a 
          href={fbUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-[#7a7a7a]/60 hover:text-[#4a4a4a] transition-colors p-1"
          aria-label="Facebook"
        >
          <Facebook className="w-4 h-4" strokeWidth={1.5} />
        </a>
        <a 
          href={emailUrl} 
          className="text-[#7a7a7a]/60 hover:text-[#4a4a4a] transition-colors p-1"
          aria-label="E-mail"
        >
          <Mail className="w-4 h-4" strokeWidth={1.5} />
        </a>
      </div>

      {/* Navigation Links */}
      <div className={`flex flex-wrap justify-center items-center px-4 ${
        isMobileLandscape ? 'gap-x-4 gap-y-2 mb-3' : 'gap-x-8 gap-y-3 mb-6'
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
        {/* Always show TERMOS link in the footer */}
        <button
          onClick={onOpenTerms}
          className={`font-sans uppercase font-medium text-[#7a7a7a]/70 hover:text-[#4a4a4a] transition-colors duration-200 cursor-pointer ${
            isMobileLandscape ? 'text-[10px] tracking-[0.15em]' : 'text-[11px] tracking-[0.2em]'
          }`}
        >
          TERMOS
        </button>
      </div>

      {/* Copyright text */}
      <div className="text-center text-[9px] md:text-[10px] tracking-[0.1em] text-[#7a7a7a]/50 uppercase font-sans px-4">
        <p>
          {settings?.footerText || `© 2026 Manuel Francisco Fotografia — Todos os direitos reservados.`}
        </p>
      </div>
    </footer>
  );
}
