import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Loader2, Save, RotateCcw, LayoutDashboard, ChevronDown, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Upload, Palette, Type, Smartphone, MessageSquare, User, Share2, MousePointer2, Settings2, Accessibility, Check } from 'lucide-react';
import { motion } from 'motion/react';

export default function SettingsPanel({ onBackToGallery }: { onBackToGallery?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  
  const INITIAL_SETTINGS = {
    // Marca (Image 1)
    siteName: 'Manuel Francisco\nFotografia',
    siteNameFont: 'Inter — sans-serif moderno',
    siteNameFontSize: 16,
    siteNameColor: '#1a1a1a',
    mobileTitle: 'Manuel Francisco Fotografia',
    welcomeMessage: 'Bem vindo a este espaço.\nQuero que descubra comigo o gosto pela fotografia.\nNão tenho um tema favorito, apenas o gosto de registar aquilo que considero que é belo.\nNão hesite em deixar os seus comentários.',
    
    // Estilo Mensagem (Image 2)
    messageSpacing: 16,
    messageFont: 'Inter — sans-serif moderno',
    messageFontSize: 13,
    messageAlignment: 'left',
    messageColor: '#1a1a1a',
    contactEmail: 'manuel.francisco3@gmail.com',

    // Biografia (Image 3)
    profilePhoto: '/src/assets/images/photographer_portrait_1784841967018.jpg',
    biography: 'Nasceu a 26 de Fevereiro de 1962 em Coimbra. Enfermeiro de profissão. O gosto pela fotografia surgiu em 1982, quando frequentava o Curso de Enfermagem, tendo realizado um curso de iniciação à fotografia leccionado por um professor da escola. Em colaboração com outros colegas e a Associação de Estudantes, reabriram uma câmara escura existente nas instalações da referida Escola. Teve a sua primeira câmara reflex analógica, como presente, uma Minolta X-700, que o passa a acompanhar para todo o lado.',

    // Redes Sociais (Image 3)
    instagram: 'https://instagram.com/...',
    facebook: 'https://www.facebook.com/manuel.francisco.3701/',
    twitter: 'https://twitter.com/...',

    // Tipografia Global (Image 3)
    globalFont: 'Inter — sans-serif moderno',
    globalColor: '#1a1a1a',

    // Tipografia Menus (Image 4)
    menuLines: 'Gradiente',
    menuLinesColor: '#1a1a1a',
    menuFont: 'Inter — sans-serif moderno',
    menuColor: '#000000',

    // Slideshow (Image 4)
    slideshowInterval: 5,
    slideshowFit: 'Foto Completa',

    // Galeria (Image 4)
    thumbnailSize: 'Pequeno',
    importQuality: 'Original',
    lightboxQuality: 'Original',
    galleryGridCols: '4',

    // Acessibilidade (Image 5)
    reduceAnimations: false,

    // Segurança
    adminPassword: 'manuel2026',

    // Categorias da Galeria
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
      alert("Erro ao carregar a foto de perfil.");
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'site'), settings);
      alert("Configurações guardadas com sucesso!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Erro ao guardar as configurações: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Tem a certeza que deseja repor todas as configurações de fábrica? Esta ação não pode ser anulada até guardar.")) {
      setSettings(INITIAL_SETTINGS);
    }
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
      className="max-w-4xl mx-auto py-12 px-6 bg-[#f7f7f7]"
    >
      {/* Header (Image 1 top) */}
      <div className="mb-12">
        <p className="text-[#999] tracking-[0.2em] text-[10px] uppercase font-sans mb-1">PERSONALIZAÇÃO</p>
        <h1 className="font-sans font-semibold text-5xl text-[#1a1a1a]">Configurações</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-20 pb-40">
        
        {/* SECÇÃO: MARCA (Image 1) */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <Palette size={20} className="text-[#7a7a7a]" />
            <h2 className="font-sans font-semibold text-2xl text-[#7a7a7a]">Marca</h2>
          </div>
          <div className="h-px bg-[#ddd] -mt-4"></div>
          
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">NOME DO SITE</label>
              <textarea 
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                rows={2}
                className="w-full bg-[#fdfdfd] border border-[#ddd] px-4 py-3 text-sm focus:outline-none focus:border-[#aaa] transition-colors font-sans"
              />
              <p className="text-[10px] text-[#999] font-sans">Use Enter para quebrar linha.</p>
            </div>

            <div className="bg-[#fdfdfd] border border-[#eee] p-8 space-y-8">
              <label className="text-[10px] uppercase tracking-widest text-[#aaa] font-bold block">ESTILO DO NOME DO SITE</label>
              
              <div className="border border-dashed border-[#ddd] p-10 text-center flex flex-col items-center justify-center min-h-[160px]">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold flex items-center gap-2">
                    <Type size={14} /> TIPO DE LETRA
                  </label>
                  <div className="relative">
                    <select 
                      name="siteNameFont"
                      value={settings.siteNameFont}
                      onChange={handleChange}
                      className="w-full appearance-none bg-white border border-[#ddd] px-4 py-3 text-xs focus:outline-none focus:border-[#aaa]"
                    >
                      <option>Inter — sans-serif moderno</option>
                      <option>Playfair Display — serif clássico</option>
                      <option>Cormorant Garamond — serif elegante</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" size={14} />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold flex items-center gap-2">
                      <Settings2 size={14} /> TAMANHO DA LETRA
                    </label>
                    <span className="text-[10px] font-sans text-[#7a7a7a]">{settings.siteNameFontSize}px</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      name="siteNameFontSize"
                      min="10" max="40"
                      value={settings.siteNameFontSize}
                      onChange={handleChange}
                      className="flex-1 h-1 bg-[#ddd] rounded-lg appearance-none cursor-pointer accent-[#1a1a1a]"
                    />
                    <span className="text-xs text-[#999] min-w-[30px]">16px</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">COR DA LETRA</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    name="siteNameColor"
                    value={settings.siteNameColor}
                    onChange={handleChange}
                    className="w-10 h-10 rounded-none border-none p-0 cursor-pointer"
                  />
                  <span className="text-[10px] text-[#999] font-sans">padrão</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold flex items-center gap-2">
                <Smartphone size={14} /> TÍTULO MOBILE
              </label>
              <p className="text-[10px] text-[#999] font-sans">Texto exibido na barra de navegação em dispositivos móveis.</p>
              <input 
                type="text" 
                name="mobileTitle"
                value={settings.mobileTitle}
                onChange={handleChange}
                className="w-full bg-[#fdfdfd] border border-[#ddd] px-4 py-3 text-sm focus:outline-none focus:border-[#aaa]"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold flex items-center gap-2">
                <MessageSquare size={14} /> MENSAGEM DE BOAS-VINDAS
              </label>
              <p className="text-[10px] text-[#999] font-sans">Aparece na barra lateral (desktop) e na página inicial (mobile).</p>
              <textarea 
                name="welcomeMessage"
                value={settings.welcomeMessage}
                onChange={handleChange}
                rows={6}
                className="w-full bg-[#fdfdfd] border border-[#ddd] px-4 py-3 text-sm focus:outline-none focus:border-[#aaa]"
              />
            </div>
          </div>
        </section>

        {/* SECÇÃO: ESTILO MENSAGEM (Image 2) */}
        <section className="space-y-8">
          <div className="bg-[#fdfdfd] border border-[#eee] p-8 space-y-8">
            <label className="text-[10px] uppercase tracking-widest text-[#aaa] font-bold block">ESTILO DA MENSAGEM</label>
            
            <div className="border border-dashed border-[#ddd] p-10">
              <p style={{ 
                fontFamily: settings.messageFont.includes('serif moderno') ? 'sans-serif' : 'serif', 
                fontSize: `${settings.messageFontSize}px`, 
                color: settings.messageColor,
                lineHeight: '1.6',
                textAlign: settings.messageAlignment as any,
                whiteSpace: 'pre-line'
              }}>
                {settings.welcomeMessage}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">DISTÂNCIA AO TÍTULO</label>
                <span className="text-[10px] font-sans text-[#7a7a7a]">{settings.messageSpacing}px</span>
              </div>
              <input 
                type="range" 
                name="messageSpacing"
                min="0" max="100"
                value={settings.messageSpacing}
                onChange={handleChange}
                className="w-full h-1 bg-[#ddd] rounded-lg appearance-none cursor-pointer accent-[#1a1a1a]"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">TIPO DE LETRA</label>
              <div className="relative">
                <select 
                  name="messageFont"
                  value={settings.messageFont}
                  onChange={handleChange}
                  className="w-full appearance-none bg-white border border-[#ddd] px-4 py-3 text-xs focus:outline-none focus:border-[#aaa]"
                >
                  <option>Inter — sans-serif moderno</option>
                  <option>Playfair Display — serif clássico</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" size={14} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between">
                <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">TAMANHO DA LETRA</label>
                <span className="text-[10px] font-sans text-[#7a7a7a]">{settings.messageFontSize}px</span>
              </div>
              <input 
                type="range" 
                name="messageFontSize"
                min="8" max="30"
                value={settings.messageFontSize}
                onChange={handleChange}
                className="w-full h-1 bg-[#ddd] rounded-lg appearance-none cursor-pointer accent-[#1a1a1a]"
              />
              
              <div className="flex gap-1">
                <button type="button" className="w-12 h-12 bg-white border border-[#ddd] flex items-center justify-center text-xs hover:bg-[#f9f9f9] transition-colors"><Bold size={16} /></button>
                <button type="button" className="w-12 h-12 bg-white border border-[#ddd] flex items-center justify-center text-xs hover:bg-[#f9f9f9] transition-colors"><Italic size={16} /></button>
                <button 
                  type="button" 
                  onClick={() => setSettings(prev => ({ ...prev, messageAlignment: 'left' }))}
                  className={`w-12 h-12 flex items-center justify-center text-xs border transition-colors ${settings.messageAlignment === 'left' ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white border-[#ddd] hover:bg-[#f9f9f9]'}`}
                >
                  <AlignLeft size={16} />
                </button>
                <button 
                  type="button" 
                  onClick={() => setSettings(prev => ({ ...prev, messageAlignment: 'center' }))}
                  className={`w-12 h-12 flex items-center justify-center text-xs border transition-colors ${settings.messageAlignment === 'center' ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white border-[#ddd] hover:bg-[#f9f9f9]'}`}
                >
                  <AlignCenter size={16} />
                </button>
                <button 
                  type="button" 
                  onClick={() => setSettings(prev => ({ ...prev, messageAlignment: 'right' }))}
                  className={`w-12 h-12 flex items-center justify-center text-xs border transition-colors ${settings.messageAlignment === 'right' ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white border-[#ddd] hover:bg-[#f9f9f9]'}`}
                >
                  <AlignRight size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">COR DA LETRA</label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    name="messageColor"
                    value={settings.messageColor}
                    onChange={handleChange}
                    className="w-12 h-12 rounded-none border-none p-0 cursor-pointer"
                  />
                  <span className="text-[14px] text-[#1a1a1a] font-mono tracking-wider">{settings.messageColor.toUpperCase()}</span>
                </div>
                <button type="button" className="text-[11px] text-[#999] hover:text-[#1a1a1a] underline font-sans transition-colors">repor padrão</button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">EMAIL DE CONTACTO</label>
            <input 
              type="email" 
              name="contactEmail"
              value={settings.contactEmail}
              onChange={handleChange}
              className="w-full bg-[#fdfdfd] border border-[#ddd] px-4 py-4 text-sm focus:outline-none focus:border-[#aaa]"
            />
          </div>
        </section>

        {/* SECÇÃO: BIOGRAFIA (Image 3) */}
        <section className="space-y-10">
          <div className="flex items-center gap-3">
            <User size={20} className="text-[#7a7a7a]" />
            <h2 className="font-sans font-semibold text-2xl text-[#7a7a7a]">Biografia</h2>
          </div>
          <div className="h-px bg-[#ddd] -mt-6"></div>
          
          <div className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">FOTO DE PERFIL</label>
              <div className="flex items-center gap-8">
                <div className="w-24 h-24 bg-[#dcd7cf] overflow-hidden rounded-sm shadow-sm relative group">
                  <img src={settings.profilePhoto} alt="Perfil" className="w-full h-full object-cover" />
                  {uploadingProfile && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 size={20} className="animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input 
                    type="file" 
                    id="profile-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleProfilePhotoUpload}
                  />
                  <label 
                    htmlFor="profile-upload"
                    className={`flex items-center gap-3 px-6 py-3 border border-[#ddd] text-[11px] tracking-widest uppercase bg-white hover:bg-gray-50 transition-all font-bold cursor-pointer ${uploadingProfile ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    {uploadingProfile ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} 
                    Escolher foto
                  </label>
                  {settings.profilePhoto && !settings.profilePhoto.includes('unsplash') && (
                    <p className="text-[9px] text-green-600 font-sans flex items-center gap-1">
                      <Check size={10} /> Foto carregada com sucesso
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">TEXTO DA BIOGRAFIA</label>
              <textarea 
                name="biography"
                value={settings.biography}
                onChange={handleChange}
                rows={12}
                className="w-full bg-[#fdfdfd] border border-[#ddd] px-4 py-4 text-sm leading-relaxed focus:outline-none focus:border-[#aaa] font-sans"
              />
            </div>
          </div>
        </section>

        {/* SECÇÃO: REDES SOCIAIS (Image 3) */}
        <section className="space-y-10">
          <div className="flex items-center gap-3">
            <Share2 size={20} className="text-[#7a7a7a]" />
            <h2 className="font-sans font-semibold text-2xl text-[#7a7a7a]">Redes Sociais</h2>
          </div>
          <div className="h-px bg-[#ddd] -mt-6"></div>
          
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">INSTAGRAM</label>
              <input 
                type="text" 
                name="instagram"
                value={settings.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/..."
                className="w-full bg-[#fdfdfd] border border-[#ddd] px-4 py-4 text-sm focus:outline-none"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">FACEBOOK</label>
              <input 
                type="text" 
                name="facebook"
                value={settings.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/..."
                className="w-full bg-[#fdfdfd] border border-[#ddd] px-4 py-4 text-sm focus:outline-none"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">TWITTER / X</label>
              <input 
                type="text" 
                name="twitter"
                value={settings.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/..."
                className="w-full bg-[#fdfdfd] border border-[#ddd] px-4 py-4 text-sm focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* SECÇÃO: TIPOGRAFIA GLOBAL (Image 3) */}
        <section className="space-y-10">
          <div className="flex items-center gap-3">
            <Type size={20} className="text-[#7a7a7a]" />
            <h2 className="font-sans font-semibold text-2xl text-[#7a7a7a]">Tipografia Global</h2>
          </div>
          <div className="h-px bg-[#ddd] -mt-6"></div>
          <p className="text-[11px] text-[#999] font-sans -mt-8">Aplica-se a todo o conteúdo do site.</p>
          
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">TIPO DE LETRA</label>
              <div className="relative">
                <select 
                  name="globalFont"
                  value={settings.globalFont}
                  onChange={handleChange}
                  className="w-full appearance-none bg-white border border-[#ddd] px-4 py-4 text-xs focus:outline-none"
                >
                  <option>Inter — sans-serif moderno</option>
                  <option>Playfair Display — serif clássico</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" size={16} />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">COR DA LETRA</label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    name="globalColor"
                    value={settings.globalColor}
                    onChange={handleChange}
                    className="w-12 h-12 rounded-none border-none p-0 cursor-pointer"
                  />
                  <span className="text-[14px] text-[#1a1a1a] font-mono">{settings.globalColor.toUpperCase()}</span>
                </div>
                <button type="button" className="px-6 py-3 border border-[#ddd] text-[11px] tracking-widest uppercase bg-white hover:bg-gray-50 font-bold transition-all shadow-sm">Pré-visualização</button>
              </div>
            </div>
          </div>
        </section>

        {/* SECÇÃO: TIPOGRAFIA MENUS (Image 4) */}
        <section className="space-y-10">
          <div className="flex items-center gap-3">
            <MousePointer2 size={20} className="text-[#7a7a7a]" />
            <h2 className="font-sans font-semibold text-2xl text-[#7a7a7a]">Tipografia dos Menus</h2>
          </div>
          <div className="h-px bg-[#ddd] -mt-6"></div>
          
          <div className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">LINHAS DECORATIVAS</label>
              <div className="grid grid-cols-5 gap-2">
                {['Gradiente', 'Sólida', 'Tracejada', 'Pontos', 'Dupla'].map(type => (
                  <button 
                    key={type}
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, menuLines: type }))}
                    className={`h-16 border text-[9px] tracking-widest uppercase flex flex-col items-center justify-center gap-2 transition-all ${settings.menuLines === type ? 'bg-white border-[#1a1a1a] shadow-sm ring-1 ring-[#1a1a1a]' : 'bg-[#f0f0f0] border-[#eee] text-[#999] hover:bg-white hover:border-[#ddd]'}`}
                  >
                    <div className={`w-full px-4 h-px ${settings.menuLines === type ? 'bg-[#1a1a1a]' : 'bg-[#999]'}`} style={{ borderTop: settings.menuLines === 'Tracejada' ? '1px dashed' : settings.menuLines === 'Pontos' ? '1px dotted' : settings.menuLines === 'Dupla' ? '3px double' : 'none', backgroundColor: settings.menuLines === 'Gradiente' ? 'transparent' : undefined, backgroundImage: settings.menuLines === 'Gradiente' ? 'linear-gradient(to right, transparent, currentColor, transparent)' : undefined }} />
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    name="menuLinesColor"
                    value={settings.menuLinesColor}
                    onChange={handleChange}
                    className="w-12 h-12 rounded-none border-none p-0 cursor-pointer"
                  />
                  <span className="text-[14px] text-[#1a1a1a] font-mono tracking-wider">{settings.menuLinesColor.toUpperCase()}</span>
                </div>
                <span className="text-[11px] text-[#999] font-sans tracking-wide">cor das linhas</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">TIPO DE LETRA</label>
              <div className="relative">
                <select 
                  name="menuFont"
                  value={settings.menuFont}
                  onChange={handleChange}
                  className="w-full appearance-none bg-white border border-[#ddd] px-4 py-4 text-xs focus:outline-none"
                >
                  <option>Inter — sans-serif moderno</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" size={16} />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">COR DA LETRA</label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    name="menuColor"
                    value={settings.menuColor}
                    onChange={handleChange}
                    className="w-12 h-12 rounded-none border-none p-0 cursor-pointer"
                  />
                  <span className="text-[14px] text-[#1a1a1a] font-mono tracking-wider">{settings.menuColor.toUpperCase()}</span>
                </div>
                <button type="button" className="px-6 py-3 border border-[#ddd] text-[11px] tracking-widest uppercase bg-white hover:bg-gray-50 font-bold transition-all shadow-sm">Pré-visualização</button>
              </div>
            </div>
          </div>
        </section>

        {/* SECÇÃO: SLIDESHOW (Image 4) */}
        <section className="space-y-10">
          <div className="flex items-center gap-3">
            <Smartphone size={20} className="text-[#7a7a7a]" />
            <h2 className="font-sans font-semibold text-2xl text-[#7a7a7a]">Slideshow da Página Inicial</h2>
          </div>
          <div className="h-px bg-[#ddd] -mt-6"></div>
          
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">INTERVALO ENTRE FOTOS (SEGUNDOS)</label>
                <span className="text-[11px] font-sans text-[#7a7a7a] font-bold">{settings.slideshowInterval}s</span>
              </div>
              <p className="text-[11px] text-[#999] font-sans -mt-2">Tempo de exibição de cada fotografia no slideshow da página inicial.</p>
              <div className="flex items-center gap-6">
                <input 
                  type="range" 
                  name="slideshowInterval"
                  min="1" max="20"
                  value={settings.slideshowInterval}
                  onChange={handleChange}
                  className="flex-1 h-1 bg-[#ddd] rounded-lg appearance-none cursor-pointer accent-[#1a1a1a]"
                />
                <span className="text-xs text-[#999] min-w-[30px]">5s</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">AJUSTE DA FOTOGRAFIA</label>
              <p className="text-[11px] text-[#999] font-sans -mt-2">Como a fotografia é apresentada no slideshow.</p>
              <div className="grid grid-cols-2 gap-6 mt-4">
                <button 
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, slideshowFit: 'Preencher' }))}
                  className={`p-10 border text-left transition-all ${settings.slideshowFit === 'Preencher' ? 'bg-white border-[#1a1a1a] shadow-md ring-1 ring-[#1a1a1a]' : 'bg-[#f0f0f0] border-[#eee] text-[#999] hover:bg-white hover:border-[#ddd]'}`}
                >
                  <p className="text-sm font-bold font-sans mb-1 text-[#1a1a1a]">Preencher</p>
                  <p className="text-[11px] font-sans leading-relaxed opacity-70">ocupa o ecrã inteiro (pode cortar)</p>
                </button>
                <button 
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, slideshowFit: 'Foto Completa' }))}
                  className={`p-10 border text-left transition-all ${settings.slideshowFit === 'Foto Completa' ? 'bg-white border-[#1a1a1a] shadow-md ring-1 ring-[#1a1a1a]' : 'bg-[#f0f0f0] border-[#eee] text-[#999] hover:bg-white hover:border-[#ddd]'}`}
                >
                  <p className="text-sm font-bold font-sans mb-1 text-[#1a1a1a]">Foto Completa</p>
                  <p className="text-[11px] font-sans leading-relaxed opacity-70">mostra a foto toda, sem cortes</p>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECÇÃO: GALERIA (Image 4 & 5) */}
        <section className="space-y-10">
          <div className="flex items-center gap-3">
            <LayoutDashboard size={20} className="text-[#7a7a7a]" />
            <h2 className="font-sans font-semibold text-2xl text-[#7a7a7a]">Galeria de Fotografias</h2>
          </div>
          <div className="h-px bg-[#ddd] -mt-6"></div>
          
          <div className="space-y-12">
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">TAMANHO DOS THUMBNAILS</label>
              <p className="text-[11px] text-[#999] font-sans -mt-2">Altura das miniaturas na grelha da galeria.</p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {[
                  { label: 'Pequeno', h: '80px' },
                  { label: 'Médio', h: '140px' },
                  { label: 'Grande', h: '220px' }
                ].map(size => (
                  <button 
                    key={size.label}
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, thumbnailSize: size.label }))}
                    className={`h-48 border flex flex-col items-center justify-center transition-all ${settings.thumbnailSize === size.label ? 'bg-white border-[#1a1a1a] shadow-md ring-1 ring-[#1a1a1a]' : 'bg-[#f0f0f0] border-[#eee] text-[#999] hover:bg-white hover:border-[#ddd]'}`}
                  >
                    <div className="w-20 bg-gray-200 mb-6 flex items-center justify-center text-[10px]" style={{ height: size.h === '80px' ? '30px' : size.h === '140px' ? '50px' : '80px' }}></div>
                    <p className="text-xs font-bold font-sans mb-1 text-[#1a1a1a]">{size.label}</p>
                    <p className="text-[11px] font-sans opacity-70">{size.h}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">QUALIDADE DE IMPORTAÇÃO</label>
              <p className="text-[11px] text-[#999] font-sans -mt-4">Largura máxima ao importar ficheiros. Reduz o tamanho do ficheiro enviado.</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Original', sub: 'sem redimensionar' },
                  { label: '1800 px', sub: 'alta qualidade' },
                  { label: '1200 px', sub: 'equilíbrio' },
                  { label: '800 px', sub: 'tamanho reduzido' }
                ].map(q => (
                  <button 
                    key={q.label}
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, importQuality: q.label }))}
                    className={`p-6 border text-left transition-all ${settings.importQuality === q.label ? 'bg-white border-[#1a1a1a] shadow-sm ring-1 ring-[#1a1a1a]' : 'bg-[#fdfdfd] border-[#eee] text-[#999] hover:border-[#ddd]'}`}
                  >
                    <p className="text-sm font-bold font-sans text-[#1a1a1a] mb-1">{q.label}</p>
                    <p className="text-[10px] font-sans opacity-70">{q.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">QUALIDADE NA AMPLIAÇÃO (LIGHTBOX)</label>
              <p className="text-[11px] text-[#999] font-sans -mt-4">Resolução da fotografia ao abrir em ecrã completo.</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Baixa', res: '800 px', sub: 'rápido' },
                  { label: 'Média', res: '1400 px', sub: 'equilíbrio' },
                  { label: 'Alta', res: '2400 px', sub: 'padrão' },
                  { label: 'Original', res: 'original', sub: 'máxima' }
                ].map(q => (
                  <button 
                    key={q.label}
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, lightboxQuality: q.label }))}
                    className={`p-6 border text-left transition-all ${settings.lightboxQuality === q.label ? 'bg-white border-[#1a1a1a] shadow-sm ring-1 ring-[#1a1a1a]' : 'bg-[#fdfdfd] border-[#eee] text-[#999] hover:border-[#ddd]'}`}
                  >
                    <p className="text-sm font-bold font-sans text-[#1a1a1a] mb-1">{q.label}</p>
                    <p className="text-[10px] font-sans opacity-70 mb-0.5">{q.res}</p>
                    <p className="text-[9px] font-sans italic opacity-50">{q.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECÇÃO: ACESSIBILIDADE (Image 5) */}
        <section className="space-y-10 pb-12">
          <div className="flex items-center gap-3">
            <Accessibility size={20} className="text-[#7a7a7a]" />
            <h2 className="font-sans font-semibold text-2xl text-[#7a7a7a]">Acessibilidade</h2>
          </div>
          <div className="h-px bg-[#ddd] -mt-6"></div>
          
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
              <p className="text-sm font-bold font-sans text-[#1a1a1a]">Reduzir Animações</p>
              <p className="text-[11px] text-[#999] font-sans">Desativa transições complexas</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="reduceAnimations"
                checked={settings.reduceAnimations}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#1a1a1a]"></div>
            </label>
          </div>
        </section>

        {/* SECÇÃO: SEGURANÇA */}
        <section className="space-y-10 pb-12">
          <div className="flex items-center gap-3">
            <Settings2 size={20} className="text-[#7a7a7a]" />
            <h2 className="font-sans font-semibold text-2xl text-[#7a7a7a]">Segurança</h2>
          </div>
          <div className="h-px bg-[#ddd] -mt-6"></div>
          
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">PALAVRA-PASSE DE ADMIN</label>
            <p className="text-[11px] text-[#999] font-sans -mt-2">Esta palavra-passe protege o acesso ao painel de administração contra utilizadores públicos.</p>
            <input 
              type="text" 
              name="adminPassword"
              value={settings.adminPassword || ''}
              onChange={handleChange}
              className="w-full max-w-md py-4 px-5 bg-white border border-[#4a4a4a]/10 text-xs tracking-widest font-sans rounded-sm focus:outline-none focus:border-[#1a1a1a]"
              placeholder="ex: manuel2026"
            />
          </div>
        </section>

        {/* RODAPÉ: BOTÕES (Image 5 bottom) */}
        <div className="fixed bottom-0 left-0 right-0 md:left-[340px] bg-white/90 backdrop-blur-md border-t border-[#ddd] p-8 z-[70] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-4xl mx-auto flex flex-col gap-4">
            <div className="flex gap-4 w-full">
              <button 
                type="submit" 
                disabled={saving}
                className="flex-[3] bg-[#1a1a1a] text-white py-4 px-10 text-[11px] tracking-[0.2em] font-bold uppercase flex items-center justify-center gap-4 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg"
              >
                {saving ? (
                  <><Loader2 size={18} className="animate-spin" /> A GUARDAR...</>
                ) : (
                  <><Save size={18} /> GUARDAR CONFIGURAÇÕES</>
                )}
              </button>
              <button 
                type="button" 
                onClick={onBackToGallery}
                className="flex-1 bg-[#f0f0f0] text-[#1a1a1a] py-4 px-6 text-[11px] tracking-[0.2em] font-bold uppercase border border-[#eee] flex items-center justify-center gap-3 hover:bg-gray-200 transition-all active:scale-[0.98]"
              >
                <LayoutDashboard size={18} /> GERIR GALERIA
              </button>
            </div>
            <button 
              type="button"
              onClick={handleReset}
              className="w-full py-4 text-[11px] tracking-[0.2em] font-bold uppercase text-[#aaa] hover:text-[#1a1a1a] transition-all flex items-center justify-center gap-3"
            >
              <RotateCcw size={16} /> REPOR PRÉ-CONFIGURAÇÕES
            </button>
          </div>
        </div>

      </form>
    </motion.div>
  );
}
