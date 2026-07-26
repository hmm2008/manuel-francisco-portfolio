import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Code, Accessibility } from 'lucide-react';
import { SiteSettings } from '../../types';
import { SettingRow, SettingToggle } from './SharedComponents';

interface SettingsSegurancaProps {
  settings: SiteSettings;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function SettingsSeguranca({ settings, handleChange }: SettingsSegurancaProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Segurança */}
      <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="border-b border-[#f0ece5] pb-4">
          <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
            <ShieldCheck size={20} className="text-[#8e8a82]" /> Acesso e Segurança
          </h2>
        </div>
        
        <SettingRow
          label="CÓDIGO DE ACESSO DO ADMINISTRADOR"
          name="adminPassword"
          type="password"
          value={settings.adminPassword}
          onChange={handleChange}
        />
        <p className="text-[11px] text-[#8e8a82] font-sans -mt-4">
          Esta palavra-passe é pedida caso a sessão do Google não seja reconhecida.
        </p>
      </div>

      {/* Acessibilidade e Legal */}
      <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="border-b border-[#f0ece5] pb-4">
          <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
            <Accessibility size={20} className="text-[#8e8a82]" /> Preferências e Legal
          </h2>
        </div>

        <div className="space-y-4">
          <SettingToggle
            label="REDUZIR ANIMAÇÕES"
            name="reduceAnimations"
            checked={settings.reduceAnimations}
            onChange={handleChange}
            description="Desativa movimentos de transição para maior acessibilidade."
          />
          <SettingToggle
            label="AVISO DE COOKIES"
            name="enableCookieConsent"
            checked={settings.enableCookieConsent || false}
            onChange={handleChange}
            description="Apresenta o banner de consentimento de cookies na primeira visita."
          />
          <SettingToggle
            label="MODO DE MANUTENÇÃO"
            name="maintenanceMode"
            checked={settings.maintenanceMode || false}
            onChange={handleChange}
            description="Oculta o site para o público geral enquanto trabalha nele."
          />
        </div>
      </div>

      {/* Custom CSS */}
      <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="border-b border-[#f0ece5] pb-4">
          <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
            <Code size={20} className="text-[#8e8a82]" /> CSS Personalizado Avançado
          </h2>
        </div>

        <SettingRow
          label="CÓDIGO CSS"
          name="customCss"
          type="textarea"
          value={settings.customCss || ''}
          onChange={handleChange}
          rows={6}
          placeholder="/* Insira regras CSS globais aqui */&#10;.custom-class {&#10;  color: red;&#10;}"
        />
        <p className="text-[11px] text-[#8e8a82] font-sans -mt-4">
          Aviso: CSS mal formatado pode quebrar a estrutura visual do site.
        </p>
      </div>
    </motion.div>
  );
}
