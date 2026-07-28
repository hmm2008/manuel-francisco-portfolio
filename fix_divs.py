with open("src/App.tsx", "r") as f:
    app_code = f.read()

bad_str = """            <SlideshowView 
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
        ) : activeView === 'galeria' ? ("""

good_str = """            <SlideshowView 
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
          </div>
        ) : activeView === 'galeria' ? ("""

app_code = app_code.replace(bad_str, good_str)
with open("src/App.tsx", "w") as f:
    f.write(app_code)
