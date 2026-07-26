export function getPositionClasses(position: string = 'bottom-left', isLightbox: boolean = false): string {
  const pos = (position || '').toLowerCase();
  
  if (pos.includes('right') || pos.includes('dto') || pos.includes('direito')) {
    if (pos.includes('top') || pos.includes('superior')) {
      return isLightbox ? "top-4 right-4" : "top-4 right-4 md:top-6 md:right-6";
    }
    return isLightbox ? "bottom-4 right-4" : "bottom-4 right-4 md:bottom-6 md:right-6";
  }

  if (pos.includes('center') || pos.includes('centro') || pos.includes('centrado')) {
    if (pos.includes('top') || pos.includes('superior')) {
      return isLightbox ? "top-4 left-1/2 -translate-x-1/2" : "top-4 left-1/2 -translate-x-1/2 md:top-6";
    }
    if (pos === 'center' || pos === 'ao centro') {
      return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
    }
    return isLightbox ? "bottom-4 left-1/2 -translate-x-1/2" : "bottom-4 left-1/2 -translate-x-1/2 md:bottom-6";
  }

  if (pos.includes('top') || pos.includes('superior')) {
    return isLightbox ? "top-4 left-4" : "top-4 left-4 md:top-6 md:left-6";
  }

  // Default: bottom-left / canto inferior esquerdo
  return isLightbox ? "bottom-4 left-4" : "bottom-4 left-4 md:bottom-6 md:left-6";
}

export function getWatermarkClasses(position: string = 'bottom-left', isLightbox: boolean = false) {
  const baseClasses = "absolute pointer-events-none select-none font-sans tracking-widest text-white/80 backdrop-blur-[2px]";
  const sizeClasses = isLightbox ? "text-[10px] md:text-xs bg-black/60 px-3 py-1 rounded-full border border-white/10" : "text-[8px] sm:text-[9px] bg-black/40 sm:bg-black/50 px-1.5 sm:px-2 py-0.5 rounded shadow-sm";
  const positionClasses = getPositionClasses(position, isLightbox);
  return `${baseClasses} ${sizeClasses} ${positionClasses}`;
}
