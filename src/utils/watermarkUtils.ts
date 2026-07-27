import React from 'react';

export function getPositionClasses(position: string = 'bottom-left', isLightbox: boolean = false, placement: 'inside' | 'outside' = 'inside'): string {
  const pos = (position || '').toLowerCase();
  
  if (placement === 'outside') {
    if (pos.includes('right') || pos.includes('dto') || pos.includes('direito') || pos.includes('dir')) {
      if (pos.includes('top') || pos.includes('superior') || pos.includes('cima')) {
        return "bottom-full right-0";
      }
      return "top-full right-0";
    }
    if (pos.includes('center') || pos.includes('centro') || pos.includes('centrado') || pos.includes('meio')) {
      if (pos.includes('top') || pos.includes('superior') || pos.includes('cima')) {
        return "bottom-full left-1/2 -translate-x-1/2";
      }
      if (pos === 'center' || pos === 'ao centro') {
        return "left-full top-1/2 -translate-y-1/2";
      }
      return "top-full left-1/2 -translate-x-1/2";
    }
    if (pos.includes('top') || pos.includes('superior') || pos.includes('cima')) {
      return "bottom-full left-0";
    }
    return "top-full left-0";
  }

  // Inside placement
  if (pos.includes('right') || pos.includes('dto') || pos.includes('direito') || pos.includes('dir')) {
    if (pos.includes('top') || pos.includes('superior') || pos.includes('cima')) {
      return "top-0 right-0";
    }
    return "bottom-0 right-0";
  }
  if (pos.includes('center') || pos.includes('centro') || pos.includes('centrado') || pos.includes('meio')) {
    if (pos.includes('top') || pos.includes('superior') || pos.includes('cima')) {
      return "top-0 left-1/2 -translate-x-1/2";
    }
    if (pos === 'center' || pos === 'ao centro') {
      return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
    }
    return "bottom-0 left-1/2 -translate-x-1/2";
  }
  if (pos.includes('top') || pos.includes('superior') || pos.includes('cima')) {
    return "top-0 left-0";
  }
  return "bottom-0 left-0";
}

export function getWatermarkClasses(position: string = 'bottom-left', isLightbox: boolean = false) {
  const baseClasses = "absolute pointer-events-none select-none font-sans tracking-widest text-white/80 backdrop-blur-[2px]";
  const sizeClasses = isLightbox ? "text-[10px] md:text-xs bg-black/60 px-3 py-1 rounded-full border border-white/10" : "text-[8px] sm:text-[9px] bg-black/40 sm:bg-black/50 px-1.5 sm:px-2 py-0.5 rounded shadow-sm";
  const pos = (position || '').toLowerCase();
  
  let positionClasses = "";
  if (pos.includes('right') || pos.includes('dto') || pos.includes('direito') || pos.includes('dir')) {
    if (pos.includes('top') || pos.includes('superior') || pos.includes('cima')) {
      positionClasses = isLightbox ? "top-4 right-4" : "top-4 right-4 md:top-6 md:right-6";
    } else {
      positionClasses = isLightbox ? "bottom-4 right-4" : "bottom-4 right-4 md:bottom-6 md:right-6";
    }
  } else if (pos.includes('center') || pos.includes('centro') || pos.includes('centrado') || pos.includes('meio')) {
    if (pos.includes('top') || pos.includes('superior') || pos.includes('cima')) {
      positionClasses = isLightbox ? "top-4 left-1/2 -translate-x-1/2" : "top-4 left-1/2 -translate-x-1/2 md:top-6";
    } else if (pos === 'center' || pos === 'ao centro') {
      positionClasses = "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
    } else {
      positionClasses = isLightbox ? "bottom-4 left-1/2 -translate-x-1/2" : "bottom-4 left-1/2 -translate-x-1/2 md:bottom-6";
    }
  } else if (pos.includes('top') || pos.includes('superior') || pos.includes('cima')) {
    positionClasses = isLightbox ? "top-4 left-4" : "top-4 left-4 md:top-6 md:left-6";
  } else {
    positionClasses = isLightbox ? "bottom-4 left-4" : "bottom-4 left-4 md:bottom-6 md:left-6";
  }

  return `${baseClasses} ${sizeClasses} ${positionClasses}`;
}

export function getCaptionOffsetStyle(position: string = 'bottom-left', placement: 'inside' | 'outside' = 'inside', padding: number = 16): React.CSSProperties {
  const pos = (position || '').toLowerCase();
  if (placement === 'inside') {
    return { padding: `${padding}px` };
  }
  
  // Outside placement
  if (pos.includes('top') || pos.includes('superior') || pos.includes('cima')) {
    return { marginBottom: `${padding}px` };
  }
  if (pos === 'center' || pos === 'ao centro') {
    return { marginLeft: `${padding}px` };
  }
  return { marginTop: `${padding}px` };
}
