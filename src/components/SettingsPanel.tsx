import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  Loader2, Save, RotateCcw, LayoutDashboard, ChevronDown, Bold, Italic, 
  AlignLeft, AlignCenter, AlignRight, Upload, Palette, Type, Smartphone, 
  MessageSquare, User, Share2, MousePointer2, Settings2, Accessibility, 
  Check, AlertCircle, ShieldCheck, Image as ImageIcon, Sliders, Eye, Sparkles, ZoomIn, Search, Globe, Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FONT_OPTIONS, getFontFamily } from '../utils/fontUtils';
import { SLIDESHOW_EFFECT_OPTIONS, LIGHTBOX_EFFECT_OPTIONS } from '../utils/transitionUtils';

export default function SettingsPanel({ onBackToGallery }: { onBackToGallery?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<'marca' | 'galeria' | 'perfil' | 'estilo' | 'seguranca'>('marca');
  
  // Dialog States
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);
  
  const INITIAL_SETTINGS = {
    // Marca & Mensagem
    siteName: 'Manuel Francisco\nFotografia',
    siteNameFont: 'Inter — sans-serif moderno',
    siteNameFontSize: 16,
    siteNameColor: '#1a1a1a',
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

  const [settings, setSettings] = useState(INITIAL_SETTINGS);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const docRef = doc(db, 'settings', 'site');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }));
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
          { id: 'marca', label: 'Marca & Mensagem', icon: Palette },
          { id: 'galeria', label: 'Galeria & Slideshow', icon: ImageIcon },
          { id: 'perfil', label: 'Perfil & Contactos', icon: User },
          { id: 'estilo', label: 'Estilo & Menus', icon: Type },
          { id: 'seo', label: 'SEO & Analytics', icon: Globe },
          { id: 'seguranca', label: 'Segurança & Avançado', icon: ShieldCheck },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
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

      <form onSubmit={handleFormSubmit} className="space-y-8 pb-32">

        {/* TAB 1: MARCA & MENSAGEM */}
        {activeTab === 'marca' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
              <div className="border-b border-[#f0ece5] pb-4">
                <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
                  <Palette size={20} className="text-[#8e8a82]" /> Marca do Site
                </h2>
                <p className="text-xs text-[#8e8a82] font-sans mt-1">Defina a identidade do cabeçalho e título principal.</p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">NOME DO SITE</label>
                <textarea 
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  rows={2}
                  className="w-full bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a1a] font-sans transition-colors"
                />
                <p className="text-[11px] text-[#8e8a82] font-sans">Pressione Enter para criar uma quebra de linha no logótipo.</p>
              </div>

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
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">TIPO DE LETRA</label>
                    <div className="relative">
                      <select 
                        name="siteNameFont"
                        value={settings.siteNameFont}
                        onChange={handleChange}
                        className="w-full appearance-none bg-white border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                      >
                        {FONT_OPTIONS.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8a82] pointer-events-none" size={14} />
                    </div>
                    <div className="mt-2 p-2.5 bg-white border border-[#e2ddd5] text-xs text-[#1a1a1a]" style={{ fontFamily: getFontFamily(settings.siteNameFont) }}>
                      <span className="text-[9px] uppercase tracking-widest text-[#8e8a82] block mb-0.5 font-sans">Pré-visualização:</span>
                      Manuel Francisco — ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">TAMANHO</label>
                      <span className="text-[11px] font-mono text-[#8e8a82]">{settings.siteNameFontSize}px</span>
                    </div>
                    <input 
                      type="range" 
                      name="siteNameFontSize"
                      min="10" max="36"
                      value={settings.siteNameFontSize}
                      onChange={handleChange}
                      className="w-full h-1.5 bg-[#e5e0d8] rounded-lg appearance-none cursor-pointer accent-[#1a1a1a] mt-3"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">COR DA LETRA</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        name="siteNameColor"
                        value={settings.siteNameColor}
                        onChange={handleChange}
                        className="w-10 h-10 rounded-none border border-[#e2ddd5] p-0 cursor-pointer"
                      />
                      <span className="text-xs font-mono text-[#1a1a1a]">{settings.siteNameColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold flex items-center gap-1.5">
                  <Smartphone size={14} /> TÍTULO EM DISPOSITIVOS MÓVEIS
                </label>
                <input 
                  type="text" 
                  name="mobileTitle"
                  value={settings.mobileTitle}
                  onChange={handleChange}
                  className="w-full bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a1a]"
                />
              </div>
            </div>

            {/* Mensagem de Boas-Vindas */}
            <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
              <div className="border-b border-[#f0ece5] pb-4">
                <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
                  <MessageSquare size={20} className="text-[#8e8a82]" /> Mensagem de Boas-Vindas
                </h2>
                <p className="text-xs text-[#8e8a82] font-sans mt-1">Texto de apresentação na barra lateral e página inicial.</p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">CONTEÚDO DA MENSAGEM</label>
                <textarea 
                  name="welcomeMessage"
                  value={settings.welcomeMessage}
                  onChange={handleChange}
                  rows={5}
                  className="w-full bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a1a] font-sans leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">FONTE DA MENSAGEM</label>
                  <div className="relative">
                    <select 
                      name="messageFont"
                      value={settings.messageFont}
                      onChange={handleChange}
                      className="w-full appearance-none bg-white border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                    >
                      {FONT_OPTIONS.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8a82] pointer-events-none" size={14} />
                  </div>
                  <div className="mt-2 p-2.5 bg-white border border-[#e2ddd5] text-xs text-[#1a1a1a]" style={{ fontFamily: getFontFamily(settings.messageFont) }}>
                    <span className="text-[9px] uppercase tracking-widest text-[#8e8a82] block mb-0.5 font-sans">Pré-visualização:</span>
                    Manuel Francisco — ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">ALINHAMENTO</label>
                  <div className="flex gap-1">
                    {(['left', 'center', 'right'] as const).map(align => (
                      <button 
                        key={align}
                        type="button" 
                        onClick={() => setSettings(prev => ({ ...prev, messageAlignment: align }))}
                        className={`flex-1 h-10 flex items-center justify-center text-xs border transition-colors ${
                          settings.messageAlignment === align 
                            ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' 
                            : 'bg-[#faf9f6] border-[#e2ddd5] text-[#8e8a82] hover:bg-white'
                        }`}
                      >
                        {align === 'left' && <AlignLeft size={16} />}
                        {align === 'center' && <AlignCenter size={16} />}
                        {align === 'right' && <AlignRight size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">TAMANHO DA FONTE</label>
                    <span className="text-[11px] font-mono text-[#8e8a82]">{settings.messageFontSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    name="messageFontSize"
                    min="10" max="22"
                    value={settings.messageFontSize}
                    onChange={handleChange}
                    className="w-full h-1.5 bg-[#e5e0d8] rounded-lg appearance-none cursor-pointer accent-[#1a1a1a] mt-3"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">COR DA MENSAGEM</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      name="messageColor"
                      value={settings.messageColor}
                      onChange={handleChange}
                      className="w-10 h-10 rounded-none border border-[#e2ddd5] p-0 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-[#1a1a1a]">{settings.messageColor}</span>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 2: GALERIA & SLIDESHOW */}
        {activeTab === 'galeria' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            {/* Opções da Galeria */}
            <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
              <div className="border-b border-[#f0ece5] pb-4">
                <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
                  <LayoutDashboard size={20} className="text-[#8e8a82]" /> Galeria de Fotografias
                </h2>
                <p className="text-xs text-[#8e8a82] font-sans mt-1">Configurações de visualização da grelha de imagens e qualidade de apresentação.</p>
              </div>

              {/* Tamanho das Miniaturas */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">TAMANHO DAS MINIATURAS (GALERIA PRINCIPAL)</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: '120 px', desc: 'Compacto' },
                    { label: '160 px', desc: 'Equilibrado' },
                    { label: '200 px', desc: 'Médio' },
                    { label: '240 px', desc: 'Grande' },
                    { label: '280 px', desc: 'Imponente' }
                  ].map(size => (
                    <button 
                      key={size.label}
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, thumbnailSize: size.label }))}
                      className={`p-3 border text-center transition-all ${
                        settings.thumbnailSize === size.label 
                          ? 'bg-[#faf9f6] border-[#1a1a1a] ring-1 ring-[#1a1a1a]' 
                          : 'bg-white border-[#e2ddd5] hover:border-[#a09c94]'
                      }`}
                    >
                      <p className="text-xs font-bold text-[#1a1a1a] mb-1">{size.label}</p>
                      <p className="text-[9px] text-[#8e8a82] uppercase tracking-wider">{size.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Qualidade de Importação e Lightbox */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">QUALIDADE NA IMPORTAÇÃO</label>
                  <select 
                    name="importQuality"
                    value={settings.importQuality}
                    onChange={handleChange}
                    className="w-full bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                  >
                    <option value="Original">Original (sem redimensionar)</option>
                    <option value="1800 px">1800 px (Alta qualidade)</option>
                    <option value="1200 px">1200 px (Equilibrado)</option>
                    <option value="800 px">800 px (Compacto)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">QUALIDADE NO LIGHTBOX (ECRÃ COMPLETO)</label>
                  <select 
                    name="lightboxQuality"
                    value={settings.lightboxQuality}
                    onChange={handleChange}
                    className="w-full bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                  >
                    <option value="Original">Original (Resolução Máxima)</option>
                    <option value="2400 px">2400 px (Alta Definição)</option>
                    <option value="1800 px">1800 px (Excelente Qualidade)</option>
                    <option value="1400 px">1400 px (Equilibrado)</option>
                    <option value="800 px">800 px (Carregamento Rápido)</option>
                  </select>
                </div>
              </div>

              {/* Configurações da Galeria Admin: Tamanho dos Thumbs em px e Compressão */}
              <div className="border-t border-[#f0ece5] pt-6 space-y-6">
                <span className="text-[10px] uppercase tracking-widest text-[#8e8a82] font-bold block">
                  GALERIA DO PAINEL ADMIN & CARREGAMENTO
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tamanho dos Thumbs em px */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">TAMANHO DOS THUMBS (ADMIN)</label>
                      <span className="text-[11px] font-mono text-[#8e8a82]">{settings.adminThumbSizePx || 200}px</span>
                    </div>
                    <input 
                      type="range" 
                      name="adminThumbSizePx"
                      min="100" max="400" step="10"
                      value={settings.adminThumbSizePx || 200}
                      onChange={(e) => setSettings(prev => ({ ...prev, adminThumbSizePx: parseInt(e.target.value, 10) }))}
                      className="w-full h-1.5 bg-[#e5e0d8] rounded-lg appearance-none cursor-pointer accent-[#1a1a1a] mt-3"
                    />
                    <p className="text-[10px] text-[#8e8a82]">Ajuste o tamanho de visualização das miniaturas na galeria do painel admin.</p>
                  </div>

                  {/* Nível de Compressão (%) */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">COMPRESSÃO NO CARREGAMENTO</label>
                      <span className="text-[11px] font-mono text-[#8e8a82]">{settings.compressQuality || 80}%</span>
                    </div>
                    <input 
                      type="range" 
                      name="compressQuality"
                      min="10" max="100" step="5"
                      value={settings.compressQuality || 80}
                      onChange={(e) => setSettings(prev => ({ ...prev, compressQuality: parseInt(e.target.value, 10) }))}
                      className="w-full h-1.5 bg-[#e5e0d8] rounded-lg appearance-none cursor-pointer accent-[#1a1a1a] mt-3"
                    />
                    <p className="text-[10px] text-[#8e8a82]">Uma qualidade de 80% reduz significativamente o tamanho da imagem com perda impercetível de qualidade visual.</p>
                  </div>
                </div>

                {/* Filtro de Nitidez no Carregamento */}
                <div className="border-t border-[#f0ece5] pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#1a1a1a]">Filtro de Nitidez Automático (Sharpen)</p>
                      <p className="text-[11px] text-[#8e8a82] font-sans">Aplica um filtro de nitidez ao carregar e comprimir novas fotografias para a base de dados.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="enableSharpen"
                        checked={settings.enableSharpen === true}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a1a1a]"></div>
                    </label>
                  </div>

                  {settings.enableSharpen === true && (
                    <div className="space-y-3 bg-[#faf9f6] p-4 border border-[#e2ddd5] rounded-sm">
                      <div className="flex justify-between">
                        <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">PERCENTAGEM DE NITIDEZ</label>
                        <span className="text-[11px] font-mono text-[#8e8a82]">{settings.sharpenAmount !== undefined ? settings.sharpenAmount : 30}%</span>
                      </div>
                      <input 
                        type="range" 
                        name="sharpenAmount"
                        min="5" max="100" step="5"
                        value={settings.sharpenAmount !== undefined ? settings.sharpenAmount : 30}
                        onChange={(e) => setSettings(prev => ({ ...prev, sharpenAmount: parseInt(e.target.value, 10) }))}
                        className="w-full h-1.5 bg-[#e5e0d8] rounded-lg appearance-none cursor-pointer accent-[#1a1a1a] mt-2"
                      />
                      <p className="text-[10px] text-[#8e8a82]">Define a intensidade do filtro de nitidez aplicado às imagens (recomenda-se entre 20% e 40%).</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Novas Opções Sugeridas */}
              <div className="border-t border-[#f0ece5] pt-6 space-y-6">
                <span className="text-[10px] uppercase tracking-widest text-[#8e8a82] font-bold block">
                  FUNCIONALIDADES AVANÇADAS DA GALERIA
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tema do Fundo */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">
                      TEMA DO FUNDO
                    </label>
                    <select 
                      name="galleryTheme"
                      value={settings.galleryTheme || 'Claro'}
                      onChange={handleChange}
                      className="w-full bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                    >
                      <option value="Claro">Claro Minimalista (Padrão)</option>
                      <option value="Sepia">Warm Sepia (Suave)</option>
                      <option value="Escuro">Escuro Fotográfico (High Contrast)</option>
                    </select>
                  </div>

                  {/* Exibição de Legendas */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">
                      EXIBIÇÃO DE TÍTULOS DE FOTOS
                    </label>
                    <select 
                      name="showCaptions"
                      value={settings.showCaptions || 'Hover'}
                      onChange={handleChange}
                      className="w-full bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                    >
                      <option value="Hover">Ao passar o cursor (Hover)</option>
                      <option value="Sempre">Sempre visível sobre a miniatura</option>
                      <option value="Oculto">Apenas na vista expandida</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">
                      POSIÇÃO DOS TÍTULOS
                    </label>
                    <select 
                      name="captionPosition"
                      value={settings.captionPosition || 'bottom-center'}
                      onChange={handleChange}
                      className="w-full bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                    >
                      <option value="bottom-left">Canto Inferior Esquerdo</option>
                      <option value="bottom-right">Canto Inferior Direito</option>
                      <option value="bottom-center">Centro Inferior</option>
                      <option value="top-left">Canto Superior Esquerdo</option>
                      <option value="top-right">Canto Superior Direito</option>
                      <option value="top-center">Centro Superior</option>
                      <option value="center">Ao Centro</option>
                    </select>
                  </div>
                </div>

                {/* Efeito e Zoom da Foto Ampliada (Lightbox) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#8e8a82]" /> EFEITO DE TRANSIÇÃO (LIGHTBOX)
                    </label>
                    <div className="relative">
                      <select 
                        name="lightboxEffect"
                        value={settings.lightboxEffect || 'Fade Standard (Dissolução Clássica)'}
                        onChange={handleChange}
                        className="w-full appearance-none bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                      >
                        {LIGHTBOX_EFFECT_OPTIONS.map(effect => (
                          <option key={effect} value={effect}>{effect}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8a82] pointer-events-none" size={14} />
                    </div>
                    <p className="text-[11px] text-[#8e8a82]">Animação visual ao mudar de foto ampliada.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block flex items-center gap-1.5">
                      <ZoomIn size={14} className="text-[#8e8a82]" /> ZOOM INICIAL DA FOTO AMPLIADA
                    </label>
                    <div className="relative">
                      <select 
                        name="defaultZoomLevel"
                        value={settings.defaultZoomLevel || 100}
                        onChange={handleChange}
                        className="w-full appearance-none bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                      >
                        <option value={50}>50% — Visão Panorâmica (Afastado)</option>
                        <option value={75}>75% — Moldura Suave</option>
                        <option value={100}>100% — Tamanho Real (Recomendado)</option>
                        <option value={125}>125% — Ligeira Ampliação de Detalhes</option>
                        <option value={150}>150% — Zoom Destacado de Detalhes</option>
                        <option value={200}>200% — Macro / Alta Densidade</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8a82] pointer-events-none" size={14} />
                    </div>
                    <p className="text-[11px] text-[#8e8a82]">Nível de aproximação inicial ao abrir a foto em ecrã expandido.</p>
                  </div>
                </div>

                {/* Cor de Fundo do Lightbox Modal */}
                <div className="space-y-2 pt-2 border-t border-[#f0ece5]">
                  <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block flex items-center gap-1.5">
                    <Palette size={14} className="text-[#8e8a82]" /> COR DE FUNDO DA FOTO AMPLIADA (LIGHTBOX)
                  </label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      name="lightboxBgColor"
                      value={settings.lightboxBgColor || '#0a0a0a'}
                      onChange={handleChange}
                      className="w-10 h-10 border border-[#e2ddd5] rounded cursor-pointer bg-transparent p-0.5"
                    />
                    <input 
                      type="text" 
                      name="lightboxBgColor"
                      value={settings.lightboxBgColor || '#0a0a0a'}
                      onChange={handleChange}
                      placeholder="#0a0a0a"
                      className="flex-1 bg-[#faf9f6] border border-[#e2ddd5] px-4 py-2.5 text-xs font-mono uppercase focus:outline-none focus:border-[#1a1a1a]"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="text-[10px] text-[#8e8a82]">Amostras rápidas:</span>
                    {[
                      { label: 'Escuro Ônix', color: '#0a0a0a' },
                      { label: 'Preto Puro', color: '#000000' },
                      { label: 'Cinza Carvão', color: '#18181b' },
                      { label: 'Cinza Fotográfico', color: '#767676' },
                      { label: 'Claro Neutro', color: '#f5f5f0' }
                    ].map(preset => (
                      <button
                        key={preset.color}
                        type="button"
                        onClick={() => setSettings(prev => ({ ...prev, lightboxBgColor: preset.color }))}
                        className="px-2 py-1 text-[10px] border border-[#e2ddd5] rounded flex items-center gap-1.5 bg-[#faf9f6] hover:bg-white transition-all"
                      >
                        <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: preset.color }} />
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Switch Proteção de Imagem */}
                <div className="flex items-center justify-between py-2 border-t border-[#f0ece5] pt-4">
                  <div>
                    <p className="text-xs font-bold text-[#1a1a1a]">Proteção contra cópias não autorizadas</p>
                    <p className="text-[11px] text-[#8e8a82] font-sans">Desativa o clique direito e o arrastamento direto de fotografias na galeria.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="protectPhotos"
                      checked={settings.protectPhotos || false}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a1a1a]"></div>
                  </label>
                </div>

                {/* Mensagem de Aviso ao Clicar com Botão Direito nas Fotos */}
                <div className="border-t border-[#f0ece5] pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#1a1a1a]">Mensagem de Direitos de Autor (Clique Direito)</p>
                      <p className="text-[11px] text-[#8e8a82] font-sans">Exibe um aviso de copyright personalizado ao clicar com o botão direito nas fotografias.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="enableRightClickMessage"
                        checked={settings.enableRightClickMessage !== false}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a1a1a]"></div>
                    </label>
                  </div>

                  {settings.enableRightClickMessage !== false && (
                    <div className="space-y-4 bg-[#faf9f6] p-4 border border-[#e2ddd5] rounded-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">TÍTULO (EX: COPYRIGHT + 2026)</label>
                          <input 
                            type="text"
                            name="rightClickTitle"
                            value={settings.rightClickTitle || 'Copyright © 2026'}
                            onChange={handleChange}
                            className="w-full bg-white border border-[#e2ddd5] px-3 py-2 text-xs focus:outline-none focus:border-[#1a1a1a]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">SUBTÍTULO (EX: TODOS OS DIREITOS RESERVADOS)</label>
                          <input 
                            type="text"
                            name="rightClickSubtitle"
                            value={settings.rightClickSubtitle || 'manuelfrancisco. Todos os direitos reservados'}
                            onChange={handleChange}
                            className="w-full bg-white border border-[#e2ddd5] px-3 py-2 text-xs focus:outline-none focus:border-[#1a1a1a]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">TIPO DE FONTE</label>
                          <div className="relative">
                            <select 
                              name="rightClickFont"
                              value={settings.rightClickFont || 'Plus Jakarta Sans — sans-serif limpo moderno'}
                              onChange={handleChange}
                              className="w-full appearance-none bg-white border border-[#e2ddd5] px-3 py-2 text-xs focus:outline-none focus:border-[#1a1a1a]"
                            >
                              {FONT_OPTIONS.map(font => (
                                <option key={font} value={font}>{font}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8a82] pointer-events-none" size={14} />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">TAMANHO DA FONTE</label>
                            <span className="text-[11px] font-mono text-[#8e8a82]">{settings.rightClickSize || '14px'}</span>
                          </div>
                          <input 
                            type="text"
                            name="rightClickSize"
                            value={settings.rightClickSize || '14px'}
                            onChange={handleChange}
                            className="w-full bg-white border border-[#e2ddd5] px-3 py-2 text-xs focus:outline-none focus:border-[#1a1a1a]"
                            placeholder="ex: 14px"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">COR DO TEXTO</label>
                          <div className="flex items-center gap-3">
                            <input 
                              type="color" 
                              name="rightClickColor"
                              value={settings.rightClickColor || '#ffffff'}
                              onChange={handleChange}
                              className="w-8 h-8 rounded border border-[#e2ddd5] cursor-pointer bg-transparent"
                            />
                            <input 
                              type="text"
                              name="rightClickColor"
                              value={settings.rightClickColor || '#ffffff'}
                              onChange={handleChange}
                              className="w-full bg-white border border-[#e2ddd5] px-3 py-1.5 text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">COR DE FUNDO DO AVISO</label>
                          <div className="flex items-center gap-3">
                            <input 
                              type="color" 
                              name="rightClickBgColor"
                              value={settings.rightClickBgColor?.startsWith('rgba') ? '#000000' : (settings.rightClickBgColor || '#000000')}
                              onChange={(e) => setSettings(prev => ({ ...prev, rightClickBgColor: e.target.value }))}
                              className="w-8 h-8 rounded border border-[#e2ddd5] cursor-pointer bg-transparent"
                            />
                            <input 
                              type="text"
                              name="rightClickBgColor"
                              value={settings.rightClickBgColor || 'rgba(0, 0, 0, 0.85)'}
                              onChange={handleChange}
                              className="w-full bg-white border border-[#e2ddd5] px-3 py-1.5 text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Live Preview */}
                      <div className="mt-4 pt-4 border-t border-[#e2ddd5]">
                        <span className="text-[9px] uppercase tracking-widest text-[#8e8a82] block mb-2 font-sans font-bold">PRÉ-VISUALIZAÇÃO DO AVISO:</span>
                        <div 
                          className="p-6 rounded-sm text-center shadow-lg border border-white/20 flex flex-col items-center gap-2"
                          style={{
                            backgroundColor: settings.rightClickBgColor || 'rgba(0, 0, 0, 0.85)',
                            fontFamily: getFontFamily(settings.rightClickFont || 'Plus Jakarta Sans — sans-serif limpo moderno'),
                            color: settings.rightClickColor || '#ffffff'
                          }}
                        >
                          <h4 className="font-bold" style={{ fontSize: settings.rightClickSize || '14px' }}>
                            {settings.rightClickTitle || 'Copyright © 2026'}
                          </h4>
                          <p className="font-sans text-xs opacity-95">
                            {settings.rightClickSubtitle || 'manuelfrancisco. Todos os direitos reservados'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Switch Dados EXIF */}
                <div className="flex items-center justify-between py-2 border-t border-[#f0ece5] pt-4">
                  <div>
                    <p className="text-xs font-bold text-[#1a1a1a]">Exibir Dados EXIF Fotográficos</p>
                    <p className="text-[11px] text-[#8e8a82] font-sans">Disponibiliza o painel EXIF no Lightbox com detalhes da câmara, lente, velocidade, ISO e abertura.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="showExifData"
                      checked={settings.showExifData !== false}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a1a1a]"></div>
                  </label>
                </div>

                {/* Switch Atalhos de Teclado e Gestos */}
                <div className="flex items-center justify-between py-2 border-t border-[#f0ece5] pt-4">
                  <div>
                    <p className="text-xs font-bold text-[#1a1a1a]">Atalhos de Teclado e Gestos Swipe</p>
                    <p className="text-[11px] text-[#8e8a82] font-sans">Ativa a navegação por teclado (Setas, Esc, E, F, J/K, G/I/B/L/C), gestos no mobile e menu de ajuda.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="enableKeyboardShortcuts"
                      checked={settings.enableKeyboardShortcuts !== false}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a1a1a]"></div>
                  </label>
                </div>

                {/* Switch Modo Zen */}
                <div className="space-y-3 border-t border-[#f0ece5] pt-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-xs font-bold text-[#1a1a1a]">Apresentação Imersiva (Modo Zen)</p>
                      <p className="text-[11px] text-[#8e8a82] font-sans">Disponibiliza o botão e a experiência de apresentação de fotografias em ecrã inteiro com áudio ambiente opcional.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="enableZenMode"
                        checked={settings.enableZenMode !== false}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a1a1a]"></div>
                    </label>
                  </div>

                  {settings.enableZenMode !== false && (
                    <div className="pl-4 border-l-2 border-[#1a1a1a] mt-3 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">COR DO TEXTO / ÍCONE</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="color" 
                              name="zenModeButtonColor"
                              value={settings.zenModeButtonColor || '#fde68a'}
                              onChange={handleChange}
                              className="h-10 w-10 border border-[#e2ddd5] cursor-pointer shrink-0"
                            />
                            <input 
                              type="text"
                              name="zenModeButtonColor"
                              value={settings.zenModeButtonColor || '#fde68a'}
                              onChange={handleChange}
                              className="w-full bg-[#faf9f6] border border-[#e2ddd5] px-2 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">COR DE FUNDO</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="color" 
                              name="zenModeButtonBgColor"
                              value={settings.zenModeButtonBgColor || 'rgba(0,0,0,0.4)'}
                              onChange={handleChange}
                              className="h-10 w-10 border border-[#e2ddd5] cursor-pointer shrink-0"
                            />
                            <input 
                              type="text"
                              name="zenModeButtonBgColor"
                              value={settings.zenModeButtonBgColor || 'rgba(0,0,0,0.4)'}
                              onChange={handleChange}
                              className="w-full bg-[#faf9f6] border border-[#e2ddd5] px-2 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                              placeholder="ex: rgba(0,0,0,0.4)"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Switch Marca de Água (Watermark) */}
                <div className="space-y-3 border-t border-[#f0ece5] pt-4">
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-xs font-bold text-[#1a1a1a]">Marca de Água do Fotógrafo</p>
                      <p className="text-[11px] text-[#8e8a82] font-sans">Exibe uma assinatura/marca de água discreta no canto inferior das fotografias.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="enableWatermark"
                        checked={settings.enableWatermark || false}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a1a1a]"></div>
                    </label>
                  </div>

                  {settings.enableWatermark && (
                    <div className="pl-2 border-l-2 border-[#1a1a1a] space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">
                          Texto da Marca de Água
                        </label>
                        <input 
                          type="text" 
                          name="watermarkText"
                          value={settings.watermarkText || '© Manuel Francisco'}
                          onChange={handleChange}
                          placeholder="© Manuel Francisco"
                          className="w-full bg-[#faf9f6] border border-[#e2ddd5] px-3 py-2 text-xs focus:outline-none focus:border-[#1a1a1a]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">
                          Posição da Marca de Água (Galeria/Lightbox)
                        </label>
                        <div className="relative">
                          <select 
                            name="watermarkPosition"
                            value={settings.watermarkPosition || 'bottom-left'}
                            onChange={handleChange}
                            className="w-full appearance-none bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                          >
                            <option value="bottom-left">Canto Inferior Esquerdo</option>
                            <option value="bottom-right">Canto Inferior Direito</option>
                            <option value="bottom-center">Centro Inferior</option>
                            <option value="top-left">Canto Superior Esquerdo</option>
                            <option value="top-right">Canto Superior Direito</option>
                            <option value="top-center">Centro Superior</option>
                            <option value="center">Ao Centro (Meio da Foto)</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8a82] pointer-events-none" size={14} />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <p className="text-[11px] font-bold text-[#1a1a1a]">Exibir também no Slideshow</p>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            name="showWatermarkInSlideshow"
                            checked={settings.showWatermarkInSlideshow ?? true}
                            onChange={handleChange}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1a1a1a]"></div>
                        </label>
                      </div>

                      {settings.showWatermarkInSlideshow !== false && (
                        <div className="space-y-1 pl-4 border-l border-[#e2ddd5]">
                          <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">
                            Posição no Slideshow
                          </label>
                          <div className="relative">
                            <select 
                              name="slideshowWatermarkPosition"
                              value={settings.slideshowWatermarkPosition || settings.watermarkPosition || 'bottom-left'}
                              onChange={handleChange}
                              className="w-full appearance-none bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                            >
                              <option value="bottom-left">Canto Inferior Esquerdo</option>
                              <option value="bottom-right">Canto Inferior Direito</option>
                              <option value="bottom-center">Centro Inferior</option>
                              <option value="top-left">Canto Superior Esquerdo</option>
                              <option value="top-right">Canto Superior Direito</option>
                              <option value="top-center">Centro Superior</option>
                              <option value="center">Ao Centro</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8a82] pointer-events-none" size={14} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Switch Pesquisa & Ordenação */}
                <div className="flex items-center justify-between py-2 border-t border-[#f0ece5] pt-4">
                  <div>
                    <p className="text-xs font-bold text-[#1a1a1a]">Barra de Pesquisa e Ordenação na Galeria</p>
                    <p className="text-[11px] text-[#8e8a82] font-sans">Permite aos visitantes pesquisar fotografias por palavra-chave ou alterar a ordem de exibição.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="enableGallerySearch"
                      checked={settings.enableGallerySearch !== false}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a1a1a]"></div>
                  </label>
                </div>

                {/* Switch Coleção de Favoritos */}
                <div className="flex items-center justify-between py-2 border-t border-[#f0ece5] pt-4">
                  <div>
                    <p className="text-xs font-bold text-[#1a1a1a]">Coleção de Fotos Favoritas (Guardar Visitante)</p>
                    <p className="text-[11px] text-[#8e8a82] font-sans">Permite aos visitantes marcar fotos com um coração e filtrar a sua coleção pessoal guardada no navegador.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="enableFavorites"
                      checked={settings.enableFavorites !== false}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a1a1a]"></div>
                  </label>
                </div>

                {/* Switch Comparador Lado a Lado */}
                <div className="flex items-center justify-between py-2 border-t border-[#f0ece5] pt-4">
                  <div>
                    <p className="text-xs font-bold text-[#1a1a1a]">Modo de Comparação Lado a Lado</p>
                    <p className="text-[11px] text-[#8e8a82] font-sans">Ativa a ferramenta de comparar duas fotografias lado a lado na galeria/lightbox para análise de detalhe.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="enablePhotoComparison"
                      checked={settings.enablePhotoComparison !== false}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a1a1a]"></div>
                  </label>
                </div>

                {/* Switch Download de Fotos High-Res */}
                <div className="flex items-center justify-between py-2 border-t border-[#f0ece5] pt-4">
                  <div>
                    <p className="text-xs font-bold text-[#1a1a1a]">Permitir Download de Fotos High-Res</p>
                    <p className="text-[11px] text-[#8e8a82] font-sans">Disponibiliza um botão de descarregamento da foto original em alta resolução no Lightbox.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="enablePhotoDownload"
                      checked={settings.enablePhotoDownload || false}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a1a1a]"></div>
                  </label>
                </div>

                {/* Switch Modo Monocromático (Preto & Branco) */}
                <div className="flex items-center justify-between py-2 border-t border-[#f0ece5] pt-4">
                  <div>
                    <p className="text-xs font-bold text-[#1a1a1a]">Filtro de Exibição Monocromática (Preto & Branco)</p>
                    <p className="text-[11px] text-[#8e8a82] font-sans">Disponibiliza aos visitantes um seletor rápido para visualizar toda a galeria em tom Preto & Branco clássico.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="enableMonochromeToggle"
                      checked={settings.enableMonochromeToggle !== false}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a1a1a]"></div>
                  </label>
                </div>
                {/* Switch Gostos & Reações Rápidas */}
                <div className="flex items-center justify-between py-2 border-t border-[#f0ece5] pt-4">
                  <div>
                    <p className="text-xs font-bold text-[#1a1a1a]">Contador de Gostos Rápidos em Fotos</p>
                    <p className="text-[11px] text-[#8e8a82] font-sans">Exibe um contador interativo de 'Gostos' nas imagens para interação imediata do público.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="enablePhotoLikes"
                      checked={settings.enablePhotoLikes !== false}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a1a1a]"></div>
                  </label>
                </div>

                {/* Tipografia e Posição do Lightbox */}
                <div className="border-t border-[#f0ece5] pt-6 space-y-6">
                  <span className="text-[10px] uppercase tracking-widest text-[#8e8a82] font-bold block flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#8e8a82]" /> TIPOGRAFIA, COR E POSIÇÃO DA LEGENDA (FOTO AMPLIADA - LIGHTBOX)
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Fonte do Título e Fonte do Subtítulo */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">FONTE DO TÍTULO (LIGHTBOX)</label>
                      <div className="relative">
                        <select 
                          name="lightboxTitleFont"
                          value={settings.lightboxTitleFont || 'Plus Jakarta Sans — sans-serif limpo moderno'}
                          onChange={handleChange}
                          className="w-full appearance-none bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                        >
                          {FONT_OPTIONS.map(font => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8a82] pointer-events-none" size={14} />
                      </div>
                      <div className="mt-2 p-2.5 bg-white border border-[#e2ddd5] text-xs text-[#1a1a1a]" style={{ fontFamily: getFontFamily(settings.lightboxTitleFont || 'Plus Jakarta Sans — sans-serif limpo moderno') }}>
                        <span className="text-[9px] uppercase tracking-widest text-[#8e8a82] block mb-0.5 font-sans">Pré-visualização:</span>
                        Manuel Francisco — ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">FONTE DO SUBTÍTULO (LIGHTBOX)</label>
                      <div className="relative">
                        <select 
                          name="lightboxSubtitleFont"
                          value={settings.lightboxSubtitleFont || 'Plus Jakarta Sans — sans-serif limpo moderno'}
                          onChange={handleChange}
                          className="w-full appearance-none bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                        >
                          {FONT_OPTIONS.map(font => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8a82] pointer-events-none" size={14} />
                      </div>
                      <div className="mt-2 p-2.5 bg-white border border-[#e2ddd5] text-xs text-[#1a1a1a]" style={{ fontFamily: getFontFamily(settings.lightboxSubtitleFont || 'Plus Jakarta Sans — sans-serif limpo moderno') }}>
                        <span className="text-[9px] uppercase tracking-widest text-[#8e8a82] block mb-0.5 font-sans">Pré-visualização:</span>
                        Manuel Francisco — ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tamanho do Título e Tamanho do Subtítulo */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">TAMANHO DO TÍTULO (LIGHTBOX)</label>
                      <div className="relative">
                        <select 
                          name="lightboxTitleSize"
                          value={settings.lightboxTitleSize || '18 px'}
                          onChange={handleChange}
                          className="w-full appearance-none bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                        >
                          {['14 px', '16 px', '18 px', '20 px', '24 px', '28 px', '32 px', '36 px', '40 px'].map(sz => (
                            <option key={sz} value={sz}>{sz}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8a82] pointer-events-none" size={14} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">TAMANHO DO SUBTÍTULO (LIGHTBOX)</label>
                      <div className="relative">
                        <select 
                          name="lightboxSubtitleSize"
                          value={settings.lightboxSubtitleSize || '12 px'}
                          onChange={handleChange}
                          className="w-full appearance-none bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                        >
                          {['10 px', '11 px', '12 px', '13 px', '14 px', '16 px', '18 px', '20 px'].map(sz => (
                            <option key={sz} value={sz}>{sz}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8a82] pointer-events-none" size={14} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Posição do Texto e Cor do Texto */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">ALINHAMENTO / POSIÇÃO (LIGHTBOX)</label>
                      <div className="relative">
                        <select 
                          name="lightboxTextPosition"
                          value={settings.lightboxTextPosition || 'bottom-left'}
                          onChange={handleChange}
                          className="w-full appearance-none bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                        >
                          <option value="bottom-left">Canto Inferior Esquerdo</option>
                          <option value="bottom-right">Canto Inferior Direito</option>
                          <option value="bottom-center">Centro Inferior</option>
                          <option value="top-left">Canto Superior Esquerdo</option>
                          <option value="top-right">Canto Superior Direito</option>
                          <option value="top-center">Centro Superior</option>
                          <option value="center">Ao Centro</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8a82] pointer-events-none" size={14} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">COR DA FONTE (LIGHTBOX)</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          name="lightboxTextColor"
                          value={settings.lightboxTextColor || '#ffffff'}
                          onChange={handleChange}
                          className="w-10 h-10 border border-[#e2ddd5] rounded cursor-pointer bg-transparent p-0.5"
                        />
                        <input 
                          type="text" 
                          name="lightboxTextColor"
                          value={settings.lightboxTextColor || '#ffffff'}
                          onChange={handleChange}
                          placeholder="#ffffff"
                          className="flex-1 bg-[#faf9f6] border border-[#e2ddd5] px-4 py-2.5 text-xs font-mono uppercase focus:outline-none focus:border-[#1a1a1a]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Configurações do Slideshow */}
            <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
              <div className="border-b border-[#f0ece5] pb-4">
                <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
                  <Smartphone size={20} className="text-[#8e8a82]" /> Slideshow da Página Inicial
                </h2>
                <p className="text-xs text-[#8e8a82] font-sans mt-1">Ajuste o comportamento do carrossel na página de entrada.</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">INTERVALO ENTRE FOTOS</label>
                  <span className="text-[11px] font-mono font-bold text-[#1a1a1a]">{settings.slideshowInterval} segundos</span>
                </div>
                <input 
                  type="range" 
                  name="slideshowInterval"
                  min="2" max="15"
                  value={settings.slideshowInterval}
                  onChange={handleChange}
                  className="w-full h-1.5 bg-[#e5e0d8] rounded-lg appearance-none cursor-pointer accent-[#1a1a1a]"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#8e8a82]" /> EFEITO VISUAL DE TRANSIÇÃO DO SLIDESHOW
                </label>
                <div className="relative">
                  <select 
                    name="slideshowEffect"
                    value={settings.slideshowEffect || 'Fade (Suave Dissolução)'}
                    onChange={handleChange}
                    className="w-full appearance-none bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                  >
                    {SLIDESHOW_EFFECT_OPTIONS.map(effect => (
                      <option key={effect} value={effect}>{effect}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8a82] pointer-events-none" size={14} />
                </div>
                <p className="text-[11px] text-[#8e8a82]">Estilo cinemático de transição entre os slides na abertura do portfolio.</p>
              </div>

              {/* Zoom e Cor de Fundo do Slideshow */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block flex items-center gap-1.5">
                    <ZoomIn size={14} className="text-[#8e8a82]" /> ESCALA / ZOOM DO SLIDESHOW
                  </label>
                  <div className="relative">
                    <select 
                      name="slideshowZoom"
                      value={settings.slideshowZoom || 105}
                      onChange={handleChange}
                      className="w-full appearance-none bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                    >
                      <option value={50}>50% — Visão Recuada Panorâmica</option>
                      <option value={60}>60% — Afastamento Amplo</option>
                      <option value={70}>70% — Moldura Larga</option>
                      <option value={75}>75% — Moldura Suave</option>
                      <option value={80}>80% — Afastamento Ligeiro</option>
                      <option value={85}>85% — Margem Espaçosa</option>
                      <option value={90}>90% — Moldura Minimalista</option>
                      <option value={95}>95% — Subtil Ligeiro Afastamento</option>
                      <option value={100}>100% — Ajuste Padrão (Sem Zoom Extra)</option>
                      <option value={105}>105% — Ligeiro Enquadramento (Recomendado)</option>
                      <option value={110}>110% — Efeito Cinemático Suave</option>
                      <option value={115}>115% — Imersão Profunda</option>
                      <option value={120}>120% — Zoom Destacado</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8a82] pointer-events-none" size={14} />
                  </div>
                  <p className="text-[11px] text-[#8e8a82]">Nível de escala aplicado às imagens no carrossel de entrada.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block flex items-center gap-1.5">
                    <Palette size={14} className="text-[#8e8a82]" /> COR DE FUNDO DO SLIDESHOW
                  </label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      name="slideshowBgColor"
                      value={settings.slideshowBgColor || '#1a1a1a'}
                      onChange={handleChange}
                      className="w-10 h-10 border border-[#e2ddd5] rounded cursor-pointer bg-transparent p-0.5"
                    />
                    <input 
                      type="text" 
                      name="slideshowBgColor"
                      value={settings.slideshowBgColor || '#1a1a1a'}
                      onChange={handleChange}
                      placeholder="#1a1a1a"
                      className="flex-1 bg-[#faf9f6] border border-[#e2ddd5] px-4 py-2.5 text-xs font-mono uppercase focus:outline-none focus:border-[#1a1a1a]"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="text-[10px] text-[#8e8a82]">Amostras:</span>
                    {[
                      { label: 'Obsidiana', color: '#1a1a1a' },
                      { label: 'Preto', color: '#000000' },
                      { label: 'Grafite', color: '#121212' },
                      { label: 'Creme', color: '#f4f0ea' },
                      { label: 'Branco', color: '#ffffff' }
                    ].map(preset => (
                      <button
                        key={preset.color}
                        type="button"
                        onClick={() => setSettings(prev => ({ ...prev, slideshowBgColor: preset.color }))}
                        className="px-2 py-1 text-[10px] border border-[#e2ddd5] rounded flex items-center gap-1.5 bg-[#faf9f6] hover:bg-white transition-all"
                      >
                        <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: preset.color }} />
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">AJUSTE DA FOTOGRAFIA NO ECRÃ</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { title: 'Foto Completa', desc: 'Exibe a fotografia na íntegra sem qualquer corte' },
                    { title: 'Preencher', desc: 'Preenche todo o ecrã adaptando a composição' }
                  ].map(fit => (
                    <button 
                      key={fit.title}
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, slideshowFit: fit.title }))}
                      className={`p-4 border text-left transition-all ${
                        settings.slideshowFit === fit.title 
                          ? 'bg-[#faf9f6] border-[#1a1a1a] ring-1 ring-[#1a1a1a]' 
                          : 'bg-white border-[#e2ddd5] hover:border-[#a09c94]'
                      }`}
                    >
                      <p className="text-xs font-bold text-[#1a1a1a] mb-1">{fit.title}</p>
                      <p className="text-[10px] text-[#8e8a82]">{fit.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipografia e Posição das Legendas do Slideshow */}
              <div className="border-t border-[#f0ece5] pt-6 space-y-6">
                <span className="text-[10px] uppercase tracking-widest text-[#8e8a82] font-bold block flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#8e8a82]" /> TIPOGRAFIA, COR E POSIÇÃO DA LEGENDA (SLIDESHOW)
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Fonte do Título e Fonte do Subtítulo */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">FONTE DO TÍTULO</label>
                    <div className="relative">
                      <select 
                        name="slideshowTitleFont"
                        value={settings.slideshowTitleFont || 'Playfair Display — serif clássico editorial'}
                        onChange={handleChange}
                        className="w-full appearance-none bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                      >
                        {FONT_OPTIONS.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8a82] pointer-events-none" size={14} />
                    </div>
                    <div className="mt-2 p-2.5 bg-white border border-[#e2ddd5] text-xs text-[#1a1a1a]" style={{ fontFamily: getFontFamily(settings.slideshowTitleFont || 'Playfair Display — serif clássico editorial') }}>
                      <span className="text-[9px] uppercase tracking-widest text-[#8e8a82] block mb-0.5 font-sans">Pré-visualização:</span>
                      Manuel Francisco — ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">FONTE DO SUBTÍTULO</label>
                    <div className="relative">
                      <select 
                        name="slideshowSubtitleFont"
                        value={settings.slideshowSubtitleFont || 'Plus Jakarta Sans — sans-serif limpo moderno'}
                        onChange={handleChange}
                        className="w-full appearance-none bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                      >
                        {FONT_OPTIONS.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8a82] pointer-events-none" size={14} />
                    </div>
                    <div className="mt-2 p-2.5 bg-white border border-[#e2ddd5] text-xs text-[#1a1a1a]" style={{ fontFamily: getFontFamily(settings.slideshowSubtitleFont || 'Plus Jakarta Sans — sans-serif limpo moderno') }}>
                      <span className="text-[9px] uppercase tracking-widest text-[#8e8a82] block mb-0.5 font-sans">Pré-visualização:</span>
                      Manuel Francisco — ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tamanho do Título e Tamanho do Subtítulo */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">TAMANHO DO TÍTULO</label>
                    <div className="relative">
                      <select 
                        name="slideshowTitleSize"
                        value={settings.slideshowTitleSize || '48 px'}
                        onChange={handleChange}
                        className="w-full appearance-none bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                      >
                        {['24 px', '28 px', '32 px', '36 px', '40 px', '48 px', '54 px', '60 px', '72 px'].map(sz => (
                          <option key={sz} value={sz}>{sz}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8a82] pointer-events-none" size={14} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">TAMANHO DO SUBTÍTULO</label>
                    <div className="relative">
                      <select 
                        name="slideshowSubtitleSize"
                        value={settings.slideshowSubtitleSize || '12 px'}
                        onChange={handleChange}
                        className="w-full appearance-none bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                      >
                        {['10 px', '11 px', '12 px', '13 px', '14 px', '16 px', '18 px', '20 px', '24 px'].map(sz => (
                          <option key={sz} value={sz}>{sz}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8a82] pointer-events-none" size={14} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Posição dos Controlos */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">POSIÇÃO DOS CONTROLOS (BARRA)</label>
                    <div className="relative">
                      <select 
                        name="slideshowControlsPosition"
                        value={settings.slideshowControlsPosition || 'bottom'}
                        onChange={handleChange}
                        className="w-full appearance-none bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                      >
                        <option value="bottom">Barra Inferior (Abaixo da Foto)</option>
                        <option value="top">Barra Superior (Acima da Foto)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8a82] pointer-events-none" size={14} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">ALINHAMENTO DOS CONTROLOS</label>
                    <div className="relative">
                      <select 
                        name="slideshowControlsAlign"
                        value={settings.slideshowControlsAlign || 'center'}
                        onChange={handleChange}
                        className="w-full appearance-none bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                      >
                        <option value="left">Esquerda</option>
                        <option value="center">Centro</option>
                        <option value="right">Direita</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8a82] pointer-events-none" size={14} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">TIPOGRAFIA DOS CONTROLOS</label>
                    <div className="relative">
                      <select 
                        name="slideshowControlsFont"
                        value={settings.slideshowControlsFont || 'Plus Jakarta Sans — sans-serif limpo moderno'}
                        onChange={handleChange}
                        className="w-full appearance-none bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                      >
                        {FONT_OPTIONS.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8a82] pointer-events-none" size={14} />
                    </div>
                    <div className="mt-2 p-2.5 bg-white border border-[#e2ddd5] text-xs text-[#1a1a1a]" style={{ fontFamily: getFontFamily(settings.slideshowControlsFont || 'Plus Jakarta Sans — sans-serif limpo moderno') }}>
                      <span className="text-[9px] uppercase tracking-widest text-[#8e8a82] block mb-0.5 font-sans">Pré-visualização:</span>
                      Manuel Francisco — ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">TAMANHO</label>
                      <input 
                        type="text"
                        name="slideshowControlsSize"
                        value={settings.slideshowControlsSize || '11 px'}
                        onChange={handleChange}
                        className="w-full bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">COR</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          name="slideshowControlsColor"
                          value={settings.slideshowControlsColor || '#ffffff'}
                          onChange={handleChange}
                          className="h-10 w-10 border border-[#e2ddd5] cursor-pointer shrink-0"
                        />
                        <input 
                          type="text"
                          name="slideshowControlsColor"
                          value={settings.slideshowControlsColor || '#ffffff'}
                          onChange={handleChange}
                          className="w-full bg-[#faf9f6] border border-[#e2ddd5] px-2 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-[#f0ece5] mt-6 pt-4">
                  <div>
                    <p className="text-xs font-bold text-[#1a1a1a]">Exibir Títulos das Fotos no Slideshow</p>
                    <p className="text-[11px] text-[#8e8a82] font-sans">Mostra o título e subtítulo da foto selecionada durante a apresentação.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="showSlideshowCaptions"
                      checked={settings.showSlideshowCaptions !== false}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a1a1a]"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Posição do Texto e Cor do Texto */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">ALINHAMENTO / POSIÇÃO DA LEGENDA NO ECRÃ</label>
                    <div className="relative">
                      <select 
                        name="slideshowTextPosition"
                        value={settings.slideshowTextPosition || 'bottom-left'}
                        onChange={handleChange}
                        className="w-full appearance-none bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                      >
                        <option value="bottom-left">Canto Inferior Esquerdo</option>
                        <option value="bottom-right">Canto Inferior Direito</option>
                        <option value="bottom-center">Centro Inferior</option>
                        <option value="top-left">Canto Superior Esquerdo</option>
                        <option value="top-right">Canto Superior Direito</option>
                        <option value="top-center">Centro Superior</option>
                        <option value="center">Ao Centro</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8a82] pointer-events-none" size={14} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">COR DA FONTE</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        name="slideshowTextColor"
                        value={settings.slideshowTextColor || '#ffffff'}
                        onChange={handleChange}
                        className="w-10 h-10 border border-[#e2ddd5] rounded cursor-pointer bg-transparent p-0.5"
                      />
                      <input 
                        type="text" 
                        name="slideshowTextColor"
                        value={settings.slideshowTextColor || '#ffffff'}
                        onChange={handleChange}
                        placeholder="#ffffff"
                        className="flex-1 bg-[#faf9f6] border border-[#e2ddd5] px-4 py-2.5 text-xs font-mono uppercase focus:outline-none focus:border-[#1a1a1a]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 3: PERFIL & CONTACTOS */}
        {activeTab === 'perfil' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            {/* Foto e Biografia */}
            <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
              <div className="border-b border-[#f0ece5] pb-4">
                <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
                  <User size={20} className="text-[#8e8a82]" /> Biografia do Fotógrafo
                </h2>
                <p className="text-xs text-[#8e8a82] font-sans mt-1">Gerencie a sua apresentação pessoal e foto de perfil.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 pb-4">
                <div className="w-28 h-28 bg-[#e8e4dc] overflow-hidden relative shadow-inner flex-shrink-0">
                  <img src={settings.profilePhoto} alt="Fotógrafo" className="w-full h-full object-cover" />
                  {uploadingProfile && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 size={24} className="animate-spin text-white" />
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <input 
                    type="file" 
                    id="profile-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleProfilePhotoUpload}
                  />
                  <label 
                    htmlFor="profile-upload"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#333] transition-colors cursor-pointer shadow-sm"
                  >
                    <Upload size={14} /> Substituir Fotografia
                  </label>
                  <p className="text-[11px] text-[#8e8a82] font-sans">Formatos suportados: JPG, PNG, WEBP.</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">TEXTO DA BIOGRAFIA</label>
                <textarea 
                  name="biography"
                  value={settings.biography}
                  onChange={handleChange}
                  rows={8}
                  className="w-full bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a1a] font-sans leading-relaxed"
                />
              </div>
            </div>

            {/* Redes Sociais & Contacto */}
            <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
              <div className="border-b border-[#f0ece5] pb-4">
                <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
                  <Share2 size={20} className="text-[#8e8a82]" /> Contacto & Redes Sociais
                </h2>
                <p className="text-xs text-[#8e8a82] font-sans mt-1">Ligue as suas contas públicas para o público interagir.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">EMAIL DE CONTACTO</label>
                  <input 
                    type="email" 
                    name="contactEmail"
                    value={settings.contactEmail}
                    onChange={handleChange}
                    className="w-full bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a1a]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">INSTAGRAM</label>
                  <input 
                    type="text" 
                    name="instagram"
                    value={settings.instagram}
                    onChange={handleChange}
                    className="w-full bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a1a]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">FACEBOOK</label>
                  <input 
                    type="text" 
                    name="facebook"
                    value={settings.facebook}
                    onChange={handleChange}
                    className="w-full bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a1a]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">TWITTER / X</label>
                  <input 
                    type="text" 
                    name="twitter"
                    value={settings.twitter}
                    onChange={handleChange}
                    className="w-full bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a1a]"
                  />
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 4: ESTILO & MENUS */}
        {activeTab === 'estilo' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
              <div className="border-b border-[#f0ece5] pb-4">
                <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
                  <Type size={20} className="text-[#8e8a82]" /> Tipografia Global
                </h2>
                <p className="text-xs text-[#8e8a82] font-sans mt-1">Estilos de fonte primários para áreas de texto e leitura.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">FONTE GLOBAL DO SITE</label>
                  <div className="relative">
                    <select 
                      name="globalFont"
                      value={settings.globalFont}
                      onChange={handleChange}
                      className="w-full appearance-none bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                    >
                      {FONT_OPTIONS.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8a82] pointer-events-none" size={14} />
                  </div>
                  <div className="mt-2 p-2.5 bg-white border border-[#e2ddd5] text-xs text-[#1a1a1a]" style={{ fontFamily: getFontFamily(settings.globalFont) }}>
                    <span className="text-[9px] uppercase tracking-widest text-[#8e8a82] block mb-0.5 font-sans">Pré-visualização:</span>
                    Manuel Francisco — ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">COR DO TEXTO GLOBAL</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      name="globalColor"
                      value={settings.globalColor}
                      onChange={handleChange}
                      className="w-10 h-10 rounded-none border border-[#e2ddd5] p-0 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-[#1a1a1a]">{settings.globalColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Estilos dos Menus */}
            <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
              <div className="border-b border-[#f0ece5] pb-4">
                <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
                  <MousePointer2 size={20} className="text-[#8e8a82]" /> Personalização dos Menus
                </h2>
                <p className="text-xs text-[#8e8a82] font-sans mt-1">Efeitos visuais e linhas decorativas nos separadores do menu.</p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">LINHAS DECORATIVAS</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {['Gradiente', 'Sólida', 'Tracejada', 'Pontos', 'Dupla'].map(type => (
                    <button 
                      key={type}
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, menuLines: type }))}
                      className={`h-14 border text-[10px] tracking-widest uppercase flex flex-col items-center justify-center gap-1.5 transition-all ${
                        settings.menuLines === type 
                          ? 'bg-[#faf9f6] border-[#1a1a1a] font-bold text-[#1a1a1a] ring-1 ring-[#1a1a1a]' 
                          : 'bg-white border-[#e2ddd5] text-[#8e8a82] hover:border-[#a09c94]'
                      }`}
                    >
                      <div className="w-10 h-0.5 bg-[#1a1a1a]" style={{ 
                        borderTop: type === 'Tracejada' ? '2px dashed' : type === 'Pontos' ? '2px dotted' : type === 'Dupla' ? '3px double' : 'none', 
                        backgroundColor: type === 'Gradiente' ? 'transparent' : undefined, 
                        backgroundImage: type === 'Gradiente' ? 'linear-gradient(to right, transparent, #1a1a1a, transparent)' : undefined 
                      }} />
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">FONTE DOS MENUS DE NAVEGAÇÃO</label>
                <div className="relative">
                  <select 
                    name="menuFont"
                    value={settings.menuFont}
                    onChange={handleChange}
                    className="w-full appearance-none bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-xs focus:outline-none focus:border-[#1a1a1a]"
                  >
                    {FONT_OPTIONS.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8a82] pointer-events-none" size={14} />
                </div>
                <div className="mt-2 p-2.5 bg-white border border-[#e2ddd5] text-xs text-[#1a1a1a]" style={{ fontFamily: getFontFamily(settings.menuFont) }}>
                  <span className="text-[9px] uppercase tracking-widest text-[#8e8a82] block mb-0.5 font-sans">Pré-visualização:</span>
                  Manuel Francisco — ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">COR DA LETRA DOS MENUS</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      name="menuColor"
                      value={settings.menuColor}
                      onChange={handleChange}
                      className="w-10 h-10 rounded-none border border-[#e2ddd5] p-0 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-[#1a1a1a]">{settings.menuColor}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">COR DAS LINHAS DE MENU</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      name="menuLinesColor"
                      value={settings.menuLinesColor}
                      onChange={handleChange}
                      className="w-10 h-10 rounded-none border border-[#e2ddd5] p-0 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-[#1a1a1a]">{settings.menuLinesColor}</span>
                  </div>
                </div>

                {/* Espaçamento dos botões */}
                <div className="col-span-1 md:col-span-2 pt-6 border-t border-[#f0ece5] space-y-2">
                  <div className="flex justify-between">
                    <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">ESPAÇAMENTO ENTRE BOTÕES DO MENU (SIDEBAR)</label>
                    <span className="text-[11px] font-mono text-[#8e8a82] font-semibold">{settings.sidebarButtonSpacing !== undefined ? settings.sidebarButtonSpacing : 16}px</span>
                  </div>
                  <input 
                    type="range" 
                    name="sidebarButtonSpacing"
                    min="2" max="32" step="1"
                    value={settings.sidebarButtonSpacing !== undefined ? settings.sidebarButtonSpacing : 16}
                    onChange={(e) => setSettings(prev => ({ ...prev, sidebarButtonSpacing: parseInt(e.target.value, 10) }))}
                    className="w-full h-1.5 bg-[#e5e0d8] rounded-lg appearance-none cursor-pointer accent-[#1a1a1a] mt-3"
                  />
                  <p className="text-[11px] text-[#8e8a82]">Ajuste a distância vertical (padding) entre os botões de navegação no menu lateral do seu portfólio.</p>
                </div>

                {/* Espaçamento entre o título e a mensagem de boas-vindas */}
                <div className="col-span-1 md:col-span-2 pt-6 border-t border-[#f0ece5] space-y-2">
                  <div className="flex justify-between">
                    <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">ESPAÇAMENTO ENTRE TÍTULO E MENSAGEM DE BOAS-VINDAS</label>
                    <span className="text-[11px] font-mono text-[#8e8a82] font-semibold">{settings.messageSpacing !== undefined ? settings.messageSpacing : 16}px</span>
                  </div>
                  <input 
                    type="range" 
                    name="messageSpacing"
                    min="0" max="120" step="2"
                    value={settings.messageSpacing !== undefined ? settings.messageSpacing : 16}
                    onChange={(e) => setSettings(prev => ({ ...prev, messageSpacing: parseInt(e.target.value, 10) }))}
                    className="w-full h-1.5 bg-[#e5e0d8] rounded-lg appearance-none cursor-pointer accent-[#1a1a1a] mt-3"
                  />
                  <p className="text-[11px] text-[#8e8a82]">Ajuste a distância vertical entre o título/subtítulo e o texto da mensagem de boas-vindas na barra lateral.</p>
                </div>

                {/* Margem / Espaçamento do slideshow (para ver o fundo) */}
                <div className="col-span-1 md:col-span-2 pt-6 border-t border-[#f0ece5] space-y-2">
                  <div className="flex justify-between">
                    <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">ESPAÇAMENTO DO CONTAINER DO SLIDESHOW (MARGEM DO FUNDO)</label>
                    <span className="text-[11px] font-mono text-[#8e8a82] font-semibold">{settings.slideshowTopMargin !== undefined ? settings.slideshowTopMargin : 0}px</span>
                  </div>
                  <input 
                    type="range" 
                    name="slideshowTopMargin"
                    min="0" max="120" step="2"
                    value={settings.slideshowTopMargin !== undefined ? settings.slideshowTopMargin : 0}
                    onChange={(e) => setSettings(prev => ({ ...prev, slideshowTopMargin: parseInt(e.target.value, 10) }))}
                    className="w-full h-1.5 bg-[#e5e0d8] rounded-lg appearance-none cursor-pointer accent-[#1a1a1a] mt-3"
                  />
                  <p className="text-[11px] text-[#8e8a82]">Define o espaçamento em redor do slideshow para descolá-lo dos bordos e mantê-lo centrado na área principal, revelando o fundo do site.</p>
                </div>

                {/* Espaçamento interno das fotos no slideshow (descolar do topo) */}
                <div className="col-span-1 md:col-span-2 pt-6 border-t border-[#f0ece5] space-y-2">
                  <div className="flex justify-between">
                    <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">MARGEM DA FOTO DENTRO DO SLIDESHOW (DESCOLAR DO TOPO)</label>
                    <span className="text-[11px] font-mono text-[#8e8a82] font-semibold">{settings.slideshowPhotoPadding !== undefined ? settings.slideshowPhotoPadding : 16}px</span>
                  </div>
                  <input 
                    type="range" 
                    name="slideshowPhotoPadding"
                    min="0" max="100" step="2"
                    value={settings.slideshowPhotoPadding !== undefined ? settings.slideshowPhotoPadding : 16}
                    onChange={(e) => setSettings(prev => ({ ...prev, slideshowPhotoPadding: parseInt(e.target.value, 10) }))}
                    className="w-full h-1.5 bg-[#e5e0d8] rounded-lg appearance-none cursor-pointer accent-[#1a1a1a] mt-3"
                  />
                  <p className="text-[11px] text-[#8e8a82]">Adiciona uma margem/espaçamento interno à fotografia para garantir que nunca fica colada ao bordo superior do fundo.</p>
                </div>

                {/* Espaçamento do rodapé a contar do fim da página */}
                <div className="col-span-1 md:col-span-2 pt-6 border-t border-[#f0ece5] space-y-2">
                  <div className="flex justify-between">
                    <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">ESPAÇAMENTO DO RODAPÉ (DO FIM DA PÁGINA)</label>
                    <span className="text-[11px] font-mono text-[#8e8a82] font-semibold">{settings.footerBottomSpacing !== undefined ? settings.footerBottomSpacing : 24}px</span>
                  </div>
                  <input 
                    type="range" 
                    name="footerBottomSpacing"
                    min="0" max="120" step="2"
                    value={settings.footerBottomSpacing !== undefined ? settings.footerBottomSpacing : 24}
                    onChange={(e) => setSettings(prev => ({ ...prev, footerBottomSpacing: parseInt(e.target.value, 10) }))}
                    className="w-full h-1.5 bg-[#e5e0d8] rounded-lg appearance-none cursor-pointer accent-[#1a1a1a] mt-3"
                  />
                  <p className="text-[11px] text-[#8e8a82]">Ajuste a distância (espaçamento inferior) entre o rodapé e a margem final inferior da página.</p>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB: SEO & ANALYTICS */}
        {activeTab === 'seo' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
              <div className="border-b border-[#f0ece5] pb-4">
                <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
                  <Globe size={20} className="text-[#8e8a82]" /> Otimização para Motores de Busca (SEO)
                </h2>
                <p className="text-xs text-[#8e8a82] font-sans mt-1">Configurações para melhorar a visibilidade do seu portfólio no Google.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">TÍTULO META (SEO TITLE)</label>
                  <input 
                    type="text" 
                    name="seoTitle"
                    value={settings.seoTitle || ''}
                    onChange={handleChange}
                    className="w-full bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a1a]"
                    placeholder="Ex: Manuel Francisco Fotografia | Portfólio"
                  />
                  <p className="text-[11px] text-[#8e8a82] font-sans">O título principal que aparece nos resultados de pesquisa e no separador do browser.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">DESCRIÇÃO META (SEO DESCRIPTION)</label>
                  <textarea 
                    name="seoDescription"
                    value={settings.seoDescription || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a1a] resize-none"
                    placeholder="Resumo do site. Recomendado entre 150-160 caracteres."
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">PALAVRAS-CHAVE (KEYWORDS)</label>
                  <input 
                    type="text" 
                    name="seoKeywords"
                    value={settings.seoKeywords || ''}
                    onChange={handleChange}
                    className="w-full bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a1a]"
                    placeholder="Ex: fotografia, portugal, casamentos, retrato (separadas por vírgula)"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
              <div className="border-b border-[#f0ece5] pb-4">
                <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
                  <Sliders size={20} className="text-[#8e8a82]" /> Analytics & Tracking
                </h2>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">ID DO GOOGLE ANALYTICS (GA4)</label>
                <input 
                  type="text" 
                  name="googleAnalyticsId"
                  value={settings.googleAnalyticsId || ''}
                  onChange={handleChange}
                  className="w-full max-w-md bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a1a] font-mono uppercase"
                  placeholder="G-XXXXXXXXXX"
                />
                <p className="text-[11px] text-[#8e8a82] font-sans">Se configurado, ativará o Google Analytics para monitorizar os visitantes.</p>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 5: SEGURANÇA & OPÇÕES */}
        {activeTab === 'seguranca' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
              <div className="border-b border-[#f0ece5] pb-4">
                <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
                  <ShieldCheck size={20} className="text-[#8e8a82]" /> Segurança do Painel
                </h2>
                <p className="text-xs text-[#8e8a82] font-sans mt-1">Proteja a sua área de administração contra acessos públicos não autorizados.</p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">PALAVRA-PASSE DE ADMINISTRADOR</label>
                <input 
                  type="text" 
                  name="adminPassword"
                  value={settings.adminPassword || ''}
                  onChange={handleChange}
                  className="w-full max-w-md bg-[#faf9f6] border border-[#e2ddd5] px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a1a] font-mono tracking-wider"
                  placeholder="ex: manuel2026"
                />
                <p className="text-[11px] text-[#8e8a82] font-sans">Esta palavra-passe será exigida ao aceder às rotas de edição e administração.</p>
              </div>
            </div>

            <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
              <div className="border-b border-[#f0ece5] pb-4">
                <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
                  <Accessibility size={20} className="text-[#8e8a82]" /> Acessibilidade & Desempenho
                </h2>
                <p className="text-xs text-[#8e8a82] font-sans mt-1">Ajuste o comportamento visual para utilizadores com preferências reduzidas de movimento.</p>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-xs font-bold text-[#1a1a1a]">Reduzir Animações</p>
                  <p className="text-[11px] text-[#8e8a82] font-sans">Desativa transições complexas e otimiza a fluidez em dispositivos mais lentos.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="reduceAnimations"
                    checked={settings.reduceAnimations}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a1a1a]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-[#f0ece5] pt-4 mt-2">
                <div>
                  <p className="text-xs font-bold text-[#1a1a1a]">Aviso de Cookies (GDPR)</p>
                  <p className="text-[11px] text-[#8e8a82] font-sans">Exibir banner de consentimento de cookies para visitantes europeus.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="enableCookieConsent"
                    checked={settings.enableCookieConsent ?? true}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a1a1a]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-[#f0ece5] pt-4 mt-2">
                <div>
                  <p className="text-xs font-bold text-amber-600 flex items-center gap-2">
                    <AlertCircle size={14} /> Modo de Manutenção
                  </p>
                  <p className="text-[11px] text-[#8e8a82] font-sans">Oculta o site do público com uma mensagem de "Brevemente". Acesso apenas para si.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>
            </div>

            <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
              <div className="border-b border-[#f0ece5] pb-4">
                <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
                  <Code size={20} className="text-[#8e8a82]" /> CSS Personalizado (Avançado)
                </h2>
                <p className="text-xs text-[#8e8a82] font-sans mt-1">Injete código CSS diretamente no site. Apenas recomendado para utilizadores avançados.</p>
              </div>
              
              <div className="space-y-3">
                <textarea 
                  name="customCss"
                  value={settings.customCss || ''}
                  onChange={handleChange}
                  rows={6}
                  className="w-full bg-[#1a1a1a] text-[#fde68a] border border-[#e2ddd5] px-4 py-3 text-sm focus:outline-none focus:border-black font-mono tracking-wide"
                  placeholder="/* Escreva o seu CSS aqui... */&#10;.custom-class {&#10;  color: red;&#10;}"
                />
              </div>
            </div>

          </motion.div>
        )}

        {/* Rodapé Fixo de Ações */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#e2ddd5] p-4 md:p-6 z-[80] shadow-[0_-4px_25px_rgba(0,0,0,0.06)]">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="hidden sm:block text-[11px] text-[#8e8a82] font-sans">
              Alterações aplicadas em tempo real após guardar.
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
              {onBackToGallery && (
                <button 
                  type="button" 
                  onClick={onBackToGallery}
                  className="flex-1 sm:flex-none py-3.5 px-6 bg-[#faf9f6] text-[#1a1a1a] border border-[#e2ddd5] text-[10px] tracking-[0.2em] font-bold uppercase hover:bg-white transition-all flex items-center justify-center gap-2"
                >
                  <LayoutDashboard size={15} /> Voltar à Galeria
                </button>
              )}

              <button 
                type="button"
                onClick={handleReset}
                className="flex-1 sm:flex-none py-3.5 px-5 bg-[#faf9f6] text-[#8e8a82] hover:text-amber-900 hover:bg-amber-50 border border-[#e2ddd5] text-[10px] tracking-[0.18em] font-bold uppercase transition-all flex items-center justify-center gap-2"
                title="Repor todas as opções para os valores pré-configurados de fábrica"
              >
                <RotateCcw size={14} /> Repor Pré-configurações
              </button>

              <button 
                type="submit" 
                disabled={saving}
                className="flex-1 sm:flex-none py-3.5 px-8 bg-[#1a1a1a] text-white text-[10px] tracking-[0.2em] font-bold uppercase hover:bg-[#333] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {saving ? (
                  <><Loader2 size={15} className="animate-spin" /> A guardar...</>
                ) : (
                  <><Save size={15} /> Guardar Alterações</>
                )}
              </button>
            </div>

          </div>
        </div>

      </form>

      {/* Save Confirmation Modal */}
      <AnimatePresence>
        {showSaveConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#1a1a1a]/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowSaveConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-[#e2ddd5] max-w-md w-full shadow-2xl p-8 text-center relative"
            >
              <div className="w-12 h-12 rounded-full bg-[#faf9f6] text-[#1a1a1a] border border-[#e2ddd5] flex items-center justify-center mx-auto mb-5">
                <Save size={22} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-2xl text-[#1a1a1a] mb-2">
                Guardar Configurações?
              </h3>
              <p className="text-xs text-[#8e8a82] font-sans leading-relaxed mb-8">
                Tem a certeza que deseja aplicar e guardar as alterações efetuadas às configurações do site?
              </p>
              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setShowSaveConfirmModal(false)}
                  className="flex-1 py-3 text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8e8a82] border border-[#e2ddd5] bg-[#faf9f6] hover:bg-white transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  type="button"
                  onClick={executeSave}
                  disabled={saving}
                  className="flex-1 bg-[#1a1a1a] text-white py-3 text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-[#333] transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : 'CONFIRMAR'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#1a1a1a]/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowResetConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-[#e2ddd5] max-w-md w-full shadow-2xl p-8 text-center relative"
            >
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto mb-5">
                <RotateCcw size={22} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-2xl text-[#1a1a1a] mb-2">
                Repor Pré-configurações?
              </h3>
              <p className="text-xs text-[#8e8a82] font-sans leading-relaxed mb-8">
                Tem a certeza que deseja repor todas as opções para os valores padrão de fábrica? As suas personalizações atuais serão substituídas.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setShowResetConfirmModal(false)}
                  className="flex-1 py-3 text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8e8a82] border border-[#e2ddd5] bg-[#faf9f6] hover:bg-white transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  type="button"
                  onClick={executeReset}
                  className="flex-1 bg-[#1a1a1a] text-white py-3 text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-[#333] transition-colors shadow-md"
                >
                  CONFIRMAR
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <AnimatePresence>
        {feedbackModal?.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[220] bg-[#1a1a1a]/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setFeedbackModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-[#e2ddd5] max-w-md w-full shadow-2xl p-8 text-center relative"
            >
              <div className={`w-12 h-12 rounded-full border flex items-center justify-center mx-auto mb-5 ${
                feedbackModal.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {feedbackModal.type === 'success' ? <Check size={24} /> : <AlertCircle size={24} />}
              </div>
              <h3 className="font-serif text-2xl text-[#1a1a1a] mb-2">
                {feedbackModal.title}
              </h3>
              <p className="text-xs text-[#8e8a82] font-sans leading-relaxed mb-8">
                {feedbackModal.message}
              </p>
              <button
                type="button"
                onClick={() => setFeedbackModal(null)}
                className="w-full bg-[#1a1a1a] text-white py-3 text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-[#333] transition-colors shadow-md"
              >
                CONCLUÍDO
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
