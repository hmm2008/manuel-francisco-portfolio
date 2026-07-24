import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageType {
  id: string | number;
  url: string;
  alt: string;
  title: string;
  subtitle?: string;
}

interface GalleryGridProps {
  images: ImageType[];
  onImageClick: (filteredIndex: number) => void;
}

export default function GalleryGrid({ images, onImageClick }: GalleryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      const isLandscape = window.innerWidth > window.innerHeight && window.innerHeight < 600;
      return window.innerWidth < 768 || isLandscape;
    }
    return false;
  });

  // Track window size for mobile vs desktop switch
  useEffect(() => {
    const handleResize = () => {
      const isLandscape = window.innerWidth > window.innerHeight && window.innerHeight < 600;
      setIsMobile(window.innerWidth < 768 || isLandscape);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Monitor container size for pixel-perfect layout on desktop
  useEffect(() => {
    if (!containerRef.current || isMobile) return;
    
    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);
    
    // Initial measure
    const rect = containerRef.current.getBoundingClientRect();
    setDimensions({ width: rect.width, height: rect.height });

    return () => resizeObserver.disconnect();
  }, [isMobile]);

  // Reset to first page when images change
  useEffect(() => {
    setCurrentPage(0);
  }, [images]);

  const gap = 16;

  // Calculate dynamic grid size on desktop
  const { cols, itemSize, rows, itemsPerPage } = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0) {
      return { cols: 4, itemSize: 220, rows: 2, itemsPerPage: 8 };
    }
    
    // Choose columns based on width, ensuring a maximum of 4 columns
    let finalCols = 4;
    if (dimensions.width < 640) finalCols = 1;
    else if (dimensions.width < 900) finalCols = 2;
    else if (dimensions.width < 1280) finalCols = 3;

    // Minimum and maximum sizes for grid items
    const minItemSize = 150;
    const maxItemSize = 320;

    // Start with a width-based item size
    const totalGapsWidth = (finalCols - 1) * gap;
    let widthBasedItemSize = Math.floor((dimensions.width - totalGapsWidth) / finalCols);
    let finalItemSize = Math.max(minItemSize, Math.min(maxItemSize, widthBasedItemSize));

    // Cap item size by container height so a single row fits
    if (finalItemSize > dimensions.height) {
      finalItemSize = Math.max(minItemSize, dimensions.height);
    }
    
    // Calculate how many rows fit vertically given the height and item size
    let calculatedRows = Math.floor((dimensions.height + gap) / (finalItemSize + gap));
    let rows = Math.max(1, calculatedRows);
    
    // If only 1 row fits, but we could fit 2 rows by shrinking the item size slightly,
    // let's see if we can do that within our minItemSize bounds.
    if (rows === 1 && dimensions.height >= (minItemSize * 2 + gap)) {
      const sizeForTwoRows = Math.floor((dimensions.height - gap) / 2);
      if (sizeForTwoRows >= minItemSize) {
        finalItemSize = Math.min(finalItemSize, sizeForTwoRows);
        rows = 2;
      }
    }

    // Double check constraints to make sure there's absolutely no overflow
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

  // Total pages (only used on desktop)
  const totalPages = Math.ceil(images.length / itemsPerPage);
  
  // Ensure current page is valid (only used on desktop)
  const validPage = Math.min(Math.max(0, currentPage), Math.max(0, totalPages - 1));

  // Current page images (only used on desktop)
  const pageImages = useMemo(() => {
    const start = validPage * itemsPerPage;
    return images.slice(start, start + itemsPerPage);
  }, [images, validPage, itemsPerPage]);

  const handlePrevPage = () => {
    if (validPage > 0) {
      setCurrentPage(validPage - 1);
    }
  };

  const handleNextPage = () => {
    if (validPage < totalPages - 1) {
      setCurrentPage(validPage + 1);
    }
  };

  // --- MOBILE LAYOUT: Pure CSS scrolling grid ---
  if (isMobile) {
    return (
      <div id="gallery-grid-wrapper" className="w-full flex flex-col">
        {images.length === 0 ? (
          <div className="text-center py-12 text-[#7a7a7a]/60 text-xs tracking-widest font-sans uppercase">
            Nenhuma imagem encontrada nesta categoria.
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-3 xs:gap-4 w-full">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
                className="aspect-square bg-[#dcd7cf]/40 border border-[#1a1a1a]/5 hover:border-[#1a1a1a]/20 cursor-zoom-in relative group overflow-hidden rounded-sm flex items-center justify-center transition-all duration-300 active:scale-[0.98]"
                onClick={() => onImageClick(index)}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  loading="lazy"
                  className="w-full h-full object-contain p-2 transition-transform duration-500 ease-out"
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual tooltip on hover/tap */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/65 text-white text-[10px] py-2 px-2 truncate opacity-0 group-hover:opacity-100 transition-opacity text-center font-sans tracking-widest uppercase">
                  {image.title}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- DESKTOP LAYOUT: Height-fitted paginated grid ---
  return (
    <div id="gallery-grid-wrapper" className="flex-1 w-full min-h-0 flex flex-col justify-between overflow-hidden relative">
      <div 
        ref={containerRef} 
        className="flex-1 w-full min-h-0 flex items-center justify-center overflow-hidden"
      >
        {images.length === 0 ? (
          <div className="text-center py-12 text-[#7a7a7a]/60 text-xs tracking-widest font-sans uppercase">
            Nenhuma imagem encontrada nesta categoria.
          </div>
        ) : dimensions.width === 0 ? (
          <div className="flex items-center justify-center h-20 text-[#7a7a7a]/40 text-[10px] tracking-widest font-sans uppercase">
            A carregar galeria...
          </div>
        ) : (
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
                const globalIndex = validPage * itemsPerPage + index;
                return (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    style={{ width: `${itemSize}px`, height: `${itemSize}px` }}
                    className="bg-[#dcd7cf]/40 border border-[#1a1a1a]/5 hover:border-[#1a1a1a]/20 cursor-zoom-in relative group overflow-hidden rounded-sm flex items-center justify-center transition-colors"
                    onClick={() => onImageClick(globalIndex)}
                    title={`${image.title}${image.subtitle ? ` - ${image.subtitle}` : ''}`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      loading="lazy"
                      className="w-full h-full object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white text-[12px] py-2 px-3 truncate opacity-0 group-hover:opacity-100 transition-opacity text-center font-sans tracking-widest uppercase">
                      {image.title}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {totalPages > 1 && (
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
    </div>
  );
}
