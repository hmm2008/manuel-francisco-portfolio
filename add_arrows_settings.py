with open("src/components/SettingsPanelTabs/SettingsGaleria.tsx", "r") as f:
    code = f.read()

target = """            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-semibold tracking-widest text-[#8e8a82] mb-1">
                POSIÇÃO DA TEXTO NA LIGHTBOX
              </label>"""

new_settings = """            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-semibold tracking-widest text-[#8e8a82] mb-1">
                POSIÇÃO DAS SETAS (DESKTOP HORIZONTAL)
              </label>
              <select
                name="lightboxArrowsDesktopLandscape"
                value={settings.lightboxArrowsDesktopLandscape || 'sides'}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-none px-4 py-2 text-white text-xs"
              >
                <option value="sides">Lados (Centro)</option>
                <option value="bottom">Fundo (Debaixo da foto)</option>
                <option value="top">Topo</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-semibold tracking-widest text-[#8e8a82] mb-1">
                POSIÇÃO DAS SETAS (DESKTOP VERTICAL)
              </label>
              <select
                name="lightboxArrowsDesktopPortrait"
                value={settings.lightboxArrowsDesktopPortrait || 'sides'}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-none px-4 py-2 text-white text-xs"
              >
                <option value="sides">Lados (Centro)</option>
                <option value="bottom">Fundo (Debaixo da foto)</option>
                <option value="top">Topo</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-semibold tracking-widest text-[#8e8a82] mb-1">
                POSIÇÃO DAS SETAS (MOBILE HORIZONTAL)
              </label>
              <select
                name="lightboxArrowsMobileLandscape"
                value={settings.lightboxArrowsMobileLandscape || 'sides'}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-none px-4 py-2 text-white text-xs"
              >
                <option value="sides">Lados (Centro)</option>
                <option value="bottom">Fundo (Debaixo da foto)</option>
                <option value="top">Topo</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-semibold tracking-widest text-[#8e8a82] mb-1">
                POSIÇÃO DAS SETAS (MOBILE VERTICAL)
              </label>
              <select
                name="lightboxArrowsMobilePortrait"
                value={settings.lightboxArrowsMobilePortrait || 'bottom'}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-none px-4 py-2 text-white text-xs"
              >
                <option value="sides">Lados (Centro)</option>
                <option value="bottom">Fundo (Debaixo da foto)</option>
                <option value="top">Topo</option>
              </select>
            </div>

"""

code = code.replace(target, new_settings + target)

with open("src/components/SettingsPanelTabs/SettingsGaleria.tsx", "w") as f:
    f.write(code)
print("Done adding settings")
