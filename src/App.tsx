/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Cookie, ShieldCheck, Home, Image as ImageIcon, User, BookOpen, Mail, Link as LinkIcon, Settings, ArrowRight, ZoomIn, ZoomOut, Maximize, Menu, Camera, Info, Keyboard, HelpCircle, Sparkles, Play, Pause, Share2, CheckCircle2, Download, Tv, Instagram, Facebook, Twitter, Heart, Eye, EyeOff } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import Footer from './components/Footer';
import AdminPasswordPrompt from './components/AdminPasswordPrompt';
import GalleryGrid from './components/GalleryGrid';
import Lightbox from './components/Lightbox';
import DesktopSidebar from './components/DesktopSidebar';
import SlideshowView from './components/SlideshowView';

import { getFontFamily, getTextStyleProps } from './utils/fontUtils';
import { getSlideshowVariants, getLightboxVariants } from './utils/transitionUtils';
import { getWatermarkClasses, getPositionClasses, getCaptionOffsetStyle } from './utils/watermarkUtils';
import { preloadImage, preloadImageAsync, preloadImagesBatch } from './utils/imagePreloader';

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

import { View, ImageProps, SiteSettings } from './types';
import { navItems } from './components/NavigationItems';




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
  const [hideLightboxControls, setHideLightboxControls] = useState<boolean>(false);
  const [showExifPanel, setShowExifPanel] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [showZenMode, setShowZenMode] = useState<boolean>(false);
  const [isAutoPlayActive, setIsAutoPlayActive] = useState<boolean>(false);
  const [slideshowSpeed, setSlideshowSpeed] = useState<number>(4000);
  const [swipeHintVisible, setSwipeHintVisible] = useState<boolean>(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchDelta, setTouchDelta] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(100);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number>(100);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTapTimeRef = useRef<number>(0);
  const lastTapPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [viewedPhotos, setViewedPhotos] = useState<string[]>(() => {
    try {
      const saved = sessionStorage.getItem('gallery_viewed_photos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const markPhotoAsViewed = useCallback((id: string | number) => {
    const strId = String(id);
    setViewedPhotos(prev => {
      if (prev.includes(strId)) return prev;
      const next = [...prev, strId];
      try {
        sessionStorage.setItem('gallery_viewed_photos', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  }, []);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2800);
  }, []);
  const [slideIndex, setSlideIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<ImageProps[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('cache_gallery_images');
        return cached ? JSON.parse(cached) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return !localStorage.getItem('cache_gallery_images');
      } catch (e) {
        return true;
      }
    }
    return true;
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [isMonochrome, setIsMonochrome] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('gallery_user_favorites');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Sync favorites with localStorage in App.tsx
  useEffect(() => {
    try {
      localStorage.setItem('gallery_user_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Error saving favorites', e);
    }
  }, [favorites]);

  const [slideshowAspects, setSlideshowAspects] = useState<Record<string, number>>({});
  const [slideshowContainerSize, setSlideshowContainerSize] = useState<{ width: number; height: number } | null>(null);
  const slideshowContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slideshowContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSlideshowContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(slideshowContainerRef.current);
    return () => observer.disconnect();
  }, [activeView]);
  const [siteSettings, setSiteSettings] = useState<Partial<SiteSettings>>(() => {
    const defaults: Partial<SiteSettings> = {
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
      sidebarButtonSpacing: 16,
      messageSpacing: 16,
      slideshowTopMargin: 0,
      showSlideshowGalleryButton: true,
      slideshowGalleryButtonPosition: 'left',
    };
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('cache_site_settings');
        return cached ? { ...defaults, ...JSON.parse(cached) } : defaults;
      } catch (e) {
        return defaults;
      }
    }
    return defaults;
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

  const uncategorizedCount = React.useMemo(() => {
    return galleryImages.filter(img => !img.category || !img.category.trim() || img.category.toLowerCase() === 'sem categoria').length;
  }, [galleryImages]);

  const filteredGallery = React.useMemo(() => {
    if (activeView !== 'galeria' && activeView !== 'inicio') return galleryImages;
    if (selectedCategory === 'TODAS') return galleryImages;
    if (selectedCategory === 'SEM_CATEGORIA' || selectedCategory === 'Sem Categoria') {
      return galleryImages.filter(img => !img.category || !img.category.trim() || img.category.toLowerCase() === 'sem categoria');
    }
    return galleryImages.filter(img => img.category === selectedCategory);
  }, [galleryImages, selectedCategory, activeView]);

  const renderGalleryHeader = () => {
    return (
      <div 
        className="w-full mx-auto flex-shrink-0"
        style={{ marginBottom: siteSettings?.mainTitleBottomMargin !== undefined ? `${siteSettings.mainTitleBottomMargin}px` : (isMobileLandscape ? '8px' : '16px') }}
      >
        {(siteSettings?.showPageHeaderTitle !== false || siteSettings?.showPageHeaderLines !== false) && !isMobileLandscape && (
          <div className={`py-2.5 mb-3 text-center ${siteSettings?.showPageHeaderLines !== false ? 'border-y border-[#4a4a4a]/10' : ''}`}>
            {siteSettings?.showPageHeaderTitle !== false && (
              <h1 className="font-sans text-base md:text-lg text-[#4a4a4a] tracking-widest uppercase font-semibold">
                {siteSettings?.siteName ? siteSettings.siteName.replace('\n', ' ') : 'Manuel Francisco Fotografia'}
              </h1>
            )}
          </div>
        )}
        
        {/* Title and utility controls row */}
        <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#4a4a4a]/10 pb-3 mb-4">
          <div className="text-left">
            <h2 
              className="font-normal"
              style={{
                fontFamily: getFontFamily(siteSettings?.pageTitleFont || siteSettings?.globalFont),
                fontSize: siteSettings?.pageTitleFontSize ? (siteSettings.pageTitleFontSize.includes('px') ? siteSettings.pageTitleFontSize : `${siteSettings.pageTitleFontSize}px`) : undefined,
                color: siteSettings?.pageTitleColor || '#4a4a4a',
                letterSpacing: siteSettings?.pageTitleLetterSpacing || '1px',
                marginBottom: siteSettings?.pageTitleSubtitleSpacing !== undefined ? `${siteSettings.pageTitleSubtitleSpacing}px` : '4px',
                ...getTextStyleProps(siteSettings?.pageTitleStyle)
              }}
            >
              {siteSettings?.gallerySectionTitle || 'Galeria'}
            </h2>
            <p 
              className="uppercase"
              style={{
                fontFamily: getFontFamily(siteSettings?.pageSubtitleFont || siteSettings?.globalFont),
                fontSize: siteSettings?.pageSubtitleFontSize ? (siteSettings.pageSubtitleFontSize.includes('px') ? siteSettings.pageSubtitleFontSize : `${siteSettings.pageSubtitleFontSize}px`) : undefined,
                color: siteSettings?.pageSubtitleColor || '#7a7a7a',
                letterSpacing: siteSettings?.pageSubtitleLetterSpacing || '2px',
                ...getTextStyleProps(siteSettings?.pageSubtitleStyle)
              }}
            >
              {siteSettings?.gallerySectionSubtitle 
                ? siteSettings.gallerySectionSubtitle 
                : `${filteredGallery.length} ${filteredGallery.length === 1 ? 'FOTOGRAFIA' : 'FOTOGRAFIAS'}`}
            </p>
          </div>

          {/* Utilities (Modo Exposição, P&B, Favoritos) aligned to the right */}
          <div className="flex items-center justify-start md:justify-end gap-2 flex-wrap">
            {siteSettings?.enableZenMode !== false && (
              <button
                onClick={() => setShowZenMode(true)}
                className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-[#1a1a1a] text-[#e2d5c3] border border-[#d2c4b0]/40 hover:bg-[#2e2e2e] transition-all flex items-center gap-1.5 shadow-2xs"
                title="Modo Exposição Ambient em Écrã Inteiro com Música e Efeito Ken Burns"
              >
                <Tv size={12} className="text-[#c8b89e] animate-pulse" />
                <span>Modo Exposição</span>
              </button>
            )}

            {siteSettings?.enableMonochromeToggle !== false && (
              <button
                onClick={() => setIsMonochrome(!isMonochrome)}
                className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 ${
                  isMonochrome 
                    ? 'bg-[#1a1a1a] text-white border border-black shadow-sm' 
                    : 'bg-white/60 border border-[#e2ddd5] text-[#4a4a4a] hover:bg-white'
                }`}
                title="Exibição Monocromática (Preto & Branco)"
              >
                <span>P&B</span>
              </button>
            )}

            {siteSettings?.enableFavorites !== false && (
              <button
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 ${
                  showOnlyFavorites 
                    ? 'bg-rose-600 text-white shadow-sm' 
                    : 'bg-white/60 border border-[#e2ddd5] text-[#4a4a4a] hover:bg-white'
                }`}
              >
                <Heart size={12} className={showOnlyFavorites ? 'fill-white' : 'text-rose-500'} />
                <span>Favoritos ({favorites.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderGalleryControls = () => {
    return (
      <div className="w-full flex flex-wrap items-center justify-center md:justify-start gap-1.5 mb-5 pb-3 flex-shrink-0">
        <button 
          onClick={() => setSelectedCategory('TODAS')}
          className={`px-3 py-1.5 border transition-colors text-[9px] tracking-[0.1em] uppercase font-bold rounded-sm ${
            selectedCategory === 'TODAS' 
              ? 'bg-[#4a4a4a] text-white border-[#4a4a4a]' 
              : 'border-[#4a4a4a]/10 text-[#7a7a7a] hover:text-[#4a4a4a] hover:border-[#4a4a4a]/30'
          }`}
        >
          TODAS ({galleryImages.length})
        </button>

        {(siteSettings?.showUncategorizedFilter ?? true) && uncategorizedCount > 0 && (
          <button 
            onClick={() => setSelectedCategory('SEM_CATEGORIA')}
            className={`px-3 py-1.5 border transition-colors text-[9px] tracking-[0.1em] uppercase font-bold rounded-sm ${
              selectedCategory === 'SEM_CATEGORIA' || selectedCategory === 'Sem Categoria'
                ? 'bg-[#4a4a4a] text-white border-[#4a4a4a]' 
                : 'border-[#4a4a4a]/10 text-[#7a7a7a] hover:text-[#4a4a4a] hover:border-[#4a4a4a]/30'
            }`}
          >
            SEM CATEGORIA ({uncategorizedCount})
          </button>
        )}
        {allCategories.map(cat => {
          const count = galleryImages.filter(img => img.category?.trim().toLowerCase() === cat.trim().toLowerCase()).length;
          return (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 border transition-colors text-[9px] tracking-[0.1em] uppercase font-bold rounded-sm ${
                selectedCategory === cat 
                  ? 'bg-[#4a4a4a] text-white border-[#4a4a4a]' 
                  : 'border-[#4a4a4a]/10 text-[#7a7a7a] hover:text-[#4a4a4a] hover:border-[#4a4a4a]/30'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>
    );
  };

  
  useEffect(() => {
    const q = query(collection(db, 'images'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedImages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          alt: data.title || 'Fotografia',
        } as ImageProps;
      });

      // Sort by custom position order if present, fallback to createdAt desc
      fetchedImages.sort((a, b) => {
        const orderA = a.order !== undefined && a.order !== null ? Number(a.order) : Infinity;
        const orderB = b.order !== undefined && b.order !== null ? Number(b.order) : Infinity;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      setGalleryImages(fetchedImages);
      setIsInitialLoading(false);
      try {
        localStorage.setItem('cache_gallery_images', JSON.stringify(fetchedImages));
      } catch (e) {
        console.error("Error saving cached images:", e);
      }
      
      // Preload initial batch of images in background for instantaneous navigation
      if (fetchedImages.length > 0) {
        const urlsToPreload = fetchedImages.map(img => img.url).filter(Boolean);
        preloadImagesBatch(urlsToPreload, 5);
      }
    }, (error) => {
      console.error("Error fetching images:", error);
      setIsInitialLoading(false);
    });

    const settingsUnsubscribe = onSnapshot(doc(db, 'settings', 'site'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSiteSettings(prev => {
          const updated = { ...prev, ...data };
          try {
            localStorage.setItem('cache_site_settings', JSON.stringify(updated));
          } catch (e) {
            console.error("Error saving cached settings:", e);
          }
          return updated;
        });
      }
    }, (error) => {
      console.error("Error listening to settings:", error);
    });

    return () => {
      unsubscribe();
      settingsUnsubscribe();
    };
  }, []);

  // Preload adjacent images for slideshow using bounded preloader & pre-decode
  useEffect(() => {
    if (activeView === 'inicio' && galleryImages.length > 0) {
      const currentUrl = galleryImages[slideIndex]?.url;
      const nextIdx = (slideIndex + 1) % galleryImages.length;
      const prevIdx = (slideIndex - 1 + galleryImages.length) % galleryImages.length;
      
      if (currentUrl) preloadImageAsync(currentUrl);
      if (galleryImages[nextIdx]?.url) preloadImageAsync(galleryImages[nextIdx].url);
      if (galleryImages[prevIdx]?.url) preloadImageAsync(galleryImages[prevIdx].url);
    }
  }, [slideIndex, galleryImages, activeView]);

  // Preload adjacent images for Lightbox using bounded preloader & mark as viewed
  useEffect(() => {
    if (selectedImageIndex !== null && filteredGallery.length > 0) {
      const currentImg = filteredGallery[selectedImageIndex];
      if (currentImg) {
        markPhotoAsViewed(currentImg.id);
        preloadImageAsync(currentImg.url);
      }
      const nextIdx = (selectedImageIndex + 1) % filteredGallery.length;
      const prevIdx = (selectedImageIndex - 1 + filteredGallery.length) % filteredGallery.length;
      if (filteredGallery[nextIdx]?.url) preloadImageAsync(filteredGallery[nextIdx].url);
      if (filteredGallery[prevIdx]?.url) preloadImageAsync(filteredGallery[prevIdx].url);
    }
  }, [selectedImageIndex, filteredGallery, markPhotoAsViewed]);

  // Auto-play slideshow effect inside Lightbox with configurable speed
  useEffect(() => {
    if (!isAutoPlayActive || selectedImageIndex === null || filteredGallery.length === 0) return;
    const timer = setInterval(() => {
      setSelectedImageIndex(prev => {
        if (prev === null) return null;
        return (prev + 1) % filteredGallery.length;
      });
    }, slideshowSpeed);
    return () => clearInterval(timer);
  }, [isAutoPlayActive, selectedImageIndex, filteredGallery, slideshowSpeed]);

  const [showRightClickModal, setShowRightClickModal] = useState(false);

  // Auto-hide right click modal when mouse button is released
  useEffect(() => {
    if (!showRightClickModal) return;
    const handleMouseUp = () => {
      setShowRightClickModal(false);
    };
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('pointerup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('pointerup', handleMouseUp);
    };
  }, [showRightClickModal]);

  // Global right-click & drag protection and right-click copyright message
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && (
        target.tagName === 'IMG' || 
        target.closest('img') || 
        target.closest('.group') || 
        target.closest('figure') ||
        target.closest('[class*="slideshow"]') ||
        target.closest('[class*="lightbox"]') ||
        target.closest('div[class*="gallery"]')
      )) {
        if (siteSettings?.protectPhotos || siteSettings?.enableRightClickMessage !== false) {
          e.preventDefault();
          e.stopPropagation();
          if (siteSettings?.enableRightClickMessage !== false) {
            setShowRightClickModal(true);
          }
          return false;
        }
      }
    };
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target && (
        target.tagName === 'IMG' || 
        target.closest('img') || 
        target.closest('.group') || 
        target.closest('figure') ||
        target.closest('[class*="slideshow"]') ||
        target.closest('[class*="lightbox"]') ||
        target.closest('div[class*="gallery"]')
      )) {
        if (siteSettings?.protectPhotos) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    };
    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('dragstart', handleDragStart, true);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('dragstart', handleDragStart, true);
    };
  }, [siteSettings?.protectPhotos, siteSettings?.enableRightClickMessage]);
  
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
    setPanOffset({ x: 0, y: 0 });
    setSwipeHintVisible(true);
    setTimeout(() => {
      setSwipeHintVisible(false);
    }, 4000);
  };

  useEffect(() => {
    if (selectedImageIndex !== null && filteredGallery[selectedImageIndex]) {
      const img = filteredGallery[selectedImageIndex];
      if (img && img.id) {
        const incrementView = async () => {
          try {
            const { doc, updateDoc, increment } = await import('firebase/firestore');
            const imgRef = doc(db, 'images', String(img.id));
            await updateDoc(imgRef, {
              views: increment(1)
            });
          } catch (err) {
            console.error("Error incrementing view count:", err);
          }
        };
        incrementView();
      }
    }
  }, [selectedImageIndex]);

  const closeLightbox = () => {
    setSelectedImageIndex(null);
    const initialZoom = Number(siteSettings?.defaultZoomLevel) || 100;
    setZoomLevel(initialZoom);
    setPanOffset({ x: 0, y: 0 });
    setShowExifPanel(false);
    setShowShortcutsModal(false);
    setHideLightboxControls(false);
    setTouchStart(null);
    setTouchDelta({ x: 0, y: 0 });
  };

  const nextImage = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedImageIndex !== null && filteredGallery.length > 0) {
      setSelectedImageIndex((selectedImageIndex + 1) % filteredGallery.length);
      setPanOffset({ x: 0, y: 0 });
    }
  }, [selectedImageIndex, filteredGallery.length]);

  const prevImage = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedImageIndex !== null && filteredGallery.length > 0) {
      setSelectedImageIndex((selectedImageIndex - 1 + filteredGallery.length) % filteredGallery.length);
      setPanOffset({ x: 0, y: 0 });
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

  // SEO and Head Configuration
  useEffect(() => {
    if (!siteSettings) return;

    // Update Title
    if (siteSettings.seoTitle) {
      document.title = siteSettings.seoTitle;
    } else if (siteSettings.siteName) {
      document.title = siteSettings.siteName.replace('\n', ' ');
    }

    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    if (siteSettings.seoDescription) {
      metaDesc.setAttribute('content', siteSettings.seoDescription);
    }

    // Update Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    if (siteSettings.seoKeywords) {
      metaKeywords.setAttribute('content', siteSettings.seoKeywords);
    }

    // Apply Custom CSS
    if (siteSettings.customCss) {
      let styleTag = document.getElementById('user-custom-css');
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'user-custom-css';
        document.head.appendChild(styleTag);
      }
      styleTag.textContent = siteSettings.customCss;
    } else {
      const styleTag = document.getElementById('user-custom-css');
      if (styleTag) styleTag.remove();
    }

  }, [siteSettings]);

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
        } else if (e.key === 'p' || e.key === 'P') {
          setIsAutoPlayActive(prev => !prev);
        } else if (e.key === 'z' || e.key === 'Z') {
          setShowZenMode(prev => !prev);
        } else if (e.key === 'h' || e.key === 'H') {
          setHideLightboxControls(prev => !prev);
        } else if (e.key === '?') {
          setShowShortcutsModal(prev => !prev);
        }
      } else {
        // Global view navigation shortcuts when modal/lightbox is closed
        if (e.key === '?' || e.key === 'h' || e.key === 'H') {
          setShowShortcutsModal(prev => !prev);
        } else if (e.key === 'z' || e.key === 'Z') {
          setShowZenMode(prev => !prev);
        } else if (e.key === 'g' || e.key === 'G') {
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

  const rootCssVars = useMemo(() => {
    const nameSize = siteSettings?.siteNameFontSize || 16;
    const msgSize = siteSettings?.messageFontSize || 13;
    const slideTitle = siteSettings?.slideshowTitleSize || '48px';
    const slideSub = siteSettings?.slideshowSubtitleSize || '12px';
    const slideCtrl = siteSettings?.slideshowControlsSize || '11px';
    const lbTitle = siteSettings?.lightboxTitleSize || '18px';
    const lbSub = siteSettings?.lightboxSubtitleSize || '12px';
    const lbCat = siteSettings?.lightboxCategorySize || '11px';
    const rcSize = siteSettings?.rightClickSize || '13px';
    const rcNum = parseFloat(rcSize.replace('px', '')) || 13;

    return {
      '--site-name-size': `${nameSize}px`,
      '--site-name-mobile-size': `${Math.max(12, nameSize * 0.8)}px`,
      '--message-font-size': `${msgSize}px`,
      '--message-font-mobile-size': `${Math.max(10, msgSize - 1)}px`,
      '--slideshow-title-size': slideTitle.includes('px') || slideTitle.includes('rem') ? slideTitle : `${slideTitle}px`,
      '--slideshow-subtitle-size': slideSub.includes('px') || slideSub.includes('rem') ? slideSub : `${slideSub}px`,
      '--slideshow-controls-size': slideCtrl.includes('px') || slideCtrl.includes('rem') ? slideCtrl : `${slideCtrl}px`,
      '--lightbox-category-size': lbCat.includes('px') || lbCat.includes('rem') ? lbCat : `${lbCat}px`,
      '--lightbox-title-size': lbTitle.includes('px') || lbTitle.includes('rem') ? lbTitle : `${lbTitle}px`,
      '--lightbox-subtitle-size': lbSub.includes('px') || lbSub.includes('rem') ? lbSub : `${lbSub}px`,
      '--right-click-size': rcSize.includes('px') || rcSize.includes('rem') ? rcSize : `${rcSize}px`,
      '--right-click-sub-size': `${rcNum * 0.85}px`,
    } as React.CSSProperties;
  }, [siteSettings]);

  const globalStyle = {
    color: siteSettings?.globalColor || '#4a4a4a',
    fontFamily: getFontFamily(siteSettings?.globalFont),
    letterSpacing: siteSettings?.globalLetterSpacing || '0px',
    ...rootCssVars,
  };

  const menuStyle = {
    color: siteSettings?.menuColor || '#7a7a7a',
    fontFamily: getFontFamily(siteSettings?.menuFont),
    letterSpacing: siteSettings?.menuLetterSpacing || '0px',
    ...getTextStyleProps(siteSettings?.menuTextStyle)
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
        {!cookiesAccepted && siteSettings?.enableCookieConsent !== false && (
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

      {/* Maintenance Mode Overlay */}
      <AnimatePresence>
        {siteSettings?.maintenanceMode && !isAdminUnlocked && activeView !== 'admin' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-[#fafafa]"
          >
            <div className="text-center space-y-6 max-w-lg">
              <h1 className="font-serif text-3xl md:text-5xl text-[#1a1a1a]">
                Em Manutenção
              </h1>
              <p className="text-[#8e8a82] font-sans text-sm md:text-base leading-relaxed">
                Este espaço encontra-se temporariamente indisponível para atualização de conteúdos. Por favor, volte mais tarde.
              </p>
              <button 
                onClick={() => setActiveView('admin')}
                className="mt-8 px-6 py-3 border border-[#e2ddd5] text-[#8e8a82] text-[10px] tracking-widest uppercase hover:text-[#1a1a1a] hover:border-[#1a1a1a] transition-all font-semibold"
              >
                Acesso Reservado
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Header/Nav */}
      <div className={`flex-shrink-0 z-40 bg-[#fafafa] border-b border-[#4a4a4a]/10 px-6 py-4 flex items-center justify-between ${isMobileLandscape ? 'flex' : 'md:hidden'}`}>
        <div 
          className="typography-site-name-mobile"
          style={{ 
            color: siteSettings?.siteNameColor || '#4a4a4a',
            fontFamily: getFontFamily(siteSettings?.siteNameFont),
            letterSpacing: siteSettings?.siteNameLetterSpacing || '0px',
            ...getTextStyleProps(siteSettings?.siteNameTextStyle)
          }}
        >
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
                    fontSize: `${Math.max(10, (siteSettings?.siteNameFontSize || 16) * 0.6)}px`,
                    fontFamily: getFontFamily(siteSettings?.siteNameFont),
                    ...getTextStyleProps(siteSettings?.siteNameTextStyle)
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
                    fontSize: `${Math.max(12, (siteSettings?.siteNameFontSize || 16) * 0.8)}px`,
                    fontFamily: getFontFamily(siteSettings?.siteNameFont),
                    ...getTextStyleProps(siteSettings?.siteNameTextStyle)
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
                        className="text-xs italic text-[#7a7a7a] leading-relaxed max-w-xs mx-auto"
                        style={{ 
                          fontSize: `${Math.max(10, (siteSettings?.messageFontSize || 13) - 1)}px`,
                          fontFamily: getFontFamily(siteSettings?.messageFont),
                          ...getTextStyleProps(siteSettings?.messageTextStyle)
                        }}
                      >
                        "{siteSettings.welcomeMessage}"
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Overlay Footer */}
                <div 
                  className="px-6 pt-4 text-center text-[#7a7a7a]/60 text-[9px] tracking-[0.05em] font-sans border-t border-[#4a4a4a]/5 flex flex-col items-center"
                  style={{ paddingBottom: siteSettings?.footerBottomSpacing !== undefined ? `${siteSettings.footerBottomSpacing}px` : '32px' }}
                >
                  {/* Social Network Icons */}
                  {(siteSettings?.instagram || siteSettings?.facebook || siteSettings?.twitter) && (
                    <div className="flex items-center justify-center gap-4 mb-3 text-[#4a4a4a]">
                      {siteSettings?.instagram && (
                        <a 
                          href={siteSettings.instagram.startsWith('http') ? siteSettings.instagram : `https://${siteSettings.instagram}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:text-[#1a1a1a] transition-colors p-1" 
                          title="Instagram"
                        >
                          <Instagram className="w-4 h-4 stroke-[1.5]" />
                        </a>
                      )}
                      {siteSettings?.facebook && (
                        <a 
                          href={siteSettings.facebook.startsWith('http') ? siteSettings.facebook : `https://${siteSettings.facebook}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:text-[#1a1a1a] transition-colors p-1" 
                          title="Facebook"
                        >
                          <Facebook className="w-4 h-4 stroke-[1.5]" />
                        </a>
                      )}
                      {siteSettings?.twitter && (
                        <a 
                          href={siteSettings.twitter.startsWith('http') ? siteSettings.twitter : `https://${siteSettings.twitter}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:text-[#1a1a1a] transition-colors p-1" 
                          title="Twitter / X"
                        >
                          <Twitter className="w-4 h-4 stroke-[1.5]" />
                        </a>
                      )}
                    </div>
                  )}

                  <p className="mb-1">{siteSettings.footerText || `© ${new Date().getFullYear()} — Todos os direitos reservados.`}</p>
                  <p className="text-[8px] opacity-80 leading-relaxed max-w-xs mx-auto">O conteúdo e as imagens não podem ser reproduzidos de qualquer forma sem o consentimento do autor.</p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <DesktopSidebar
        siteSettings={siteSettings}
        activeView={activeView}
        setActiveView={setActiveView}
        isMobileLandscape={isMobileLandscape}
        menuStyle={menuStyle}
        navItemClass={navItemClass}
      />
      {/* Main Content Area */}
      <main className="flex-1 min-h-0 md:h-full relative overflow-hidden bg-[#f0f0f0]">
        {activeView === 'inicio' ? (
          <div 
            className="w-full h-full flex items-center justify-center relative overflow-hidden transition-all duration-300"
            style={{ 
              padding: `${siteSettings?.slideshowTopMargin !== undefined ? siteSettings.slideshowTopMargin : 0}px` 
            }}
          >
            <SlideshowView 
              galleryImages={galleryImages}
              slideIndex={slideIndex}
              siteSettings={siteSettings}
              slideshowAspects={slideshowAspects}
              setSlideshowAspects={setSlideshowAspects}
              slideshowContainerSize={slideshowContainerSize}
              slideshowContainerRef={slideshowContainerRef}
              isMobileLandscape={isMobileLandscape}
              setActiveView={setActiveView}
              isAdminUnlocked={isAdminUnlocked}
            />
          </div>
        ) : activeView === 'galeria' ? (
          siteSettings?.separateFooterDiv ? (
            <div className="w-full h-full flex flex-col overflow-hidden">
              {/* Upper scrollable content container (2-div mode) */}
              <div 
                className="flex-1 w-full overflow-y-auto px-4 pb-6 sm:px-6 lg:px-8"
                style={{ paddingTop: siteSettings?.mainTitleTopMargin !== undefined ? `${siteSettings.mainTitleTopMargin}px` : '32px' }}
              >
                <div className="w-full mx-auto flex flex-col">
                  {renderGalleryHeader()}
                  
                  {galleryImages.length > 0 ? (
                    <>
                      {renderGalleryControls()}

                      <GalleryGrid 
                        images={filteredGallery} 
                        onImageClick={openLightbox} 
                        viewedPhotos={viewedPhotos}
                        onOpenZenMode={() => setShowZenMode(true)}
                        protectPhotos={siteSettings?.protectPhotos}
                        showCaptions={siteSettings?.showCaptions}
                        captionPosition={siteSettings?.captionPosition}
                        enableWatermark={siteSettings?.enableWatermark}
                        watermarkText={siteSettings?.watermarkText}
                        watermarkPosition={siteSettings?.watermarkPosition}
                        enableFavorites={siteSettings?.enableFavorites}
                        enableGallerySearch={siteSettings?.enableGallerySearch}
                        enablePhotoComparison={siteSettings?.enablePhotoComparison}
                        enableMonochromeToggle={siteSettings?.enableMonochromeToggle}
                        enablePhotoLikes={siteSettings?.enablePhotoLikes}
                        thumbnailSize={siteSettings?.thumbnailSize}
                        isMonochrome={isMonochrome}
                        setIsMonochrome={setIsMonochrome}
                        showOnlyFavorites={showOnlyFavorites}
                        setShowOnlyFavorites={setShowOnlyFavorites}
                        favorites={favorites}
                        setFavorites={setFavorites}
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
              </div>

              {/* Separate fixed bottom Footer div */}
              <div className="w-full flex-shrink-0 border-t border-[#4a4a4a]/10 bg-[#f7f5f0]/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-2.5 z-10">
                <Footer 
                  activeView={activeView} 
                  setActiveView={setActiveView} 
                  settings={siteSettings} 
                  onOpenTerms={() => setShowTermsModal(true)} 
                />
              </div>
            </div>
          ) : (
            <div 
              className="w-full h-full overflow-y-auto px-4 pb-6 sm:px-6 lg:px-8 flex flex-col"
              style={{ paddingTop: siteSettings?.mainTitleTopMargin !== undefined ? `${siteSettings.mainTitleTopMargin}px` : '32px' }}
            >
              {/* Single scrollable container mode */}
              <div className="w-full mx-auto flex flex-col flex-1">
                {renderGalleryHeader()}
                
                {galleryImages.length > 0 ? (
                  <>
                    {renderGalleryControls()}

                    <GalleryGrid 
                      images={filteredGallery} 
                      onImageClick={openLightbox} 
                      viewedPhotos={viewedPhotos}
                      onOpenZenMode={() => setShowZenMode(true)}
                      protectPhotos={siteSettings?.protectPhotos}
                      showCaptions={siteSettings?.showCaptions}
                      captionPosition={siteSettings?.captionPosition}
                      enableWatermark={siteSettings?.enableWatermark}
                      watermarkText={siteSettings?.watermarkText}
                      watermarkPosition={siteSettings?.watermarkPosition}
                      enableFavorites={siteSettings?.enableFavorites}
                      enableGallerySearch={siteSettings?.enableGallerySearch}
                      enablePhotoComparison={siteSettings?.enablePhotoComparison}
                      enableMonochromeToggle={siteSettings?.enableMonochromeToggle}
                      enablePhotoLikes={siteSettings?.enablePhotoLikes}
                      thumbnailSize={siteSettings?.thumbnailSize}
                      isMonochrome={isMonochrome}
                      setIsMonochrome={setIsMonochrome}
                      showOnlyFavorites={showOnlyFavorites}
                      setShowOnlyFavorites={setShowOnlyFavorites}
                      favorites={favorites}
                      setFavorites={setFavorites}
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

              {/* Footer inside main scrollable div */}
              <div className="w-full mt-10 pt-4 border-t border-[#4a4a4a]/10 flex-shrink-0">
                <Footer 
                  activeView={activeView} 
                  setActiveView={setActiveView} 
                  settings={siteSettings} 
                  onOpenTerms={() => setShowTermsModal(true)} 
                />
              </div>
            </div>
          )
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
          <Lightbox
            selectedImageIndex={selectedImageIndex}
            filteredGallery={filteredGallery}
            siteSettings={siteSettings}
            onClose={closeLightbox}
            onNext={nextImage}
            onPrev={prevImage}
            showToast={showToast}
            toggleFullScreen={toggleFullScreen}
          />
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

      {/* Right Click Copyright Overlay */}
      <AnimatePresence>
        {showRightClickModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[400] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 pointer-events-none"
          >
            <div
              className="max-w-xs w-full px-5 py-3 rounded shadow-2xl border border-white/20 text-center flex flex-col items-center gap-1.5 pointer-events-auto"
              style={{
                backgroundColor: siteSettings?.rightClickBgColor || 'rgba(0, 0, 0, 0.85)',
                fontFamily: getFontFamily(siteSettings?.rightClickFont || 'Plus Jakarta Sans — sans-serif limpo moderno'),
                color: siteSettings?.rightClickColor || '#ffffff',
              }}
            >
              <h4 className="typography-right-click-title" style={{ 
                letterSpacing: siteSettings?.rightClickTitleLetterSpacing || '1px',
                ...getTextStyleProps(siteSettings?.rightClickTitleStyle)
              }}>
                {siteSettings?.rightClickTitle || 'Copyright © 2026'}
              </h4>
              <p className="opacity-90 typography-right-click-subtitle" style={{
                letterSpacing: siteSettings?.rightClickSubtitleLetterSpacing || '0px',
                ...getTextStyleProps(siteSettings?.rightClickSubtitleStyle)
              }}>
                {siteSettings?.rightClickSubtitle || 'manuelfrancisco. Todos os direitos reservados'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Toast Notification Overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-[500] bg-black/90 backdrop-blur-md text-white px-4 py-2.5 rounded-full border border-white/20 shadow-2xl flex items-center gap-2 text-xs font-sans tracking-wide pointer-events-none"
          >
            <CheckCircle2 size={15} className="text-[#c8b89e]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Standalone Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {selectedImageIndex === null && showShortcutsModal && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShortcutsModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-[410] bg-black/90 backdrop-blur-xl text-white p-6 rounded-2xl border border-white/20 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-white/15">
                <span className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2">
                  <Keyboard size={18} className="text-[#c8b89e]" /> Atalhos do Teclado
                </span>
                <button
                  onClick={() => setShowShortcutsModal(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/50 mb-2 font-bold">Navegação e Modos</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <kbd className="px-2 py-0.5 bg-white/15 rounded border border-white/20 font-mono text-[10px]">G</kbd>
                      <span className="text-white/80">Galeria</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <kbd className="px-2 py-0.5 bg-white/15 rounded border border-white/20 font-mono text-[10px]">I</kbd>
                      <span className="text-white/80">Início</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <kbd className="px-2 py-0.5 bg-white/15 rounded border border-white/20 font-mono text-[10px]">B</kbd>
                      <span className="text-white/80">Biografia</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <kbd className="px-2 py-0.5 bg-white/15 rounded border border-white/20 font-mono text-[10px]">L</kbd>
                      <span className="text-white/80">Livro Visitas</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <kbd className="px-2 py-0.5 bg-white/15 rounded border border-white/20 font-mono text-[10px]">C</kbd>
                      <span className="text-white/80">Contacto</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <kbd className="px-2 py-0.5 bg-white/15 rounded border border-white/20 font-mono text-[10px]">Z</kbd>
                      <span className="text-white/80">Modo Zen</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <kbd className="px-2 py-0.5 bg-white/15 rounded border border-white/20 font-mono text-[10px]">P</kbd>
                      <span className="text-white/80">Apresentação</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <kbd className="px-2 py-0.5 bg-white/15 rounded border border-white/20 font-mono text-[10px]">?</kbd>
                      <span className="text-white/80">Guia Atalhos</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 text-center">
                  <p className="text-[10px] text-white/60">
                    Pressione <kbd className="px-1.5 py-0.5 bg-white/20 rounded font-mono text-[10px]">Esc</kbd> ou <kbd className="px-1.5 py-0.5 bg-white/20 rounded font-mono text-[10px]">?</kbd> para fechar.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
