import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  Loader2, Save, RotateCcw, LayoutDashboard, ChevronDown, Bold, Italic, 
  AlignLeft, AlignCenter, AlignRight, Upload, Palette, Type, Smartphone, 
  MessageSquare, User, Share2, MousePointer2, Settings2, Accessibility, 
  Check, AlertCircle, ShieldCheck, Image as ImageIcon, Sliders, Eye, Sparkles, ZoomIn, Search, Globe, Code, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SiteSettings } from '../types';

import SettingsMarca from './SettingsPanelTabs/SettingsMarca';
import SettingsGaleria from './SettingsPanelTabs/SettingsGaleria';
import SettingsPerfil from './SettingsPanelTabs/SettingsPerfil';
import SettingsEstilo from './SettingsPanelTabs/SettingsEstilo';
import SettingsSEO from './SettingsPanelTabs/SettingsSEO';
import SettingsSeguranca from './SettingsPanelTabs/SettingsSeguranca';
import SettingsEstatisticas from './SettingsPanelTabs/SettingsEstatisticas';

type TabType = 'estatisticas' | 'marca' | 'galeria' | 'perfil' | 'estilo' | 'seo' | 'seguranca';

export default function SettingsPanel({ onBackToGallery }: { onBackToGallery?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('marca');
  
  // Dialog States
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);
  
  const INITIAL_SETTINGS: SiteSettings = {
    // Marca & Mensagem
    siteName: 'Manuel Francisco\nFotografia',
    siteNameFont: 'Inter — sans-serif moderno',
    siteNameFontSize: 16,
    siteNameColor: '#1a1a1a',
    sidebarTitleTopMargin: 48,
    sidebarTitleBottomMargin: 32,
    sidebarTitleLeftMargin: 40,
    sidebarTitleRightMargin: 40,
    sidebarFooterBottomMargin: 32,
    mainTitleTopMargin: 32,
    mainTitleBottomMargin: 16,
    showPageHeaderTitle: true,
    showPageHeaderLines: true,
    separateFooterDiv: false,
    mobileTitle: 'Manuel Francisco Fotografia',
    welcomeMessage: 'Bem vindo a este espaço.\nQuero que descubra comigo o gosto pela fotografia.\nNão tenho um tema favorito, apenas o gosto de registar aquilo que considero que é belo.\nNão hesite em deixar os seus comentários.',
    messageSpacing: 16,
    messageFont: 'Inter — sans-serif moderno',
    messageFontSize: 13,
    messageAlignment: 'left',
    messageColor: '#1a1a1a',
    
    // Perfil & Contacto
    contactEmail: 'manuel.francisco3@gmail.com',
    profilePhoto: '', // Uses bundled fallback if empty
    biography: 'Nasceu a 26 de Fevereiro de 1962 em Coimbra. Enfermeiro de profissão. O gosto pela fotografia surgiu em 1982, quando frequentava o Curso de Enfermagem, tendo realizado um curso de iniciação à fotografia leccionado por um professor da escola. Em colaboração com outros colegas e a Associação de Estudantes, reabriram uma câmara escura existente nas instalações da referida Escola. Teve a sua primeira câmara reflex analógica, como presente, uma Minolta X-700, que o passa a acompanhar para todo o lado.',
    instagram: 'https://instagram.com/...',
    facebook: 'https://www.facebook.com/manuel.francisco.3701/',
    twitter: 'https://twitter.com/...',

    // Tipografia & Estilo Global
    globalFont: 'Inter — sans-serif moderno',
    globalColor: '#1a1a1a',
    menuLines: 'Gradiente',
    menuLinesColor: '#1a1a1a',
    menuFont: 'Inter — sans-serif moderno',
    menuColor: '#000000',
    sidebarButtonSpacing: 16,
    footerBottomSpacing: 24,
    slideshowPhotoPadding: 16,

    // Slideshow & Galeria
    slideshowInterval: 5,
    slideshowTopMargin: 0,
    footerText: "Copyright 2026",

    slideshowFit: 'Foto Completa',
    slideshowEffect: 'Fade (Suave Dissolução)',
    slideshowZoom: 105,
    slideshowBgColor: '#1a1a1a',
    lightboxEffect: 'Fade Standard (Dissolução Clássica)',
    defaultZoomLevel: 100,
    lightboxBgColor: '#0a0a0a',
    thumbnailSize: '160 px',
    importQuality: '1800 px',
    lightboxQuality: '1800 px',
    galleryGridCols: '4',
    adminThumbSizePx: 200,
    compressQuality: 80,

    // Slideshow Typography & Position
    slideshowTitleFont: 'Playfair Display — serif clássico editorial',
    slideshowTitleSize: '48 px',
    slideshowSubtitleFont: 'Plus Jakarta Sans — sans-serif limpo moderno',
    slideshowSubtitleSize: '12 px',
    showSlideshowCaptions: true,
    slideshowTextPosition: 'canto inferior esq',
    slideshowTextColor: '#ffffff',
    slideshowControlsPosition: 'bottom',
    slideshowControlsAlign: 'center',
    slideshowControlsFont: 'Plus Jakarta Sans — sans-serif limpo moderno',
    slideshowControlsSize: '11 px',
    slideshowControlsColor: '#ffffff',
    showWatermarkInSlideshow: true,
    slideshowWatermarkPosition: 'bottom-left',

    // Lightbox Typography & Position
    lightboxTitleFont: 'Plus Jakarta Sans — sans-serif limpo moderno',
    lightboxTitleSize: '18 px',
    lightboxSubtitleFont: 'Plus Jakarta Sans — sans-serif limpo moderno',
    lightboxSubtitleSize: '12 px',
    lightboxTextPosition: 'canto inferior esq',
    lightboxTextColor: '#ffffff',

    // Novas Funcionalidades Sugeridas
    protectPhotos: false,
    enableSharpen: false,
    sharpenAmount: 30,
    enableRightClickMessage: true,
    rightClickTitle: 'Copyright © 2026',
    rightClickSubtitle: 'manuelfrancisco. Todos os direitos reservados',
    rightClickFont: 'Plus Jakarta Sans — sans-serif limpo moderno',
    rightClickSize: '14px',
    rightClickColor: '#ffffff',
    rightClickBgColor: 'rgba(0, 0, 0, 0.85)',
    showCaptions: 'Hover',
    captionPosition: 'bottom-center',
    galleryTheme: 'Claro',
    showExifData: true,
    enableKeyboardShortcuts: true,
    enableZenMode: true,
    zenModeButtonColor: '#fde68a',
    zenModeButtonBgColor: 'rgba(0, 0, 0, 0.4)',
    enableWatermark: false,
    watermarkText: '© Manuel Francisco',
    watermarkPosition: 'bottom-left',
    enableGallerySearch: true,
    enableFavorites: true,
    enablePhotoComparison: true,
    enablePhotoDownload: false,
    enableMonochromeToggle: true,
    enablePhotoLikes: true,

    // SEO & Analytics
    seoTitle: 'Manuel Francisco Fotografia',
    seoDescription: 'Portfólio fotográfico de Manuel Francisco. Paisagem, Retrato, Arquitetura e mais.',
    seoKeywords: 'fotografia, portfólio, manuel francisco, coimbra',
    googleAnalyticsId: '',
    enableCookieConsent: true,
    maintenanceMode: false,
    customCss: '',

    // Acessibilidade & Segurança
    reduceAnimations: false,
    adminPassword: 'manuel2026',
    categories: ['Paisagem', 'Retrato', 'Rua', 'Arquitetura', 'Natureza', 'Abstrato', 'Documentário', 'Animais'],
  };

  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const docRef = doc(db, 'settings', 'site');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() as Partial<SiteSettings> }));
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProfile(true);
    try {
      const storageRef = ref(storage, `settings/profile_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setSettings(prev => ({ ...prev, profilePhoto: url }));
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Erro no Upload',
        message: 'Ocorreu um erro ao carregar a foto de perfil.'
      });
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSaveConfirmModal(true);
  };

  const executeSave = async () => {
    setShowSaveConfirmModal(false);
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'site'), settings);
      setFeedbackModal({
        isOpen: true,
        type: 'success',
        title: 'Configurações Guardadas',
        message: 'Todas as alterações foram guardadas com sucesso no servidor.'
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Erro ao Guardar',
        message: 'Ocorreu um erro ao guardar as configurações: ' + (error instanceof Error ? error.message : String(error))
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setShowResetConfirmModal(true);
  };

  const executeReset = () => {
    setShowResetConfirmModal(false);
    setSettings(INITIAL_SETTINGS);
    setFeedbackModal({
      isOpen: true,
      type: 'success',
      title: 'Pré-configurações Repostas',
      message: 'As opções foram repostas para os valores padrão de fábrica.'
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setSettings(prev => ({ ...prev, [name]: val }));
  };

  const handleRangeChange = (name: string, value: number) => {
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-[#4a4a4a]" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto py-8 px-4 md:px-8 bg-[#f8f7f5] text-[#1a1a1a]"
    >
      {/* Header */}
      <div className="mb-8">
        <span className="text-[#8e8a82] tracking-[0.25em] text-[10px] uppercase font-sans font-semibold block mb-1">
          PAINEL DE CONTROLO DO SITE
        </span>
        <h1 className="font-serif text-3xl md:text-4xl text-[#1a1a1a] font-normal">
          Configurações
        </h1>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#e5e0d8] mb-8 overflow-x-auto no-scrollbar gap-1">
        {[
          { id: 'estatisticas', label: 'Estatísticas & Analytics', icon: BarChart3 },
          { id: 'marca', label: 'Marca & Mensagem', icon: Palette },
          { id: 'galeria', label: 'Galeria & Slideshow', icon: ImageIcon },
          { id: 'perfil', label: 'Perfil & Contactos', icon: User },
          { id: 'estilo', label: 'Estilo & Menus', icon: Type },
          { id: 'seo', label: 'SEO & Meta', icon: Globe },
          { id: 'seguranca', label: 'Segurança & Avançado', icon: ShieldCheck },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2.5 px-5 py-3.5 text-xs font-medium tracking-wider uppercase border-b-2 transition-all whitespace-nowrap ${
                isActive 
                  ? 'border-[#1a1a1a] text-[#1a1a1a] bg-white shadow-sm font-semibold' 
                  : 'border-transparent text-[#8e8a82] hover:text-[#1a1a1a] hover:bg-white/50'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-[#1a1a1a]' : 'text-[#a09c94]'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleFormSubmit}>
        {activeTab === 'estatisticas' && (
          <SettingsEstatisticas />
        )}
        {activeTab === 'marca' && (
          <SettingsMarca settings={settings} handleChange={handleChange} handleRangeChange={handleRangeChange} />
        )}
        {activeTab === 'galeria' && (
          <SettingsGaleria settings={settings} handleChange={handleChange} handleRangeChange={handleRangeChange} />
        )}
        {activeTab === 'perfil' && (
          <SettingsPerfil settings={settings} handleChange={handleChange} handleProfilePhotoUpload={handleProfilePhotoUpload} uploadingProfile={uploadingProfile} />
        )}
        {activeTab === 'estilo' && (
          <SettingsEstilo settings={settings} handleChange={handleChange} handleRangeChange={handleRangeChange} />
        )}
        {activeTab === 'seo' && (
          <SettingsSEO settings={settings} handleChange={handleChange} />
        )}
        {activeTab === 'seguranca' && (
          <SettingsSeguranca settings={settings} handleChange={handleChange} />
        )}

        {/* Action Buttons */}
        <div className="mt-12 flex justify-between items-center border-t border-[#e5e0d8] pt-8">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 border border-[#d8d3c9] text-[#4a4a4a] text-sm uppercase tracking-widest font-bold hover:bg-[#f0ece5] transition-colors"
          >
            <RotateCcw size={16} />
            Repor Padrões
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-[#1a1a1a] text-white text-sm uppercase tracking-widest font-bold hover:bg-[#333333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {saving ? 'A Guardar...' : 'Guardar Tudo'}
          </button>
        </div>
      </form>

      {/* Save Confirm Modal */}
      <AnimatePresence>
        {showSaveConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowSaveConfirmModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-md w-full shadow-2xl relative z-10 border border-[#e8e4dc]"
            >
              <div className="p-8">
                <div className="w-12 h-12 rounded-full bg-[#f8f7f5] flex items-center justify-center mb-6">
                  <Save size={24} className="text-[#1a1a1a]" />
                </div>
                <h3 className="text-xl font-serif text-[#1a1a1a] mb-2">Guardar Configurações</h3>
                <p className="text-[#8e8a82] font-sans text-sm mb-8">
                  As novas configurações serão aplicadas imediatamente em todo o site. Deseja confirmar?
                </p>
                <div className="flex gap-4">
                  <button onClick={() => setShowSaveConfirmModal(false)} className="flex-1 py-3 border border-[#d8d3c9] text-[#4a4a4a] text-xs uppercase tracking-widest font-bold hover:bg-[#f8f7f5] transition-colors">
                    Cancelar
                  </button>
                  <button onClick={executeSave} className="flex-1 py-3 bg-[#1a1a1a] text-white text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors">
                    Confirmar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Confirm Modal */}
      <AnimatePresence>
        {showResetConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowResetConfirmModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-md w-full shadow-2xl relative z-10 border-t-4 border-red-900"
            >
              <div className="p-8">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-6">
                  <AlertCircle size={24} className="text-red-900" />
                </div>
                <h3 className="text-xl font-serif text-[#1a1a1a] mb-2">Repor Configurações</h3>
                <p className="text-[#8e8a82] font-sans text-sm mb-8">
                  Vai repor todas as configurações para os valores originais. Irá perder as suas alterações atuais se gravar.
                </p>
                <div className="flex gap-4">
                  <button onClick={() => setShowResetConfirmModal(false)} className="flex-1 py-3 border border-[#d8d3c9] text-[#4a4a4a] text-xs uppercase tracking-widest font-bold hover:bg-[#f8f7f5] transition-colors">
                    Cancelar
                  </button>
                  <button onClick={executeReset} className="flex-1 py-3 bg-red-900 text-white text-xs uppercase tracking-widest font-bold hover:bg-red-950 transition-colors">
                    Repor Tudo
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Feedback Toast/Modal */}
      <AnimatePresence>
        {feedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="pointer-events-auto"
            >
              <div className="bg-[#1a1a1a] text-white p-6 shadow-2xl min-w-[320px] max-w-md border border-[#333]">
                <div className="flex items-start gap-4">
                  {feedbackModal.type === 'success' ? (
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <Check size={20} className="text-white" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                      <AlertCircle size={20} className="text-red-400" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-serif text-lg mb-1">{feedbackModal.title}</h4>
                    <p className="text-sm text-gray-300 font-sans">{feedbackModal.message}</p>
                    <button 
                      onClick={() => setFeedbackModal(null)}
                      className="mt-4 text-xs font-bold uppercase tracking-widest text-[#fde68a] hover:text-white transition-colors"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
