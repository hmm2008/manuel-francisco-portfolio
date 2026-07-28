import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Smartphone, Share, PlusSquare, X, Check, Globe, ArrowDown, Sparkles } from 'lucide-react';

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
  const [installedSuccess, setInstalledSuccess] = useState(false);
  const [showIOSPointer, setShowIOSPointer] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (PWA installed & opened)
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

    // Check window global deferred prompt if already captured
    if (window.deferredPWAInstallPrompt) {
      setDeferredPrompt(window.deferredPWAInstallPrompt);
    }

    // Listen for beforeinstallprompt (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.deferredPWAInstallPrompt = e;
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstalledSuccess(true);
      setDeferredPrompt(null);
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
        promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setInstalledSuccess(true);
        }
      } catch (err) {
        console.warn('PWA install prompt error:', err);
      }
      setDeferredPrompt(null);
      window.deferredPWAInstallPrompt = null;
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    setShowIOSPointer(false);
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
              className="bg-[#121212] border border-[#2d2d2d] text-[#f0ece5] rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              {/* Header Gradient Accent */}
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
              <div className="flex items-center gap-4 mb-6 border-b border-[#222222] pb-5 pt-1">
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
                    O portfólio já está disponível no seu ecrã principal para um acesso instantâneo, em ecrã total e sem barras do browser.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-200 transition-colors w-full shadow-md"
                  >
                    Concluído
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-white/90">
                      Instale a aplicação no seu dispositivo móvel para uma experiência otimizada em ecrã inteiro.
                    </p>
                  </div>

                  {/* Android / Native Prompt Option */}
                  {(deferredPrompt || isAndroid) && (
                    <div className="bg-[#1a1a1a] border border-amber-500/30 p-4 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                        <Smartphone size={16} /> Instalação Rápida (Android / Chrome)
                      </div>
                      <p className="text-[11px] text-[#b8b4ac] leading-relaxed">
                        Detetámos um browser compatível. Pode instalar a aplicação diretamente na sua página inicial com um toque:
                      </p>
                      <button
                        onClick={handleInstallClick}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"
                      >
                        <Download size={16} /> Instalar Aplicação Agora
                      </button>
                    </div>
                  )}

                  {/* iOS Instructions */}
                  {isIOS && (
                    <div className="bg-[#1a1a1a] border border-amber-500/20 p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between text-amber-400 font-semibold text-xs uppercase tracking-wider">
                        <span className="flex items-center gap-2">
                          <Smartphone size={16} /> Instalação no iPhone / iPad
                        </span>
                        <span className="text-[10px] bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded text-amber-300">
                          Safari
                        </span>
                      </div>
                      
                      <ol className="text-xs text-[#c4c0b8] space-y-3 pt-1">
                        <li className="flex items-start gap-3 bg-[#222] p-2.5 rounded-lg border border-[#333]">
                          <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                          <span className="pt-0.5">Toque no botão <strong className="text-white">Partilhar</strong> <Share size={14} className="inline mx-1 text-amber-400" /> na barra inferior do Safari.</span>
                        </li>
                        <li className="flex items-start gap-3 bg-[#222] p-2.5 rounded-lg border border-[#333]">
                          <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                          <span className="pt-0.5">Deslize a lista e toque em <strong className="text-white">"Adicionar ao Ecrã Principal"</strong> <PlusSquare size={14} className="inline mx-1 text-amber-400" />.</span>
                        </li>
                        <li className="flex items-start gap-3 bg-[#222] p-2.5 rounded-lg border border-[#333]">
                          <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                          <span className="pt-0.5">Toque em <strong className="text-white">"Adicionar"</strong> no canto superior direito.</span>
                        </li>
                      </ol>

                      <button
                        onClick={() => {
                          setShowIOSPointer(true);
                          onClose();
                        }}
                        className="w-full text-center text-xs text-amber-400 underline pt-1 font-medium hover:text-amber-300"
                      >
                        Mostrar onde fica o botão Partilhar ↓
                      </button>
                    </div>
                  )}

                  {/* General Browsers Fallback if neither iOS nor direct Android prompt */}
                  {!isIOS && !deferredPrompt && !isAndroid && (
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                        <Globe size={16} /> Instalação no Browser
                      </div>
                      <ol className="text-xs text-[#b8b4ac] space-y-2.5">
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-[#2a2a2a] text-white flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">1</span>
                          <span>Abra o menu do seu browser (três pontos no topo/fundo).</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-[#2a2a2a] text-white flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">2</span>
                          <span>Selecione <strong className="text-white">"Instalar Aplicação"</strong> ou <strong className="text-white">"Adicionar ao Ecrã Principal"</strong>.</span>
                        </li>
                      </ol>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={handleDismiss}
                      className="px-4 py-2 text-xs font-medium text-[#8e8a82] hover:text-white transition-colors"
                    >
                      Agora Não
                    </button>
                    {deferredPrompt && (
                      <button
                        onClick={handleInstallClick}
                        className="px-5 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-neutral-200 transition-colors"
                      >
                        Instalar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating iOS Pointer Helper at bottom of screen */}
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
              className="bg-black/20 hover:bg-black/30 text-black p-1 rounded-full shrink-0"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

