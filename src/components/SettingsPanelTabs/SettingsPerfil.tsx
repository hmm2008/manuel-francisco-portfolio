import React from 'react';
import { motion } from 'motion/react';
import { User, Loader2, Upload, BookOpen, Award, Mail } from 'lucide-react';
import { SiteSettings } from '../../types';
import { SettingRow } from './SharedComponents';

interface SettingsPerfilProps {
  settings: SiteSettings;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleProfilePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  uploadingProfile: boolean;
}

export default function SettingsPerfil({ settings, handleChange, handleProfilePhotoUpload, uploadingProfile }: SettingsPerfilProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Photo & Social Info */}
      <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="border-b border-[#f0ece5] pb-4">
          <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
            <User size={20} className="text-[#8e8a82]" /> Foto de Perfil & Contactos
          </h2>
          <p className="text-xs text-[#8e8a82] font-sans mt-1">
            Fotografia de perfil e ligações de contacto do fotógrafo. (As definições de estilo e tipografia de cada página encontram-se no separador Estilo e Menus).
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 items-start pt-2">
          {/* Foto de Perfil */}
          <div className="w-full md:w-1/3 flex flex-col items-center space-y-4">
            <div className="w-48 h-48 rounded-full overflow-hidden border border-[#d8d3c9] bg-[#f8f7f5] flex items-center justify-center group relative shadow-inner">
              {uploadingProfile ? (
                <div className="flex flex-col items-center text-[#8e8a82]">
                  <Loader2 className="animate-spin mb-2" size={24} />
                  <span className="text-[10px] uppercase font-bold tracking-widest">A carregar...</span>
                </div>
              ) : settings.profilePhoto ? (
                <>
                  <img src={settings.profilePhoto} alt="Perfil" className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-60" />
                  <label className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer bg-black/40 transition-opacity duration-300">
                    <Upload size={24} className="text-white mb-2" />
                    <span className="text-[10px] uppercase text-white font-bold tracking-widest px-4 text-center">Alterar Foto</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleProfilePhotoUpload} />
                  </label>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full transition-colors hover:bg-[#f0ece5]">
                  <User size={40} className="text-[#c8c4bc] mb-2" />
                  <span className="text-[10px] uppercase text-[#8e8a82] font-bold tracking-widest px-4 text-center">Adicionar Foto de Perfil</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleProfilePhotoUpload} />
                </label>
              )}
            </div>
            <p className="text-[10px] text-[#8e8a82] text-center max-w-[200px]">Recomendado: Imagem quadrada (ex: 800x800px)</p>
          </div>

          <div className="w-full md:w-2/3 space-y-6">
            <div className="border-b border-[#f0ece5] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] flex items-center gap-2">
                <Mail size={16} className="text-[#8e8a82]" /> Informações de Contacto & Redes Sociais
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingRow label="EMAIL DE CONTACTO" name="contactEmail" value={settings.contactEmail} onChange={handleChange} />
              <SettingRow label="LINK INSTAGRAM" name="instagram" value={settings.instagram} onChange={handleChange} placeholder="https://instagram.com/..." />
              <SettingRow label="LINK FACEBOOK" name="facebook" value={settings.facebook} onChange={handleChange} placeholder="https://facebook.com/..." />
              <SettingRow label="LINK X (TWITTER)" name="twitter" value={settings.twitter} onChange={handleChange} placeholder="https://twitter.com/..." />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
