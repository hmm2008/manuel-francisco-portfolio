export const SLIDESHOW_EFFECT_OPTIONS = [
  'Fade (Suave Dissolução)',
  'Ken Burns (Zoom Contínuo Lento)',
  'Slide Horizontal (Deslizar Clássico)',
  'Scale & Blur (Ampliação com Desfocagem)',
  'Crossfade Parallax (Sobreposição Profunda)',
  'Rotate Cinema (Giro & Escala Suave)'
];

export const LIGHTBOX_EFFECT_OPTIONS = [
  'Fade Standard (Dissolução Clássica)',
  'Ken Burns Zoom (Zoom In/Out Dramático)',
  'Slide Cross (Deslize Elegante Lateral)',
  'Scale Bounce (Escala com Elasticidade)',
  '3D Flip (Giro 3D Suave)',
  'Cinema Blur (Desfocagem de Lente)'
];

export function getSlideshowVariants(effectName?: string, slideshowZoom: number = 100, reduceAnimations?: boolean) {
  const baseScale = (slideshowZoom || 100) / 100;

  if (reduceAnimations) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, scale: baseScale },
      exit: { opacity: 0 },
      transition: { duration: 0.3 }
    };
  }

  if (effectName?.includes('Ken Burns')) {
    return {
      initial: { opacity: 0, scale: baseScale * 1.2 },
      animate: { opacity: 1, scale: baseScale },
      exit: { opacity: 0, scale: baseScale * 0.95 },
      transition: { duration: 2.2, ease: "easeInOut" }
    };
  }

  if (effectName?.includes('Slide Horizontal')) {
    return {
      initial: { opacity: 0, x: '100%', scale: baseScale },
      animate: { opacity: 1, x: '0%', scale: baseScale },
      exit: { opacity: 0, x: '-100%', scale: baseScale },
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    };
  }

  if (effectName?.includes('Scale & Blur')) {
    return {
      initial: { opacity: 0, scale: baseScale * 0.85, filter: 'blur(12px)' },
      animate: { opacity: 1, scale: baseScale, filter: 'blur(0px)' },
      exit: { opacity: 0, scale: baseScale * 1.15, filter: 'blur(12px)' },
      transition: { duration: 1.2, ease: "easeInOut" }
    };
  }

  if (effectName?.includes('Crossfade Parallax')) {
    return {
      initial: { opacity: 0, y: 50, scale: baseScale * 1.1 },
      animate: { opacity: 1, y: 0, scale: baseScale },
      exit: { opacity: 0, y: -50, scale: baseScale * 0.95 },
      transition: { duration: 1.4, ease: "easeInOut" }
    };
  }

  if (effectName?.includes('Rotate Cinema')) {
    return {
      initial: { opacity: 0, rotate: -3, scale: baseScale * 0.9 },
      animate: { opacity: 1, rotate: 0, scale: baseScale },
      exit: { opacity: 0, rotate: 3, scale: baseScale * 1.1 },
      transition: { duration: 1.3, ease: "easeInOut" }
    };
  }

  // Default: Fade
  return {
    initial: { opacity: 0, scale: baseScale * 1.05 },
    animate: { opacity: 1, scale: baseScale },
    exit: { opacity: 0 },
    transition: { duration: 1.5, ease: "easeInOut" }
  };
}

export function getLightboxVariants(effectName?: string, zoomLevel: number = 100, reduceAnimations?: boolean) {
  const scaleTarget = zoomLevel / 100;

  if (reduceAnimations) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, scale: scaleTarget },
      exit: { opacity: 0 },
      transition: { duration: 0.2 }
    };
  }

  if (effectName?.includes('Ken Burns Zoom')) {
    return {
      initial: { opacity: 0, scale: 1.25 },
      animate: { opacity: 1, scale: scaleTarget },
      exit: { opacity: 0, scale: 0.8 },
      transition: { duration: 0.4, ease: "easeOut" }
    };
  }

  if (effectName?.includes('Slide Cross')) {
    return {
      initial: { opacity: 0, x: 140 },
      animate: { opacity: 1, x: 0, scale: scaleTarget },
      exit: { opacity: 0, x: -140 },
      transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] }
    };
  }

  if (effectName?.includes('Scale Bounce')) {
    return {
      initial: { opacity: 0, scale: 0.5 },
      animate: { opacity: 1, scale: scaleTarget },
      exit: { opacity: 0, scale: scaleTarget },
      transition: { type: 'spring', stiffness: 300, damping: 22 }
    };
  }

  if (effectName?.includes('3D Flip')) {
    return {
      initial: { opacity: 0, rotateY: 90 },
      animate: { opacity: 1, rotateY: 0, scale: scaleTarget },
      exit: { opacity: 0, rotateY: -90 },
      transition: { duration: 0.45, ease: "easeInOut" }
    };
  }

  if (effectName?.includes('Cinema Blur')) {
    return {
      initial: { opacity: 0, filter: 'blur(20px)', scale: 1.1 },
      animate: { opacity: 1, filter: 'blur(0px)', scale: scaleTarget },
      exit: { opacity: 0, filter: 'blur(20px)', scale: 0.9 },
      transition: { duration: 0.35, ease: "easeInOut" }
    };
  }

  // Default: Fade Standard
  return {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: scaleTarget },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.25, ease: "easeOut" }
  };
}
