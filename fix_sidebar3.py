with open("src/App.tsx", "r") as f:
    app_code = f.read()

bad_str = """      <DesktopSidebar
        siteSettings={siteSettings}
        activeView={activeView}
        setActiveView={setActiveView}
        isMobileLandscape={isMobileLandscape}
        menuStyle={menuStyle}
        navItemClass={navItemClass}
      />
          <div """

good_str = """      <DesktopSidebar
        siteSettings={siteSettings}
        activeView={activeView}
        setActiveView={setActiveView}
        isMobileLandscape={isMobileLandscape}
        menuStyle={menuStyle}
        navItemClass={navItemClass}
      />
      {/* Main Content Area */}
      <main className="flex-1 min-h-0 md:h-full relative overflow-hidden bg-[#f0f0f0]">
        {activeView === 'inicio' ? (
          <div """

app_code = app_code.replace(bad_str, good_str)

with open("src/App.tsx", "w") as f:
    f.write(app_code)
