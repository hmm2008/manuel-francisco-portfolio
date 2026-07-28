import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Smartphone, Share, PlusSquare, X, Check, Globe, Sparkles, Copy, Info, AlertTriangle } from 'lucide-react';

interface InstallPWAModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoShowOnMobile?: boolean;
}

declare global {
  interface Window {
    deferredPWAInstallPrompt?: any;
  }
}

export function InstallPWAModal({ isOpen, onClose, autoShowOnMobile = true }: InstallPWAModalProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInApp, setIsInApp] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);
  const [showIOSPointer, setShowIOSPointer] = useState(false);
  const [showManualSteps, setShowManualSteps] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detect user agent
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);

    setIsIOS(isIosDevice);
    setIsAndroid(isAndroidDevice);

    // Detect in-app browsers (e.g. Instagram, Facebook, WhatsApp, Messenger, Telegram, Twitter, etc.)
    const isInAppBrowser = /instagram|fb_iab|fb4a|fban|fbios|twitter|linkedin|snapchat|pinterest|whatsapp|messenger|telegram/i.test(userAgent);
    setIsInApp(isInAppBrowser);

    if (window.deferredPWAInstallPrompt) {
      setDeferredPrompt(window.deferredPWAInstallPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.deferredPWAInstallPrompt = e;
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstalledSuccess(true);
      setDeferredPrompt(null);
      window.deferredPWAInstallPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || window.deferredPWAInstallPrompt;
    
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          setInstalledSuccess(true);
          setDeferredPrompt(null);
          window.deferredPWAInstallPrompt = null;
          return;
        }
      } catch (err) {
        console.warn('PWA install prompt error:', err);
      }
    }
    
    // If native prompt is unavailable or rejected, expand step-by-step guidance immediately so the user always receives response
    setShowManualSteps(true);
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 3000);
      }
    } catch (err) {
      // Fallback: show the link directly if clipboard API fails
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Manuel Francisco — Portfólio',
          text: 'Instale a aplicação do portfólio de fotografia de Manuel Francisco.',
          url: window.location.href,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    setShowIOSPointer(false);
    setShowManualSteps(false);
    onClose();
  };

  if (isStandalone) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#121212] border border-[#2d2d2d] text-[#f0ece5] rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Header Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 text-[#8e8a82] hover:text-white transition-colors p-1.5 rounded-full bg-[#1e1e1e] hover:bg-[#2a2a2a]"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>

              {/* App Header & Icon */}
              <div className="flex items-center gap-4 mb-5 border-b border-[#222222] pb-5 pt-1">
                <img
                  src="/icon-192.png"
                  alt="MF Fotografia Ícone"
                  className="w-16 h-16 rounded-2xl object-cover border border-[#3a3a3a] shadow-xl flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles size={10} /> Aplicação Web
                    </span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-white tracking-wide mt-1 truncate">
                    Manuel Francisco
                  </h3>
                  <p className="text-xs text-[#8e8a82] uppercase tracking-widest font-sans truncate">
                    Portfólio de Fotografia
                  </p>
                </div>
              </div>

              {installedSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
                    <Check size={28} />
                  </div>
                  <h4 className="text-lg font-bold text-white">Aplicação Instalada com Sucesso!</h4>
                  <p className="text-xs text-[#a09c94] leading-relaxed max-w-xs mx-auto">
                    O portfólio já está disponível no seu ecrã principal para um acesso instantâneo, em ecrã total.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-200 transition-colors w-full shadow-md"
                  >
                    Concluído
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {isInApp ? (
                    <div className="bg-amber-950/40 border border-amber-500/30 p-4 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                        Telemóvel: Rede Social ou In-App
                      </div>
                      <p className="text-xs text-amber-200/90 leading-relaxed">
                        Está a aceder através de uma aplicação (Instagram, WhatsApp, Facebook, etc.). Estes browsers internos <strong className="text-white">impedem a instalação de aplicações</strong> e removem o logótipo oficial!
                      </p>
                      <div className="text-[11px] text-amber-300/80 bg-black/40 p-3 rounded-lg border border-amber-500/10 space-y-1.5">
                        <span className="font-bold block text-white/90">Para instalar com o logotipo bonito:</span>
                        <ol className="list-decimal pl-4 space-y-1 text-amber-200/70">
                          <li>Use o botão <strong className="text-amber-400">Copiar Link</strong> abaixo.</li>
                          <li>Abra a aplicação <strong className="text-white">{isIOS ? 'Safari' : 'Chrome'}</strong> no seu telemóvel.</li>
                          <li>Cole o link na barra de endereços e aceda ao site.</li>
                          <li>Toque no botão <strong className="text-white">Instalar App</strong> que aparecerá no ecrã!</li>
                        </ol>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-white/90">
                      Instale a aplicação no seu dispositivo móvel para uma experiência otimizada em ecrã inteiro.
                    </p>
                  )}

                  {/* Android / Direct Button */}
                  {(!isIOS || isAndroid) && (
                    <div className="bg-[#1a1a1a] border border-[#2d2d2d] p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                          <Smartphone size={16} /> Instalação no Android
                        </div>
                        {(deferredPrompt || window.deferredPWAInstallPrompt) && (
                          <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded-full font-mono">
                            Suporta App Real
                          </span>
                        )}
                      </div>

                      <button
                        onClick={handleInstallClick}
                        type="button"
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                      >
                        <Download size={16} /> Instalar Aplicação Agora
                      </button>

                      {/* Explicit warning about the simple "shortcut with browser badge" issue */}
                      <div className="bg-[#1f140d] border border-amber-500/20 p-3 rounded-lg space-y-2">
                        <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[10px] uppercase tracking-wider">
                          <AlertTriangle size={12} /> Evitar "Atalho de Internet"
                        </div>
                        <p className="text-[10.5px] text-[#c4c0b8] leading-relaxed">
                          Se o telemóvel criar um atalho com o símbolo do Chrome por cima, é porque não está a usar o Chrome diretamente ou está dentro de outra app.
                        </p>
                        <p className="text-[10.5px] text-[#c4c0b8] leading-relaxed">
                          <strong className="text-white">Para ter a App Real com o logotipo bonito:</strong> Abra a app <strong className="text-white">Google Chrome</strong> no telemóvel, cole o link lá, e clique em "Instalar" (ou nos 3 pontos ⋮ e escolha <strong className="text-white">"Instalar aplicação"</strong>, NÃO "Adicionar ao ecrã principal" se aparecer atalho).
                        </p>
                      </div>

                      {/* Manual Steps when prompt isn't directly triggered by browser or after click */}
                      {showManualSteps && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="pt-2 border-t border-[#333] space-y-2.5"
                        >
                          <div className="flex items-start gap-2 text-amber-300 text-[11px] font-medium bg-amber-950/40 p-2.5 rounded-lg border border-amber-800/30">
                            <Info size={15} className="shrink-0 mt-0.5" />
                            <span>Siga estes passos no menu do Chrome:</span>
                          </div>
                          <ol className="text-xs text-[#c4c0b8] space-y-2 pl-1">
                            <li className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                              <span>Toque nos <strong className="text-white">três pontos (⋮)</strong> no canto superior direito do Chrome.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                              <span>Selecione <strong className="text-white">"Instalar aplicação"</strong>. Se apenas vir "Adicionar ao ecrã principal", certifique-se de que não está num browser de redes sociais.</span>
                            </li>
                          </ol>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* iOS Section */}
                  {isIOS && (
                    <div className="bg-[#1a1a1a] border border-[#2d2d2d] p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between text-amber-400 font-semibold text-xs uppercase tracking-wider">
                        <span className="flex items-center gap-2">
                          <Smartphone size={16} /> iPhone / iPad (Safari)
                        </span>
                        <span className="text-[10px] bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded text-amber-300">
                          Safari Obrigatório
                        </span>
                      </div>

                      {/* Explicit warning about the simple "shortcut" issue on iOS */}
                      <div className="bg-[#1f140d] border border-amber-500/20 p-3 rounded-lg space-y-2">
                        <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[10px] uppercase tracking-wider">
                          <AlertTriangle size={12} /> Obter Logotipo Oficial Limpo
                        </div>
                        <p className="text-[10.5px] text-[#c4c0b8] leading-relaxed">
                          Para obter o logotipo oficial de Manuel Francisco em alta qualidade (sem ser um simples link de internet):
                        </p>
                        <ol className="list-decimal pl-4 text-[10.5px] text-[#c4c0b8] space-y-1">
                          <li>Tem obrigatoriamente de abrir este site no browser <strong className="text-white">Safari</strong> do iPhone.</li>
                          <li>Não utilize o Chrome no iPhone nem abra links vindos do Instagram/Facebook.</li>
                        </ol>
                      </div>
                      
                      <ol className="text-xs text-[#c4c0b8] space-y-2.5 pt-1">
                        <li className="flex items-start gap-2.5 bg-[#222] p-2.5 rounded-lg border border-[#333]">
                          <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                          <span>No Safari, toque no botão <strong className="text-white">Partilhar</strong> <Share size={13} className="inline mx-1 text-amber-400" /> na barra inferior.</span>
                        </li>
                        <li className="flex items-start gap-2.5 bg-[#222] p-2.5 rounded-lg border border-[#333]">
                          <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                          <span>Selecione <strong className="text-white">"Adicionar ao Ecrã Principal"</strong> <PlusSquare size={13} className="inline mx-1 text-amber-400" />.</span>
                        </li>
                        <li className="flex items-start gap-2.5 bg-[#222] p-2.5 rounded-lg border border-[#333]">
                          <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                          <span>Toque em <strong className="text-white">"Adicionar"</strong> para fixar a app no ecrã com o logotipo bonito.</span>
                        </li>
                      </ol>

                      <button
                        onClick={() => {
                          setShowIOSPointer(true);
                          onClose();
                        }}
                        type="button"
                        className="w-full text-center text-xs text-amber-400 underline pt-1 font-medium hover:text-amber-300 cursor-pointer"
                      >
                        Mostrar onde fica o botão Partilhar ↓
                      </button>
                    </div>
                  )}

                  {/* Share / Copy Link Helper */}
                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      onClick={handleShare}
                      type="button"
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#1e1e1e] hover:bg-[#2a2a2a] border border-[#333] text-xs font-medium text-white/80 rounded-xl transition-colors cursor-pointer"
                    >
                      <Share size={14} /> {copiedLink ? 'Link Copiado!' : 'Partilhar / Copiar Link'}
                    </button>
                    
                    <div className="flex items-center gap-2 bg-[#1a1a1a] p-2 rounded-lg border border-[#333]">
                       <input 
                         type="text" 
                         readOnly 
                         value={window.location.href} 
                         className="flex-1 bg-transparent text-[10px] text-white/70 outline-none truncate"
                         onClick={(e) => (e.target as HTMLInputElement).select()}
                       />
                       <button onClick={handleCopyLink} className="p-1.5 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded text-amber-400 transition-colors">
                         <Copy size={12} />
                       </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={handleDismiss}
                      type="button"
                      className="px-4 py-2 text-xs font-medium text-[#8e8a82] hover:text-white transition-colors cursor-pointer"
                    >
                      Agora Não
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating iOS Pointer Helper */}
      <AnimatePresence>
        {showIOSPointer && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[110] max-w-xs w-[92vw] bg-amber-500 text-black p-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 border border-amber-300"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Share size={20} className="shrink-0 animate-bounce" />
              <div className="text-xs font-bold leading-tight">
                Toque no botão <span className="underline">Partilhar</span> do Safari abaixo e escolha "Adicionar ao Ecrã Principal"!
              </div>
            </div>
            <button
              onClick={() => setShowIOSPointer(false)}
              className="bg-black/20 hover:bg-black/30 text-black p-1 rounded-full shrink-0 cursor-pointer"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


