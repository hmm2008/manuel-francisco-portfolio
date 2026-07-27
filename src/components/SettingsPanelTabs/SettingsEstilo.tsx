import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Type, LayoutDashboard, User, Mail, BookOpen, Link, Sliders, Heading, Image } from 'lucide-react';
import { SiteSettings } from '../../types';
import { FONT_OPTIONS } from '../../utils/fontUtils';
import { SettingRow, RangeSlider, SettingSelect, SettingTextStyle, SettingLetterSpacing } from './SharedComponents';

interface SettingsEstiloProps {
  settings: SiteSettings;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleRangeChange: (name: string, value: number) => void;
}

export default function SettingsEstilo({ settings, handleChange, handleRangeChange }: SettingsEstiloProps) {
  const [activeSubTab, setActiveSubTab] = useState<'geral' | 'titulos' | 'biografia' | 'galeria' | 'contactos' | 'livro' | 'links' | 'cabecalho' | 'espacamento'>('geral');
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
            onClick={() => setActiveSubTab('galeria')}
            className={`px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'galeria'
                ? 'bg-[#1a1a1a] text-white shadow-sm'
                : 'bg-[#f8f7f5] text-[#4a4a4a] hover:bg-[#e8e4dc]'
            }`}
          >
            <Image size={14} /> Galeria
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
            onClick={() => setActiveSubTab('titulos')}
            className={`px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'titulos'
                ? 'bg-[#1a1a1a] text-white shadow-sm'
                : 'bg-[#f8f7f5] text-[#4a4a4a] hover:bg-[#e8e4dc]'
            }`}
          >
            <Heading size={14} /> Títulos Globais
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
              <SettingRow
                label="TEXTO DO TÍTULO"
                name="biographySectionTitle"
                value={settings.biographySectionTitle || 'Biografia'}
                onChange={handleChange}
                placeholder="ex: Biografia"
              />
              </div>
            {/* Subtítulo da Página Biografia */}
            <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">2. Subtítulo da Página (ex: Sobre o Fotógrafo)</span>
              <SettingRow
                label="TEXTO DO SUBTÍTULO"
                name="biographySectionSubtitle"
                value={settings.biographySectionSubtitle || 'Sobre o Fotógrafo'}
                onChange={handleChange}
                placeholder="ex: Sobre o Fotógrafo"
              />
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
              <SettingRow
                label="TEXTO BIOGRÁFICO"
                name="biography"
                type="textarea"
                value={settings.biography || ''}
                onChange={handleChange}
                rows={6}
              />
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
              <SettingRow
                label="TÍTULO DA SECÇÃO"
                name="publishedWorksSectionTitle"
                value={settings.publishedWorksSectionTitle || 'Trabalhos Publicados'}
                onChange={handleChange}
                placeholder="ex: Trabalhos Publicados"
              />
              <SettingRow
                label="CONTEÚDO DA SECÇÃO"
                name="publishedWorks"
                type="textarea"
                value={settings.publishedWorks ?? ''}
                onChange={handleChange}
                rows={5}
              />
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
              <SettingRow
                label="TÍTULO DA SECÇÃO"
                name="exhibitionsSectionTitle"
                value={settings.exhibitionsSectionTitle || 'Exposições'}
                onChange={handleChange}
                placeholder="ex: Exposições"
              />
              <SettingRow
                label="CONTEÚDO DA SECÇÃO"
                name="exhibitions"
                type="textarea"
                value={settings.exhibitions ?? ''}
                onChange={handleChange}
                rows={7}
              />
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

      {/* PÁGINA: GALERIA */}
      {activeSubTab === 'galeria' && (
        <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
          <div className="border-b border-[#f0ece5] pb-4">
            <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
              <Image size={20} className="text-[#8e8a82]" /> Estilos da Página Galeria
            </h2>
            <p className="text-xs text-[#8e8a82] font-sans mt-1">Configure o título ("Galeria") e o subtítulo ("X FOTOGRAFIAS").</p>
          </div>

          {/* Título Principal */}
          <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">1. Título Principal (ex: Galeria)</span>
            <SettingRow
              label="TEXTO DO TÍTULO"
              name="gallerySectionTitle"
              value={settings.gallerySectionTitle || 'Galeria'}
              onChange={handleChange}
              placeholder="ex: Galeria"
            />
          </div>

          {/* Subtítulo */}
          <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">2. Subtítulo / Contador (ex: X FOTOGRAFIAS)</span>
            <SettingRow
              label="TEXTO DO SUBTÍTULO (DEIXE EM BRANCO PARA MOSTRAR A CONTAGEM PADRÃO)"
              name="gallerySectionSubtitle"
              value={settings.gallerySectionSubtitle || ''}
              onChange={handleChange}
              placeholder="ex: Ver portfólio completo (ou deixe vazio para contagem)"
            />
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
            <SettingRow
              label="TEXTO DO TÍTULO"
              name="contactSectionTitle"
              value={settings.contactSectionTitle || 'Contacto'}
              onChange={handleChange}
              placeholder="ex: Contacto"
            />
            </div>
          {/* Subtítulo de Contacto */}
          <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">2. Subtítulo (ex: ENTRE EM CONTACTO)</span>
            <SettingRow
              label="TEXTO DO SUBTÍTULO"
              name="contactSectionSubtitle"
              value={settings.contactSectionSubtitle || 'ENTRE EM CONTACTO'}
              onChange={handleChange}
              placeholder="ex: ENTRE EM CONTACTO"
            />
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
            <SettingRow
              label="TEXTO DO TÍTULO"
              name="guestbookSectionTitle"
              value={settings.guestbookSectionTitle || 'Livro de Visitas'}
              onChange={handleChange}
              placeholder="ex: Livro de Visitas"
            />
          </div>
          {/* Subtítulo */}
          <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">2. Subtítulo / Estatística</span>
            
            <div className="space-y-3 pb-3">
              <label className="text-[10px] uppercase font-bold text-[#4a4a4a] block mb-2 tracking-wider">MODO DE EXIBIÇÃO</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-xs text-[#4a4a4a] cursor-pointer">
                  <input
                    type="radio"
                    name="guestbookSubtitleMode"
                    value="both"
                    checked={!settings.guestbookSubtitleMode || settings.guestbookSubtitleMode === 'both'}
                    onChange={handleChange as any}
                    className="accent-[#1a1a1a]"
                  />
                  Mostrar Subtítulo + Contador de Mensagens (ex: VISITANTES - 4 registos)
                </label>
                <label className="flex items-center gap-2 text-xs text-[#4a4a4a] cursor-pointer">
                  <input
                    type="radio"
                    name="guestbookSubtitleMode"
                    value="subtitle_only"
                    checked={settings.guestbookSubtitleMode === 'subtitle_only'}
                    onChange={handleChange as any}
                    className="accent-[#1a1a1a]"
                  />
                  Mostrar Apenas Subtítulo (ex: VISITANTES)
                </label>
                <label className="flex items-center gap-2 text-xs text-[#4a4a4a] cursor-pointer">
                  <input
                    type="radio"
                    name="guestbookSubtitleMode"
                    value="count_only"
                    checked={settings.guestbookSubtitleMode === 'count_only'}
                    onChange={handleChange as any}
                    className="accent-[#1a1a1a]"
                  />
                  Mostrar Apenas Contador de Mensagens (ex: 4 registos)
                </label>
              </div>
            </div>

            {(!settings.guestbookSubtitleMode || settings.guestbookSubtitleMode !== 'count_only') && (
              <SettingRow
                label="TEXTO DO SUBTÍTULO"
                name="guestbookSectionSubtitle"
                value={settings.guestbookSectionSubtitle || 'REGISTOS DE VISITANTES'}
                onChange={handleChange}
                placeholder="ex: REGISTOS DE VISITANTES"
              />
            )}
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
            <SettingRow
              label="TEXTO DO TÍTULO"
              name="linksSectionTitle"
              value={settings.linksSectionTitle || 'Links'}
              onChange={handleChange}
              placeholder="ex: Links"
            />
          </div>
          {/* Subtítulo */}
          <div className="bg-[#fcfbf9] border border-[#f0ece5] p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">2. Subtítulo (ex: RECURSOS)</span>
            <SettingRow
              label="TEXTO DO SUBTÍTULO"
              name="linksSectionSubtitle"
              value={settings.linksSectionSubtitle || 'RECURSOS'}
              onChange={handleChange}
              placeholder="ex: RECURSOS"
            />
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

      {/* PÁGINA: TÍTULOS GLOBAIS */}
      {activeSubTab === 'titulos' && (
        <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
          <div className="border-b border-[#f0ece5] pb-4">
            <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
              <Heading size={20} className="text-[#8e8a82]" /> Títulos Globais das Páginas
            </h2>
            <p className="text-xs text-[#8e8a82] font-sans mt-1">Defina a fonte, tamanho, cor e espaçamento para todos os títulos e subtítulos das várias páginas (Galeria, Biografia, Livro de Visitas, Contactos, Links).</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Título Principal */}
            <div className="space-y-6 bg-[#fcfbf9] border border-[#f0ece5] p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] block mb-2">Título Principal</span>
              <RangeSlider
                label="DISTÂNCIA ENTRE TÍTULO E SUBTÍTULO"
                name="pageTitleSubtitleSpacing"
                value={settings.pageTitleSubtitleSpacing !== undefined ? Number(settings.pageTitleSubtitleSpacing) : 12}
                min={0}
                max={100}
                step={1}
                unit="px"
                onChange={handleRangeChange}
              />
              <SettingSelect
                label="FONTE DO TÍTULO"
                name="pageTitleFont"
                value={settings.pageTitleFont || settings.globalFont}
                options={fontOptions}
                onChange={handleChange}
              />
              <SettingSelect
                label="ESTILO (PESO)"
                name="pageTitleStyle"
                value={settings.pageTitleStyle}
                options={[{label: "Normal", value: "normal"}, {label: "Negrito", value: "bold"}, {label: "Leve", value: "light"}]}
                onChange={handleChange}
              />
              <SettingRow
                label="TAMANHO DA FONTE"
                name="pageTitleFontSize"
                value={settings.pageTitleFontSize}
                onChange={handleChange}
                placeholder="ex: 24px, 2rem"
              />
              <SettingRow
                label="COR DO TEXTO"
                name="pageTitleColor"
                type="color"
                value={settings.pageTitleColor || '#1a1a1a'}
                onChange={handleChange}
              />
              <SettingLetterSpacing
                label="ESPAÇAMENTO ENTRE LETRAS"
                name="pageTitleLetterSpacing"
                value={settings.pageTitleLetterSpacing || '0px'}
                onChange={handleChange}
              />
            </div>

            
          {/* Subtítulo */}
            <div className="space-y-6 bg-[#fcfbf9] border border-[#f0ece5] p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] block mb-2">Subtítulo</span>
              <SettingSelect
                label="FONTE DO SUBTÍTULO"
                name="pageSubtitleFont"
                value={settings.pageSubtitleFont || settings.globalFont}
                options={fontOptions}
                onChange={handleChange}
              />
              <SettingSelect
                label="ESTILO (PESO E CAIXA)"
                name="pageSubtitleStyle"
                value={settings.pageSubtitleStyle}
                options={[{label: "Normal", value: "normal"}, {label: "Maiúsculas (Uppercase)", value: "uppercase"}, {label: "Negrito", value: "bold"}]}
                onChange={handleChange}
              />
              <SettingRow
                label="TAMANHO DA FONTE"
                name="pageSubtitleFontSize"
                value={settings.pageSubtitleFontSize}
                onChange={handleChange}
                placeholder="ex: 12px, 0.8rem"
              />
              <SettingRow
                label="COR DO TEXTO"
                name="pageSubtitleColor"
                type="color"
                value={settings.pageSubtitleColor || '#7a7a7a'}
                onChange={handleChange}
              />
              <SettingLetterSpacing
                label="ESPAÇAMENTO ENTRE LETRAS"
                name="pageSubtitleLetterSpacing"
                value={settings.pageSubtitleLetterSpacing || '2px'}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}
