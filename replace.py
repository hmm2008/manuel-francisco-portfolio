import sys

with open("src/App.tsx", "r") as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if "{/* Lightbox for Gallery View */}" in line:
        start_idx = i
    if "{/* Install PWA Modal */}" in line:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    new_lines = lines[:start_idx] + [
        "      {/* Lightbox for Gallery View */}\n",
        "      <AnimatePresence>\n",
        "        {selectedImageIndex !== null && (\n",
        "          <Lightbox\n",
        "            selectedImageIndex={selectedImageIndex}\n",
        "            filteredGallery={filteredGallery}\n",
        "            siteSettings={siteSettings}\n",
        "            onClose={closeLightbox}\n",
        "            onNext={nextImage}\n",
        "            onPrev={prevImage}\n",
        "            showToast={showToast}\n",
        "            toggleFullScreen={toggleFullScreen}\n",
        "          />\n",
        "        )}\n",
        "      </AnimatePresence>\n",
        "\n"
    ] + lines[end_idx:]
    
    with open("src/App.tsx", "w") as f:
        f.writelines(new_lines)
    print("Replaced successfully")
else:
    print(f"Could not find indices: {start_idx}, {end_idx}")
