with open("src/components/Lightbox.tsx", "r") as f:
    text = f.read()

import re
text = re.sub(r"filteredGallery\[selectedImageIndex\]\.cameraSettings\.camera", "filteredGallery[selectedImageIndex].cameraModel", text)
with open("src/components/Lightbox.tsx", "w") as f:
    f.write(text)
