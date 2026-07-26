import React from 'react';
import { motion } from 'motion/react';
import { ImageIcon, ShieldCheck, ZoomIn, Sliders, Play, Settings2 } from 'lucide-react';
import { SiteSettings } from '../../types';
import { FONT_OPTIONS } from '../../utils/fontUtils';
import { SLIDESHOW_EFFECT_OPTIONS, LIGHTBOX_EFFECT_OPTIONS } from "../../utils/transitionUtils";
import { SettingRow, RangeSlider, SettingSelect, SettingToggle, SettingTextStyle } from './SharedComponents';

interface SettingsGaleriaProps {
  settings: SiteSettings;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleRangeChange: (name: string, value: number) => void;
}

export default function SettingsGaleria({ settings, handleChange, handleRangeChange }: SettingsGaleriaProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Qualidade e Compressão de Imagens */}
      <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="border-b border-[#f0ece5] pb-4">
          <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
            <Sliders size={20} className="text-[#8e8a82]" /> Qualidade de Imagem e Sistema
          </h2>
          <p className="text-xs text-[#8e8a82] font-sans mt-1">Configurações de compressão e qualidade para otimização.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#fcfbf9] border border-[#e8e4dc] p-6">
          <SettingSelect
            label="QUALIDADE ORIGINAL DE UPLOAD"
            name="importQuality"
            value={settings.importQuality}
            options={[
              { label: 'Máxima (4K - 3840px)', value: '3840 px' },
              { label: 'Alta (1080p - 1920px)', value: '1920 px' },
              { label: 'Padrão (1800px)', value: '1800 px' },
              { label: 'Web (1200px)', value: '1200 px' },
            ]}
            onChange={handleChange}
          />
          <SettingSelect
            label="RESOLUÇÃO MÁXIMA DA LIGHTBOX"
            name="lightboxQuality"
            value={settings.lightboxQuality}
            options={[
              { label: 'Original Upload', value: 'original' },
              { label: 'Alta (1920px)', value: '1920 px' },
              { label: 'Padrão (1800px)', value: '1800 px' },
              { label: 'Web (1200px)', value: '1200 px' },
            ]}
            onChange={handleChange}
          />
          <RangeSlider
            label="TAMANHO DAS MINIATURAS (ADMIN)"
            name="adminThumbSizePx"
            value={settings.adminThumbSizePx || 200}
            min={100} max={400} step={10}
            onChange={handleRangeChange}
          />
          <RangeSlider
            label="COMPRESSÃO WEBP"
            name="compressQuality"
            value={settings.compressQuality || 80}
            min={10} max={100} step={5} unit="%"
            onChange={handleRangeChange}
          />
          <div className="md:col-span-2 space-y-4 pt-4 border-t border-[#e8e4dc]">
            <SettingToggle
              label="APLICAR NITIDEZ (SHARPENING) AUTOMÁTICO"
              name="enableSharpen"
              checked={settings.enableSharpen || false}
              onChange={handleChange}
              description="Aplica um ligeiro unsharp mask após a compressão nas miniaturas."
            />
            {settings.enableSharpen && (
              <div className="pl-6 border-l-2 border-[#1a1a1a]">
                <RangeSlider
                  label="INTENSIDADE DA NITIDEZ"
                  name="sharpenAmount"
                  value={settings.sharpenAmount || 30}
                  min={0} max={100} step={5} unit="%"
                  onChange={handleRangeChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comportamento da Lightbox */}
      <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="border-b border-[#f0ece5] pb-4">
          <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
            <ZoomIn size={20} className="text-[#8e8a82]" /> Experiência de Visualização (Lightbox)
          </h2>
          <p className="text-xs text-[#8e8a82] font-sans mt-1">Configure as transições e interações das fotos ampliadas.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#fcfbf9] border border-[#e8e4dc] p-6">
          <SettingSelect
            label="TEMA DO FUNDO (GALERIA GRID)"
            name="galleryTheme"
            value={settings.galleryTheme}
            options={[
              { label: 'Claro (Padrão)', value: 'Claro' },
              { label: 'Escuro', value: 'Escuro' },
            ]}
            onChange={handleChange}
          />
          <SettingSelect
            label="LEGENDA NO GRID"
            name="showCaptions"
            value={settings.showCaptions}
            options={[
              { label: 'Visível ao passar o rato (Hover)', value: 'Hover' },
              { label: 'Sempre Visível', value: 'Sempre' },
              { label: 'Ocultar Legendas', value: 'Nunca' },
            ]}
            onChange={handleChange}
          />
          <SettingSelect
            label="POSIÇÃO DA LEGENDA NO GRID"
            name="captionPosition"
            value={settings.captionPosition || 'bottom-center'}
            options={[
              { label: 'Inferior Esquerda', value: 'bottom-left' },
              { label: 'Inferior Centro', value: 'bottom-center' },
              { label: 'Inferior Direita', value: 'bottom-right' },
              { label: 'Centro da Imagem', value: 'center' },
            ]}
            onChange={handleChange}
          />
          <SettingSelect
            label="EFEITO DE TRANSIÇÃO (LIGHTBOX)"
            name="lightboxEffect"
            value={settings.lightboxEffect}
            options={LIGHTBOX_EFFECT_OPTIONS.map(f => ({ label: f, value: f }))}
            onChange={handleChange}
          />
          <RangeSlider
            label="NÍVEL DE ZOOM PADRÃO DA LIGHTBOX"
            name="defaultZoomLevel"
            value={settings.defaultZoomLevel || 100}
            min={50} max={200} step={10} unit="%"
            onChange={handleRangeChange}
          />
          <SettingRow
            label="COR DE FUNDO DA LIGHTBOX"
            name="lightboxBgColor"
            type="color"
            value={settings.lightboxBgColor}
            onChange={handleChange}
          />
          <SettingSelect
            label="POSICIONAMENTO DA LEGENDA NA LIGHTBOX"
            name="lightboxTextPosition"
            value={settings.lightboxTextPosition || 'canto inferior esq'}
            options={[
              { label: 'Canto Inferior Esquerdo', value: 'canto inferior esq' },
              { label: 'Canto Inferior Direito', value: 'canto inferior dir' },
              { label: 'Canto Superior Esquerdo', value: 'canto superior esq' },
              { label: 'Canto Superior Direito', value: 'canto superior dir' },
              { label: 'Centrado em Baixo', value: 'centrado em baixo' },
              { label: 'Centrado em Cima', value: 'centrado em cima' },
              { label: 'Ao Centro', value: 'ao centro' },
              { label: 'Não mostrar', value: 'none' },
            ]}
            onChange={handleChange}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingSelect
              label="FONTE DO TÍTULO (LIGHTBOX)"
              name="lightboxTitleFont"
              value={settings.lightboxTitleFont || 'Plus Jakarta Sans — sans-serif limpo moderno'}
              options={FONT_OPTIONS.map(f => ({ label: f, value: f }))}
              onChange={handleChange}
            />
            <SettingRow
              label="TAMANHO DO TÍTULO"
              name="lightboxTitleSize"
              value={settings.lightboxTitleSize || '18px'}
              onChange={handleChange}
              placeholder="ex: 18px"
            />
          </div>
          <SettingTextStyle
            label="ESTILO DO TÍTULO"
            name="lightboxTitleStyle"
            value={settings.lightboxTitleStyle || ''}
            onChange={(name, val) => handleChange({ target: { name, value: val } } as any)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingSelect
              label="FONTE DO SUBTÍTULO (LIGHTBOX)"
              name="lightboxSubtitleFont"
              value={settings.lightboxSubtitleFont || 'Plus Jakarta Sans — sans-serif limpo moderno'}
              options={FONT_OPTIONS.map(f => ({ label: f, value: f }))}
              onChange={handleChange}
            />
            <SettingRow
              label="TAMANHO DO SUBTÍTULO"
              name="lightboxSubtitleSize"
              value={settings.lightboxSubtitleSize || '12px'}
              onChange={handleChange}
              placeholder="ex: 12px"
            />
          </div>
          <SettingTextStyle
            label="ESTILO DO SUBTÍTULO"
            name="lightboxSubtitleStyle"
            value={settings.lightboxSubtitleStyle || ''}
            onChange={(name, val) => handleChange({ target: { name, value: val } } as any)}
          />
          <SettingRow
            label="COR DOS TEXTOS DA LIGHTBOX"
            name="lightboxTextColor"
            type="color"
            value={settings.lightboxTextColor || '#ffffff'}
            onChange={handleChange}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingToggle
              label="FUNDO DO TEXTO"
              name="enableLightboxTextBg"
              checked={settings.enableLightboxTextBg ?? false}
              onChange={handleChange}
            />
            {settings.enableLightboxTextBg && (
              <SettingRow
                label="COR DO FUNDO DO TEXTO"
                name="lightboxTextBgColor"
                type="color"
                value={settings.lightboxTextBgColor || '#000000'}
                onChange={handleChange}
              />
            )}
          </div>
          <SettingSelect
            label="LOCALIZAÇÃO DAS LEGENDAS"
            name="lightboxCaptionPlacement"
            value={settings.lightboxCaptionPlacement || 'inside'}
            options={[
              { label: 'Dentro da Imagem', value: 'inside' },
              { label: 'Fora da Imagem (borda)', value: 'outside' }
            ]}
            onChange={handleChange}
          />
          <RangeSlider
            label="DISTÂNCIA DA LEGENDA (px)"
            name="lightboxCaptionPadding"
            value={settings.lightboxCaptionPadding ?? 16}
            min={0} max={100}
            onChange={handleRangeChange}
          />
        </div>
      </div>

      {/* Opções de Funcionalidades */}
      <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="border-b border-[#f0ece5] pb-4">
          <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
            <Settings2 size={20} className="text-[#8e8a82]" /> Funcionalidades da Galeria
          </h2>
          <p className="text-xs text-[#8e8a82] font-sans mt-1">Ative ou desative ferramentas interativas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingToggle
            label="MOSTRAR DADOS EXIF (CÂMARA)"
            name="showExifData"
            checked={settings.showExifData}
            onChange={handleChange}
          />
          <SettingToggle
            label="ATALHOS DE TECLADO"
            name="enableKeyboardShortcuts"
            checked={settings.enableKeyboardShortcuts}
            onChange={handleChange}
          />
          <SettingToggle
            label="PESQUISA DE FOTOS"
            name="enableGallerySearch"
            checked={settings.enableGallerySearch}
            onChange={handleChange}
          />
          <SettingToggle
            label="SISTEMA DE FAVORITOS"
            name="enableFavorites"
            checked={settings.enableFavorites}
            onChange={handleChange}
          />
          <SettingToggle
            label="COMPARAÇÃO DE FOTOS"
            name="enablePhotoComparison"
            checked={settings.enablePhotoComparison}
            onChange={handleChange}
          />
          <SettingToggle
            label="FILTRO MONOCROMÁTICO (P/B)"
            name="enableMonochromeToggle"
            checked={settings.enableMonochromeToggle}
            onChange={handleChange}
          />
          <SettingToggle
            label="DOWNLOAD DE FOTOS"
            name="enablePhotoDownload"
            checked={settings.enablePhotoDownload}
            onChange={handleChange}
          />
          <SettingToggle
            label="SISTEMA DE LIKES"
            name="enablePhotoLikes"
            checked={settings.enablePhotoLikes}
            onChange={handleChange}
          />
          
          <div className="md:col-span-2 space-y-4 pt-4 border-t border-[#e8e4dc]">
            <SettingToggle
              label="MODO ZEN (EASY-VIEW)"
              name="enableZenMode"
              checked={settings.enableZenMode}
              onChange={handleChange}
              description="Esconde UI e aplica margens negras ao redor da imagem."
            />
            {settings.enableZenMode && (
              <div className="pl-6 border-l-2 border-[#1a1a1a] grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <SettingRow
                  label="COR DO BOTÃO ZEN"
                  name="zenModeButtonColor"
                  type="color"
                  value={settings.zenModeButtonColor || '#fde68a'}
                  onChange={handleChange}
                />
                <SettingRow
                  label="COR DE FUNDO DO BOTÃO ZEN"
                  name="zenModeButtonBgColor"
                  type="text"
                  value={settings.zenModeButtonBgColor || 'rgba(0, 0, 0, 0.4)'}
                  onChange={handleChange}
                  placeholder="ex: rgba(0,0,0,0.4)"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Proteção e Marca de Água */}
      <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="border-b border-[#f0ece5] pb-4">
          <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
            <ShieldCheck size={20} className="text-[#8e8a82]" /> Proteção de Imagem
          </h2>
        </div>

        <div className="space-y-6">
          <SettingToggle
            label="PROTEGER FOTOGRAFIAS CONTRA DOWNLOAD DIRETO"
            name="protectPhotos"
            checked={settings.protectPhotos || false}
            onChange={handleChange}
            description="Impede o clique direito do rato e o arrastamento das imagens na galeria."
          />
          
          {settings.protectPhotos && (
            <div className="pl-6 border-l-2 border-[#1a1a1a] space-y-6">
              <SettingToggle
                label="MOSTRAR MENSAGEM DE AVISO (CLIQUE DIREITO)"
                name="enableRightClickMessage"
                checked={settings.enableRightClickMessage ?? true}
                onChange={handleChange}
              />
              {(settings.enableRightClickMessage ?? true) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#fcfbf9] border border-[#e8e4dc] p-4">
                  <SettingRow label="TÍTULO DO AVISO" name="rightClickTitle" value={settings.rightClickTitle || 'Copyright'} onChange={handleChange} />
                  <SettingRow label="SUBTÍTULO DO AVISO" name="rightClickSubtitle" value={settings.rightClickSubtitle || 'Todos os direitos reservados'} onChange={handleChange} />
                  <SettingTextStyle label="ESTILO DO TÍTULO" name="rightClickTitleStyle" value={settings.rightClickTitleStyle || ''} onChange={(name, val) => handleChange({ target: { name, value: val } } as any)} />
                  <SettingTextStyle label="ESTILO DO SUBTÍTULO" name="rightClickSubtitleStyle" value={settings.rightClickSubtitleStyle || ''} onChange={(name, val) => handleChange({ target: { name, value: val } } as any)} />
                  <SettingSelect label="FONTE DO AVISO" name="rightClickFont" value={settings.rightClickFont || settings.globalFont} options={FONT_OPTIONS.map(f => ({label: f, value: f}))} onChange={handleChange} />
                  <SettingRow label="TAMANHO DO AVISO" name="rightClickSize" value={settings.rightClickSize || '14px'} onChange={handleChange} />
                  <SettingRow label="COR DO TEXTO" name="rightClickColor" type="color" value={settings.rightClickColor || '#ffffff'} onChange={handleChange} />
                  <SettingRow label="COR DE FUNDO" name="rightClickBgColor" type="text" value={settings.rightClickBgColor || 'rgba(0, 0, 0, 0.85)'} onChange={handleChange} />
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-[#e8e4dc]">
            <SettingToggle
              label="MARCA DE ÁGUA NA GALERIA GRID"
              name="enableWatermark"
              checked={settings.enableWatermark}
              onChange={handleChange}
            />
            {settings.enableWatermark && (
              <div className="pl-6 border-l-2 border-[#1a1a1a] grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <SettingRow label="TEXTO DA MARCA DE ÁGUA" name="watermarkText" value={settings.watermarkText} onChange={handleChange} />
                <SettingSelect
                  label="POSIÇÃO DA MARCA DE ÁGUA (GRID)"
                  name="watermarkPosition"
                  value={settings.watermarkPosition}
                  options={[
                    { label: 'Inferior Esquerda', value: 'bottom-left' },
                    { label: 'Inferior Direita', value: 'bottom-right' },
                    { label: 'Centro', value: 'center' },
                  ]}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slideshow */}
      <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="border-b border-[#f0ece5] pb-4">
          <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
            <Play size={20} className="text-[#8e8a82]" /> Início (Slideshow)
          </h2>
          <p className="text-xs text-[#8e8a82] font-sans mt-1">Configurações para as fotografias na página inicial.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#fcfbf9] border border-[#e8e4dc] p-6">
          <RangeSlider
            label="INTERVALO DE TRANSIÇÃO (SEGUNDOS)"
            name="slideshowInterval"
            value={settings.slideshowInterval}
            min={2} max={15}
            onChange={handleRangeChange}
            unit="s"
          />
          <SettingSelect
            label="EFEITO DE TRANSIÇÃO"
            name="slideshowEffect"
            value={settings.slideshowEffect}
            options={SLIDESHOW_EFFECT_OPTIONS.map(f => ({ label: f, value: f }))}
            onChange={handleChange}
          />
          <RangeSlider
            label="NÍVEL DE ZOOM DO SLIDESHOW"
            name="slideshowZoom"
            value={settings.slideshowZoom || 100}
            min={30} max={150} step={5} unit="%"
            onChange={handleRangeChange}
          />
          <SettingRow
            label="COR DE FUNDO"
            name="slideshowBgColor"
            type="color"
            value={settings.slideshowBgColor}
            onChange={handleChange}
          />
          <SettingSelect
            label="POSICIONAMENTO DA LEGENDA NO SLIDESHOW"
            name="slideshowTextPosition"
            value={settings.slideshowTextPosition || 'canto inferior esq'}
            options={[
              { label: 'Canto Inferior Esquerdo', value: 'canto inferior esq' },
              { label: 'Canto Inferior Direito', value: 'canto inferior dir' },
              { label: 'Canto Superior Esquerdo', value: 'canto superior esq' },
              { label: 'Canto Superior Direito', value: 'canto superior dir' },
              { label: 'Centrado em Baixo', value: 'centrado em baixo' },
              { label: 'Centrado em Cima', value: 'centrado em cima' },
              { label: 'Ao Centro', value: 'ao centro' },
              { label: 'Não mostrar', value: 'none' },
            ]}
            onChange={handleChange}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingSelect
              label="FONTE DO TÍTULO (SLIDESHOW)"
              name="slideshowTitleFont"
              value={settings.slideshowTitleFont || 'Plus Jakarta Sans — sans-serif limpo moderno'}
              options={FONT_OPTIONS.map(f => ({ label: f, value: f }))}
              onChange={handleChange}
            />
            <SettingRow
              label="TAMANHO DO TÍTULO"
              name="slideshowTitleSize"
              value={settings.slideshowTitleSize || '48px'}
              onChange={handleChange}
              placeholder="ex: 48px"
            />
          </div>
          <SettingTextStyle
            label="ESTILO DO TÍTULO"
            name="slideshowTitleStyle"
            value={settings.slideshowTitleStyle || ''}
            onChange={(name, val) => handleChange({ target: { name, value: val } } as any)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingSelect
              label="FONTE DO SUBTÍTULO (SLIDESHOW)"
              name="slideshowSubtitleFont"
              value={settings.slideshowSubtitleFont || 'Plus Jakarta Sans — sans-serif limpo moderno'}
              options={FONT_OPTIONS.map(f => ({ label: f, value: f }))}
              onChange={handleChange}
            />
            <SettingRow
              label="TAMANHO DO SUBTÍTULO"
              name="slideshowSubtitleSize"
              value={settings.slideshowSubtitleSize || '12px'}
              onChange={handleChange}
              placeholder="ex: 12px"
            />
          </div>
          <SettingTextStyle
            label="ESTILO DO SUBTÍTULO"
            name="slideshowSubtitleStyle"
            value={settings.slideshowSubtitleStyle || ''}
            onChange={(name, val) => handleChange({ target: { name, value: val } } as any)}
          />
          <SettingRow
            label="COR DOS TEXTOS DO SLIDESHOW"
            name="slideshowTextColor"
            type="color"
            value={settings.slideshowTextColor || '#ffffff'}
            onChange={handleChange}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingToggle
              label="FUNDO DO TEXTO"
              name="enableSlideshowTextBg"
              checked={settings.enableSlideshowTextBg ?? false}
              onChange={handleChange}
            />
            {settings.enableSlideshowTextBg && (
              <SettingRow
                label="COR DO FUNDO DO TEXTO"
                name="slideshowTextBgColor"
                type="color"
                value={settings.slideshowTextBgColor || '#000000'}
                onChange={handleChange}
              />
            )}
          </div>
          <SettingSelect
            label="LOCALIZAÇÃO DAS LEGENDAS"
            name="slideshowCaptionPlacement"
            value={settings.slideshowCaptionPlacement || 'inside'}
            options={[
              { label: 'Dentro da Imagem', value: 'inside' },
              { label: 'Fora da Imagem (borda)', value: 'outside' }
            ]}
            onChange={handleChange}
          />
          <RangeSlider
            label="DISTÂNCIA DA LEGENDA (px)"
            name="slideshowCaptionPadding"
            value={settings.slideshowCaptionPadding ?? 16}
            min={0} max={100}
            onChange={handleRangeChange}
          />
        </div>
      </div>
    </motion.div>
  );
}
