/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Cookie, ShieldCheck, Home, Image as ImageIcon, User, BookOpen, Mail, Link as LinkIcon, Settings, ArrowRight, ZoomIn, ZoomOut, Maximize, Menu, Camera, Info, Keyboard, HelpCircle, Sparkles, Play, Download } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import Footer from './components/Footer';
import AdminPasswordPrompt from './components/AdminPasswordPrompt';
import GalleryGrid from './components/GalleryGrid';
import { getFontFamily } from './utils/fontUtils';
import { getSlideshowVariants, getLightboxVariants } from './utils/transitionUtils';
import { getWatermarkClasses } from './utils/watermarkUtils';

const AdminPanel = lazy(() => import('./AdminPanel'));
const Biography = lazy(() => import('./components/Biography'));
const Guestbook = lazy(() => import('./components/Guestbook'));
const Contact = lazy(() => import('./components/Contact'));
const Links = lazy(() => import('./components/Links'));
const ZenStoryMode = lazy(() => import('./components/ZenStoryMode'));

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
    let timeoutId: number;
    const checkOrientation = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        const isL = window.innerWidth > window.innerHeight && window.innerHeight < 600;
        setIsMobileLandscape(isL);
      }, 100);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);

  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('admin_unlocked') === 'true';
  });
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [showExifPanel, setShowExifPanel] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [showZenMode, setShowZenMode] = useState<boolean>(false);
  const [swipeHintVisible, setSwipeHintVisible] = useState<boolean>(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchDelta, setTouchDelta] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [slideIndex, setSlideIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [siteSettings, setSiteSettings] = useState<any>({
    siteName: 'MANUEL FRANCISCO FOTOGRAFIA',
    siteSubtitle: 'FOTOGRAFIA',
    welcomeMessage: 'Bem vindo a este espaço. Quero que descubra comigo o gosto pela fotografia.',
    contactEmail: 'manuel.francisco3@gmail.com',
    showExifData: true,
    enableKeyboardShortcuts: true,
    enableZenMode: true,
    enableWatermark: false,
    watermarkText: '© Manuel Francisco',
    watermarkPosition: 'bottom-left',
    enableGallerySearch: true,
    enableFavorites: true,
    enablePhotoComparison: true,
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
      const fetchedImages: any[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        alt: doc.data().title || 'Fotografia',
      }));
      setGalleryImages(fetchedImages);
      setIsInitialLoading(false);
      
      // Preload initial batch of images in background for instantaneous navigation
      if (fetchedImages.length > 0) {
        fetchedImages.slice(0, 12).forEach((img) => {
          if (img.url) {
            const imageObj = new Image();
            imageObj.src = img.url;
          }
        });
      }
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

  // Preload adjacent images for slideshow
  useEffect(() => {
    if (activeView === 'inicio' && galleryImages.length > 0) {
      const nextIdx = (slideIndex + 1) % galleryImages.length;
      const prevIdx = (slideIndex - 1 + galleryImages.length) % galleryImages.length;
      [nextIdx, prevIdx].forEach(idx => {
        if (galleryImages[idx]?.url) {
          const img = new Image();
          img.src = galleryImages[idx].url;
        }
      });
    }
  }, [slideIndex, galleryImages, activeView]);

  // Preload adjacent images for Lightbox
  useEffect(() => {
    if (selectedImageIndex !== null && filteredGallery.length > 0) {
      const nextIdx = (selectedImageIndex + 1) % filteredGallery.length;
      const prevIdx = (selectedImageIndex - 1 + filteredGallery.length) % filteredGallery.length;
      [nextIdx, prevIdx].forEach(idx => {
        if (filteredGallery[idx]?.url) {
          const img = new Image();
          img.src = filteredGallery[idx].url;
        }
      });
    }
  }, [selectedImageIndex, filteredGallery]);

  // Global right-click & drag protection when protectPhotos is enabled
  useEffect(() => {
    if (siteSettings?.protectPhotos) {
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
      const handleDragStart = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
      window.addEventListener('contextmenu', handleContextMenu, true);
      window.addEventListener('dragstart', handleDragStart, true);
      return () => {
        window.removeEventListener('contextmenu', handleContextMenu, true);
        window.removeEventListener('dragstart', handleDragStart, true);
      };
    }
  }, [siteSettings?.protectPhotos]);
  
  const [cookiesAccepted, setCookiesAccepted] = useState<boolean>(() => {
    return localStorage.getItem('cookiesAccepted') === 'true';
  });

  const acceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setCookiesAccepted(true);
  };

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    const initialZoom = Number(siteSettings?.defaultZoomLevel) || 100;
    setZoomLevel(initialZoom);
    setSwipeHintVisible(true);
    setTimeout(() => {
      setSwipeHintVisible(false);
    }, 4000);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
    const initialZoom = Number(siteSettings?.defaultZoomLevel) || 100;
    setZoomLevel(initialZoom);
    setShowExifPanel(false);
    setShowShortcutsModal(false);
    setTouchStart(null);
    setTouchDelta({ x: 0, y: 0 });
  };

  const nextImage = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedImageIndex !== null && filteredGallery.length > 0) {
      setSelectedImageIndex((selectedImageIndex + 1) % filteredGallery.length);
    }
  }, [selectedImageIndex, filteredGallery.length]);

  const prevImage = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedImageIndex !== null && filteredGallery.length > 0) {
      setSelectedImageIndex((selectedImageIndex - 1 + filteredGallery.length) % filteredGallery.length);
    }
  }, [selectedImageIndex, filteredGallery.length]);

  const toggleFullScreen = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  const handleZoom = (e: React.MouseEvent, type: 'in' | 'out') => {
    e.stopPropagation();
    setZoomLevel(prev => {
      if (type === 'in') return Math.min(prev + 25, 300);
      return Math.max(prev - 25, 50);
    });
  };

  // Touch & Swipe handlers for mobile Lightbox
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setTouchDelta({ x: 0, y: 0 });
      setSwipeHintVisible(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || e.touches.length > 1) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    setTouchDelta({
      x: currentX - touchStart.x,
      y: currentY - touchStart.y
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart) return;
    const { x, y } = touchDelta;
    if (Math.abs(x) > Math.abs(y)) {
      if (x < -50) {
        nextImage();
      } else if (x > 50) {
        prevImage();
      }
    } else {
      if (y > 70) {
        closeLightbox();
      }
    }
    setTouchStart(null);
    setTouchDelta({ x: 0, y: 0 });
  };

  // Comprehensive Keyboard Shortcuts Event Listener
  useEffect(() => {
    if (siteSettings?.enableKeyboardShortcuts === false) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toUpperCase();
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) return;

      if (selectedImageIndex !== null) {
        if (e.key === 'Escape') {
          if (showShortcutsModal) {
            setShowShortcutsModal(false);
          } else if (showExifPanel) {
            setShowExifPanel(false);
          } else {
            closeLightbox();
          }
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'j' || e.key === 'J') {
          nextImage();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'k' || e.key === 'K') {
          prevImage();
        } else if ((e.key === 'i' || e.key === 'I' || e.key === 'e' || e.key === 'E') && siteSettings?.showExifData !== false) {
          setShowExifPanel(prev => !prev);
        } else if (e.key === 'f' || e.key === 'F') {
          toggleFullScreen();
        } else if (e.key === '+' || e.key === '=') {
          setZoomLevel(prev => Math.min(prev + 25, 300));
        } else if (e.key === '-' || e.key === '_') {
          setZoomLevel(prev => Math.max(prev - 25, 50));
        } else if (e.key === '?' || e.key === 'h' || e.key === 'H') {
          setShowShortcutsModal(prev => !prev);
        }
      } else {
        // Global view navigation shortcuts when modal/lightbox is closed
        if (e.key === 'g' || e.key === 'G') {
          setActiveView('galeria');
        } else if (e.key === 'i' || e.key === 'I') {
          setActiveView('inicio');
        } else if (e.key === 'b' || e.key === 'B') {
          setActiveView('biografia');
        } else if (e.key === 'l' || e.key === 'L') {
          setActiveView('livro');
        } else if (e.key === 'c' || e.key === 'C') {
          setActiveView('contacto');
        } else if (activeView === 'inicio' && (e.key === 'ArrowRight' || e.key === 'ArrowDown')) {
          setSlideIndex(prev => (prev + 1) % (galleryImages.length || 1));
        } else if (activeView === 'inicio' && (e.key === 'ArrowLeft' || e.key === 'ArrowUp')) {
          setSlideIndex(prev => (prev - 1 + (galleryImages.length || 1)) % (galleryImages.length || 1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, showShortcutsModal, showExifPanel, activeView, nextImage, prevImage, toggleFullScreen, galleryImages.length, siteSettings?.enableKeyboardShortcuts, siteSettings?.showExifData]);

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
    fontFamily: getFontFamily(siteSettings?.globalFont),
  };

  const menuStyle = {
    color: siteSettings?.menuColor || '#7a7a7a',
    fontFamily: getFontFamily(siteSettings?.menuFont),
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
          fontSize: `${Math.max(12, (siteSettings?.siteNameFontSize || 16) * 0.8)}px`,
          fontFamily: getFontFamily(siteSettings?.siteNameFont)
        }}>
          <h1 className="tracking-widest uppercase font-semibold">{siteSettings.siteName?.replace('\n', ' ')}</h1>
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
            fontSize: `${siteSettings?.siteNameFontSize || 16}px`,
            fontFamily: getFontFamily(siteSettings?.siteNameFont)
          }}>
            <h1 className="tracking-widest leading-tight uppercase whitespace-pre-line font-semibold">{siteSettings.siteName}</h1>
            <p className="text-[#7a7a7a] tracking-widest text-[12px] font-sans mt-2 uppercase">{siteSettings.siteSubtitle}</p>
          </div>
          <div 
            className="px-10 text-xs md:text-sm font-sans leading-relaxed mb-8 whitespace-pre-line"
            style={{ 
              marginTop: `${siteSettings?.messageSpacing || 0}px`,
              fontSize: `${siteSettings?.messageFontSize || 13}px`,
              color: siteSettings?.messageColor || '#4a4a4a',
              textAlign: siteSettings?.messageAlignment || 'left',
              fontFamily: getFontFamily(siteSettings?.messageFont)
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
          <div 
            className="relative w-full h-full transition-colors duration-500"
            style={{ backgroundColor: siteSettings?.slideshowBgColor || '#1a1a1a' }}
          >
            {galleryImages.length > 0 ? (
              <>
                {(() => {
                  const slideshowVariants = getSlideshowVariants(siteSettings?.slideshowEffect, Number(siteSettings?.slideshowZoom) || 105, siteSettings?.reduceAnimations);
                  return (
                    <AnimatePresence mode="popLayout">
                      <motion.img
                        key={slideIndex}
                        src={galleryImages[slideIndex]?.url}
                        alt={galleryImages[slideIndex]?.alt}
                        decoding="async"
                        fetchPriority="high"
                        referrerPolicy="no-referrer"
                        initial={slideshowVariants.initial}
                        animate={slideshowVariants.animate}
                        exit={slideshowVariants.exit}
                        transition={slideshowVariants.transition}
                        className={`absolute inset-0 w-full h-full ${siteSettings?.slideshowFit === 'Preencher' ? 'object-cover' : 'object-contain'}`}
                      />
                    </AnimatePresence>
                  );
                })()}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />
                <div 
                  className={(() => {
                    const pos = siteSettings?.slideshowTextPosition;
                    if (pos === 'centrado em baixo') {
                      return 'absolute bottom-8 md:bottom-16 left-1/2 -translate-x-1/2 z-20 text-center w-[90%] max-w-2xl flex flex-col items-center';
                    }
                    if (pos === 'canto inferior dto') {
                      return 'absolute bottom-8 md:bottom-16 right-6 md:right-16 z-20 text-right flex flex-col items-end';
                    }
                    return 'absolute bottom-8 md:bottom-16 left-6 md:left-16 z-20 text-left flex flex-col items-start';
                  })()}
                >
                  <motion.h2 
                    key={`title-${slideIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="mb-2 tracking-wide font-light"
                    style={{
                      fontFamily: getFontFamily(siteSettings?.slideshowTitleFont),
                      fontSize: (siteSettings?.slideshowTitleSize || '48px').replace(/\s+/g, ''),
                      color: siteSettings?.slideshowTextColor || '#ffffff'
                    }}
                  >
                    {galleryImages[slideIndex]?.title}
                  </motion.h2>
                  <motion.p 
                    key={`subtitle-${slideIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="tracking-widest uppercase mb-6 md:mb-8 opacity-80"
                    style={{
                      fontFamily: getFontFamily(siteSettings?.slideshowSubtitleFont),
                      fontSize: (siteSettings?.slideshowSubtitleSize || '12px').replace(/\s+/g, ''),
                      color: siteSettings?.slideshowTextColor || '#ffffff'
                    }}
                  >
                    {galleryImages[slideIndex]?.subtitle}
                  </motion.p>
                  <div 
                    className={(() => {
                      const pos = siteSettings?.slideshowTextPosition;
                      if (pos === 'centrado em baixo') return 'flex items-center justify-center gap-4';
                      if (pos === 'canto inferior dto') return 'flex items-center justify-end gap-4';
                      return 'flex items-center justify-start gap-4';
                    })()}
                  >
                    <button 
                      onClick={() => setActiveView('galeria')}
                      className="flex items-center gap-3 py-2 text-[12px] md:text-xs font-sans tracking-[0.2em] uppercase hover:text-white/70 transition-colors border-b border-white/30 hover:border-white pb-1 w-fit font-semibold"
                    >
                      <span>VER GALERIA</span>
                      <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
                    </button>

                    {siteSettings?.enableZenMode !== false && (
                      <button 
                        onClick={() => setShowZenMode(true)}
                        className="flex items-center gap-2 px-4 py-1.5 bg-black/40 hover:bg-black/70 border border-white/30 hover:border-white/60 text-[11px] md:text-xs font-sans tracking-[0.2em] uppercase text-amber-200 transition-all rounded-full backdrop-blur-md"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                        <span>MODO ZEN</span>
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Slideshow Indicators */}
                {galleryImages.length > 1 && (
                  <div 
                    className={(() => {
                      const pos = siteSettings?.slideshowTextPosition;
                      if (pos === 'canto inferior dto') {
                        return 'absolute bottom-8 md:bottom-16 left-6 md:left-16 z-20 flex gap-2';
                      }
                      return 'absolute bottom-8 md:bottom-16 right-6 md:right-16 z-20 flex gap-2';
                    })()}
                  >
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

                    {siteSettings?.enableZenMode !== false && (
                      <button 
                        onClick={() => setShowZenMode(true)}
                        className="ml-2 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#333] text-amber-200 border border-amber-300/30 hover:border-amber-300/70 transition-all text-[9px] tracking-[0.1em] uppercase flex items-center gap-1.5 font-bold rounded-full shadow-sm"
                        title="Apresentação Zen Fullscreen"
                      >
                        <Sparkles size={12} className="text-amber-300 animate-pulse" />
                        <span>Modo Zen</span>
                      </button>
                    )}
                  </div>

                  <GalleryGrid 
                    images={filteredGallery} 
                    onImageClick={openLightbox} 
                    protectPhotos={siteSettings?.protectPhotos}
                    showCaptions={siteSettings?.showCaptions}
                    enableWatermark={siteSettings?.enableWatermark}
                    watermarkText={siteSettings?.watermarkText}
                    watermarkPosition={siteSettings?.watermarkPosition}
                    enableFavorites={siteSettings?.enableFavorites}
                    enableGallerySearch={siteSettings?.enableGallerySearch}
                    enablePhotoComparison={siteSettings?.enablePhotoComparison}
                    enableMonochromeToggle={siteSettings?.enableMonochromeToggle}
                    enablePhotoLikes={siteSettings?.enablePhotoLikes}
                    thumbnailSize={siteSettings?.thumbnailSize}
                  />
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
          <Suspense fallback={<div className="flex-1 h-full flex items-center justify-center"><span className="text-[10px] uppercase tracking-widest text-[#7a7a7a]">A carregar...</span></div>}>
            <Biography 
              settings={siteSettings} 
              setActiveView={setActiveView} 
              onOpenTerms={() => setShowTermsModal(true)} 
            />
          </Suspense>
        ) : activeView === 'livro' ? (
          <Suspense fallback={<div className="flex-1 h-full flex items-center justify-center"><span className="text-[10px] uppercase tracking-widest text-[#7a7a7a]">A carregar...</span></div>}>
            <Guestbook 
              settings={siteSettings} 
              isAdminUnlocked={isAdminUnlocked} 
              setActiveView={setActiveView} 
              onOpenTerms={() => setShowTermsModal(true)} 
            />
          </Suspense>
        ) : activeView === 'contacto' ? (
          <Suspense fallback={<div className="flex-1 h-full flex items-center justify-center"><span className="text-[10px] uppercase tracking-widest text-[#7a7a7a]">A carregar...</span></div>}>
            <Contact 
              settings={siteSettings} 
              setActiveView={setActiveView} 
              onOpenTerms={() => setShowTermsModal(true)} 
            />
          </Suspense>
        ) : activeView === 'links' ? (
          <Suspense fallback={<div className="flex-1 h-full flex items-center justify-center"><span className="text-[10px] uppercase tracking-widest text-[#7a7a7a]">A carregar...</span></div>}>
            <Links 
              settings={siteSettings} 
              isAdminUnlocked={isAdminUnlocked}
              setActiveView={setActiveView} 
              onOpenTerms={() => setShowTermsModal(true)} 
            />
          </Suspense>
        ) : activeView === 'admin' ? (
          isAdminUnlocked ? (
            <Suspense fallback={<div className="flex-1 h-full flex items-center justify-center"><span className="text-[10px] uppercase tracking-widest text-[#7a7a7a]">A carregar...</span></div>}>
              <AdminPanel 
                images={galleryImages} 
                setImages={setGalleryImages} 
                onLogout={() => {
                  setIsAdminUnlocked(false);
                  sessionStorage.removeItem('admin_unlocked');
                  setActiveView('inicio');
                }}
              />
            </Suspense>
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
            className="fixed inset-0 z-[150] flex items-center justify-center transition-colors duration-300"
            style={{ backgroundColor: siteSettings?.lightboxBgColor || '#0a0a0a' }}
            onClick={closeLightbox}
          >
            {/* Top Right Controls */}
            <div className="absolute top-6 right-6 z-[160] flex items-center gap-3 md:gap-4">
              {siteSettings?.enableKeyboardShortcuts !== false && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShortcutsModal(!showShortcutsModal);
                  }}
                  className={`px-3 py-1.5 rounded-full text-[10px] tracking-widest uppercase transition-all flex items-center gap-1.5 ${
                    showShortcutsModal 
                      ? 'bg-white text-black font-bold shadow-lg' 
                      : 'bg-black/40 text-white/90 hover:bg-black/60 border border-white/20'
                  }`}
                  title="Atalhos de Teclado & Gestos (?)"
                >
                  <Keyboard size={14} /> <span className="hidden sm:inline">Atalhos</span>
                </button>
              )}

              {siteSettings?.showExifData !== false && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowExifPanel(!showExifPanel);
                  }}
                  className={`px-3 py-1.5 rounded-full text-[10px] tracking-widest uppercase transition-all flex items-center gap-1.5 ${
                    showExifPanel 
                      ? 'bg-white text-black font-bold shadow-lg' 
                      : 'bg-black/40 text-white/90 hover:bg-black/60 border border-white/20'
                  }`}
                  title="Ver Dados EXIF (E)"
                >
                  <Camera size={14} /> EXIF
                </button>
              )}

              <div className="flex items-center gap-3 text-white bg-black/40 border border-white/20 px-3 py-1 rounded-full">
                <button onClick={(e) => handleZoom(e, 'out')} className="hover:text-white/70 transition-colors" title="Zoom Out (-)">
                  <ZoomOut size={16} strokeWidth={1.5} />
                </button>
                <span className="text-[10px] tracking-wider font-sans w-8 text-center font-mono">{zoomLevel}%</span>
                <button onClick={(e) => handleZoom(e, 'in')} className="hover:text-white/70 transition-colors" title="Zoom In (+)">
                  <ZoomIn size={16} strokeWidth={1.5} />
                </button>
              </div>

              {siteSettings?.enablePhotoDownload && filteredGallery[selectedImageIndex] && (
                <a 
                  href={filteredGallery[selectedImageIndex].url}
                  download={filteredGallery[selectedImageIndex].title || 'fotografia-highres'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full text-[10px] tracking-widest uppercase transition-all flex items-center gap-1.5 bg-black/40 text-white/90 hover:bg-white hover:text-black border border-white/20"
                  title="Descarregar Foto High-Res"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download size={14} /> Download
                </a>
              )}

              <button onClick={toggleFullScreen} className="text-white bg-black/40 hover:bg-black/60 border border-white/20 p-2 rounded-full transition-colors" title="Ecrã Inteiro (F)">
                <Maximize size={16} strokeWidth={1.5} />
              </button>
              <button onClick={closeLightbox} className="text-white bg-black/40 hover:bg-black/60 border border-white/20 p-2 rounded-full transition-colors ml-1" title="Fechar (Esc)">
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Mobile Touch Swipe Hint Pill */}
            <AnimatePresence>
              {swipeHintVisible && siteSettings?.enableKeyboardShortcuts !== false && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="md:hidden absolute top-20 left-1/2 -translate-x-1/2 z-[160] bg-black/80 backdrop-blur-md text-white/90 px-4 py-2 rounded-full text-[10px] uppercase tracking-widest border border-white/20 shadow-xl flex items-center gap-2 pointer-events-none"
                >
                  <span>Deslize ← → para fotos, ↓ para fechar</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button 
              onClick={prevImage}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white bg-black/30 hover:bg-black/60 rounded-full border border-white/10 transition-colors z-[160]"
              title="Foto Anterior (← / K)"
            >
              <ChevronLeft size={28} strokeWidth={1.5} />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white bg-black/30 hover:bg-black/60 rounded-full border border-white/10 transition-colors z-[160]"
              title="Próxima Foto (→ / J)"
            >
              <ChevronRight size={28} strokeWidth={1.5} />
            </button>

            {/* Image Container with Touch Swipe Gesture Support */}
            <div 
              className="overflow-hidden max-h-screen max-w-full flex items-center justify-center touch-pan-y relative select-none" 
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {(() => {
                const lightboxVariants = getLightboxVariants(siteSettings?.lightboxEffect, zoomLevel, siteSettings?.reduceAnimations);
                return (
                  <motion.div
                    key={selectedImageIndex}
                    initial={lightboxVariants.initial}
                    animate={lightboxVariants.animate}
                    exit={lightboxVariants.exit}
                    transition={lightboxVariants.transition}
                    style={{
                      transform: touchStart ? `translate3d(${touchDelta.x}px, ${touchDelta.y}px, 0px)` : undefined,
                      opacity: touchStart && Math.abs(touchDelta.y) > 30 ? Math.max(0.3, 1 - Math.abs(touchDelta.y) / 300) : 1,
                      transition: touchStart ? 'none' : 'transform 0.25s ease-out, opacity 0.25s ease-out'
                    }}
                    className="relative z-[150] flex items-center justify-center"
                  >
                    <img
                      src={filteredGallery[selectedImageIndex]?.url}
                      alt={filteredGallery[selectedImageIndex]?.alt}
                      decoding="async"
                      fetchPriority="high"
                      referrerPolicy="no-referrer"
                      className="max-h-screen max-w-full object-contain pointer-events-none"
                    />
                    {siteSettings?.enableWatermark && (
                      <div className={getWatermarkClasses(siteSettings?.watermarkPosition, true)}>
                        {siteSettings?.watermarkText || '© Manuel Francisco'}
                      </div>
                    )}
                  </motion.div>
                );
              })()}
            </div>
            
            {/* Lightbox Caption with custom tipografia, cor e posição */}
            <div 
              className={(() => {
                const pos = siteSettings?.lightboxTextPosition;
                if (pos === 'centrado em baixo') {
                  return 'absolute bottom-8 left-1/2 -translate-x-1/2 z-[160] text-center w-[90%] max-w-2xl';
                }
                if (pos === 'canto inferior dto') {
                  return 'absolute bottom-8 right-8 z-[160] text-right';
                }
                return 'absolute bottom-8 left-8 z-[160] text-left';
              })()}
            >
              {filteredGallery[selectedImageIndex]?.title && (
                <h3 
                  className="mb-1 tracking-widest font-medium"
                  style={{
                    fontFamily: getFontFamily(siteSettings?.lightboxTitleFont),
                    fontSize: (siteSettings?.lightboxTitleSize || '18px').replace(/\s+/g, ''),
                    color: siteSettings?.lightboxTextColor || '#ffffff'
                  }}
                >
                  {filteredGallery[selectedImageIndex]?.title}
                </h3>
              )}
              {filteredGallery[selectedImageIndex]?.subtitle && (
                <p 
                  className="tracking-widest uppercase opacity-80"
                  style={{
                    fontFamily: getFontFamily(siteSettings?.lightboxSubtitleFont),
                    fontSize: (siteSettings?.lightboxSubtitleSize || '12px').replace(/\s+/g, ''),
                    color: siteSettings?.lightboxTextColor || '#ffffff'
                  }}
                >
                  {filteredGallery[selectedImageIndex]?.subtitle}
                </p>
              )}
            </div>

            {/* EXIF Overlay Panel */}
            <AnimatePresence>
              {showExifPanel && filteredGallery[selectedImageIndex] && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-8 right-8 z-[170] bg-black/85 backdrop-blur-md text-white p-5 rounded-lg border border-white/10 max-w-sm w-full shadow-2xl space-y-3"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-white/10">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-white/90 flex items-center gap-2">
                      <Camera size={14} className="text-[#8e8a82]" /> Informação EXIF
                    </span>
                    <button
                      onClick={() => setShowExifPanel(false)}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    {(filteredGallery[selectedImageIndex].exif?.camera || filteredGallery[selectedImageIndex].camera) && (
                      <div className="col-span-2">
                        <p className="text-[9px] uppercase tracking-wider text-white/50">Câmara</p>
                        <p className="font-medium text-white/90">{filteredGallery[selectedImageIndex].exif?.camera || filteredGallery[selectedImageIndex].camera}</p>
                      </div>
                    )}

                    {(filteredGallery[selectedImageIndex].exif?.lens || filteredGallery[selectedImageIndex].lens) && (
                      <div className="col-span-2">
                        <p className="text-[9px] uppercase tracking-wider text-white/50">Lente</p>
                        <p className="font-medium text-white/90">{filteredGallery[selectedImageIndex].exif?.lens || filteredGallery[selectedImageIndex].lens}</p>
                      </div>
                    )}

                    {(filteredGallery[selectedImageIndex].exif?.aperture || filteredGallery[selectedImageIndex].aperture) && (
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-white/50">Abertura</p>
                        <p className="font-medium text-white/90">{filteredGallery[selectedImageIndex].exif?.aperture || filteredGallery[selectedImageIndex].aperture}</p>
                      </div>
                    )}

                    {(filteredGallery[selectedImageIndex].exif?.shutter || filteredGallery[selectedImageIndex].shutter) && (
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-white/50">Velocidade</p>
                        <p className="font-medium text-white/90">{filteredGallery[selectedImageIndex].exif?.shutter || filteredGallery[selectedImageIndex].shutter}</p>
                      </div>
                    )}

                    {(filteredGallery[selectedImageIndex].exif?.iso || filteredGallery[selectedImageIndex].iso) && (
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-white/50">ISO</p>
                        <p className="font-medium text-white/90">{filteredGallery[selectedImageIndex].exif?.iso || filteredGallery[selectedImageIndex].iso}</p>
                      </div>
                    )}

                    {(filteredGallery[selectedImageIndex].exif?.focalLength || filteredGallery[selectedImageIndex].focalLength) && (
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-white/50">Distância Focal</p>
                        <p className="font-medium text-white/90">{filteredGallery[selectedImageIndex].exif?.focalLength || filteredGallery[selectedImageIndex].focalLength}</p>
                      </div>
                    )}

                    {filteredGallery[selectedImageIndex].cameraSettings && (
                      <div className="col-span-2 pt-2 border-t border-white/10">
                        <p className="text-[9px] uppercase tracking-wider text-white/50">Definições</p>
                        <p className="font-mono text-[11px] text-[#e0ded8]">{filteredGallery[selectedImageIndex].cameraSettings}</p>
                      </div>
                    )}

                    {filteredGallery[selectedImageIndex].description && (
                      <div className="col-span-2 pt-2 border-t border-white/10">
                        <p className="text-[9px] uppercase tracking-wider text-white/50">Descrição</p>
                        <p className="text-[11px] text-white/80 leading-relaxed">{filteredGallery[selectedImageIndex].description}</p>
                      </div>
                    )}

                    {(!filteredGallery[selectedImageIndex].exif?.camera && !filteredGallery[selectedImageIndex].cameraSettings) && (
                      <p className="col-span-2 text-white/50 text-[11px] italic">Sem dados EXIF disponíveis para esta imagem.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Keyboard Shortcuts & Gestos Modal */}
            <AnimatePresence>
              {showShortcutsModal && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-20 right-6 md:right-8 z-[180] bg-black/90 backdrop-blur-xl text-white p-6 rounded-xl border border-white/15 max-w-sm w-full shadow-2xl space-y-4"
                >
                  <div className="flex justify-between items-center pb-3 border-b border-white/15">
                    <span className="text-[11px] uppercase tracking-widest font-bold text-white flex items-center gap-2">
                      <Keyboard size={16} className="text-amber-400" /> Atalhos & Gestos
                    </span>
                    <button
                      onClick={() => setShowShortcutsModal(false)}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs font-sans">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/50 mb-2 font-bold">Navegação no Teclado</p>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <kbd className="px-2 py-0.5 bg-white/15 rounded border border-white/20 font-mono text-[10px]">←</kbd>
                          <kbd className="px-2 py-0.5 bg-white/15 rounded border border-white/20 font-mono text-[10px]">→</kbd>
                          <span className="text-white/80">Fotos</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <kbd className="px-2 py-0.5 bg-white/15 rounded border border-white/20 font-mono text-[10px]">Esc</kbd>
                          <span className="text-white/80">Fechar</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <kbd className="px-2 py-0.5 bg-white/15 rounded border border-white/20 font-mono text-[10px]">E</kbd>
                          <span className="text-white/80">EXIF</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <kbd className="px-2 py-0.5 bg-white/15 rounded border border-white/20 font-mono text-[10px]">F</kbd>
                          <span className="text-white/80">Ecrã Inteiro</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <kbd className="px-2 py-0.5 bg-white/15 rounded border border-white/20 font-mono text-[10px]">+</kbd>
                          <kbd className="px-2 py-0.5 bg-white/15 rounded border border-white/20 font-mono text-[10px]">-</kbd>
                          <span className="text-white/80">Zoom</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <kbd className="px-2 py-0.5 bg-white/15 rounded border border-white/20 font-mono text-[10px]">?</kbd>
                          <span className="text-white/80">Ajuda</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10">
                      <p className="text-[10px] uppercase tracking-wider text-white/50 mb-2 font-bold">Gestos em Dispositivos Móveis</p>
                      <div className="space-y-1.5 text-[11px] text-white/80">
                        <p className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Deslizar ← / → para mudar de foto
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Deslizar ↓ para fechar visualizador
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10">
                      <p className="text-[10px] uppercase tracking-wider text-white/50 mb-2 font-bold">Atalhos Globais do Site</p>
                      <p className="text-[10px] text-white/70 leading-relaxed">
                        Pressione <kbd className="px-1.5 py-0.5 bg-white/15 rounded font-mono">G</kbd> para Galeria, <kbd className="px-1.5 py-0.5 bg-white/15 rounded font-mono">I</kbd> para Início, <kbd className="px-1.5 py-0.5 bg-white/15 rounded font-mono">B</kbd> para Biografia, <kbd className="px-1.5 py-0.5 bg-white/15 rounded font-mono">L</kbd> para Livro de Visitas, <kbd className="px-1.5 py-0.5 bg-white/15 rounded font-mono">C</kbd> para Contactos.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
      {/* Zen Story Mode Presentation */}
      <AnimatePresence>
        {showZenMode && (
          <Suspense fallback={<div className="fixed inset-0 z-[300] bg-black flex items-center justify-center"><span className="text-white/50 text-[10px] uppercase tracking-widest">A iniciar...</span></div>}>
            <ZenStoryMode
              images={filteredGallery.length > 0 ? filteredGallery : galleryImages}
              onClose={() => setShowZenMode(false)}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}
