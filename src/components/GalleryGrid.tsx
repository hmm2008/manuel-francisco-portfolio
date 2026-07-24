import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, ChevronRight, Search, Heart, SlidersHorizontal, 
  X, Columns, Camera, Check 
} from 'lucide-react';
import { getWatermarkClasses } from '../utils/watermarkUtils';

interface ImageType {
  id: string | number;
  url: string;
  alt: string;
  title: string;
  subtitle?: string;
  category?: string;
  cameraModel?: string;
  lens?: string;
  iso?: string;
  aperture?: string;
  shutterSpeed?: string;
}

interface GalleryGridProps {
  images: ImageType[];
  onImageClick: (filteredIndex: number) => void;
  protectPhotos?: boolean;
  showCaptions?: string;
  enableWatermark?: boolean;
  watermarkText?: string;
  watermarkPosition?: string;
  enableFavorites?: boolean;
  enableGallerySearch?: boolean;
  enablePhotoComparison?: boolean;
  enableMonochromeToggle?: boolean;
  enablePhotoLikes?: boolean;
}

export default function GalleryGrid({ 
  images, 
  onImageClick, 
  protectPhotos, 
  showCaptions,
  enableWatermark,
  watermarkText = '© Manuel Francisco',
  watermarkPosition = 'bottom-left',
  enableFavorites = true,
  enableGallerySearch = true,
  enablePhotoComparison = true,
  enableMonochromeToggle = true,
  enablePhotoLikes = true
}: GalleryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [currentPage, setCurrentPage] = useState(0);

  // Search, Sort, Monochrome & Favorites state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'title-asc' | 'title-desc'>('recent');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [isMonochrome, setIsMonochrome] = useState(false);
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

  const toggleLike = (e: React.MouseEvent, id: string | number) => {
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
  };

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

  // Track window size for mobile vs desktop switch
  useEffect(() => {
    let timeoutId: number;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        const isLandscape = window.innerWidth > window.innerHeight && window.innerHeight < 600;
        setIsMobile(window.innerWidth < 768 || isLandscape);
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

  const toggleFavorite = (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    const strId = String(id);
    setFavorites(prev => 
      prev.includes(strId) ? prev.filter(f => f !== strId) : [...prev, strId]
    );
  };

  const toggleComparison = (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    setComparisonIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id]; // keep last and add new
      }
      return [...prev, id];
    });
  };

  // Filter and Sort Images
  const processedImages = useMemo(() => {
    let result = [...images];

    // Filter by Favorites
    if (showOnlyFavorites) {
      result = result.filter(img => favorites.includes(String(img.id)));
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(img => 
        img.title?.toLowerCase().includes(query) ||
        img.subtitle?.toLowerCase().includes(query) ||
        img.category?.toLowerCase().includes(query) ||
        img.alt?.toLowerCase().includes(query)
      );
    }

    // Sort Images
    result.sort((a, b) => {
      if (sortBy === 'title-asc') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'title-desc') return (b.title || '').localeCompare(a.title || '');
      if (sortBy === 'oldest') return Number(a.id) - Number(b.id);
      return Number(b.id) - Number(a.id); // 'recent'
    });

    return result;
  }, [images, searchQuery, sortBy, showOnlyFavorites, favorites]);

  // Monitor container size for pixel-perfect layout on desktop
  useEffect(() => {
    if (!containerRef.current || isMobile) return;
    
    let timeoutId: number;
    const handleResize = (entries: ResizeObserverEntry[]) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          setDimensions({ width, height });
        }
      }, 50);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);
    
    const rect = containerRef.current.getBoundingClientRect();
    setDimensions({ width: rect.width, height: rect.height });

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [isMobile]);

  // Reset to first page when filtered images change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, sortBy, showOnlyFavorites, images]);

  const gap = 16;

  // Calculate dynamic grid size on desktop
  const { cols, itemSize, rows, itemsPerPage } = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0) {
      return { cols: 4, itemSize: 220, rows: 2, itemsPerPage: 8 };
    }
    
    let finalCols = 4;
    if (dimensions.width < 640) finalCols = 1;
    else if (dimensions.width < 900) finalCols = 2;
    else if (dimensions.width < 1280) finalCols = 3;

    const minItemSize = 150;
    const maxItemSize = 320;

    const totalGapsWidth = (finalCols - 1) * gap;
    let widthBasedItemSize = Math.floor((dimensions.width - totalGapsWidth) / finalCols);
    let finalItemSize = Math.max(minItemSize, Math.min(maxItemSize, widthBasedItemSize));

    if (finalItemSize > dimensions.height) {
      finalItemSize = Math.max(minItemSize, dimensions.height);
    }
    
    let calculatedRows = Math.floor((dimensions.height + gap) / (finalItemSize + gap));
    let rows = Math.max(1, calculatedRows);

    if (rows === 1 && dimensions.height >= (minItemSize * 2 + gap)) {
      const sizeForTwoRows = Math.floor((dimensions.height - gap) / 2);
      if (sizeForTwoRows >= minItemSize) {
        finalItemSize = Math.min(finalItemSize, sizeForTwoRows);
        rows = 2;
      }
    }

    while (rows > 1 && (rows * finalItemSize + (rows - 1) * gap) > dimensions.height) {
      rows--;
    }
    while (finalCols > 1 && (finalCols * finalItemSize + (finalCols - 1) * gap) > dimensions.width) {
      finalCols--;
    }

    return {
      cols: finalCols,
      itemSize: finalItemSize,
      rows,
      itemsPerPage: finalCols * rows
    };
  }, [dimensions, gap]);

  const totalPages = Math.ceil(processedImages.length / itemsPerPage);
  const validPage = Math.min(Math.max(0, currentPage), Math.max(0, totalPages - 1));

  // Current page images (desktop)
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

  // Find objects for comparison modal
  const comparisonPhotos = useMemo(() => {
    return comparisonIds.map(id => images.find(img => String(img.id) === String(id))).filter(Boolean) as ImageType[];
  }, [comparisonIds, images]);

  return (
    <div id="gallery-grid-wrapper" className="flex-1 w-full min-h-0 flex flex-col justify-between overflow-hidden relative">
      
      {/* --- Top Utility Bar (Search, Sort, Favorites, Comparison) --- */}
      {(enableGallerySearch || enableFavorites || enablePhotoComparison) && (
        <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#4a4a4a]/10 text-xs font-sans">
          
          {/* Left: Search Bar */}
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

          {/* Right: Sort & Favorites & Comparison Controls */}
          <div className="flex items-center gap-2 flex-wrap ml-auto">
            
            {/* Monochrome / B&W View Toggle */}
            {enableMonochromeToggle && (
              <button
                onClick={() => setIsMonochrome(!isMonochrome)}
                className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 ${
                  isMonochrome 
                    ? 'bg-[#1a1a1a] text-white border border-black shadow-sm' 
                    : 'bg-white/60 border border-[#e2ddd5] text-[#4a4a4a] hover:bg-white'
                }`}
                title="Ativar/Desativar Exibição Monocromática (Preto & Branco)"
              >
                <span>P&B</span>
              </button>
            )}

            {/* Favorites Toggle */}
            {enableFavorites && (
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

            {/* Sort Selector */}
            {enableGallerySearch && (
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
            )}

            {/* Comparison Trigger Button */}
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
      )}

      {/* --- Main Gallery Container --- */}
      <div 
        ref={containerRef} 
        className="flex-1 w-full min-h-0 flex items-center justify-center overflow-hidden"
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
          <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-3 min-[480px]:gap-4 w-full overflow-y-auto max-h-full pb-4">
            {processedImages.map((image, index) => {
              const isFav = favorites.includes(String(image.id));
              const isComp = comparisonIds.includes(image.id);

              return (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                  className="bg-[#dcd7cf]/40 border border-[#1a1a1a]/5 hover:border-[#1a1a1a]/20 cursor-pointer relative group overflow-hidden rounded-sm aspect-square flex items-center justify-center"
                  onContextMenu={(e) => {
                    if (protectPhotos) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  onClick={() => {
                    const originalIdx = images.findIndex(img => img.id === image.id);
                    onImageClick(originalIdx >= 0 ? originalIdx : index);
                  }}
                >
                  <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105 flex items-center justify-center p-1.5">
                    <img
                      src={image.url}
                      alt={image.alt}
                      loading={index < 6 ? "eager" : "lazy"}
                      decoding="async"
                      style={{ filter: isMonochrome ? 'grayscale(100%) contrast(108%)' : 'none' }}
                      className={`w-full h-full object-contain ${
                        protectPhotos ? 'pointer-events-none select-none' : ''
                      }`}
                      onContextMenu={(e) => { if (protectPhotos) e.preventDefault(); }}
                    />
                    {/* Watermark Overlay */}
                    {enableWatermark && (
                      <div className={getWatermarkClasses(watermarkPosition, false)}>
                        {watermarkText}
                      </div>
                    )}
                  </div>

                  {/* Action Icons (Favorite, Comparison, Likes) */}
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10">
                    {enablePhotoLikes && (
                      <button 
                        onClick={(e) => toggleLike(e, image.id)}
                        className={`px-1.5 py-1 rounded-full text-[9px] font-mono flex items-center gap-1 transition-all backdrop-blur-md ${
                          userLikedPhotos.includes(String(image.id)) ? 'bg-amber-500 text-black font-bold' : 'bg-black/40 text-white/90 hover:bg-black/70'
                        }`}
                        title="Gosto nesta foto"
                      >
                        <Heart size={10} className={userLikedPhotos.includes(String(image.id)) ? 'fill-black' : ''} />
                        <span>{photoLikes[String(image.id)] || 0}</span>
                      </button>
                    )}

                    {enableFavorites && (
                      <button 
                        onClick={(e) => toggleFavorite(e, image.id)}
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
                        onClick={(e) => toggleComparison(e, image.id)}
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
                    <div className={`absolute bottom-0 left-0 right-0 bg-black/65 text-white text-[10px] py-2 px-2 truncate transition-opacity text-center font-sans tracking-widest uppercase ${
                      showCaptions === 'Sempre' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      {image.title}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : dimensions.width === 0 ? (
          <div className="flex items-center justify-center h-20 text-[#7a7a7a]/40 text-[10px] tracking-widest font-sans uppercase">
            A carregar galeria...
          </div>
        ) : (
          /* DESKTOP PAGINATED GRID */
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, ${itemSize}px)`,
              gridTemplateRows: `repeat(${rows}, ${itemSize}px)`,
              gap: `${gap}px`,
              justifyContent: 'center',
              alignContent: 'center',
              width: '100%',
              height: '100%'
            }}
          >
            <AnimatePresence mode="popLayout">
              {pageImages.map((image, index) => {
                const isFav = favorites.includes(String(image.id));
                const isComp = comparisonIds.includes(image.id);

                return (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                    style={{ width: `${itemSize}px`, height: `${itemSize}px` }}
                    className="bg-[#dcd7cf]/40 border border-[#1a1a1a]/5 hover:border-[#1a1a1a]/20 cursor-zoom-in relative group overflow-hidden rounded-sm flex items-center justify-center transition-colors"
                    onContextMenu={(e) => {
                      if (protectPhotos) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                    onClick={() => {
                      const originalIdx = images.findIndex(img => img.id === image.id);
                      onImageClick(originalIdx >= 0 ? originalIdx : index);
                    }}
                    title={`${image.title}${image.subtitle ? ` - ${image.subtitle}` : ''}`}
                  >
                    <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105 flex items-center justify-center p-2">
                      <img
                        src={image.url}
                        alt={image.alt}
                        loading={index < itemsPerPage ? "eager" : "lazy"}
                        decoding="async"
                        style={{ filter: isMonochrome ? 'grayscale(100%) contrast(108%)' : 'none' }}
                        className={`w-full h-full object-contain ${
                          protectPhotos ? 'pointer-events-none select-none' : ''
                        }`}
                        onContextMenu={(e) => { if (protectPhotos) e.preventDefault(); }}
                        referrerPolicy="no-referrer"
                      />
                      {/* Watermark Overlay */}
                      {enableWatermark && (
                        <div className={getWatermarkClasses(watermarkPosition, false)}>
                          {watermarkText}
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />

                    {/* Top Action Buttons (Likes, Favorite & Comparison) */}
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {enablePhotoLikes && (
                        <button 
                          onClick={(e) => toggleLike(e, image.id)}
                          className={`px-2 py-1 rounded-full text-[10px] font-mono flex items-center gap-1 transition-all backdrop-blur-md shadow-sm ${
                            userLikedPhotos.includes(String(image.id)) ? 'bg-amber-400 text-black font-bold' : 'bg-black/40 text-white/90 hover:bg-black/70'
                          }`}
                          title="Gosto nesta foto"
                        >
                          <Heart size={11} className={userLikedPhotos.includes(String(image.id)) ? 'fill-black' : ''} />
                          <span>{photoLikes[String(image.id)] || 0}</span>
                        </button>
                      )}

                      {enableFavorites && (
                        <button 
                          onClick={(e) => toggleFavorite(e, image.id)}
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
                          onClick={(e) => toggleComparison(e, image.id)}
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
                      <div className={`absolute bottom-0 left-0 right-0 bg-black/75 text-white text-[12px] py-2 px-3 truncate transition-opacity text-center font-sans tracking-widest uppercase ${
                        showCaptions === 'Sempre' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        {image.title}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* --- Desktop Pagination --- */}
      {!isMobile && totalPages > 1 && (
        <div className="w-full border-t border-[#4a4a4a]/10 pt-4 mt-6 flex items-center justify-between text-[10px] tracking-[0.2em] font-sans font-semibold uppercase text-[#7a7a7a]">
          <button
            onClick={handlePrevPage}
            disabled={validPage === 0}
            className="flex items-center gap-2 hover:text-[#1a1a1a] transition-colors disabled:opacity-20 disabled:pointer-events-none"
          >
            <ChevronLeft size={14} strokeWidth={1.5} />
            <span>Página Anterior</span>
          </button>
          
          <span className="text-[9px] tracking-[0.15em] text-[#7a7a7a]/60">
            {validPage + 1} / {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={validPage === totalPages - 1}
            className="flex items-center gap-2 hover:text-[#1a1a1a] transition-colors disabled:opacity-20 disabled:pointer-events-none"
          >
            <span>Página Seguinte</span>
            <ChevronRight size={14} strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* --- Side-by-Side Photo Comparison Modal --- */}
      <AnimatePresence>
        {showComparisonModal && comparisonPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 text-white flex flex-col p-4 md:p-8 backdrop-blur-lg overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/20 pb-4 mb-6">
              <div className="flex items-center gap-2 font-serif text-lg md:text-xl text-amber-200">
                <Columns size={20} />
                <span>Comparador de Fotografias Lado a Lado</span>
              </div>
              <button 
                onClick={() => setShowComparisonModal(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Comparison Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-center">
              {comparisonPhotos.map((photo, idx) => (
                <div key={photo.id} className="flex flex-col items-center bg-white/5 border border-white/10 p-4 rounded-lg relative">
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

                  <div className="w-full h-[350px] md:h-[450px] flex items-center justify-center overflow-hidden my-2">
                    <img 
                      src={photo.url} 
                      alt={photo.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="w-full text-center space-y-1 mt-2 border-t border-white/10 pt-3">
                    <h3 className="font-serif text-base text-white">{photo.title}</h3>
                    {photo.subtitle && <p className="text-xs text-white/60 font-sans">{photo.subtitle}</p>}
                    
                    {/* EXIF Quick Snippet if available */}
                    {(photo.cameraModel || photo.lens || photo.iso) && (
                      <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-mono text-amber-200/80 pt-2">
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
                <div className="flex flex-col items-center justify-center h-[350px] md:h-[450px] border-2 border-dashed border-white/20 rounded-lg p-6 text-center text-white/40">
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
