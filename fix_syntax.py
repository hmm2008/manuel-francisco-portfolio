with open("src/App.tsx") as f:
    text = f.read()

# Let's find the toggleFullScreen and the SEO and Head Configuration
import re
new_text = re.sub(
    r"  \}, \[\]\);\n\n    e\.stopPropagation\(\);\n    if \(zoomLevel > 105\) \{\n      setZoomLevel\(100\);\n      setPanOffset\(\{ x: 0, y: 0 \}\);\n      showToast\('Zoom 100%'\);\n    \} else \{\n      setZoomLevel\(200\);\n      showToast\('Zoom 200%'\);\n    \}\n  \};\n\n  // SEO and Head Configuration",
    "  }, []);\n\n  // SEO and Head Configuration",
    text
)

with open("src/App.tsx", "w") as f:
    f.write(new_text)

print("Replaced:", text != new_text)
