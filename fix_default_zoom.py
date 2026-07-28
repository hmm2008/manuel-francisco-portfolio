with open("src/components/Lightbox.tsx", "r") as f:
    code = f.read()

bad_usestate = "const [zoomLevel, setZoomLevel] = useState(100);"
good_usestate = "const [zoomLevel, setZoomLevel] = useState(siteSettings?.defaultZoomLevel || 100);"

code = code.replace(bad_usestate, good_usestate)

# Also need an effect to reset zoom when changing image
effect = """
  useEffect(() => {
    setZoomLevel(siteSettings?.defaultZoomLevel || 100);
    setPanOffset({ x: 0, y: 0 });
  }, [selectedImageIndex, siteSettings?.defaultZoomLevel]);
"""

# Let's insert it after the panOffset useState
bad_pan = "const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });"
if bad_pan in code and effect not in code:
    code = code.replace(bad_pan, bad_pan + effect)

with open("src/components/Lightbox.tsx", "w") as f:
    f.write(code)
print("Done fixing default zoom")
