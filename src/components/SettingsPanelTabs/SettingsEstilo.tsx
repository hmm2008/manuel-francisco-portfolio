import React from 'react';
import { motion } from 'motion/react';
import { Type, LayoutDashboard } from 'lucide-react';
import { SiteSettings } from '../../types';
import { FONT_OPTIONS } from '../../utils/fontUtils';
import { SettingRow, RangeSlider, SettingSelect, SettingTextStyle } from './SharedComponents';

interface SettingsEstiloProps {
  settings: SiteSettings;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleRangeChange: (name: string, value: number) => void;
}

export default function SettingsEstilo({ settings, handleChange, handleRangeChange }: SettingsEstiloProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Tipografia Global */}
      <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="border-b border-[#f0ece5] pb-4">
          <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
            <Type size={20} className="text-[#8e8a82]" /> Tipografia & Estilo Global
          </h2>
          <p className="text-xs text-[#8e8a82] font-sans mt-1">Defina a fonte de texto principal e o aspeto do menu lateral.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <SettingSelect
              label="TIPO DE LETRA BASE (CORPO)"
              name="globalFont"
              value={settings.globalFont}
              options={FONT_OPTIONS.map(f => ({ label: f, value: f }))}
              onChange={handleChange}
            />
            <SettingRow
              label="COR PRINCIPAL DO TEXTO"
              name="globalColor"
              type="color"
              value={settings.globalColor}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-6">
            <SettingSelect
              label="TIPO DE LETRA DO MENU LATERAL"
              name="menuFont"
              value={settings.menuFont || settings.globalFont}
              options={FONT_OPTIONS.map(f => ({ label: f, value: f }))}
              onChange={handleChange}
            />
            <SettingRow
              label="COR DO TEXTO DO MENU"
              name="menuColor"
              type="color"
              value={settings.menuColor || '#000000'}
              onChange={handleChange}
            />
            <SettingTextStyle
              label="ESTILO DO MENU"
              name="menuTextStyle"
              value={settings.menuTextStyle || ''}
              onChange={(name, val) => handleChange({ target: { name, value: val } } as any)}
            />
            <SettingRow
              label="COR DAS LINHAS DE SEPARAÇÃO"
              name="menuLinesColor"
              type="color"
              value={settings.menuLinesColor || '#1a1a1a'}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Espaçamentos e Margens */}
      <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="border-b border-[#f0ece5] pb-4">
          <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
            <LayoutDashboard size={20} className="text-[#8e8a82]" /> Espaçamentos Específicos
          </h2>
          <p className="text-xs text-[#8e8a82] font-sans mt-1">Ajuste fino de distâncias e espaços.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#fcfbf9] border border-[#e8e4dc] p-6">
          <RangeSlider
            label="ESPAÇAMENTO ENTRE BOTÕES DO MENU LATERAL"
            name="sidebarButtonSpacing"
            value={settings.sidebarButtonSpacing !== undefined ? settings.sidebarButtonSpacing : 16}
            min={0} max={64} step={2}
            onChange={handleRangeChange}
          />
          <RangeSlider
            label="DISTÂNCIA DO TEXTO DE BOAS VINDAS (INÍCIO)"
            name="messageSpacing"
            value={settings.messageSpacing !== undefined ? settings.messageSpacing : 16}
            min={0} max={100} step={2}
            onChange={handleRangeChange}
          />
          <RangeSlider
            label="MARGEM SUPERIOR DO SLIDESHOW"
            name="slideshowTopMargin"
            value={settings.slideshowTopMargin !== undefined ? settings.slideshowTopMargin : 0}
            min={0} max={100} step={2}
            onChange={handleRangeChange}
          />
          <RangeSlider
            label="PREENCHIMENTO (PADDING) FOTO SLIDESHOW"
            name="slideshowPhotoPadding"
            value={settings.slideshowPhotoPadding !== undefined ? settings.slideshowPhotoPadding : 16}
            min={0} max={64} step={2}
            onChange={handleRangeChange}
          />
        </div>
      </div>
    </motion.div>
  );
}
