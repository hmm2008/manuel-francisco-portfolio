import React from 'react';
import { motion } from 'motion/react';
import { Globe } from 'lucide-react';
import { SiteSettings } from '../../types';
import { SettingRow } from './SharedComponents';

interface SettingsSEOProps {
  settings: SiteSettings;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function SettingsSEO({ settings, handleChange }: SettingsSEOProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="border-b border-[#f0ece5] pb-4">
          <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
            <Globe size={20} className="text-[#8e8a82]" /> SEO (Otimização para Motores de Busca)
          </h2>
          <p className="text-xs text-[#8e8a82] font-sans mt-1">Melhore a visibilidade do seu portfólio no Google e redes sociais.</p>
        </div>

        <div className="space-y-6">
          <SettingRow
            label="TÍTULO SEO (BROWSER)"
            name="seoTitle"
            value={settings.seoTitle || ''}
            onChange={handleChange}
            placeholder="Ex: Manuel Francisco Fotografia | Portfólio"
          />
          <SettingRow
            label="DESCRIÇÃO SEO (META DESCRIPTION)"
            name="seoDescription"
            type="textarea"
            value={settings.seoDescription || ''}
            onChange={handleChange}
            rows={2}
            placeholder="Ex: Portfólio oficial do fotógrafo Manuel Francisco..."
          />
          <SettingRow
            label="PALAVRAS-CHAVE (KEYWORDS)"
            name="seoKeywords"
            type="textarea"
            value={settings.seoKeywords || ''}
            onChange={handleChange}
            rows={2}
            placeholder="Ex: fotografia, retrato, paisagem, coimbra"
          />
        </div>
      </div>
      
      {/* Analytics */}
      <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="border-b border-[#f0ece5] pb-4">
          <h2 className="font-serif text-xl text-[#1a1a1a]">Google Analytics</h2>
        </div>
        
        <SettingRow
          label="ID DE ACOMPANHAMENTO (GA4)"
          name="googleAnalyticsId"
          value={settings.googleAnalyticsId || ''}
          onChange={handleChange}
          placeholder="G-XXXXXXXXXX"
        />
        <p className="text-[11px] text-[#8e8a82] font-sans -mt-4">Cole aqui o ID (Measurement ID) para ativar o tracking.</p>
      </div>
    </motion.div>
  );
}
