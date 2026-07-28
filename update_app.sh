# Remove the old state lines
sed -i.bak \
-e '/const \[hideLightboxControls/,/const \[slideshowSpeed/d' \
-e '/const \[swipeHintVisible/,/const \[touchDelta/d' \
-e '/const \[zoomLevel/,/const lastTapPosRef/d' \
src/App.tsx

# Remove handlers
sed -i.tmp \
-e '/const handleZoom =/,/const handleDoubleClick =/d' \
src/App.tsx

sed -i.tmp \
-e '/const handleDoubleClick =/,/  };/d' \
src/App.tsx

# Add import
sed -i.tmp '/import GalleryGrid from/a\
import Lightbox from '"'./components/Lightbox'"';' src/App.tsx
