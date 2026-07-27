import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Smartphone, Share, PlusSquare, X, Check, Globe } from 'lucide-react';

interface InstallPWAModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstallPWAModal({ isOpen, onClose }: InstallPWAModalProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Check if already installed / standalone
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstalledSuccess(true);
      }
      setDeferredPrompt(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-[#141414] border border-[#2a2a2a] text-[#f0ece5] rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#8e8a82] hover:text-white transition-colors p-1 rounded-full bg-[#1e1e1e] hover:bg-[#2a2a2a]"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>

          {/* App Header & Icon */}
          <div className="flex items-center gap-4 mb-6 border-b border-[#222222] pb-5">
            <img
              src="/icon-192.png"
              alt="MF Fotografia Ícone"
              className="w-16 h-16 rounded-xl object-cover border border-[#333] shadow-md"
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="text-lg font-serif font-bold text-white tracking-wide">
                Manuel Francisco
              </h3>
              <p className="text-xs text-[#8e8a82] uppercase tracking-widest font-sans mt-0.5">
                Portfólio de Fotografia
              </p>
              <div className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/40 border border-amber-800/50 px-2 py-0.5 rounded-full mt-2 font-mono">
                <Globe size={10} /> App Web Progressiva (PWA)
              </div>
            </div>
          </div>

          {isStandalone || installedSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 bg-emerald-950 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <Check size={24} />
              </div>
              <h4 className="text-base font-medium text-white">Aplicação Instalada com Sucesso!</h4>
              <p className="text-xs text-[#8e8a82] leading-relaxed">
                O portfólio já está disponível no seu ecrã principal para um acesso rápido, fluído e em ecrã total.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 bg-white text-black text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-neutral-200 transition-colors w-full"
              >
                Concluído
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Native prompt button if available */}
              {deferredPrompt && (
                <div className="bg-[#1a1a1a] border border-amber-500/20 p-4 rounded-xl space-y-3">
                  <p className="text-xs text-[#d0ccc5] leading-relaxed">
                    Instale o portfólio diretamente no seu dispositivo Android / PC como uma aplicação dedicada sem barras de navegação.
                  </p>
                  <button
                    onClick={handleInstallClick}
                    className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs uppercase tracking-wider py-3 px-4 rounded-lg shadow-lg transition-all transform active:scale-95"
                  >
                    <Download size={16} /> Instalar Agora no Dispositivo
                  </button>
                </div>
              )}

              {/* iOS Instructions */}
              {isIOS ? (
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-medium text-xs uppercase tracking-wider">
                    <Smartphone size={16} /> Instalação no iOS (iPhone / iPad)
                  </div>
                  <ol className="text-xs text-[#b8b4ac] space-y-2.5 pl-1">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#2a2a2a] text-white flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">1</span>
                      <span>Toque no botão <strong>Partilhar</strong> <Share size={13} className="inline mx-1 text-amber-400" /> na barra inferior do Safari.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#2a2a2a] text-white flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">2</span>
                      <span>Deslize e selecione <strong>"Adicionar ao Ecrã Principal"</strong> <PlusSquare size={13} className="inline mx-1 text-amber-400" />.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#2a2a2a] text-white flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">3</span>
                      <span>Confirme em <strong>"Adicionar"</strong> no canto superior direito.</span>
                    </li>
                  </ol>
                </div>
              ) : (
                /* Android / General Web Instructions */
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-medium text-xs uppercase tracking-wider">
                    <Smartphone size={16} /> Instalação em Android / Chrome / Outros
                  </div>
                  <ol className="text-xs text-[#b8b4ac] space-y-2.5 pl-1">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#2a2a2a] text-white flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">1</span>
                      <span>Abra o menu do browser (três pontos no canto superior direito).</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#2a2a2a] text-white flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">2</span>
                      <span>Toque em <strong>"Instalar Aplicação"</strong> ou <strong>"Adicionar ao Ecrã Principal"</strong>.</span>
                    </li>
                  </ol>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-medium text-[#8e8a82] hover:text-white transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
