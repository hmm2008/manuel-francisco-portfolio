import sys

with open("src/App.tsx", "r") as f:
    app_code = f.read()

with open("target.txt", "r") as f:
    target = f.read()

replacement = """            <SlideshowView 
              galleryImages={galleryImages}
              slideIndex={slideIndex}
              siteSettings={siteSettings}
              slideshowAspects={slideshowAspects}
              setSlideshowAspects={setSlideshowAspects}
              slideshowContainerSize={slideshowContainerSize}
              slideshowContainerRef={slideshowContainerRef}
              isMobileLandscape={isMobileLandscape}
              setActiveView={setActiveView}
              isAdminUnlocked={isAdminUnlocked}
            />
"""

if target in app_code:
    app_code = app_code.replace(target, replacement)
    
    # Check if SlideshowView is imported
    if "import SlideshowView" not in app_code:
        # Add import after other components
        import_stmt = "import SlideshowView from './components/SlideshowView';\n"
        if "import AdminPanel from './components/AdminPanel';" in app_code:
            app_code = app_code.replace("import AdminPanel from './components/AdminPanel';", "import AdminPanel from './components/AdminPanel';\n" + import_stmt)
        elif "import Lightbox from './components/Lightbox';" in app_code:
            app_code = app_code.replace("import Lightbox from './components/Lightbox';", "import Lightbox from './components/Lightbox';\n" + import_stmt)
            
    with open("src/App.tsx", "w") as f:
        f.write(app_code)
    print("Replaced successfully!")
else:
    print("Target not found in App.tsx!")
