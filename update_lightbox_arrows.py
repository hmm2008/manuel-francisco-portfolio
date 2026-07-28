with open("src/components/Lightbox.tsx", "r") as f:
    code = f.read()

# Add windowSize state
import_target = "const [swipeHintVisible, setSwipeHintVisible] = useState(true);"
window_size_code = """
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < 768;
  const isLandscape = windowSize.width > windowSize.height;

  let arrowPosition = 'sides';
  if (isMobile) {
    arrowPosition = isLandscape ? (siteSettings?.lightboxArrowsMobileLandscape || 'sides') : (siteSettings?.lightboxArrowsMobilePortrait || 'bottom');
  } else {
    arrowPosition = isLandscape ? (siteSettings?.lightboxArrowsDesktopLandscape || 'sides') : (siteSettings?.lightboxArrowsDesktopPortrait || 'sides');
  }

  const prevArrowClasses = arrowPosition === 'bottom' 
    ? 'absolute bottom-6 left-1/2 -translate-x-[120%] p-3 text-white/60 hover:text-white bg-black/30 hover:bg-black/60 rounded-full border border-white/10 transition-colors z-[160]'
    : arrowPosition === 'top'
    ? 'absolute top-20 left-1/2 -translate-x-[120%] p-3 text-white/60 hover:text-white bg-black/30 hover:bg-black/60 rounded-full border border-white/10 transition-colors z-[160]'
    : 'absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white bg-black/30 hover:bg-black/60 rounded-full border border-white/10 transition-colors z-[160]';

  const nextArrowClasses = arrowPosition === 'bottom' 
    ? 'absolute bottom-6 left-1/2 translate-x-[20%] p-3 text-white/60 hover:text-white bg-black/30 hover:bg-black/60 rounded-full border border-white/10 transition-colors z-[160]'
    : arrowPosition === 'top'
    ? 'absolute top-20 left-1/2 translate-x-[20%] p-3 text-white/60 hover:text-white bg-black/30 hover:bg-black/60 rounded-full border border-white/10 transition-colors z-[160]'
    : 'absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white bg-black/30 hover:bg-black/60 rounded-full border border-white/10 transition-colors z-[160]';
"""

if "const isMobile = windowSize.width < 768;" not in code:
    code = code.replace(import_target, import_target + "\n" + window_size_code)

bad_prev = """      <button 
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white bg-black/30 hover:bg-black/60 rounded-full border border-white/10 transition-colors z-[160]"
        title="Foto Anterior (← / K)"
      >"""

good_prev = """      <button 
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className={prevArrowClasses}
        title="Foto Anterior (← / K)"
      >"""

bad_next = """      <button 
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white bg-black/30 hover:bg-black/60 rounded-full border border-white/10 transition-colors z-[160]"
        title="Próxima Foto (→ / J)"
      >"""

good_next = """      <button 
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className={nextArrowClasses}
        title="Próxima Foto (→ / J)"
      >"""

code = code.replace(bad_prev, good_prev)
code = code.replace(bad_next, good_next)

with open("src/components/Lightbox.tsx", "w") as f:
    f.write(code)

print("Updated Lightbox arrows")
