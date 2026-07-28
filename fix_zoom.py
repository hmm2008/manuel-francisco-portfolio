with open("src/components/Lightbox.tsx", "r") as f:
    code = f.read()

bad_transform = """                transform: touchStart && zoomLevel <= 105 
                  ? `translate3d(${touchDelta.x}px, ${touchDelta.y}px, 0px)` 
                  : (panOffset.x !== 0 || panOffset.y !== 0) 
                  ? `translate3d(${panOffset.x}px, ${panOffset.y}px, 0px)` 
                  : undefined,"""

good_transform = """                transform: touchStart && zoomLevel <= 105 
                  ? `translate3d(${touchDelta.x}px, ${touchDelta.y}px, 0px) scale(${zoomLevel / 100})` 
                  : `translate3d(${panOffset.x}px, ${panOffset.y}px, 0px) scale(${zoomLevel / 100})`,"""

if bad_transform in code:
    code = code.replace(bad_transform, good_transform)
    with open("src/components/Lightbox.tsx", "w") as f:
        f.write(code)
    print("Fixed transform!")
else:
    print("Bad transform not found!")
