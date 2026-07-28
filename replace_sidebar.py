with open("src/App.tsx", "r") as f:
    app_code = f.read()

with open("sidebar_target.txt", "r") as f:
    target = f.read()

replacement = """      <DesktopSidebar
        siteSettings={siteSettings}
        activeView={activeView}
        setActiveView={setActiveView}
        isMobileLandscape={isMobileLandscape}
        menuStyle={menuStyle}
        navItemClass={navItemClass}
      />
"""

if target in app_code:
    app_code = app_code.replace(target, replacement)
    
    if "import DesktopSidebar" not in app_code:
        import_stmt = "import DesktopSidebar from './components/DesktopSidebar';\n"
        if "import SlideshowView" in app_code:
            app_code = app_code.replace("import SlideshowView", import_stmt + "import SlideshowView")
        else:
            app_code = import_stmt + app_code
            
    with open("src/App.tsx", "w") as f:
        f.write(app_code)
    print("Replaced successfully!")
else:
    print("Target not found in App.tsx!")
