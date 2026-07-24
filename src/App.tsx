/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Cookie, ShieldCheck, Home, Image as ImageIcon, User, BookOpen, Mail, Link as LinkIcon, Settings, ArrowRight, ZoomIn, ZoomOut, Maximize, Menu } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import AdminPanel from './AdminPanel';
import Biography from './components/Biography';
import AdminPasswordPrompt from './components/AdminPasswordPrompt';
import GalleryGrid from './components/GalleryGrid';
import Guestbook from './components/Guestbook';
import Footer from './components/Footer';
import Contact from './components/Contact';
import Links from './components/Links';

const fallbackImages = [
  { id: 1, url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1920&q=80', alt: 'Montanhas ao entardecer', title: 'Espelho', subtitle: 'Alcochete' },
  { id: 2, url: 'https://images.unsplash.com/photo-1506744626753-143d4eb38b97?auto=format&fit=crop&w=1920&q=80', alt: 'Rio sereno na floresta', title: 'Serenidade', subtitle: 'Floresta' },
  { id: 3, url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1920&q=80', alt: 'Vista urbana noturna', title: 'Luzes da Cidade', subtitle: 'Metrópole' },
  { id: 4, url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=80', alt: 'Estrada solitária nas montanhas', title: 'Caminho', subtitle: 'Montanhas' },
  { id: 5, url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1920&q=80', alt: 'Ponte suspensa na névoa', title: 'Mistério', subtitle: 'Névoa' },
  { id: 6, url: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1920&q=80', alt: 'Céu estrelado no deserto', title: 'Infinidade', subtitle: 'Deserto' },
  { id: 7, url: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1920&q=80', alt: 'Lago alpino', title: 'Reflexo', subtitle: 'Alpes' },
  { id: 8, url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80', alt: 'Cores de outono', title: 'Outono', subtitle: 'Folhas' },
  { id: 9, url: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?auto=format&fit=crop&w=1920&q=80', alt: 'Montanhas sob neblina', title: 'Picos', subtitle: 'Neblina' },
  { id: 10, url: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?auto=format&fit=crop&w=1920&q=80', alt: 'Luz matinal', title: 'Alvorada', subtitle: 'Luz' },
  { id: 11, url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=1920&q=80', alt: 'Paisagem costeira', title: 'Horizonte', subtitle: 'Costa' },
  { id: 12, url: 'https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?auto=format&fit=crop&w=1920&q=80', alt: 'Nascer do sol', title: 'Despertar', subtitle: 'Manhã' }
];

type View = 'inicio' | 'galeria' | 'biografia' | 'livro' | 'contacto' | 'links' | 'admin';

const navItems = [
  { id: 'inicio', label: 'INÍCIO', icon: Home },
  { id: 'galeria', label: 'GALERIA', icon: ImageIcon },
  { id: 'biografia', label: 'BIOGRAFIA', icon: User },
  { id: 'livro', label: 'LIVRO DE VISITAS', icon: BookOpen },
  { id: 'contacto', label: 'CONTACTO', icon: Mail },
  { id: 'links', label: 'LINKS', icon: LinkIcon },
  { id: 'admin', label: 'ADMIN', icon: Settings }
];

const menuOverlayVariants = {
  closed: {
    opacity: 0,
    y: '-100%',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.05,
      staggerDirection: -1,
    }
  },
  open: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.08,
      delayChildren: 0.1,
    }
  }
};

const menuItemVariants = {
  closed: { opacity: 0, y: 15, transition: { duration: 0.2 } },
  open: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }
};

export default function App() {
  const [activeView, setActiveView] = useState<View>('inicio');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isMobileLandscape, setIsMobileLandscape] = useState<boolean>(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isL = window.innerWidth > window.innerHeight && window.innerHeight < 600;
      setIsMobileLandscape(isL);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('admin_unlocked') === 'true';
  });
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [zoomLevel, setZoomLevel] = useState(75);
  const [siteSettings, setSiteSettings] = useState<any>({
    siteName: 'MANUEL FRANCISCO FOTOGRAFIA',
    siteSubtitle: 'FOTOGRAFIA',
    welcomeMessage: 'Bem vindo a este espaço. Quero que descubra comigo o gosto pela fotografia.',
    contactEmail: 'manuel.francisco3@gmail.com',
  });

  const predefinedCategories = ['Paisagem', 'Retrato', 'Rua', 'Arquitetura', 'Natureza', 'Abstrato', 'Documentário', 'Animais'];
  const allCategories = React.useMemo(() => {
    const fromImages = galleryImages.map(img => img.category).filter(Boolean);
    const baseCats = (siteSettings && siteSettings.categories && Array.isArray(siteSettings.categories))
      ? siteSettings.categories
      : predefinedCategories;
    const unique = Array.from(new Set([...baseCats, ...fromImages]));
    return unique.filter(Boolean);
  }, [galleryImages, siteSettings]);

  const filteredGallery = React.useMemo(() => {
    if (activeView !== 'galeria' && activeView !== 'inicio') return galleryImages;
    if (selectedCategory === 'TODAS') return galleryImages;
    return galleryImages.filter(img => img.category === selectedCategory);
  }, [galleryImages, selectedCategory, activeView]);

  
  useEffect(() => {
    const q = query(collection(db, 'images'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedImages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        alt: doc.data().title || 'Fotografia',
      }));
      setGalleryImages(fetchedImages);
      setIsInitialLoading(false);
    }, (error) => {
      console.error("Error fetching images:", error);
      setIsInitialLoading(false);
    });

    const settingsUnsubscribe = onSnapshot(doc(db, 'settings', 'site'), (docSnap) => {
      if (docSnap.exists()) {
        setSiteSettings(prev => ({ ...prev, ...docSnap.data() }));
      }
    }, (error) => {
      console.error("Error listening to settings:", error);
    });

    return () => {
      unsubscribe();
      settingsUnsubscribe();
    };
  }, []);
  
  const [cookiesAccepted, setCookiesAccepted] = useState<boolean>(() => {
    return localStorage.getItem('cookiesAccepted') === 'true';
  });

  const acceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setCookiesAccepted(true);
  };

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setZoomLevel(75);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
    setZoomLevel(75);
  };

  const nextImage = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % filteredGallery.length);
    }
  }, [selectedImageIndex, filteredGallery.length]);

  const prevImage = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + filteredGallery.length) % filteredGallery.length);
    }
  }, [selectedImageIndex, filteredGallery.length]);

  const toggleFullScreen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleZoom = (e: React.MouseEvent, type: 'in' | 'out') => {
    e.stopPropagation();
    setZoomLevel(prev => {
      if (type === 'in') return Math.min(prev + 25, 300);
      return Math.max(prev - 25, 50);
    });
  };

  // Handle keyboard events for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, nextImage, prevImage]);

  // Lock body scroll when modal, lightbox or mobile menu is open
  useEffect(() => {
    if (!cookiesAccepted || selectedImageIndex !== null || isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [cookiesAccepted, selectedImageIndex, isMobileMenuOpen]);

  // Slideshow rotation
  useEffect(() => {
    if (activeView !== 'inicio' || !cookiesAccepted) return;
    
    const interval = (siteSettings?.slideshowInterval || 6) * 1000;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % galleryImages.length);
    }, interval);
    
    return () => clearInterval(timer);
  }, [activeView, cookiesAccepted, galleryImages.length, siteSettings?.slideshowInterval]);

  const globalStyle = {
    color: siteSettings?.globalColor || '#4a4a4a',
  };

  const menuStyle = {
    color: siteSettings?.menuColor || '#7a7a7a',
  };

  const navItemClass = (isActive: boolean) => `relative flex items-center gap-4 px-10 py-4 border-b border-[#4a4a4a]/5 text-[13px] tracking-widest uppercase transition-colors font-sans ${
    isActive ? 'bg-[#4a4a4a]/5 text-[#4a4a4a]' : 'hover:bg-[#4a4a4a]/[0.02] hover:text-[#4a4a4a]'
  }`;

  return (
    <div 
      style={globalStyle}
      className={`h-screen w-full bg-[#fafafa] antialiased selection:bg-[#4a4a4a] selection:text-white flex flex-col overflow-hidden ${isMobileLandscape ? 'flex-col' : 'md:flex-row'}`}
    >
      
      {/* Cookie Consent Modal */}
      <AnimatePresence>
        {!cookiesAccepted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/60"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-[#f5f2ed] max-w-[500px] w-full p-8 md:p-12 shadow-2xl relative"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-2 border border-[#1a1a1a]/10 rounded-full flex items-center justify-center">
                  <Cookie className="w-5 h-5 text-[#1a1a1a]" strokeWidth={1} />
                </div>
                <h2 className="font-sans text-2xl text-[#1a1a1a]">Privacidade & Cookies</h2>
              </div>
              
              <div className="space-y-4 text-sm text-[#1a1a1a]/70 font-sans leading-relaxed mb-10">
                <p>
                  Este site utiliza <strong className="text-[#1a1a1a] font-medium">cookies essenciais</strong> para garantir o correto funcionamento e melhorar a sua experiência de navegação.
                </p>
                <p>
                  Ao clicar em <strong className="text-[#1a1a1a] font-medium">Aceito</strong>, consente a utilização de cookies de acordo com a nossa <a href="#" className="underline underline-offset-4 hover:text-[#5a5a40] transition-colors">Política de Privacidade</a>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button 
                  className="flex-1 py-4 px-4 border border-[#1a1a1a]/10 text-[#8e8a82] hover:text-[#1a1a1a] hover:border-[#1a1a1a]/30 uppercase tracking-[0.2em] text-[10px] font-semibold transition-all"
                >
                  Não Aceito
                </button>
                <button 
                  onClick={acceptCookies}
                  className="flex-1 py-4 px-4 bg-[#1a1a1a] text-white hover:bg-[#5a5a40] uppercase tracking-[0.2em] text-[10px] font-semibold transition-all flex items-center justify-center gap-3"
                >
                  <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
                  Aceito
                </button>
              </div>

              <p className="text-center text-[#8e8a82]/60 text-[9px] tracking-[0.1em] uppercase font-mono">
                Sem aceitar cookies não é possível aceder ao site
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Header/Nav */}
      <div className={`flex-shrink-0 z-40 bg-[#fafafa] border-b border-[#4a4a4a]/10 px-6 py-4 flex items-center justify-between ${isMobileLandscape ? 'flex' : 'md:hidden'}`}>
        <div style={{ 
          color: siteSettings?.siteNameColor || '#4a4a4a',
          fontSize: `${Math.max(12, (siteSettings?.siteNameFontSize || 16) * 0.8)}px`
        }}>
          <h1 className="tracking-widest uppercase font-sans font-semibold">{siteSettings.siteName?.replace('\n', ' ')}</h1>
          <p className="text-[#7a7a7a] tracking-widest text-[12px] font-sans uppercase mt-1">{siteSettings.siteSubtitle}</p>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 border border-[#4a4a4a]/10 hover:border-[#4a4a4a]/30 transition-all rounded-sm text-[#4a4a4a]"
          aria-label="Abrir menu"
        >
          <span className="text-[11px] tracking-[0.15em] font-sans font-semibold uppercase">MENU</span>
          <Menu className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Mobile Menu Fullscreen Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuOverlayVariants}
            className="fixed inset-0 z-50 bg-[#fafafa] flex flex-col justify-between overflow-y-auto"
          >
            {isMobileLandscape ? (
              // Landscape Mobile Layout: Columns instead of vertical stack to prevent overlapping
              <>
                {/* Overlay Header (Landscape) */}
                <div className="flex-shrink-0 bg-[#fafafa] border-b border-[#4a4a4a]/5 px-6 py-2.5 flex items-center justify-between">
                  <div style={{ 
                    color: siteSettings?.siteNameColor || '#4a4a4a',
                    fontSize: `${Math.max(10, (siteSettings?.siteNameFontSize || 16) * 0.6)}px`
                  }}>
                    <h1 className="tracking-widest uppercase font-sans font-semibold text-xs">{siteSettings.siteName?.replace('\n', ' ')}</h1>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1 border border-[#4a4a4a]/10 hover:border-[#4a4a4a]/30 transition-all rounded-sm text-[#4a4a4a]"
                    aria-label="Fechar menu"
                  >
                    <span className="text-[9px] tracking-[0.15em] font-sans font-semibold uppercase">FECHAR</span>
                    <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Landscape Content Grid */}
                <div className="flex-1 flex flex-row items-center justify-center gap-8 px-8 py-4 max-w-4xl mx-auto w-full">
                  {/* Left Column (Brand info & Welcome Msg) */}
                  <div className="flex flex-col justify-center text-left max-w-xs space-y-2 pr-6 border-r border-[#4a4a4a]/10 h-full py-2">
                    <div>
                      <h2 className="tracking-widest uppercase font-sans font-semibold text-[10px] text-[#1a1a1a]">{siteSettings.siteName?.replace('\n', ' ')}</h2>
                      <p className="text-[#7a7a7a] tracking-widest text-[8px] font-sans uppercase mt-0.5">{siteSettings.siteSubtitle}</p>
                    </div>
                    {siteSettings.welcomeMessage && (
                      <p className="text-[9px] font-sans italic text-[#7a7a7a] leading-relaxed max-h-[85px] overflow-y-auto pr-1">
                        "{siteSettings.welcomeMessage}"
                      </p>
                    )}
                  </div>

                  {/* Right Column (2-Column Grid of Navigation links) */}
                  <nav className="flex-1 grid grid-cols-2 gap-x-6 gap-y-1.5 my-auto">
                    {navItems.map((item) => {
                      const isActive = activeView === item.id;
                      const Icon = item.icon;
                      return (
                        <motion.button
                          key={item.id}
                          variants={menuItemVariants}
                          onClick={() => {
                            setActiveView(item.id as View);
                            setIsMobileMenuOpen(false);
                          }}
                          style={menuStyle}
                          className="relative flex items-center gap-3 py-1.5 border-b border-[#4a4a4a]/5 text-[11px] tracking-[0.15em] uppercase font-sans text-left transition-colors"
                        >
                          {isActive && (
                            <motion.div 
                              layoutId="activeMobileDotLandscape"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#4a4a4a]"
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                          <div className={`flex items-center gap-3 transition-transform duration-300 ${isActive ? 'translate-x-3 text-[#1a1a1a] font-semibold' : 'hover:translate-x-1.5 text-[#7a7a7a] hover:text-[#4a4a4a]'}`}>
                            <Icon className="w-3.5 h-3.5 stroke-[1.25]" />
                            <span>{item.label}</span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </nav>
                </div>

                {/* Compact Landscape Footer */}
                <div className="px-6 py-2.5 text-center text-[#7a7a7a]/60 text-[8px] tracking-[0.05em] font-sans border-t border-[#4a4a4a]/5 flex items-center justify-between w-full">
                  <p>{siteSettings.footerText || `© ${new Date().getFullYear()} — Todos os direitos reservados.`}</p>
                  <p className="opacity-80 truncate hidden sm:block">Não reproduzir sem autorização prévia.</p>
                </div>
              </>
            ) : (
              // Portrait Mobile Layout: Vertical stack of links
              <>
                {/* Overlay Header */}
                <div className="flex-shrink-0 bg-[#fafafa] border-b border-[#4a4a4a]/5 px-6 py-4 flex items-center justify-between">
                  <div style={{ 
                    color: siteSettings?.siteNameColor || '#4a4a4a',
                    fontSize: `${Math.max(12, (siteSettings?.siteNameFontSize || 16) * 0.8)}px`
                  }}>
                    <h1 className="tracking-widest uppercase font-sans font-semibold">{siteSettings.siteName?.replace('\n', ' ')}</h1>
                    <p className="text-[#7a7a7a] tracking-widest text-[12px] font-sans uppercase mt-1">{siteSettings.siteSubtitle}</p>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 border border-[#4a4a4a]/10 hover:border-[#4a4a4a]/30 transition-all rounded-sm text-[#4a4a4a]"
                    aria-label="Fechar menu"
                  >
                    <span className="text-[11px] tracking-[0.15em] font-sans font-semibold uppercase">FECHAR</span>
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Overlay Navigation Links & Info */}
                <div className="flex-1 flex flex-col justify-center px-8 py-10 max-w-md mx-auto w-full">
                  <nav className="flex flex-col space-y-5">
                    {navItems.map((item) => {
                      const isActive = activeView === item.id;
                      const Icon = item.icon;
                      return (
                        <motion.button
                          key={item.id}
                          variants={menuItemVariants}
                          onClick={() => {
                            setActiveView(item.id as View);
                            setIsMobileMenuOpen(false);
                          }}
                          style={menuStyle}
                          className="relative flex items-center gap-4 py-3 border-b border-[#4a4a4a]/5 text-[14px] tracking-[0.2em] uppercase font-sans text-left transition-colors"
                        >
                          {isActive && (
                            <motion.div 
                              layoutId="activeMobileDot"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#4a4a4a]"
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                          <div className={`flex items-center gap-4 transition-transform duration-300 ${isActive ? 'translate-x-4 text-[#1a1a1a] font-semibold' : 'hover:translate-x-2 text-[#7a7a7a] hover:text-[#4a4a4a]'}`}>
                            <Icon className="w-4 h-4 stroke-[1.25]" />
                            <span>{item.label}</span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </nav>

                  {/* Site Welcome Message */}
                  {siteSettings.welcomeMessage && (
                    <motion.div 
                      variants={menuItemVariants}
                      className="mt-10 pt-6 border-t border-[#4a4a4a]/10 text-center"
                    >
                      <p 
                        className="text-xs font-sans italic text-[#7a7a7a] leading-relaxed max-w-xs mx-auto"
                        style={{ 
                          fontSize: `${Math.max(10, (siteSettings?.messageFontSize || 13) - 1)}px`,
                        }}
                      >
                        "{siteSettings.welcomeMessage}"
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Overlay Footer */}
                <div className="px-6 pb-8 pt-4 text-center text-[#7a7a7a]/60 text-[9px] tracking-[0.05em] font-sans border-t border-[#4a4a4a]/5">
                  <p className="mb-1">{siteSettings.footerText || `© ${new Date().getFullYear()} — Todos os direitos reservados.`}</p>
                  <p className="text-[8px] opacity-80 leading-relaxed max-w-xs mx-auto">O conteúdo e as imagens não podem ser reproduzidos de qualquer forma sem o consentimento do autor.</p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className={`w-[340px] flex-shrink-0 h-full bg-[#fafafa] border-r border-[#4a4a4a]/10 flex-col justify-between overflow-y-auto z-30 ${isMobileLandscape ? 'hidden' : 'hidden md:flex'}`}>
        <div>
          <div className="pt-12 pb-8 px-10 text-center" style={{ 
            color: siteSettings?.siteNameColor || '#4a4a4a',
            fontSize: `${siteSettings?.siteNameFontSize || 16}px`
          }}>
            <h1 className="tracking-widest leading-tight uppercase whitespace-pre-line font-sans font-semibold">{siteSettings.siteName}</h1>
            <p className="text-[#7a7a7a] tracking-widest text-[12px] font-sans mt-2 uppercase">{siteSettings.siteSubtitle}</p>
          </div>
          <div 
            className="px-10 text-xs md:text-sm font-sans leading-relaxed mb-8 whitespace-pre-line"
            style={{ 
              marginTop: `${siteSettings?.messageSpacing || 0}px`,
              fontSize: `${siteSettings?.messageFontSize || 13}px`,
              color: siteSettings?.messageColor || '#4a4a4a',
              textAlign: siteSettings?.messageAlignment || 'left'
            }}
          >
            <p>{siteSettings.welcomeMessage}</p>
          </div>
          <nav className="flex flex-col border-t border-[#1a1a1a]/5">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as View)}
                  style={menuStyle}
                  className={navItemClass(isActive)}
                >
                  {isActive && (
                    <div className="absolute left-8 top-0 bottom-0 w-[1.5px] bg-[#4a4a4a]" />
                  )}
                  <Icon className="w-4 h-4" strokeWidth={1} />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>
        <div className="px-10 pb-8 pt-8 text-center text-[#7a7a7a]/60 text-[10px] tracking-[0.05em] font-sans">
          <p className="mb-1">{siteSettings.footerText || `© ${new Date().getFullYear()} — Todos os direitos reservados.`}</p>
          <p>O conteúdo e as imagens não podem ser reproduzidos de qualquer forma sem o consentimento do autor.</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full relative overflow-hidden bg-[#f0f0f0]">
        {activeView === 'inicio' ? (
          <div className="relative w-full h-full bg-[#1a1a1a]">
            {galleryImages.length > 0 ? (
              <>
                <AnimatePresence mode="popLayout">
                  <motion.img
                    key={slideIndex}
                    src={galleryImages[slideIndex]?.url}
                    alt={galleryImages[slideIndex]?.alt}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: siteSettings?.reduceAnimations ? 0.3 : 1.5, ease: "easeInOut" }}
                    className={`absolute inset-0 w-full h-full ${siteSettings?.slideshowFit === 'Preencher' ? 'object-cover' : 'object-contain'}`}
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />
                
                <div className="absolute bottom-8 md:bottom-16 left-6 md:left-16 z-20 text-white">
                  <motion.h2 
                    key={`title-${slideIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="font-sans font-medium text-4xl md:text-6xl mb-2 tracking-wide font-light"
                  >
                    {galleryImages[slideIndex]?.title}
                  </motion.h2>
                  <motion.p 
                    key={`subtitle-${slideIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="font-sans text-[12px] tracking-widest uppercase mb-6 md:mb-8 opacity-80"
                  >
                    {galleryImages[slideIndex]?.subtitle}
                  </motion.p>
                  <button 
                    onClick={() => setActiveView('galeria')}
                    className="flex items-center gap-3 py-2 text-[12px] md:text-xs font-sans tracking-[0.2em] uppercase hover:text-white/70 transition-colors border-b border-white/30 hover:border-white pb-1 w-fit font-semibold"
                  >
                    <span>VER GALERIA</span>
                    <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
                  </button>
                </div>
                
                {/* Slideshow Indicators */}
                {galleryImages.length > 1 && (
                  <div className="absolute bottom-8 md:bottom-16 right-6 md:right-16 z-20 flex gap-2">
                    {galleryImages.map((_, i) => (
                      <button 
                        key={i} 
                        onClick={() => setSlideIndex(i)}
                        className={`h-[2px] transition-all duration-500 ${i === slideIndex ? 'w-8 bg-white' : 'w-4 bg-white/30 hover:bg-white/60'}`} 
                        aria-label={`Ir para a foto ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-[#1a1a1a]">
                <div className="max-w-md space-y-4">
                  <h2 className="font-serif text-2xl md:text-3xl text-white/95 font-light tracking-wide">
                    Espaço de Fotografia
                  </h2>
                  <div className="w-12 h-px bg-white/20 mx-auto"></div>
                  <p className="text-white/50 text-[10px] md:text-[11px] font-sans tracking-widest uppercase leading-relaxed">
                    Nenhuma fotografia disponível de momento.
                  </p>
                  {isAdminUnlocked ? (
                    <button 
                      onClick={() => setActiveView('admin')}
                      className="mt-6 px-6 py-3 bg-white text-[#1a1a1a] text-[10px] font-sans tracking-widest uppercase hover:bg-white/90 transition-all font-semibold"
                    >
                      Adicionar Fotografias
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        ) : activeView === 'galeria' ? (
          <div className={`w-full h-full p-6 md:p-10 flex flex-col justify-between ${isMobileLandscape ? 'overflow-y-auto' : 'md:overflow-hidden overflow-y-auto'}`}>
            <div className={`flex flex-col w-full flex-shrink-0 ${isMobileLandscape ? '' : 'md:flex-1 md:min-h-0'}`}>
              <div className={`text-center w-full max-w-5xl mx-auto flex-shrink-0 ${isMobileLandscape ? 'mb-3' : 'mb-6'}`}>
                {!isMobileLandscape && (
                  <div className="border-y border-[#4a4a4a]/10 py-4 mb-4">
                    <h1 className="font-sans text-lg md:text-xl text-[#4a4a4a] tracking-widest uppercase font-semibold">
                      Manuel Francisco Fotografia
                    </h1>
                  </div>
                )}
                <h2 className={`font-sans font-medium text-[#4a4a4a] tracking-wide mb-1 ${isMobileLandscape ? 'text-lg' : 'text-xl md:text-2xl'}`}>Galeria</h2>
                <p className="text-[#7a7a7a] tracking-widest text-[10px] sm:text-[12px] uppercase font-sans">{filteredGallery.length} FOTOGRAFIAS</p>
              </div>
              
              {galleryImages.length > 0 ? (
                <>
                  <div className={`flex flex-wrap items-center justify-center gap-1.5 flex-shrink-0 ${isMobileLandscape ? 'mb-3' : 'mb-6'}`}>
                    <button 
                      onClick={() => setSelectedCategory('TODAS')}
                      className={`px-3 py-1.5 border transition-colors text-[9px] tracking-[0.1em] uppercase ${selectedCategory === 'TODAS' ? 'bg-[#4a4a4a] text-white border-[#4a4a4a]' : 'border-[#4a4a4a]/10 text-[#7a7a7a] hover:text-[#4a4a4a] hover:border-[#4a4a4a]/30'}`}
                    >
                      TODAS
                    </button>
                    {allCategories.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 border transition-colors text-[9px] tracking-[0.1em] uppercase ${selectedCategory === cat ? 'bg-[#4a4a4a] text-white border-[#4a4a4a]' : 'border-[#4a4a4a]/10 text-[#7a7a7a] hover:text-[#4a4a4a] hover:border-[#4a4a4a]/30'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <GalleryGrid images={filteredGallery} onImageClick={openLightbox} />
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                  <p className="text-[#7a7a7a] text-[10px] md:text-xs font-sans tracking-[0.2em] uppercase mb-4">A galeria está vazia de momento.</p>
                  {isAdminUnlocked && (
                    <button 
                      onClick={() => setActiveView('admin')}
                      className="px-6 py-3 border border-[#4a4a4a]/20 hover:border-[#4a4a4a]/50 text-[#4a4a4a] text-[10px] font-sans tracking-widest uppercase transition-colors font-semibold"
                    >
                      Adicionar Fotografias
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0 mt-auto pt-4 md:pt-0 w-full max-w-5xl mx-auto">
              <Footer 
                activeView={activeView} 
                setActiveView={setActiveView} 
                settings={siteSettings} 
                onOpenTerms={() => setShowTermsModal(true)} 
              />
            </div>
          </div>
        ) : activeView === 'biografia' ? (
          <Biography 
            settings={siteSettings} 
            setActiveView={setActiveView} 
            onOpenTerms={() => setShowTermsModal(true)} 
          />
        ) : activeView === 'livro' ? (
          <Guestbook 
            settings={siteSettings} 
            isAdminUnlocked={isAdminUnlocked} 
            setActiveView={setActiveView} 
            onOpenTerms={() => setShowTermsModal(true)} 
          />
        ) : activeView === 'contacto' ? (
          <Contact 
            settings={siteSettings} 
            setActiveView={setActiveView} 
            onOpenTerms={() => setShowTermsModal(true)} 
          />
        ) : activeView === 'links' ? (
          <Links 
            settings={siteSettings} 
            isAdminUnlocked={isAdminUnlocked}
            setActiveView={setActiveView} 
            onOpenTerms={() => setShowTermsModal(true)} 
          />
        ) : activeView === 'admin' ? (
          isAdminUnlocked ? (
            <AdminPanel 
              images={galleryImages} 
              setImages={setGalleryImages} 
              onLogout={() => {
                setIsAdminUnlocked(false);
                sessionStorage.removeItem('admin_unlocked');
                setActiveView('inicio');
              }}
            />
          ) : (
            <AdminPasswordPrompt 
              correctPassword={siteSettings?.adminPassword || 'manuel2026'} 
              onUnlock={() => {
                setIsAdminUnlocked(true);
                sessionStorage.setItem('admin_unlocked', 'true');
              }} 
              onCancel={() => setActiveView('inicio')}
            />
          )
        ) : (
          <div className="w-full h-full overflow-y-auto p-6 md:p-10 flex flex-col justify-between items-center">
            <div className="my-auto max-w-md space-y-4 text-center py-12">
              <h2 className="font-sans font-semibold text-3xl text-[#4a4a4a]">Em Construção</h2>
              <div className="w-12 h-px bg-[#4a4a4a] mx-auto opacity-50"></div>
              <p className="text-[#7a7a7a] text-sm tracking-widest uppercase leading-relaxed font-sans">
                A secção "{navItems.find(i => i.id === activeView)?.label}" será disponibilizada brevemente.
              </p>
            </div>
            <Footer 
              activeView={activeView} 
              setActiveView={setActiveView} 
              settings={siteSettings} 
              onOpenTerms={() => setShowTermsModal(true)} 
            />
          </div>
        )}
      </main>

      {/* Lightbox for Gallery View */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[150] bg-[#767676] flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Top Right Controls */}
            <div className="absolute top-6 right-6 z-[160] flex items-center gap-6">
              <div className="flex items-center gap-4 text-white">
                <button onClick={(e) => handleZoom(e, 'out')} className="hover:text-white/70 transition-colors">
                  <ZoomOut size={18} strokeWidth={1.5} />
                </button>
                <span className="text-[10px] tracking-[0.2em] font-sans w-8 text-center">{zoomLevel}%</span>
                <button onClick={(e) => handleZoom(e, 'in')} className="hover:text-white/70 transition-colors">
                  <ZoomIn size={18} strokeWidth={1.5} />
                </button>
              </div>
              <button onClick={toggleFullScreen} className="text-white hover:text-white/70 transition-colors">
                <Maximize size={18} strokeWidth={1.5} />
              </button>
              <button onClick={closeLightbox} className="text-white hover:text-white/70 transition-colors ml-2">
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* Navigation Arrows */}
            <button 
              onClick={prevImage}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white transition-colors z-[160]"
            >
              <ChevronLeft size={36} strokeWidth={1} />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white transition-colors z-[160]"
            >
              <ChevronRight size={36} strokeWidth={1} />
            </button>

            {/* Image */}
            <div className="overflow-hidden max-h-screen max-w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <motion.img
                key={selectedImageIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: zoomLevel / 100 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                src={filteredGallery[selectedImageIndex]?.url}
                alt={filteredGallery[selectedImageIndex]?.alt}
                className="max-h-screen max-w-full object-contain z-[150]"
              />
            </div>
            
            {/* Bottom Left Title/Subtitle */}
            <div className="absolute bottom-8 left-8 z-[160] text-left">
              <h3 className="text-white font-sans font-medium text-lg tracking-widest mb-1">{filteredGallery[selectedImageIndex]?.title}</h3>
              <p className="text-white/80 font-sans text-[12px] tracking-widest uppercase">{filteredGallery[selectedImageIndex]?.subtitle}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms & Privacy Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTermsModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-2xl bg-[#fafafa] shadow-xl border border-[#4a4a4a]/10 p-8 z-[210] flex flex-col max-h-[85vh] overflow-hidden"
            >
              <button
                onClick={() => setShowTermsModal(false)}
                className="absolute top-6 right-6 text-[#4a4a4a]/60 hover:text-[#4a4a4a] transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>

              <h3 className="font-sans font-medium text-xl md:text-2xl text-[#4a4a4a] tracking-wide mb-6">
                Termos & Privacidade
              </h3>

              <div className="flex-grow overflow-y-auto pr-2 space-y-6 text-sm text-[#4a4a4a]/80 font-sans leading-relaxed text-left">
                <div>
                  <h4 className="font-semibold text-[#4a4a4a] uppercase tracking-wider text-xs mb-2">1. Propriedade Intelectual</h4>
                  <p>
                    Todas as fotografias, imagens, textos e conteúdos apresentados neste website são propriedade exclusiva de Manuel Francisco Fotografia. É estritamente proibida qualquer reprodução, cópia, distribuição, modificação ou utilização pública sem o prévio consentimento por escrito do autor.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-[#4a4a4a] uppercase tracking-wider text-xs mb-2">2. Política de Privacidade</h4>
                  <p>
                    Respeitamos a sua privacidade. Este website é um portfólio de fotografia e não recolhe dados pessoais de forma oculta. Ao interagir com o Livro de Visitas, o nome e mensagem que disponibilizar serão armazenados de forma pública no site. Não vendemos nem partilhamos as suas informações com terceiros.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-[#4a4a4a] uppercase tracking-wider text-xs mb-2">3. Utilização de Cookies</h4>
                  <p>
                    Utilizamos apenas cookies técnicos e estritamente essenciais para o funcionamento correto da sua sessão e preferências estéticas locais do site (como a gravação do seu consentimento de cookies). Estes cookies não recolhem dados para fins publicitários ou estatísticas de marketing invasivas.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-[#4a4a4a] uppercase tracking-wider text-xs mb-2">4. Contacto</h4>
                  <p>
                    Para questões de licenciamento, direitos de imagem ou propostas profissionais, utilize o formulário da página de Contacto ou envie um e-mail para <a href={`mailto:${siteSettings?.contactEmail || 'manuel.francisco3@gmail.com'}`} className="underline hover:text-[#4a4a4a]/60 transition-colors">{siteSettings?.contactEmail || 'manuel.francisco3@gmail.com'}</a>.
                  </p>
                </div>
              </div>

              <div className="mt-8 border-t border-[#4a4a4a]/10 pt-4 flex justify-end">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="bg-[#1a1a1a] hover:bg-[#2c2c2c] text-white px-6 py-2.5 uppercase text-xs tracking-widest font-sans font-semibold transition-all duration-200"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Elegant Initial Loading Screen */}
      <AnimatePresence>
        {isInitialLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[300] bg-[#fafafa] flex flex-col items-center justify-center p-6"
          >
            <div className="text-center space-y-6 max-w-lg">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="space-y-2"
              >
                <h1 className="font-serif text-3xl md:text-4xl text-[#1a1a1a] tracking-widest uppercase font-light">
                  {siteSettings?.siteName?.replace('\n', ' ') || 'MANUEL FRANCISCO'}
                </h1>
                <p className="text-[#7a7a7a] tracking-[0.3em] text-[11px] font-sans uppercase font-medium">
                  {siteSettings?.siteSubtitle || 'FOTOGRAFIA'}
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "80px" }}
                transition={{ delay: 0.3, duration: 1.2, ease: "easeInOut" }}
                className="h-[1px] bg-[#1a1a1a]/20 mx-auto"
              />

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="text-[9px] tracking-[0.25em] text-[#7a7a7a] uppercase font-sans"
              >
                A carregar portfólio
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
