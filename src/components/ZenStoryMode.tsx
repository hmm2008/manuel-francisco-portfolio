import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, ChevronLeft, ChevronRight, X, Volume2, VolumeX, Camera, Info, Maximize, Settings, Sliders, Music, Tv, Sparkles } from 'lucide-react';

interface ZenStoryModeProps {
  images: any[];
  onClose: () => void;
  initialIndex?: number;
}

type AudioPreset = 'zen' | 'meditation' | 'piano' | 'off';

export default function ZenStoryMode({ images, onClose, initialIndex = 0 }: ZenStoryModeProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedSeconds, setSpeedSeconds] = useState(7);
  const [showInfo, setShowInfo] = useState(true);
  const [audioPreset, setAudioPreset] = useState<AudioPreset>('off');
  const [showSettings, setShowSettings] = useState(false);
  const [progress, setProgress] = useState(0);
  const [effect, setEffect] = useState<'kenburns' | 'fade' | 'slide'>('kenburns');
  const [bgTheme, setBgTheme] = useState<'dark' | 'black' | 'sepia'>('dark');
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientOscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Toggle Native Fullscreen for Exhibition Monitors
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error enabling fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Auto advance timer
  useEffect(() => {
    if (!isPlaying || images.length === 0) return;

    setProgress(0);
    const intervalMs = 100;
    const totalSteps = (speedSeconds * 1000) / intervalMs;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setProgress((step / totalSteps) * 100);
      if (step >= totalSteps) {
        setCurrentIndex(prev => (prev + 1) % images.length);
        step = 0;
        setProgress(0);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, speedSeconds, currentIndex, images.length]);

  // Hide controls on idle mouse
  const handleMouseMove = useCallback(() => {
    setControlsVisible(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3500);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    handleMouseMove();
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [handleMouseMove]);

  // Web Audio Synth for Exhibition Soundscapes
  const startAudio = (preset: AudioPreset) => {
    try {
      if (preset === 'off') {
        if (gainNodeRef.current && audioContextRef.current) {
          gainNodeRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 1);
          setTimeout(() => {
            if (ambientOscillatorRef.current) {
              ambientOscillatorRef.current.stop();
              ambientOscillatorRef.current.disconnect();
            }
          }, 1000);
        }
        setAudioPreset('off');
        return;
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Stop previous
      if (ambientOscillatorRef.current) {
        ambientOscillatorRef.current.stop();
        ambientOscillatorRef.current.disconnect();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (preset === 'zen') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(216, ctx.currentTime); // 432Hz harmonic A3
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 3);
      } else if (preset === 'meditation') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(144, ctx.currentTime); // Deep warm tone
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 4);
      } else if (preset === 'piano') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(288, ctx.currentTime); // Soft melodic harmonic
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 2);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      ambientOscillatorRef.current = osc;
      gainNodeRef.current = gain;
      setAudioPreset(preset);
    } catch (err) {
      console.error('Audio synthesis error:', err);
    }
  };

  useEffect(() => {
    return () => {
      if (ambientOscillatorRef.current) {
        try { ambientOscillatorRef.current.stop(); } catch (e) {}
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch (e) {}
      }
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
      if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => (prev + 1) % images.length);
        setProgress(0);
      }
      if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
        setProgress(0);
      }
      if (e.key === 'i' || e.key === 'I') setShowInfo(prev => !prev);
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  const currentImage = images[currentIndex];

  if (!currentImage) return null;

  // Ken Burns directional calculations
  const panDirections = [
    { scaleStart: 1.05, scaleEnd: 1.18, xStart: 0, xEnd: -20, yStart: 0, yEnd: -10 },
    { scaleStart: 1.18, scaleEnd: 1.05, xStart: -15, xEnd: 15, yStart: -10, yEnd: 10 },
    { scaleStart: 1.06, scaleEnd: 1.16, xStart: 15, xEnd: -15, yStart: 10, yEnd: -10 },
    { scaleStart: 1.15, scaleEnd: 1.06, xStart: 0, xEnd: 0, yStart: -15, yEnd: 15 },
  ];
  const pan = panDirections[currentIndex % panDirections.length];

  const themeBgColor = bgTheme === 'black' ? '#000000' : bgTheme === 'sepia' ? '#1c1917' : '#0d0d0d';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      style={{ backgroundColor: themeBgColor }}
      className="fixed inset-0 z-[200] text-white flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Top Ambient Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-[220]">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-200 to-amber-500 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header Overlay Controls */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-6 left-6 right-6 z-[220] flex items-center justify-between"
          >
            {/* Title & Exhibition Counter */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-sans tracking-[0.3em] uppercase text-amber-200/90 font-bold flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Modo Exposição Ambient
              </span>
              <span className="text-white/60 font-mono text-xs">
                {currentIndex + 1} <span className="opacity-40">/</span> {images.length}
              </span>
            </div>

            {/* Top Right Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={toggleFullscreen}
                className={`p-2.5 rounded-full border transition-all ${
                  isFullscreen 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : 'bg-black/50 text-white/70 border-white/15 hover:text-white'
                }`}
                title="Écrã Inteiro para Projeção / TV (F)"
              >
                <Maximize size={16} />
              </button>

              <button
                onClick={() => startAudio(audioPreset === 'off' ? 'zen' : 'off')}
                className={`p-2.5 rounded-full border transition-all ${
                  audioPreset !== 'off' 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : 'bg-black/50 text-white/70 border-white/15 hover:text-white'
                }`}
                title={audioPreset !== 'off' ? 'Silenciar Áudio' : 'Ativar Música de Fundo Ambient'}
              >
                {audioPreset !== 'off' ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              <button
                onClick={() => setShowInfo(!showInfo)}
                className={`p-2.5 rounded-full border transition-all ${
                  showInfo 
                    ? 'bg-white/20 text-white border-white/40' 
                    : 'bg-black/50 text-white/50 border-white/15 hover:text-white'
                }`}
                title="Alternar Legendas e Cartão de Museu (I)"
              >
                <Info size={16} />
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2.5 rounded-full bg-black/50 text-white/70 border border-white/15 hover:text-white transition-all"
                title="Configurações do Modo Projeção"
              >
                <Sliders size={16} />
              </button>

              <button
                onClick={onClose}
                className="p-2.5 rounded-full bg-black/60 text-white/80 border border-white/20 hover:bg-white hover:text-black transition-all ml-2"
                title="Sair do Modo Exposição (Esc)"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Exhibition Canvas with Ken Burns or Smooth Dissolve */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage.id || currentIndex}
            initial={{ 
              opacity: 0, 
              scale: effect === 'kenburns' ? pan.scaleStart : 1,
              x: effect === 'kenburns' ? pan.xStart : 0,
              y: effect === 'kenburns' ? pan.yStart : 0
            }}
            animate={{ 
              opacity: 1, 
              scale: effect === 'kenburns' ? pan.scaleEnd : 1,
              x: effect === 'kenburns' ? pan.xEnd : effect === 'slide' ? [40, 0] : 0,
              y: effect === 'kenburns' ? pan.yEnd : 0
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: effect === 'kenburns' ? speedSeconds : 1.2, 
              ease: "easeInOut" 
            }}
            className="absolute inset-0 w-full h-full flex items-center justify-center p-4 md:p-12"
          >
            <img
              src={currentImage.url}
              alt={currentImage.alt || currentImage.title}
              className="max-w-full max-h-full object-contain drop-shadow-2xl select-none"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Touch Areas / Arrows */}
        <AnimatePresence>
          {controlsVisible && (
            <>
              <button
                onClick={() => {
                  setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
                  setProgress(0);
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white bg-black/40 hover:bg-black/70 rounded-full border border-white/10 transition-all z-[210]"
              >
                <ChevronLeft size={28} />
              </button>

              <button
                onClick={() => {
                  setCurrentIndex(prev => (prev + 1) % images.length);
                  setProgress(0);
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white bg-black/40 hover:bg-black/70 rounded-full border border-white/10 transition-all z-[210]"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Info Bar Overlay (Museum Card Style) */}
      <AnimatePresence>
        {showInfo && controlsVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-8 left-6 right-6 md:left-12 md:right-12 z-[220] flex flex-col md:flex-row justify-between items-end gap-4 pointer-events-none"
          >
            <div className="bg-black/70 backdrop-blur-xl p-5 rounded-2xl border border-white/15 max-w-xl pointer-events-auto shadow-2xl">
              <span className="text-[10px] tracking-[0.2em] text-amber-300 font-mono uppercase block mb-1">
                {currentImage.category || 'Fotografia de Autor'}
              </span>
              <h3 className="text-xl md:text-2xl font-serif font-normal tracking-wide text-white mb-1">
                {currentImage.title}
              </h3>
              {currentImage.subtitle && (
                <p className="text-white/80 text-xs tracking-wider font-sans mb-2">
                  {currentImage.subtitle}
                </p>
              )}
              {currentImage.cameraSettings && (
                <p className="text-white/50 font-mono text-[11px] flex items-center gap-1.5 pt-1 border-t border-white/10">
                  <Camera size={13} className="text-white/40" /> {currentImage.cameraSettings}
                </p>
              )}
            </div>

            {/* Playback Controls Center / Bottom Right */}
            <div className="flex items-center gap-3 bg-black/70 backdrop-blur-xl px-5 py-3 rounded-full border border-white/15 pointer-events-auto shadow-2xl">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2.5 rounded-full bg-white text-black hover:bg-amber-300 transition-colors shadow-lg"
                title={isPlaying ? 'Pausar Projeção (Espaço)' : 'Iniciar Projeção (Espaço)'}
              >
                {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" className="ml-0.5" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exhibition Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-20 right-6 md:right-20 z-[230] bg-black/90 backdrop-blur-2xl p-6 rounded-2xl border border-white/20 w-80 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-3 border-b border-white/15">
              <span className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2">
                <Sliders size={14} className="text-amber-400" /> Definições de Exposição
              </span>
              <button onClick={() => setShowSettings(false)} className="text-white/60 hover:text-white">
                <X size={14} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/60 block mb-2 font-bold">
                  Tempo por Fotografia ({speedSeconds}s)
                </label>
                <input
                  type="range"
                  min={3}
                  max={20}
                  step={1}
                  value={speedSeconds}
                  onChange={(e) => setSpeedSeconds(Number(e.target.value))}
                  className="w-full accent-amber-400 bg-white/20 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-white/40 mt-1 font-mono">
                  <span>3s</span>
                  <span>7s (Recomendado)</span>
                  <span>20s</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/60 block mb-2 font-bold">
                  Efeito de Movimento (Ken Burns)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['kenburns', 'fade', 'slide'] as const).map((eff) => (
                    <button
                      key={eff}
                      onClick={() => setEffect(eff)}
                      className={`py-1.5 px-2 rounded text-[10px] uppercase tracking-wider border transition-all ${
                        effect === eff
                          ? 'bg-amber-400 text-black border-amber-400 font-bold'
                          : 'bg-white/10 text-white/70 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {eff === 'kenburns' ? 'Ken Burns' : eff === 'fade' ? 'Suave' : 'Deslizar'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/60 block mb-2 font-bold">
                  Música / Áudio Ambiente
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'off', label: 'Silencioso' },
                    { id: 'zen', label: 'Sintetizador 432Hz' },
                    { id: 'meditation', label: 'Gongo Meditação' },
                    { id: 'piano', label: 'Piano Suave' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => startAudio(p.id as AudioPreset)}
                      className={`py-1.5 px-2 rounded text-[10px] border text-left transition-all ${
                        audioPreset === p.id
                          ? 'bg-amber-400 text-black border-amber-400 font-bold'
                          : 'bg-white/10 text-white/70 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/60 block mb-2 font-bold">
                  Fundo do Ambiente de Galeria
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'dark', label: 'Carvão' },
                    { id: 'black', label: 'Preto Puro' },
                    { id: 'sepia', label: 'Sépia Escuro' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setBgTheme(t.id as any)}
                      className={`py-1.5 px-2 rounded text-[10px] uppercase tracking-wider border transition-all ${
                        bgTheme === t.id
                          ? 'bg-amber-400 text-black border-amber-400 font-bold'
                          : 'bg-white/10 text-white/70 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
