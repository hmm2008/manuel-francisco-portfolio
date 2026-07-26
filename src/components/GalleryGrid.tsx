import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, ChevronRight, Search, Heart, SlidersHorizontal, 
  X, Columns, Camera, Check, Eye, RectangleHorizontal, RectangleVertical, Square, Tv
} from 'lucide-react';
import { getWatermarkClasses } from '../utils/watermarkUtils';
import { ImageProps } from '../types';

interface GalleryCardProps {
  image: ImageProps;
  index: number;
  isMobile: boolean;
  isMonochrome: boolean;
  isViewed?: boolean;
  protectPhotos?: boolean;
  enableWatermark?: boolean;
  watermarkPosition?: string;
  watermarkText?: string;
  enablePhotoLikes?: boolean;
  enableFavorites?: boolean;
  enablePhotoComparison?: boolean;
  showCaptions?: string;
  captionPosition?: string;
  isFav: boolean;
  isComp: boolean;
  isLiked: boolean;
  likesCount: number;
  itemSize?: number;
  itemsPerPage?: number;
  onImageClick: (idx: number) => void;
  onToggleLike: (e: React.MouseEvent, id: string | number) => void;
  onToggleFavorite: (e: React.MouseEvent, id: string | number) => void;
  onToggleComparison: (e: React.MouseEvent, id: string | number) => void;
}

const GalleryCard = React.memo(function GalleryCard({
  image,
  index,
  isMobile,
  isMonochrome,
  isViewed,
  protectPhotos,
  enableWatermark,
  watermarkPosition = 'bottom-left',
  watermarkText = '© Manuel Francisco',
  enablePhotoLikes = true,
  enableFavorites = true,
  enablePhotoComparison = true,
  showCaptions,
  captionPosition,
  isFav,
  isComp,
  isLiked,
  likesCount,
  itemSize,
  itemsPerPage = 8,
  onImageClick,
  onToggleLike,
  onToggleFavorite,
  onToggleComparison,
}: GalleryCardProps) {
  const handleCardClick = () => {
    onImageClick(index);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (protectPhotos) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (isMobile) {
    return (
      <motion.div
        key={image.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.2) }}
        className="bg-[#dcd7cf]/40 border border-[#1a1a1a]/5 hover:border-[#1a1a1a]/20 cursor-pointer relative group overflow-hidden rounded-sm aspect-square flex items-center justify-center"
        onContextMenu={handleContextMenu}
        onClick={handleCardClick}
      >
        <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105 flex items-center justify-center p-0">
          <img
            src={image.url}
            alt={image.alt || image.title || 'Fotografia'}
            loading={index < 6 ? "eager" : "lazy"}
            decoding="async"
            style={{ filter: isMonochrome ? 'grayscale(100%) contrast(108%)' : 'none' }}
            className={`w-full h-full object-cover ${
              protectPhotos ? 'pointer-events-none select-none' : ''
            }`}
            onContextMenu={handleContextMenu}
            referrerPolicy="no-referrer"
          />
          {enableWatermark && (
            <div className={getWatermarkClasses(watermarkPosition, false)}>
              {watermarkText}
            </div>
          )}
        </div>

        {/* Viewed Indicator */}
        {isViewed && (
          <div className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded-full bg-black/60 text-amber-300 text-[8px] font-mono flex items-center gap-0.5 backdrop-blur-xs">
            <Eye size={9} />
          </div>
        )}

        {/* Action Icons (Favorite, Comparison, Likes) */}
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10">
          {enablePhotoLikes && (
            <button 
              onClick={(e) => onToggleLike(e, image.id)}
              className={`px-1.5 py-1 rounded-full text-[9px] font-mono flex items-center gap-1 transition-all backdrop-blur-md ${
                isLiked ? 'bg-amber-500 text-black font-bold' : 'bg-black/40 text-white/90 hover:bg-black/70'
              }`}
              title="Gosto nesta foto"
            >
              <Heart size={10} className={isLiked ? 'fill-black' : ''} />
              <span>{likesCount}</span>
            </button>
          )}

          {enableFavorites && (
            <button 
              onClick={(e) => onToggleFavorite(e, image.id)}
              className={`p-1.5 rounded-full transition-all backdrop-blur-md ${
                isFav ? 'bg-rose-600 text-white' : 'bg-black/30 text-white/80 hover:bg-black/60'
              }`}
              title="Guardar nos Favoritos"
            >
              <Heart size={11} className={isFav ? 'fill-white' : ''} />
            </button>
          )}

          {enablePhotoComparison && (
            <button 
              onClick={(e) => onToggleComparison(e, image.id)}
              className={`p-1.5 rounded-full transition-all backdrop-blur-md ${
                isComp ? 'bg-amber-500 text-black font-bold' : 'bg-black/30 text-white/80 hover:bg-black/60'
              }`}
              title="Selecionar para Comparação Lado a Lado"
            >
              <Columns size={11} />
            </button>
          )}
        </div>

        {showCaptions !== 'Oculto' && (
          <div className={`${getWatermarkClasses(captionPosition || 'bottom-center', false)} flex flex-col transition-opacity ${
            showCaptions === 'Sempre' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            <span className="font-bold">{image.title}</span>
            {image.subtitle && <span className="text-[0.8em] opacity-80 mt-0.5">{image.subtitle}</span>}
          </div>
        )}
      </motion.div>
    );
  }

  // DESKTOP CARD
  return (
    <motion.div
      key={image.id}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.2 }}
      style={{ width: `${itemSize}px`, height: `${itemSize}px` }}
      className="bg-[#dcd7cf]/40 border border-[#1a1a1a]/5 hover:border-[#1a1a1a]/20 cursor-zoom-in relative group overflow-hidden rounded-sm flex items-center justify-center transition-colors"
      onContextMenu={handleContextMenu}
      onClick={handleCardClick}
      title={`${image.title || ''}${image.subtitle ? ` - ${image.subtitle}` : ''}`}
    >
      <div className="absolute inset-0 transition-transform duration-400 ease-out group-hover:scale-105 flex items-center justify-center p-0">
        <img
          src={image.url}
          alt={image.alt || image.title || 'Fotografia'}
          loading={index < itemsPerPage ? "eager" : "lazy"}
          decoding="async"
          style={{ filter: isMonochrome ? 'grayscale(100%) contrast(108%)' : 'none' }}
          className={`w-full h-full object-cover ${
            protectPhotos ? 'pointer-events-none select-none' : ''
          }`}
          onContextMenu={handleContextMenu}
          referrerPolicy="no-referrer"
        />
        {enableWatermark && (
          <div className={getWatermarkClasses(watermarkPosition, false)}>
            {watermarkText}
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />

      {/* Viewed Indicator */}
      {isViewed && (
        <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-black/40 text-amber-300 text-[9px] font-mono uppercase tracking-wider flex items-center gap-1 backdrop-blur-xs transition-all" title="Fotografia visualizada nesta sessão">
          <Eye size={10} />
          <span className="hidden group-hover:inline text-white/90 text-[8px]">Vista</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {enablePhotoLikes && (
          <button 
            onClick={(e) => onToggleLike(e, image.id)}
            className={`px-2 py-1 rounded-full text-[10px] font-mono flex items-center gap-1 transition-all backdrop-blur-md shadow-sm ${
              isLiked ? 'bg-amber-400 text-black font-bold' : 'bg-black/40 text-white/90 hover:bg-black/70'
            }`}
            title="Gosto nesta foto"
          >
            <Heart size={11} className={isLiked ? 'fill-black' : ''} />
            <span>{likesCount}</span>
          </button>
        )}

        {enableFavorites && (
          <button 
            onClick={(e) => onToggleFavorite(e, image.id)}
            className={`p-1.5 rounded-full transition-all backdrop-blur-md shadow-sm ${
              isFav ? 'bg-rose-600 text-white opacity-100' : 'bg-black/40 text-white/90 hover:bg-rose-600 hover:text-white'
            }`}
            title={isFav ? "Remover dos Favoritos" : "Guardar nos Favoritos"}
          >
            <Heart size={12} className={isFav ? 'fill-white' : ''} />
          </button>
        )}

        {enablePhotoComparison && (
          <button 
            onClick={(e) => onToggleComparison(e, image.id)}
            className={`p-1.5 rounded-full transition-all backdrop-blur-md shadow-sm ${
              isComp ? 'bg-amber-400 text-black font-bold opacity-100' : 'bg-black/40 text-white/90 hover:bg-amber-400 hover:text-black'
            }`}
            title="Comparar Fotografias Lado a Lado"
          >
            <Columns size={12} />
          </button>
        )}
      </div>

      {showCaptions !== 'Oculto' && (
        <div className={`${getWatermarkClasses(captionPosition || 'bottom-center', false)} flex flex-col transition-opacity ${
          showCaptions === 'Sempre' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <span className="font-bold">{image.title}</span>
          {image.subtitle && <span className="text-[0.8em] opacity-80 mt-0.5">{image.subtitle}</span>}
        </div>
      )}
    </motion.div>
  );
});

interface GalleryGridProps {
  images: ImageProps[];
  onImageClick: (filteredIndex: number) => void;
  viewedPhotos?: string[];
  protectPhotos?: boolean;
  showCaptions?: string;
  captionPosition?: string;
  enableWatermark?: boolean;
  watermarkText?: string;
  watermarkPosition?: string;
  enableFavorites?: boolean;
  enableGallerySearch?: boolean;
  enablePhotoComparison?: boolean;
  enableMonochromeToggle?: boolean;
  enablePhotoLikes?: boolean;
  thumbnailSize?: string;
  onOpenZenMode?: () => void;
  isMonochrome?: boolean;
  setIsMonochrome?: (v: boolean) => void;
  showOnlyFavorites?: boolean;
  setShowOnlyFavorites?: (v: boolean) => void;
  favorites?: string[];
  setFavorites?: React.Dispatch<React.SetStateAction<string[]>>;
}

function GalleryGrid({ 
  images, 
  onImageClick, 
  viewedPhotos = [],
  protectPhotos, 
  showCaptions,
  captionPosition,
  enableWatermark,
  watermarkText = '© Manuel Francisco',
  watermarkPosition = 'bottom-left',
  enableFavorites = true,
  enableGallerySearch = true,
  enablePhotoComparison = true,
  enableMonochromeToggle = true,
  enablePhotoLikes = true,
  thumbnailSize = '160 px',
  onOpenZenMode,
  isMonochrome: propIsMonochrome,
  setIsMonochrome: propSetIsMonochrome,
  showOnlyFavorites: propShowOnlyFavorites,
  setShowOnlyFavorites: propSetShowOnlyFavorites,
  favorites: propFavorites,
  setFavorites: propSetFavorites
}: GalleryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [currentPage, setCurrentPage] = useState(0);

  // Search, Sort, Monochrome, Orientation & Favorites state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'title-asc' | 'title-desc'>('recent');
  const [selectedOrientation, setSelectedOrientation] = useState<'all' | 'landscape' | 'portrait' | 'square'>('all');
  
  const [localShowOnlyFavorites, setLocalShowOnlyFavorites] = useState(false);
  const showOnlyFavorites = propShowOnlyFavorites !== undefined ? propShowOnlyFavorites : localShowOnlyFavorites;
  const setShowOnlyFavorites = propSetShowOnlyFavorites || setLocalShowOnlyFavorites;

  const [localIsMonochrome, setLocalIsMonochrome] = useState(false);
  const isMonochrome = propIsMonochrome !== undefined ? propIsMonochrome : localIsMonochrome;
  const setIsMonochrome = propSetIsMonochrome || setLocalIsMonochrome;

  const [localFavorites, setLocalFavorites] = useState<string[]>(() => {
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
  const favorites = propFavorites !== undefined ? propFavorites : localFavorites;
  const setFavorites = propSetFavorites || setLocalFavorites;

  const [photoLikes, setPhotoLikes] = useState<Record<string, number>>({});
  const [userLikedPhotos, setUserLikedPhotos] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('gallery_user_liked_photos');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const toggleLike = useCallback((e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    const strId = String(id);
    const alreadyLiked = userLikedPhotos.includes(strId);
    
    setUserLikedPhotos(prev => {
      const next = alreadyLiked ? prev.filter(i => i !== strId) : [...prev, strId];
      try {
        localStorage.setItem('gallery_user_liked_photos', JSON.stringify(next));
      } catch (err) {}
      return next;
    });

    setPhotoLikes(prev => ({
      ...prev,
      [strId]: Math.max(0, (prev[strId] || 0) + (alreadyLiked ? -1 : 1))
    }));
  }, [userLikedPhotos]);

  // Photo Comparison state
  const [comparisonIds, setComparisonIds] = useState<(string | number)[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      const isLandscape = window.innerWidth > window.innerHeight && window.innerHeight < 600;
      return window.innerWidth < 768 || isLandscape;
    }
    return false;
  });

  const [windowHeight, setWindowHeight] = useState(() => {
    if (typeof window !== 'undefined') return window.innerHeight;
    return 800;
  });

  // Track window size for mobile vs desktop switch & window height
  useEffect(() => {
    let timeoutId: number;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        const isLandscape = window.innerWidth > window.innerHeight && window.innerHeight < 600;
        setIsMobile(window.innerWidth < 768 || isLandscape);
        setWindowHeight(window.innerHeight);
      }, 100);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gallery_user_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Error saving favorites', e);
    }
  }, [favorites]);

  const toggleFavorite = useCallback((e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    const strId = String(id);
    setFavorites(prev => 
      prev.includes(strId) ? prev.filter(f => f !== strId) : [...prev, strId]
    );
  }, []);

  const toggleComparison = useCallback((e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    setComparisonIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  }, []);

  // Filter and Sort Images
  const processedImages = useMemo(() => {
    let result = [...images];

    if (showOnlyFavorites) {
      result = result.filter(img => favorites.includes(String(img.id)));
    }

    if (selectedOrientation !== 'all') {
      result = result.filter(img => {
        if (img.orientation) return img.orientation === selectedOrientation;
        const isPortrait = img.url.includes('portrait') || (img.title && img.title.toLowerCase().includes('vertical'));
        const isSquare = img.url.includes('square') || (img.title && img.title.toLowerCase().includes('quadrado'));
        if (selectedOrientation === 'portrait') return isPortrait;
        if (selectedOrientation === 'square') return isSquare;
        if (selectedOrientation === 'landscape') return !isPortrait && !isSquare;
        return true;
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(img => 
        img.title?.toLowerCase().includes(query) ||
        img.subtitle?.toLowerCase().includes(query) ||
        img.category?.toLowerCase().includes(query) ||
        img.alt?.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'title-asc') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'title-desc') return (b.title || '').localeCompare(a.title || '');
      if (sortBy === 'oldest') return Number(a.id) - Number(b.id);
      return Number(b.id) - Number(a.id);
    });

    return result;
  }, [images, searchQuery, sortBy, showOnlyFavorites, selectedOrientation, favorites]);

  // Monitor container width only (avoiding height measurement feedback loops)
  useEffect(() => {
    if (!containerRef.current || isMobile) return;
    
    let timeoutId: number;
    const handleResize = (entries: ResizeObserverEntry[]) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        for (const entry of entries) {
          const { width } = entry.contentRect;
          if (width > 0) {
            setDimensions(prev => (prev.width === width ? prev : { ...prev, width }));
          }
        }
      }, 50);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);
    
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width > 0) {
      setDimensions(prev => ({ ...prev, width: rect.width }));
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [isMobile]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, sortBy, showOnlyFavorites, selectedOrientation, images]);

  const gap = 16;

  const targetSize = useMemo(() => {
    if (thumbnailSize) {
      const parsed = parseInt(thumbnailSize, 10);
      if (!isNaN(parsed)) return parsed;
    }
    return 160;
  }, [thumbnailSize]);

  const { cols, itemSize, rows, itemsPerPage } = useMemo(() => {
    const width = dimensions.width || (containerRef.current?.clientWidth ?? 800);

    if (width <= 0) {
      return { cols: 4, itemSize: 180, rows: 2, itemsPerPage: 8 };
    }
    
    let finalCols = Math.max(1, Math.floor((width + gap) / (targetSize + gap)));
    if (width < 500 && finalCols > 2) finalCols = 2;
    if (width < 350 && finalCols > 1) finalCols = 1;

    const minItemSize = Math.max(80, targetSize - 40);
    const maxItemSize = Math.min(500, targetSize + 60);

    const totalGapsWidth = (finalCols - 1) * gap;
    let widthBasedItemSize = Math.floor((width - totalGapsWidth) / finalCols);
    let finalItemSize = Math.max(minItemSize, Math.min(maxItemSize, widthBasedItemSize));

    // Calculate rows based on viewport height (windowHeight) minus top/bottom overheads (~280px)
    const availableGridHeight = Math.max(180, windowHeight - 280);
    let calcRows = Math.max(1, Math.floor((availableGridHeight + gap) / (finalItemSize + gap)));

    const totalItems = Math.max(1, finalCols * calcRows);

    return {
      cols: finalCols,
      itemSize: finalItemSize,
      rows: calcRows,
      itemsPerPage: totalItems
    };
  }, [dimensions.width, windowHeight, gap, targetSize]);

  const totalPages = Math.ceil(processedImages.length / itemsPerPage);
  const validPage = Math.min(Math.max(0, currentPage), Math.max(0, totalPages - 1));

  const pageImages = useMemo(() => {
    const start = validPage * itemsPerPage;
    return processedImages.slice(start, start + itemsPerPage);
  }, [processedImages, validPage, itemsPerPage]);

  const handlePrevPage = () => {
    if (validPage > 0) setCurrentPage(validPage - 1);
  };

  const handleNextPage = () => {
    if (validPage < totalPages - 1) setCurrentPage(validPage + 1);
  };

  const comparisonPhotos = useMemo(() => {
    return comparisonIds.map(id => images.find(img => String(img.id) === String(id))).filter(Boolean) as ImageProps[];
  }, [comparisonIds, images]);

  const handleImageCardClick = useCallback((indexInList: number) => {
    const imgObj = isMobile ? processedImages[indexInList] : pageImages[indexInList];
    if (imgObj) {
      const originalIdx = images.findIndex(i => i.id === imgObj.id);
      onImageClick(originalIdx >= 0 ? originalIdx : indexInList);
    }
  }, [isMobile, processedImages, pageImages, images, onImageClick]);

  return (
    <div id="gallery-grid-wrapper" className="w-full flex flex-col relative">
      
      {/* Top Utility Bar */}
      {(enableGallerySearch || enableFavorites || enablePhotoComparison) && (
        <div className="w-full flex flex-col gap-2.5 mb-4 pb-3 border-b border-[#4a4a4a]/10 text-xs font-sans">
          
          <div className="w-full flex flex-wrap items-center justify-between gap-3">
            {/* Search Bar */}
            {enableGallerySearch && (
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e8a82]" size={14} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar por título ou tema..."
                  className="w-full pl-8 pr-8 py-1.5 bg-white/60 border border-[#e2ddd5] rounded-full text-xs text-[#1a1a1a] placeholder-[#8e8a82] focus:outline-none focus:border-[#1a1a1a] focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8e8a82] hover:text-[#1a1a1a]"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-2 flex-wrap ml-auto">
              {enableGallerySearch && (
                <>
                  <div className="flex items-center gap-1 bg-white/60 border border-[#e2ddd5] px-2.5 py-1 rounded-full text-[10px]" title="Filtrar por Formato de Fotografia">
                    <select 
                      value={selectedOrientation}
                      onChange={(e) => setSelectedOrientation(e.target.value as any)}
                      className="bg-transparent text-[#1a1a1a] font-sans font-medium focus:outline-none cursor-pointer uppercase tracking-wider text-[9px]"
                    >
                      <option value="all">Formato: Todos</option>
                      <option value="landscape">Horizontal (Paisagem)</option>
                      <option value="portrait">Vertical (Retrato)</option>
                      <option value="square">Quadrado</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1 bg-white/60 border border-[#e2ddd5] px-2 py-1 rounded-full text-[10px]">
                    <SlidersHorizontal size={12} className="text-[#8e8a82]" />
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent text-[#1a1a1a] font-sans font-medium focus:outline-none cursor-pointer uppercase tracking-wider text-[9px]"
                    >
                      <option value="recent">Mais Recentes</option>
                      <option value="oldest">Mais Antigas</option>
                      <option value="title-asc">Título (A - Z)</option>
                      <option value="title-desc">Título (Z - A)</option>
                    </select>
                  </div>
                </>
              )}

              {enablePhotoComparison && comparisonIds.length > 0 && (
                <button
                  onClick={() => setShowComparisonModal(true)}
                  className="px-3 py-1.5 bg-[#1a1a1a] text-white rounded-full text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 shadow-md hover:bg-black transition-all animate-bounce"
                >
                  <Columns size={12} />
                  <span>Comparar ({comparisonIds.length}/2)</span>
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Main Gallery Grid */}
      <div 
        ref={containerRef} 
        className="w-full min-h-[200px] flex items-center justify-center relative my-3"
      >
        {processedImages.length === 0 ? (
          <div className="text-center py-12 text-[#7a7a7a]/60 text-xs tracking-widest font-sans uppercase flex flex-col items-center gap-2">
            <span>Nenhuma fotografia encontrada com os filtros selecionados.</span>
            {(searchQuery || showOnlyFavorites) && (
              <button 
                onClick={() => { setSearchQuery(''); setShowOnlyFavorites(false); }}
                className="mt-2 text-[10px] underline hover:text-[#1a1a1a]"
              >
                Limpar filtros de pesquisa
              </button>
            )}
          </div>
        ) : isMobile ? (
          /* MOBILE SCROLLING GRID */
          <div 
            className="grid gap-3 w-full overflow-y-auto max-h-full pb-4"
            style={{
              gridTemplateColumns: `repeat(auto-fill, minmax(${Math.min(180, targetSize)}px, 1fr))`
            }}
          >
            {processedImages.map((image, index) => (
              <GalleryCard
                key={image.id}
                image={image}
                index={index}
                isMobile={true}
                isMonochrome={isMonochrome}
                isViewed={viewedPhotos.includes(String(image.id))}
                protectPhotos={protectPhotos}
                enableWatermark={enableWatermark}
                watermarkPosition={watermarkPosition}
                watermarkText={watermarkText}
                enablePhotoLikes={enablePhotoLikes}
                enableFavorites={enableFavorites}
                enablePhotoComparison={enablePhotoComparison}
                showCaptions={showCaptions}
                captionPosition={captionPosition}
                isFav={favorites.includes(String(image.id))}
                isComp={comparisonIds.includes(image.id)}
                isLiked={userLikedPhotos.includes(String(image.id))}
                likesCount={photoLikes[String(image.id)] || 0}
                onImageClick={handleImageCardClick}
                onToggleLike={toggleLike}
                onToggleFavorite={toggleFavorite}
                onToggleComparison={toggleComparison}
              />
            ))}
          </div>
        ) : (
          /* DESKTOP PAGINATED GRID */
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${Math.max(1, Math.ceil(pageImages.length / cols))}, ${itemSize}px)`,
              gap: `${gap}px`,
              justifyContent: 'center',
              alignContent: 'center',
              width: '100%'
            }}
          >
            <AnimatePresence mode="popLayout">
              {pageImages.map((image, index) => (
                <GalleryCard
                  key={image.id}
                  image={image}
                  index={index}
                  isMobile={false}
                  isMonochrome={isMonochrome}
                  isViewed={viewedPhotos.includes(String(image.id))}
                  protectPhotos={protectPhotos}
                  enableWatermark={enableWatermark}
                  watermarkPosition={watermarkPosition}
                  watermarkText={watermarkText}
                  enablePhotoLikes={enablePhotoLikes}
                  enableFavorites={enableFavorites}
                  enablePhotoComparison={enablePhotoComparison}
                  showCaptions={showCaptions}
                  captionPosition={captionPosition}
                  isFav={favorites.includes(String(image.id))}
                  isComp={comparisonIds.includes(image.id)}
                  isLiked={userLikedPhotos.includes(String(image.id))}
                  likesCount={photoLikes[String(image.id)] || 0}
                  itemSize={itemSize}
                  itemsPerPage={itemsPerPage}
                  onImageClick={handleImageCardClick}
                  onToggleLike={toggleLike}
                  onToggleFavorite={toggleFavorite}
                  onToggleComparison={toggleComparison}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isMobile && totalPages > 1 && (
        <div className="w-full border-t border-[#4a4a4a]/15 pt-4 mt-6 mb-2 flex items-center justify-between text-[11px] tracking-[0.18em] font-sans font-semibold uppercase text-[#4a4a4a] flex-shrink-0 bg-white/30 backdrop-blur-xs px-4 py-2.5 rounded-lg border border-[#4a4a4a]/10">
          <button
            onClick={handlePrevPage}
            disabled={validPage === 0}
            className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-[#4a4a4a]/10 hover:text-[#1a1a1a] transition-all disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronLeft size={16} strokeWidth={1.75} />
            <span>Página Anterior</span>
          </button>
          
          <span className="text-[10px] tracking-[0.2em] text-[#7a7a7a] font-mono px-3 py-1 bg-white/60 rounded-full border border-[#4a4a4a]/10">
            {validPage + 1} / {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={validPage === totalPages - 1}
            className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-[#4a4a4a]/10 hover:text-[#1a1a1a] transition-all disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
          >
            <span>Página Seguinte</span>
            <ChevronRight size={16} strokeWidth={1.75} />
          </button>
        </div>
      )}

      {/* Side-by-Side Comparison Modal */}
      <AnimatePresence>
        {showComparisonModal && comparisonPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 text-white flex flex-col p-4 md:p-8 backdrop-blur-lg max-h-screen overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-white/20 pb-4 mb-4 flex-shrink-0">
              <div className="flex items-center gap-2 font-serif text-base md:text-xl text-amber-200">
                <Columns size={18} />
                <span>Comparador de Fotografias</span>
              </div>
              <button 
                onClick={() => setShowComparisonModal(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center overflow-y-auto">
              {comparisonPhotos.map((photo, idx) => (
                <div key={photo.id} className="flex flex-col items-center bg-white/5 border border-white/10 p-3 rounded-lg relative">
                  <div className="absolute top-2 left-2 bg-black/60 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wider">
                    Foto #{idx + 1}
                  </div>
                  <button 
                    onClick={() => setComparisonIds(prev => prev.filter(id => id !== photo.id))}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-rose-600 rounded-full text-white/80 transition-colors"
                    title="Remover da comparação"
                  >
                    <X size={14} />
                  </button>

                  <div className="w-full h-[280px] md:h-[400px] flex items-center justify-center overflow-hidden my-2">
                    <img 
                      src={photo.url} 
                      alt={photo.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="w-full text-center space-y-1 mt-1 border-t border-white/10 pt-2">
                    <h3 className="font-serif text-sm md:text-base text-white">{photo.title}</h3>
                    {photo.subtitle && <p className="text-xs text-white/60 font-sans">{photo.subtitle}</p>}
                    
                    {(photo.cameraModel || photo.lens || photo.iso) && (
                      <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono text-amber-200/80 pt-1">
                        {photo.cameraModel && <span>📷 {photo.cameraModel}</span>}
                        {photo.lens && <span>🔍 {photo.lens}</span>}
                        {photo.aperture && <span>{photo.aperture}</span>}
                        {photo.shutterSpeed && <span>{photo.shutterSpeed}</span>}
                        {photo.iso && <span>ISO {photo.iso}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {comparisonPhotos.length === 1 && (
                <div className="flex flex-col items-center justify-center h-[280px] md:h-[400px] border-2 border-dashed border-white/20 rounded-lg p-6 text-center text-white/40">
                  <Camera size={32} className="mb-2" />
                  <p className="text-xs uppercase tracking-widest">Selecione uma segunda fotografia na galeria para comparar</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default React.memo(GalleryGrid);

