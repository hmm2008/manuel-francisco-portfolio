import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Keyboard, Camera, ZoomOut, ZoomIn, Pause, Play, Download, Maximize, EyeOff, Eye, X, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { getLightboxVariants } from '../utils/transitionUtils';
import { getWatermarkClasses, getPositionClasses, getCaptionOffsetStyle } from '../utils/watermarkUtils';
import { getFontFamily, getTextStyleProps } from '../utils/fontUtils';
import { ImageProps, SiteSettings } from '../types';

interface LightboxProps {
  selectedImageIndex: number;
  filteredGallery: ImageProps[];
  siteSettings: Partial<SiteSettings> | undefined;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  showToast: (msg: string) => void;
  toggleFullScreen: () => void;
}

export default function Lightbox({
  selectedImageIndex,
  filteredGallery,
  siteSettings,
  onClose,
  onNext,
  onPrev,
  showToast,
  toggleFullScreen
}: LightboxProps) {
  const [hideLightboxControls, setHideLightboxControls] = useState(false);
  const [showExifPanel, setShowExifPanel] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [isAutoPlayActive, setIsAutoPlayActive] = useState(false);
  const [slideshowSpeed, setSlideshowSpeed] = useState(4000);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [swipeHintVisible, setSwipeHintVisible] = useState(true);

  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchDelta, setTouchDelta] = useState({ x: 0, y: 0 });

  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number>(100);
  const panStartRef = useRef({ x: 0, y: 0 });
  const lastTapTimeRef = useRef<number>(0);
  const lastTapPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSwipeHintVisible(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard Navigation & Shortcuts for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toUpperCase();
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) return;

      if (e.key === 'Escape') {
        if (showShortcutsModal) {
          setShowShortcutsModal(false);
        } else if (showExifPanel) {
          setShowExifPanel(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'j' || e.key === 'J') {
        onNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'k' || e.key === 'K') {
        onPrev();
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
      } else if (e.key === 'h' || e.key === 'H') {
        setHideLightboxControls(prev => !prev);
      } else if (e.key === '?') {
        setShowShortcutsModal(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showShortcutsModal, showExifPanel, onNext, onPrev, onClose, toggleFullScreen, siteSettings?.showExifData]);

  // Auto-play logic
  useEffect(() => {
    if (!isAutoPlayActive || filteredGallery.length === 0) return;
    const timer = setInterval(() => {
      onNext();
    }, slideshowSpeed);
    return () => clearInterval(timer);
  }, [isAutoPlayActive, onNext, filteredGallery.length, slideshowSpeed]);

  const handleZoom = (e: React.MouseEvent, type: 'in' | 'out') => {
    e.stopPropagation();
    setZoomLevel(prev => {
      const nextZoom = type === 'in' ? Math.min(prev + 25, 350) : Math.max(prev - 25, 50);
      if (nextZoom <= 100) {
        setPanOffset({ x: 0, y: 0 });
      }
      return nextZoom;
    });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoomLevel > 105) {
      setZoomLevel(100);
      setPanOffset({ x: 0, y: 0 });
      showToast('Zoom 100%');
    } else {
      setZoomLevel(200);
      showToast('Zoom 200%');
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setSwipeHintVisible(false);

    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartDistRef.current = dist;
      pinchStartZoomRef.current = zoomLevel;
      setTouchStart(null);
      setTouchDelta({ x: 0, y: 0 });
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
      setTouchDelta({ x: 0, y: 0 });
      panStartRef.current = { ...panOffset };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (pinchStartDistRef.current > 0) {
        const scaleRatio = currentDist / pinchStartDistRef.current;
        const newZoom = Math.min(350, Math.max(50, Math.round(pinchStartZoomRef.current * scaleRatio)));
        setZoomLevel(newZoom);
        if (newZoom <= 100) {
          setPanOffset({ x: 0, y: 0 });
        }
      }
    } else if (e.touches.length === 1 && touchStart) {
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - touchStart.x;
      const deltaY = currentY - touchStart.y;
      setTouchDelta({ x: deltaX, y: deltaY });

      if (zoomLevel > 105) {
        setPanOffset({
          x: panStartRef.current.x + deltaX,
          y: panStartRef.current.y + deltaY
        });
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (pinchStartDistRef.current !== null && e.touches.length < 2) {
      pinchStartDistRef.current = null;
    }

    if (touchStart) {
      const { x, y } = touchDelta;
      const absX = Math.abs(x);
      const absY = Math.abs(y);
      const now = Date.now();

      const isTap = absX < 15 && absY < 15;
      if (isTap) {
        const lastTime = lastTapTimeRef.current;
        const lastPos = lastTapPosRef.current;
        const distFromLastTap = Math.hypot(touchStart.x - lastPos.x, touchStart.y - lastPos.y);

        if (now - lastTime < 300 && distFromLastTap < 40) {
          e.preventDefault();
          if (zoomLevel > 105) {
            setZoomLevel(100);
            setPanOffset({ x: 0, y: 0 });
            showToast('Zoom 100%');
          } else {
            setZoomLevel(200);
            showToast('Zoom 200%');
          }
          lastTapTimeRef.current = 0;
          setTouchStart(null);
          setTouchDelta({ x: 0, y: 0 });
          return;
        } else {
          lastTapTimeRef.current = now;
          lastTapPosRef.current = { x: touchStart.x, y: touchStart.y };
        }
      }

      if (zoomLevel <= 105) {
        if (absX > absY && absX > 40) {
          if (x < 0) {
            onNext();
          } else {
            onPrev();
          }
        } else if (absY > absX && (y > 60 || y < -80)) {
          onClose();
        }
      }

      setTouchStart(null);
      setTouchDelta({ x: 0, y: 0 });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[150] flex items-center justify-center transition-colors duration-300"
      style={{ backgroundColor: siteSettings?.lightboxBgColor || '#0a0a0a' }}
      onClick={onClose}
    >
      <div className="absolute top-6 right-6 z-[160] flex items-center gap-3 md:gap-4">
        {!hideLightboxControls ? (
          <>
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

            <div className="flex items-center gap-1 bg-black/40 border border-white/20 p-0.5 rounded-full">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAutoPlayActive(!isAutoPlayActive);
                  showToast(!isAutoPlayActive ? `Apresentação Automática Ativada (${slideshowSpeed / 1000}s)` : 'Apresentação Automática Pausada');
                }}
                className={`px-3 py-1 rounded-full text-[10px] tracking-widest uppercase transition-all flex items-center gap-1.5 ${
                  isAutoPlayActive 
                    ? 'bg-[#c8b89e] text-[#1a1a1a] font-bold shadow-lg' 
                    : 'text-white/90 hover:bg-white/10'
                }`}
                title="Apresentação Automática (Tecla P)"
              >
                {isAutoPlayActive ? <Pause size={13} /> : <Play size={13} />}
                <span className="hidden sm:inline">{isAutoPlayActive ? 'Pausar' : 'Apresentação'}</span>
              </button>

              {isAutoPlayActive && (
                <div className="flex items-center gap-0.5 pr-1 border-l border-white/20 pl-1">
                  {[2000, 4000, 7000, 10000].map(speed => (
                    <button
                      key={speed}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSlideshowSpeed(speed);
                        showToast(`Velocidade: ${speed / 1000}s por foto`);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-all ${
                        slideshowSpeed === speed
                          ? 'bg-white text-black font-bold'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                      title={`${speed / 1000} segundos por fotografia`}
                    >
                      {speed / 1000}s
                    </button>
                  ))}
                </div>
              )}
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

            <button onClick={(e) => { e.stopPropagation(); toggleFullScreen(); }} className="text-white bg-black/40 hover:bg-black/60 border border-white/20 p-2 rounded-full transition-colors" title="Ecrã Inteiro (F)">
              <Maximize size={16} strokeWidth={1.5} />
            </button>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                setHideLightboxControls(true);
              }}
              className="px-3 py-1.5 rounded-full text-[10px] tracking-widest uppercase transition-all flex items-center gap-1.5 bg-black/40 text-white/90 hover:bg-white hover:text-black border border-white/20"
              title="Esconder Todos os Botões (H)"
            >
              <EyeOff size={14} /> <span className="hidden sm:inline">Esconder</span>
            </button>
          </>
        ) : (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setHideLightboxControls(false);
            }}
            className="px-3 py-1.5 rounded-full text-[10px] tracking-widest uppercase transition-all flex items-center gap-1.5 bg-black/60 hover:bg-black/80 text-white border border-white/30 shadow-lg"
            title="Mostrar Todos os Botões (H)"
          >
            <Eye size={14} /> <span className="hidden sm:inline">Mostrar</span>
          </button>
        )}

        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-white bg-black/40 hover:bg-black/60 border border-white/20 p-2 rounded-full transition-colors ml-1" title="Fechar (Esc)">
          <X size={18} strokeWidth={1.5} />
        </button>
      </div>

      <AnimatePresence>
        {!hideLightboxControls && swipeHintVisible && siteSettings?.enableKeyboardShortcuts !== false && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-20 left-1/2 -translate-x-1/2 z-[160] bg-black/80 backdrop-blur-md text-white/90 px-4 py-2 rounded-full text-[10px] uppercase tracking-widest border border-white/20 shadow-xl flex items-center gap-2 pointer-events-none"
          >
            <span>Deslize ← → para fotos, 2 dedos / duplo toque para zoom</span>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white bg-black/30 hover:bg-black/60 rounded-full border border-white/10 transition-colors z-[160]"
        title="Foto Anterior (← / K)"
      >
        <ChevronLeft size={28} strokeWidth={1.5} />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white bg-black/30 hover:bg-black/60 rounded-full border border-white/10 transition-colors z-[160]"
        title="Próxima Foto (→ / J)"
      >
        <ChevronRight size={28} strokeWidth={1.5} />
      </button>

      <div 
        className="max-h-screen max-w-full flex items-center justify-center relative select-none touch-none" 
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
              onDoubleClick={handleDoubleClick}
              style={{
                transform: touchStart && zoomLevel <= 105 
                  ? `translate3d(${touchDelta.x}px, ${touchDelta.y}px, 0px)` 
                  : (panOffset.x !== 0 || panOffset.y !== 0) 
                  ? `translate3d(${panOffset.x}px, ${panOffset.y}px, 0px)` 
                  : undefined,
                opacity: touchStart && zoomLevel <= 105 && Math.abs(touchDelta.y) > 30 ? Math.max(0.3, 1 - Math.abs(touchDelta.y) / 300) : 1,
                transition: touchStart ? 'none' : 'transform 0.25s ease-out, opacity 0.25s ease-out',
                touchAction: 'none'
              }}
              className="relative z-[150] flex items-center justify-center max-w-full max-h-screen cursor-zoom-in"
            >
              <img
                src={filteredGallery[selectedImageIndex]?.url}
                alt={filteredGallery[selectedImageIndex]?.alt}
                decoding="async"
                fetchPriority="high"
                referrerPolicy="no-referrer"
                className="max-h-screen max-w-full block"
              />
              {siteSettings?.enableWatermark && (
                <div className={getWatermarkClasses(siteSettings?.watermarkPosition, true)}>
                  {siteSettings?.watermarkText || '© Manuel Francisco'}
                </div>
              )}
              
              {siteSettings?.showLightboxCategory !== false && 
                filteredGallery[selectedImageIndex]?.category && 
                (siteSettings?.lightboxCategoryPosition || 'canto inferior esq') !== 'none' && 
                (siteSettings?.lightboxCategoryPosition || 'canto inferior esq') !== 'Não mostrar' && (
                <div 
                  className={`absolute pointer-events-none select-none flex flex-col ${getPositionClasses(siteSettings?.lightboxCategoryPosition || 'canto inferior esq', true, (siteSettings?.lightboxCategoryPlacement || 'inside') as 'inside' | 'outside')} ${
                    (siteSettings?.lightboxCategoryPosition || 'canto inferior esq').includes('right') || (siteSettings?.lightboxCategoryPosition || 'canto inferior esq').includes('dir') || (siteSettings?.lightboxCategoryPosition || 'canto inferior esq').includes('direito') ? 'items-end text-right' :
                    (siteSettings?.lightboxCategoryPosition || 'canto inferior esq').includes('center') || (siteSettings?.lightboxCategoryPosition || 'canto inferior esq').includes('centro') || (siteSettings?.lightboxCategoryPosition || 'canto inferior esq').includes('centrado') || (siteSettings?.lightboxCategoryPosition || 'canto inferior esq').includes('meio') ? 'items-center text-center' :
                    'items-start text-left'
                  }`}
                  style={getCaptionOffsetStyle(siteSettings?.lightboxCategoryPosition || 'canto inferior esq', (siteSettings?.lightboxCategoryPlacement || 'inside') as 'inside' | 'outside', siteSettings?.lightboxCategoryPadding ?? 16)}
                >
                  <span 
                    className="tracking-widest uppercase opacity-80 drop-shadow-md w-fit max-w-full typography-lightbox-category font-semibold"
                    style={{
                      fontFamily: getFontFamily(siteSettings?.lightboxCategoryFont || siteSettings?.lightboxTitleFont),
                      color: siteSettings?.lightboxCategoryColor || siteSettings?.lightboxTextColor || '#ffffff',
                      letterSpacing: siteSettings?.lightboxCategoryLetterSpacing || '1px',
                      backgroundColor: siteSettings?.enableLightboxCategoryBg ? (siteSettings?.lightboxCategoryBgColor || '#000000') : 'transparent',
                      padding: siteSettings?.enableLightboxCategoryBg ? '0.2em 0.4em' : 0,
                      ...getTextStyleProps(siteSettings?.lightboxCategoryStyle)
                    }}
                  >
                    {filteredGallery[selectedImageIndex]?.category}
                  </span>
                </div>
              )}

              {(siteSettings?.lightboxTextPosition || 'canto inferior dir') !== 'none' && 
                (siteSettings?.lightboxTextPosition || 'canto inferior dir') !== 'Não mostrar' && 
                (filteredGallery[selectedImageIndex]?.title || filteredGallery[selectedImageIndex]?.subtitle) && (
                <div 
                  className={`absolute pointer-events-none select-none flex flex-col ${getPositionClasses(siteSettings?.lightboxTextPosition || 'canto inferior dir', true, (siteSettings?.lightboxCaptionPlacement || 'inside') as 'inside' | 'outside')} ${
                    (siteSettings?.lightboxTextPosition || 'canto inferior dir').includes('right') || (siteSettings?.lightboxTextPosition || 'canto inferior dir').includes('dir') || (siteSettings?.lightboxTextPosition || 'canto inferior dir').includes('direito') ? 'items-end text-right' :
                    (siteSettings?.lightboxTextPosition || 'canto inferior dir').includes('center') || (siteSettings?.lightboxTextPosition || 'canto inferior dir').includes('centro') || (siteSettings?.lightboxTextPosition || 'canto inferior dir').includes('centrado') || (siteSettings?.lightboxTextPosition || 'canto inferior dir').includes('meio') ? 'items-center text-center' :
                    'items-start text-left'
                  }`}
                  style={getCaptionOffsetStyle(siteSettings?.lightboxTextPosition || 'canto inferior dir', (siteSettings?.lightboxCaptionPlacement || 'inside') as 'inside' | 'outside', siteSettings?.lightboxCaptionPadding ?? 16)}
                >
                  {filteredGallery[selectedImageIndex]?.title && (
                    <h3 
                      className="tracking-widest drop-shadow-md w-fit max-w-full typography-lightbox-title"
                      style={{
                        fontFamily: getFontFamily(siteSettings?.lightboxTitleFont),
                        color: siteSettings?.lightboxTextColor || '#ffffff',
                        letterSpacing: siteSettings?.lightboxTitleLetterSpacing || '1px',
                        backgroundColor: siteSettings?.enableLightboxTextBg ? (siteSettings?.lightboxTextBgColor || '#000000') : 'transparent',
                        padding: siteSettings?.enableLightboxTextBg ? '0.2em 0.4em' : 0,
                        ...getTextStyleProps(siteSettings?.lightboxTitleStyle)
                      }}
                    >
                      {filteredGallery[selectedImageIndex]?.title}
                    </h3>
                  )}
                  {filteredGallery[selectedImageIndex]?.subtitle && (
                    <p 
                      className="tracking-widest opacity-90 drop-shadow-md mt-1 w-fit max-w-full typography-lightbox-subtitle"
                      style={{
                        fontFamily: getFontFamily(siteSettings?.lightboxSubtitleFont),
                        color: siteSettings?.lightboxTextColor || '#ffffff',
                        letterSpacing: siteSettings?.lightboxSubtitleLetterSpacing || '1px',
                        backgroundColor: siteSettings?.enableLightboxTextBg ? (siteSettings?.lightboxTextBgColor || '#000000') : 'transparent',
                        padding: siteSettings?.enableLightboxTextBg ? '0.2em 0.4em' : 0,
                        ...getTextStyleProps(siteSettings?.lightboxSubtitleStyle)
                      }}
                    >
                      {filteredGallery[selectedImageIndex]?.subtitle}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          );
        })()}
      </div>
      
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
              {(filteredGallery[selectedImageIndex].cameraModel) && (
                <div className="col-span-2">
                  <p className="text-[9px] uppercase tracking-wider text-white/50">Câmara</p>
                  <p className="font-medium text-white/90">{filteredGallery[selectedImageIndex].cameraModel}</p>
                </div>
              )}

              {(filteredGallery[selectedImageIndex].lens) && (
                <div className="col-span-2">
                  <p className="text-[9px] uppercase tracking-wider text-white/50">Lente</p>
                  <p className="font-medium text-white/90">{filteredGallery[selectedImageIndex].lens}</p>
                </div>
              )}

              {(filteredGallery[selectedImageIndex].aperture) && (
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/50">Abertura</p>
                  <p className="font-medium text-white/90">{filteredGallery[selectedImageIndex].aperture}</p>
                </div>
              )}

              {(filteredGallery[selectedImageIndex].shutterSpeed) && (
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/50">Velocidade</p>
                  <p className="font-medium text-white/90">{filteredGallery[selectedImageIndex].shutterSpeed}</p>
                </div>
              )}

              {(filteredGallery[selectedImageIndex].iso) && (
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/50">ISO</p>
                  <p className="font-medium text-white/90">{filteredGallery[selectedImageIndex].iso}</p>
                </div>
              )}

              {(filteredGallery[selectedImageIndex].cameraSettings) && (
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/50">Distância Focal</p>
                  <p className="font-medium text-white/90">{filteredGallery[selectedImageIndex].cameraSettings}</p>
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

              {(!filteredGallery[selectedImageIndex].cameraModel && !filteredGallery[selectedImageIndex].cameraSettings) && (
                <p className="col-span-2 text-white/50 text-[11px] italic">Sem dados EXIF disponíveis para esta imagem.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <Keyboard size={16} className="text-[#c8b89e]" /> Atalhos & Gestos
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
                    <kbd className="px-2 py-0.5 bg-white/15 rounded border border-white/20 font-mono text-[10px]">P</kbd>
                    <span className="text-white/80">Apresentação</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-2 py-0.5 bg-white/15 rounded border border-white/20 font-mono text-[10px]">H</kbd>
                    <span className="text-white/80">Esconder Botões</span>
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
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c8b89e]"></span> Pinçar (2 dedos) para ampliar ou reduzir foto
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c8b89e]"></span> Duplo toque / clique para alternar zoom (100% / 200%)
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c8b89e]"></span> Arrastar foto com zoom para explorar detalhes
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c8b89e]"></span> Deslizar ← / → para mudar de foto
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c8b89e]"></span> Deslizar ↓ para fechar visualizador
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
