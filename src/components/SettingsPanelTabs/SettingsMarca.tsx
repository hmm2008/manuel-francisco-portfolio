import React from 'react';
import { motion } from 'motion/react';
import { Palette, MessageSquare } from 'lucide-react';
import { SiteSettings } from '../../types';
import { FONT_OPTIONS } from '../../utils/fontUtils';
import { SettingRow, RangeSlider, SettingSelect } from './SharedComponents';

interface SettingsMarcaProps {
  settings: SiteSettings;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleRangeChange: (name: string, value: number) => void;
}

export default function SettingsMarca({ settings, handleChange, handleRangeChange }: SettingsMarcaProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Marca do Site */}
      <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="border-b border-[#f0ece5] pb-4">
          <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
            <Palette size={20} className="text-[#8e8a82]" /> Marca do Site
          </h2>
          <p className="text-xs text-[#8e8a82] font-sans mt-1">Defina a identidade do cabeçalho e título principal.</p>
        </div>

        <SettingRow
          label="NOME DO SITE"
          name="siteName"
          type="textarea"
          value={settings.siteName}
          onChange={handleChange}
          rows={2}
          placeholder="Insira o nome do site"
        />
        <p className="text-[11px] text-[#8e8a82] font-sans -mt-4">Pressione Enter para criar uma quebra de linha no logótipo.</p>

        {/* Preview e Tipografia do Logótipo */}
        <div className="bg-[#fcfbf9] border border-[#e8e4dc] p-6 space-y-6">
          <span className="text-[10px] uppercase tracking-widest text-[#8e8a82] font-bold block"> PRÉ-VISUALIZAÇÃO DO LOGÓTIPO</span>
          
          <div className="border border-dashed border-[#d8d3c9] p-8 text-center flex flex-col items-center justify-center min-h-[140px] bg-white">
            <div style={{ 
               fontFamily: settings.siteNameFont.includes('serif moderno') ? 'sans-serif' : 'serif', 
               fontSize: `${settings.siteNameFontSize}px`, 
               color: settings.siteNameColor,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              lineHeight: '1.4',
              whiteSpace: 'pre-line'
            }}>
              {settings.siteName}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SettingSelect
              label="TIPO DE LETRA"
              name="siteNameFont"
              value={settings.siteNameFont}
              options={FONT_OPTIONS.map(f => ({ label: f, value: f }))}
              onChange={handleChange}
            />
            
            <RangeSlider
              label="TAMANHO"
              name="siteNameFontSize"
              value={settings.siteNameFontSize}
              min={12} max={48}
              onChange={handleRangeChange}
            />

            <SettingRow
              label="COR DO LOGÓTIPO"
              name="siteNameColor"
              type="color"
              value={settings.siteNameColor}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Margens do Menu (Desktop) */}
      <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="border-b border-[#f0ece5] pb-4">
          <h3 className="font-serif text-lg text-[#1a1a1a]">Espaçamentos do Menu Sidebar</h3>
          <p className="text-xs text-[#8e8a82] font-sans mt-1">Ajuste as margens do título no menu lateral (apenas Desktop).</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <RangeSlider
            label="MARGEM SUPERIOR"
            name="sidebarTitleTopMargin"
            value={settings.sidebarTitleTopMargin}
            min={0} max={150} step={2}
            onChange={handleRangeChange}
          />
          <RangeSlider
            label="MARGEM INFERIOR"
            name="sidebarTitleBottomMargin"
            value={settings.sidebarTitleBottomMargin}
            min={0} max={100} step={2}
            onChange={handleRangeChange}
          />
          <RangeSlider
            label="MARGEM ESQUERDA"
            name="sidebarTitleLeftMargin"
            value={settings.sidebarTitleLeftMargin}
            min={0} max={100} step={2}
            onChange={handleRangeChange}
          />
          <RangeSlider
            label="MARGEM DIREITA"
            name="sidebarTitleRightMargin"
            value={settings.sidebarTitleRightMargin}
            min={0} max={100} step={2}
            onChange={handleRangeChange}
          />
          <RangeSlider
            label="ESPAÇAMENTO ENTRE BOTÕES DO MENU"
            name="sidebarButtonSpacing"
            value={settings.sidebarButtonSpacing}
            min={0} max={64} step={2}
            onChange={handleRangeChange}
          />
          <RangeSlider
            label="MARGEM DO FOOTER (FUNDO)"
            name="sidebarFooterBottomMargin"
            value={settings.sidebarFooterBottomMargin}
            min={0} max={100} step={2}
            onChange={handleRangeChange}
          />
        </div>
      </div>

      {/* Margens das Páginas Principais */}
      <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="border-b border-[#f0ece5] pb-4">
          <h3 className="font-serif text-lg text-[#1a1a1a]">Espaçamentos do Título Central</h3>
          <p className="text-xs text-[#8e8a82] font-sans mt-1">Ajuste o espaço à volta do título nas páginas (Galeria, Biografia, etc).</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <RangeSlider
            label="ESPAÇAMENTO SUPERIOR"
            name="mainTitleTopMargin"
            value={settings.mainTitleTopMargin}
            min={0} max={150} step={2}
            onChange={handleRangeChange}
          />
          <RangeSlider
            label="ESPAÇAMENTO INFERIOR"
            name="mainTitleBottomMargin"
            value={settings.mainTitleBottomMargin}
            min={0} max={100} step={2}
            onChange={handleRangeChange}
          />
          <RangeSlider
            label="MARGEM DO RODAPÉ (PÁGINAS)"
            name="footerBottomSpacing"
            value={settings.footerBottomSpacing}
            min={0} max={100} step={2}
            onChange={handleRangeChange}
          />
        </div>
      </div>

      {/* Mensagem de Boas-vindas (Início) */}
      <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="border-b border-[#f0ece5] pb-4">
          <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
            <MessageSquare size={20} className="text-[#8e8a82]" /> Mensagem de Boas-vindas
          </h2>
          <p className="text-xs text-[#8e8a82] font-sans mt-1">Texto exibido na página inicial por baixo do título.</p>
        </div>

        <SettingRow
          label="MENSAGEM"
          name="welcomeMessage"
          type="textarea"
          value={settings.welcomeMessage}
          onChange={handleChange}
          rows={4}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#fcfbf9] border border-[#e8e4dc] p-6">
          <SettingSelect
            label="TIPO DE LETRA DA MENSAGEM"
            name="messageFont"
            value={settings.messageFont}
            options={FONT_OPTIONS.map(f => ({ label: f, value: f }))}
            onChange={handleChange}
          />
          <SettingSelect
            label="ALINHAMENTO"
            name="messageAlignment"
            value={settings.messageAlignment}
            options={[
              { label: 'Esquerda', value: 'left' },
              { label: 'Centro', value: 'center' },
              { label: 'Direita', value: 'right' }
            ]}
            onChange={handleChange}
          />
          <RangeSlider
            label="TAMANHO DO TEXTO"
            name="messageFontSize"
            value={settings.messageFontSize}
            min={10} max={32}
            onChange={handleRangeChange}
          />
          <SettingRow
            label="COR DA MENSAGEM"
            name="messageColor"
            type="color"
            value={settings.messageColor}
            onChange={handleChange}
          />
          <div className="md:col-span-2">
            <RangeSlider
              label="DISTÂNCIA DO TOPO (SLIDESHOW/GALERIA)"
              name="slideshowTopMargin"
              value={settings.slideshowTopMargin || 0}
              min={0} max={150} step={2}
              onChange={handleRangeChange}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
