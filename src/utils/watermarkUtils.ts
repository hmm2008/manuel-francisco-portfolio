export function getWatermarkClasses(position: string = 'bottom-left', isLightbox: boolean = false) {
  const baseClasses = "absolute pointer-events-none select-none font-sans tracking-widest text-white/80 backdrop-blur-[2px]";
  const sizeClasses = isLightbox ? "text-[10px] md:text-xs bg-black/60 px-3 py-1 rounded-full border border-white/10" : "text-[8px] sm:text-[9px] bg-black/40 sm:bg-black/50 px-1.5 sm:px-2 py-0.5 rounded shadow-sm";
  
  let positionClasses = "";
  switch (position) {
    case 'bottom-right':
      positionClasses = isLightbox ? "bottom-4 right-4" : "bottom-2 sm:bottom-2.5 right-2 sm:right-2.5";
      break;
    case 'bottom-center':
      positionClasses = isLightbox ? "bottom-4 left-1/2 -translate-x-1/2" : "bottom-2 sm:bottom-2.5 left-1/2 -translate-x-1/2";
      break;
    case 'top-left':
      positionClasses = isLightbox ? "top-4 left-4" : "top-2 sm:top-2.5 left-2 sm:left-2.5";
      break;
    case 'top-right':
      positionClasses = isLightbox ? "top-4 right-4" : "top-2 sm:top-2.5 right-2 sm:right-2.5";
      break;
    case 'top-center':
      positionClasses = isLightbox ? "top-4 left-1/2 -translate-x-1/2" : "top-2 sm:top-2.5 left-1/2 -translate-x-1/2";
      break;
    case 'center':
      positionClasses = "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
      break;
    case 'bottom-left':
    default:
      positionClasses = isLightbox ? "bottom-4 left-4" : "bottom-2 sm:bottom-2.5 left-2 sm:left-2.5";
      break;
  }
  return `${baseClasses} ${sizeClasses} ${positionClasses}`;
}
