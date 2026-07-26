import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Type, LayoutDashboard, User, Mail, BookOpen, Link, Sliders, Heading } from 'lucide-react';
import { SiteSettings } from '../../types';
import { FONT_OPTIONS } from '../../utils/fontUtils';
import { SettingRow, RangeSlider, SettingSelect, SettingTextStyle, SettingLetterSpacing } from './SharedComponents';

interface SettingsEstiloProps {
  settings: SiteSettings;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleRangeChange: (name: string, value: number) => void;
}

export default function SettingsEstilo({ settings, handleChange, handleRangeChange }: SettingsEstiloProps) {
  const [activeSubTab, setActiveSubTab] = useState<'geral' | 'biografia' | 'contactos' | 'livro' | 'links' | 'cabecalho' | 'espacamento'>('biografia');
  const fontOptions = FONT_OPTIONS.map(f => ({ label: f, value: f }));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Sub-Navigation for Page Typography & Styles */}
      <div className="bg-white border border-[#e8e4dc] p-4 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-[#8e8a82] mb-3 px-1 flex items-center gap-2">
          <Heading size={16} /> Selecione a Página / Secção para Configurar Estilos & Tipografia:
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('biografia')}
            className={`px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'biografia'
                ? 'bg-[#1a1a1a] text-white shadow-sm'
                : 'bg-[#f8f7f5] text-[#4a4a4a] hover:bg-[#e8e4dc]'
            }`}
          >
            <User size={14} /> Biografia
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('contactos')}
            className={`px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'contactos'
                ? 'bg-[#1a1a1a] text-white shadow-sm'
                : 'bg-[#f8f7f5] text-[#4a4a4a] hover:bg-[#e8e4dc]'
            }`}
          >
            <Mail size={14} /> Contactos
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('livro')}
            className={`px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'livro'
                ? 'bg-[#1a1a1a] text-white shadow-sm'
                : 'bg-[#f8f7f5] text-[#4a4a4a] hover:bg-[#e8e4dc]'
            }`}
          >
            <BookOpen size={14} /> Livro de Visitas
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('links')}
            className={`px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'links'
                ? 'bg-[#1a1a1a] text-white shadow-sm'
                : 'bg-[#f8f7f5] text-[#4a4a4a] hover:bg-[#e8e4dc]'
            }`}
          >
            <Link size={14} /> Links / Recursos
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('cabecalho')}
            className={`px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'cabecalho'
                ? 'bg-[#1a1a1a] text-white shadow-sm'
                : 'bg-[#f8f7f5] text-[#4a4a4a] hover:bg-[#e8e4dc]'
            }`}
          >
            <Heading size={14} /> Nome & Boas-Vindas
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('geral')}
            className={`px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'geral'
                ? 'bg-[#1a1a1a] text-white shadow-sm'
                : 'bg-[#f8f7f5] text-[#4a4a4a] hover:bg-[#e8e4dc]'
            }`}
          >
            <Type size={14} /> Tipografia Geral & Menu
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('espacamento')}
            className={`px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'espacamento'
                ? 'bg-[#1a1a1a] text-white shadow-sm'
                : 'bg-[#f8f7f5] text-[#4a4a4a] hover:bg-[#e8e4dc]'
            }`}
          >
            <Sliders size={14} /> Espaçamentos
          </button>
        </div>
      </div>

      {/* PÁGINA: BIOGRAFIA */}
      {activeSubTab === 'biografia' && (
        <div className="space-y-8">
          {/* Título & Subtítulo da Página Biografia */}
          <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
            <div className="border-b border-[#f0ece5] pb-4">
              <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
                <User size={20} className="text-[#8e8a82]" /> Estilos do Título & Subtítulo da Página Biografia
              </h2>
              <p className="text-xs text-[#8e8a82] font-sans mt-1">Defina a fonte, tamanho, cor e espaçamento do título principal ("Biografia") e do subtítulo ("Sobre o Fotógrafo").</p>
            </div>

            {/* Título da Página Biografia */}
            <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">1. Título Principal da Página (ex: Biografia)</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingSelect
                  label="FONTE DO TÍTULO"
                  name="biographyTitleFont"
                  value={settings.biographyTitleFont || settings.biographyFont || settings.globalFont}
                  options={fontOptions}
                  onChange={handleChange}
                />
                <SettingRow
                  label="TAMANHO DO TÍTULO"
                  name="biographyTitleFontSize"
                  value={settings.biographyTitleFontSize || '24px'}
                  onChange={handleChange}
                  placeholder="ex: 24px"
                />
                <SettingRow
                  label="COR DO TÍTULO"
                  name="biographyTitleColor"
                  type="color"
                  value={settings.biographyTitleColor || '#4a4a4a'}
                  onChange={handleChange}
                />
                <SettingTextStyle
                  label="ESTILO DO TÍTULO"
                  name="biographyTitleStyle"
                  value={settings.biographyTitleStyle || ''}
                  onChange={(name, val) => handleChange({ target: { name, value: val } } as any)}
                />
                <div className="md:col-span-2">
                  <SettingLetterSpacing
                    label="ESPAÇAMENTO ENTRE LETRAS DO TÍTULO"
                    name="biographyTitleLetterSpacing"
                    value={settings.biographyTitleLetterSpacing || '1px'}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Subtítulo da Página Biografia */}
            <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">2. Subtítulo da Página (ex: Sobre o Fotógrafo)</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingSelect
                  label="FONTE DO SUBTÍTULO"
                  name="biographySubtitleFont"
                  value={settings.biographySubtitleFont || settings.biographyFont || settings.globalFont}
                  options={fontOptions}
                  onChange={handleChange}
                />
                <SettingRow
                  label="TAMANHO DO SUBTÍTULO"
                  name="biographySubtitleFontSize"
                  value={settings.biographySubtitleFontSize || '12px'}
                  onChange={handleChange}
                  placeholder="ex: 12px"
                />
                <SettingRow
                  label="COR DO SUBTÍTULO"
                  name="biographySubtitleColor"
                  type="color"
                  value={settings.biographySubtitleColor || '#7a7a7a'}
                  onChange={handleChange}
                />
                <SettingTextStyle
                  label="ESTILO DO SUBTÍTULO"
                  name="biographySubtitleStyle"
                  value={settings.biographySubtitleStyle || ''}
                  onChange={(name, val) => handleChange({ target: { name, value: val } } as any)}
                />
                <div className="md:col-span-2">
                  <SettingLetterSpacing
                    label="ESPAÇAMENTO ENTRE LETRAS DO SUBTÍTULO"
                    name="biographySubtitleLetterSpacing"
                    value={settings.biographySubtitleLetterSpacing || '2px'}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Texto Biográfico, Trabalhos Publicados & Exposições */}
          <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
            <div className="border-b border-[#f0ece5] pb-4">
              <h2 className="font-serif text-xl text-[#1a1a1a]">Tipografia do Conteúdo Biográfico</h2>
              <p className="text-xs text-[#8e8a82] font-sans mt-1">Personalize a tipografia do texto biográfico, da secção Trabalhos Publicados e da secção Exposições.</p>
            </div>

            {/* Texto Biográfico */}
            <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">3. Texto Biográfico Principal</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingSelect
                  label="FONTE DO TEXTO BIOGRÁFICO"
                  name="biographyFont"
                  value={settings.biographyFont || settings.globalFont}
                  options={fontOptions}
                  onChange={handleChange}
                />
                <SettingRow
                  label="TAMANHO DO TEXTO BIOGRÁFICO"
                  name="biographyFontSize"
                  value={settings.biographyFontSize || '15px'}
                  onChange={handleChange}
                  placeholder="ex: 15px"
                />
                <SettingRow
                  label="COR DO TEXTO BIOGRÁFICO"
                  name="biographyColor"
                  type="color"
                  value={settings.biographyColor || '#4a4a4a'}
                  onChange={handleChange}
                />
                <SettingTextStyle
                  label="ESTILO DO TEXTO BIOGRÁFICO"
                  name="biographyStyle"
                  value={settings.biographyStyle || ''}
                  onChange={(name, val) => handleChange({ target: { name, value: val } } as any)}
                />
                <div className="md:col-span-2">
                  <SettingLetterSpacing
                    label="ESPAÇAMENTO ENTRE LETRAS"
                    name="biographyLetterSpacing"
                    value={settings.biographyLetterSpacing || '0px'}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Trabalhos Publicados */}
            <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">4. Secção Trabalhos Publicados</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingSelect
                  label="FONTE (TRABALHOS PUBLICADOS)"
                  name="publishedWorksFont"
                  value={settings.publishedWorksFont || settings.biographyFont || settings.globalFont}
                  options={fontOptions}
                  onChange={handleChange}
                />
                <SettingRow
                  label="TAMANHO (TRABALHOS PUBLICADOS)"
                  name="publishedWorksFontSize"
                  value={settings.publishedWorksFontSize || '13px'}
                  onChange={handleChange}
                  placeholder="ex: 13px"
                />
                <SettingRow
                  label="COR (TRABALHOS PUBLICADOS)"
                  name="publishedWorksColor"
                  type="color"
                  value={settings.publishedWorksColor || '#4a4a4a'}
                  onChange={handleChange}
                />
                <SettingTextStyle
                  label="ESTILO (TRABALHOS PUBLICADOS)"
                  name="publishedWorksStyle"
                  value={settings.publishedWorksStyle || ''}
                  onChange={(name, val) => handleChange({ target: { name, value: val } } as any)}
                />
                <div className="md:col-span-2">
                  <SettingLetterSpacing
                    label="ESPAÇAMENTO ENTRE LETRAS"
                    name="publishedWorksLetterSpacing"
                    value={settings.publishedWorksLetterSpacing || '0px'}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Exposições */}
            <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">5. Secção Exposições</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingSelect
                  label="FONTE (EXPOSIÇÕES)"
                  name="exhibitionsFont"
                  value={settings.exhibitionsFont || settings.biographyFont || settings.globalFont}
                  options={fontOptions}
                  onChange={handleChange}
                />
                <SettingRow
                  label="TAMANHO (EXPOSIÇÕES)"
                  name="exhibitionsFontSize"
                  value={settings.exhibitionsFontSize || '13px'}
                  onChange={handleChange}
                  placeholder="ex: 13px"
                />
                <SettingRow
                  label="COR (EXPOSIÇÕES)"
                  name="exhibitionsColor"
                  type="color"
                  value={settings.exhibitionsColor || '#4a4a4a'}
                  onChange={handleChange}
                />
                <SettingTextStyle
                  label="ESTILO (EXPOSIÇÕES)"
                  name="exhibitionsStyle"
                  value={settings.exhibitionsStyle || ''}
                  onChange={(name, val) => handleChange({ target: { name, value: val } } as any)}
                />
                <div className="md:col-span-2">
                  <SettingLetterSpacing
                    label="ESPAÇAMENTO ENTRE LETRAS"
                    name="exhibitionsLetterSpacing"
                    value={settings.exhibitionsLetterSpacing || '0px'}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PÁGINA: CONTACTOS */}
      {activeSubTab === 'contactos' && (
        <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
          <div className="border-b border-[#f0ece5] pb-4">
            <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
              <Mail size={20} className="text-[#8e8a82]" /> Estilos & Tipografia da Página Contactos
            </h2>
            <p className="text-xs text-[#8e8a82] font-sans mt-1">Configure o título principal ("Contacto"), o subtítulo ("ENTRE EM CONTACTO") e as etiquetas do formulário.</p>
          </div>

          {/* Título Principal de Contacto */}
          <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">1. Título Principal (ex: Contacto)</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingSelect
                label="FONTE DO TÍTULO"
                name="contactTitleFont"
                value={settings.contactTitleFont || settings.globalFont}
                options={fontOptions}
                onChange={handleChange}
              />
              <SettingRow
                label="TAMANHO DO TÍTULO"
                name="contactTitleFontSize"
                value={settings.contactTitleFontSize || '36px'}
                onChange={handleChange}
                placeholder="ex: 36px"
              />
              <SettingRow
                label="COR DO TÍTULO"
                name="contactTitleColor"
                type="color"
                value={settings.contactTitleColor || '#4a4a4a'}
                onChange={handleChange}
              />
              <SettingTextStyle
                label="ESTILO DO TÍTULO"
                name="contactTitleStyle"
                value={settings.contactTitleStyle || ''}
                onChange={(name, val) => handleChange({ target: { name, value: val } } as any)}
              />
              <div className="md:col-span-2">
                <SettingLetterSpacing
                  label="ESPAÇAMENTO ENTRE LETRAS DO TÍTULO"
                  name="contactTitleLetterSpacing"
                  value={settings.contactTitleLetterSpacing || '0px'}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Subtítulo de Contacto */}
          <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">2. Subtítulo (ex: ENTRE EM CONTACTO)</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingSelect
                label="FONTE DO SUBTÍTULO"
                name="contactSubtitleFont"
                value={settings.contactSubtitleFont || settings.globalFont}
                options={fontOptions}
                onChange={handleChange}
              />
              <SettingRow
                label="TAMANHO DO SUBTÍTULO"
                name="contactSubtitleFontSize"
                value={settings.contactSubtitleFontSize || '10px'}
                onChange={handleChange}
                placeholder="ex: 10px"
              />
              <SettingRow
                label="COR DO SUBTÍTULO"
                name="contactSubtitleColor"
                type="color"
                value={settings.contactSubtitleColor || '#7a7a7a'}
                onChange={handleChange}
              />
              <SettingTextStyle
                label="ESTILO DO SUBTÍTULO"
                name="contactSubtitleStyle"
                value={settings.contactSubtitleStyle || ''}
                onChange={(name, val) => handleChange({ target: { name, value: val } } as any)}
              />
              <div className="md:col-span-2">
                <SettingLetterSpacing
                  label="ESPAÇAMENTO ENTRE LETRAS DO SUBTÍTULO"
                  name="contactSubtitleLetterSpacing"
                  value={settings.contactSubtitleLetterSpacing || '2px'}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Etiquetas do Formulário */}
          <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">3. Etiquetas dos Campos do Formulário (Nome *, Email *, Mensagem *)</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingSelect
                label="FONTE DAS ETIQUETAS"
                name="contactFormLabelFont"
                value={settings.contactFormLabelFont || settings.globalFont}
                options={fontOptions}
                onChange={handleChange}
              />
              <SettingRow
                label="TAMANHO DAS ETIQUETAS"
                name="contactFormLabelSize"
                value={settings.contactFormLabelSize || '10px'}
                onChange={handleChange}
                placeholder="ex: 10px"
              />
              <SettingRow
                label="COR DAS ETIQUETAS"
                name="contactFormLabelColor"
                type="color"
                value={settings.contactFormLabelColor || '#4a4a4a'}
                onChange={handleChange}
              />
              <SettingLetterSpacing
                label="ESPAÇAMENTO ENTRE LETRAS"
                name="contactFormLabelLetterSpacing"
                value={settings.contactFormLabelLetterSpacing || '2px'}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* PÁGINA: LIVRO DE VISITANTES */}
      {activeSubTab === 'livro' && (
        <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
          <div className="border-b border-[#f0ece5] pb-4">
            <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
              <BookOpen size={20} className="text-[#8e8a82]" /> Estilos da Página Livro de Visitas
            </h2>
            <p className="text-xs text-[#8e8a82] font-sans mt-1">Configure o título ("Livro de Visitas") e o subtítulo/contador ("REGISTOS DE VISITANTES").</p>
          </div>

          {/* Título Principal */}
          <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">1. Título Principal (ex: Livro de Visitas)</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingSelect
                label="FONTE DO TÍTULO"
                name="guestbookTitleFont"
                value={settings.guestbookTitleFont || settings.globalFont}
                options={fontOptions}
                onChange={handleChange}
              />
              <SettingRow
                label="TAMANHO DO TÍTULO"
                name="guestbookTitleFontSize"
                value={settings.guestbookTitleFontSize || '24px'}
                onChange={handleChange}
                placeholder="ex: 24px"
              />
              <SettingRow
                label="COR DO TÍTULO"
                name="guestbookTitleColor"
                type="color"
                value={settings.guestbookTitleColor || '#4a4a4a'}
                onChange={handleChange}
              />
              <SettingTextStyle
                label="ESTILO DO TÍTULO"
                name="guestbookTitleStyle"
                value={settings.guestbookTitleStyle || ''}
                onChange={(name, val) => handleChange({ target: { name, value: val } } as any)}
              />
              <div className="md:col-span-2">
                <SettingLetterSpacing
                  label="ESPAÇAMENTO ENTRE LETRAS DO TÍTULO"
                  name="guestbookTitleLetterSpacing"
                  value={settings.guestbookTitleLetterSpacing || '1px'}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Subtítulo */}
          <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">2. Subtítulo / Estatística (ex: REGISTOS DE VISITANTES)</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingSelect
                label="FONTE DO SUBTÍTULO"
                name="guestbookSubtitleFont"
                value={settings.guestbookSubtitleFont || settings.globalFont}
                options={fontOptions}
                onChange={handleChange}
              />
              <SettingRow
                label="TAMANHO DO SUBTÍTULO"
                name="guestbookSubtitleFontSize"
                value={settings.guestbookSubtitleFontSize || '10px'}
                onChange={handleChange}
                placeholder="ex: 10px"
              />
              <SettingRow
                label="COR DO SUBTÍTULO"
                name="guestbookSubtitleColor"
                type="color"
                value={settings.guestbookSubtitleColor || '#7a7a7a'}
                onChange={handleChange}
              />
              <SettingTextStyle
                label="ESTILO DO SUBTÍTULO"
                name="guestbookSubtitleStyle"
                value={settings.guestbookSubtitleStyle || ''}
                onChange={(name, val) => handleChange({ target: { name, value: val } } as any)}
              />
              <div className="md:col-span-2">
                <SettingLetterSpacing
                  label="ESPAÇAMENTO ENTRE LETRAS DO SUBTÍTULO"
                  name="guestbookSubtitleLetterSpacing"
                  value={settings.guestbookSubtitleLetterSpacing || '2px'}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PÁGINA: LINKS / RECURSOS */}
      {activeSubTab === 'links' && (
        <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
          <div className="border-b border-[#f0ece5] pb-4">
            <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
              <Link size={20} className="text-[#8e8a82]" /> Estilos da Página Links & Recursos
            </h2>
            <p className="text-xs text-[#8e8a82] font-sans mt-1">Configure o título ("Links") e o subtítulo ("RECURSOS").</p>
          </div>

          {/* Título Principal */}
          <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">1. Título Principal (ex: Links)</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingSelect
                label="FONTE DO TÍTULO"
                name="linksTitleFont"
                value={settings.linksTitleFont || settings.globalFont}
                options={fontOptions}
                onChange={handleChange}
              />
              <SettingRow
                label="TAMANHO DO TÍTULO"
                name="linksTitleFontSize"
                value={settings.linksTitleFontSize || '36px'}
                onChange={handleChange}
                placeholder="ex: 36px"
              />
              <SettingRow
                label="COR DO TÍTULO"
                name="linksTitleColor"
                type="color"
                value={settings.linksTitleColor || '#4a4a4a'}
                onChange={handleChange}
              />
              <SettingTextStyle
                label="ESTILO DO TÍTULO"
                name="linksTitleStyle"
                value={settings.linksTitleStyle || ''}
                onChange={(name, val) => handleChange({ target: { name, value: val } } as any)}
              />
              <div className="md:col-span-2">
                <SettingLetterSpacing
                  label="ESPAÇAMENTO ENTRE LETRAS DO TÍTULO"
                  name="linksTitleLetterSpacing"
                  value={settings.linksTitleLetterSpacing || '0px'}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Subtítulo */}
          <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">2. Subtítulo (ex: RECURSOS)</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingSelect
                label="FONTE DO SUBTÍTULO"
                name="linksSubtitleFont"
                value={settings.linksSubtitleFont || settings.globalFont}
                options={fontOptions}
                onChange={handleChange}
              />
              <SettingRow
                label="TAMANHO DO SUBTÍTULO"
                name="linksSubtitleFontSize"
                value={settings.linksSubtitleFontSize || '10px'}
                onChange={handleChange}
                placeholder="ex: 10px"
              />
              <SettingRow
                label="COR DO SUBTÍTULO"
                name="linksSubtitleColor"
                type="color"
                value={settings.linksSubtitleColor || '#7a7a7a'}
                onChange={handleChange}
              />
              <SettingTextStyle
                label="ESTILO DO SUBTÍTULO"
                name="linksSubtitleStyle"
                value={settings.linksSubtitleStyle || ''}
                onChange={(name, val) => handleChange({ target: { name, value: val } } as any)}
              />
              <div className="md:col-span-2">
                <SettingLetterSpacing
                  label="ESPAÇAMENTO ENTRE LETRAS DO SUBTÍTULO"
                  name="linksSubtitleLetterSpacing"
                  value={settings.linksSubtitleLetterSpacing || '2px'}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CABEÇALHOS & NOME DO SITE */}
      {activeSubTab === 'cabecalho' && (
        <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
          <div className="border-b border-[#f0ece5] pb-4">
            <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
              <Heading size={20} className="text-[#8e8a82]" /> Estilos do Nome do Site & Boas-Vindas
            </h2>
            <p className="text-xs text-[#8e8a82] font-sans mt-1">Configure a tipografia do Logótipo/Nome do Fotógrafo e da Mensagem de Boas-Vindas.</p>
          </div>

          {/* Nome do Site / Logótipo */}
          <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">1. Logótipo / Nome do Fotógrafo</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingSelect
                label="FONTE DO NOME DO SITE"
                name="siteNameFont"
                value={settings.siteNameFont || settings.globalFont}
                options={fontOptions}
                onChange={handleChange}
              />
              <SettingRow
                label="COR DO NOME DO SITE"
                name="siteNameColor"
                type="color"
                value={settings.siteNameColor || '#1a1a1a'}
                onChange={handleChange}
              />
              <SettingTextStyle
                label="ESTILO DO NOME DO SITE"
                name="siteNameTextStyle"
                value={settings.siteNameTextStyle || ''}
                onChange={(name, val) => handleChange({ target: { name, value: val } } as any)}
              />
              <SettingLetterSpacing
                label="ESPAÇAMENTO ENTRE LETRAS"
                name="siteNameLetterSpacing"
                value={settings.siteNameLetterSpacing || '0px'}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Mensagem de Boas-Vindas */}
          <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">2. Mensagem de Boas-Vindas (Página Inicial)</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingSelect
                label="FONTE DA MENSAGEM"
                name="messageFont"
                value={settings.messageFont || settings.globalFont}
                options={fontOptions}
                onChange={handleChange}
              />
              <SettingRow
                label="COR DA MENSAGEM"
                name="messageColor"
                type="color"
                value={settings.messageColor || '#1a1a1a'}
                onChange={handleChange}
              />
              <SettingTextStyle
                label="ESTILO DA MENSAGEM"
                name="messageTextStyle"
                value={settings.messageTextStyle || ''}
                onChange={(name, val) => handleChange({ target: { name, value: val } } as any)}
              />
              <SettingLetterSpacing
                label="ESPAÇAMENTO ENTRE LETRAS"
                name="messageLetterSpacing"
                value={settings.messageLetterSpacing || '0px'}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* TIPOGRAFIA GERAL & MENU */}
      {activeSubTab === 'geral' && (
        <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
          <div className="border-b border-[#f0ece5] pb-4">
            <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
              <Type size={20} className="text-[#8e8a82]" /> Tipografia Global & Menu Lateral
            </h2>
            <p className="text-xs text-[#8e8a82] font-sans mt-1">Defina a fonte de texto base do site e os estilos do menu de navegação.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6 bg-[#fcfbf9] border border-[#f0ece5] p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] block mb-2">Tipografia Base (Corpo)</span>
              <SettingSelect
                label="TIPO DE LETRA BASE (CORPO)"
                name="globalFont"
                value={settings.globalFont}
                options={fontOptions}
                onChange={handleChange}
              />
              <SettingLetterSpacing
                label="ESPAÇAMENTO ENTRE LETRAS GLOBAL"
                name="globalLetterSpacing"
                value={settings.globalLetterSpacing || '0px'}
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

            <div className="space-y-6 bg-[#fcfbf9] border border-[#f0ece5] p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] block mb-2">Menu Lateral</span>
              <SettingSelect
                label="TIPO DE LETRA DO MENU LATERAL"
                name="menuFont"
                value={settings.menuFont || settings.globalFont}
                options={fontOptions}
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
              <SettingLetterSpacing
                label="ESPAÇAMENTO ENTRE LETRAS DO MENU"
                name="menuLetterSpacing"
                value={settings.menuLetterSpacing || '0px'}
                onChange={handleChange}
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
      )}

      {/* ESPAÇAMENTOS E MARGENS */}
      {activeSubTab === 'espacamento' && (
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
              value={settings.slideshowPhotoPadding !== undefined ? settings.slideshowPhotoPadding : 0}
              min={0} max={64} step={2}
              onChange={handleRangeChange}
            />
            <RangeSlider
              label="MARGEM INFERIOR DO RODAPÉ"
              name="footerBottomSpacing"
              value={settings.footerBottomSpacing !== undefined ? settings.footerBottomSpacing : 0}
              min={0} max={100} step={2}
              onChange={handleRangeChange}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
