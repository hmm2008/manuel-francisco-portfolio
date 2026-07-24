import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, ChevronLeft, ChevronRight, X, Volume2, VolumeX, Camera, Info, Maximize, Settings, Sliders } from 'lucide-react';

interface ZenStoryModeProps {
  images: any[];
  onClose: () => void;
  initialIndex?: number;
}

export default function ZenStoryMode({ images, onClose, initialIndex = 0 }: ZenStoryModeProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedSeconds, setSpeedSeconds] = useState(6);
  const [showInfo, setShowInfo] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [progress, setProgress] = useState(0);
  const [effect, setEffect] = useState<'kenburns' | 'fade' | 'slide'>('kenburns');
  const [controlsVisible, setControlsVisible] = useState(true);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientOscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

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

  // Ambient sound synthesis using Web Audio API for calm zen sound
  const toggleSound = () => {
    if (isMuted) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioCtx();
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Warm ambient synth sine wave (432Hz / A4 concert tuned ambient chord)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(216, ctx.currentTime); // A3 calm note
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 3); // Very soft background hum

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        ambientOscillatorRef.current = osc;
        gainNodeRef.current = gain;
        setIsMuted(false);
      } catch (err) {
        console.error('Audio synthesis failed:', err);
      }
    } else {
      if (gainNodeRef.current && audioContextRef.current) {
        gainNodeRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 1);
        setTimeout(() => {
          if (ambientOscillatorRef.current) {
            ambientOscillatorRef.current.stop();
            ambientOscillatorRef.current.disconnect();
          }
        }, 1000);
      }
      setIsMuted(true);
    }
  };

  useEffect(() => {
    return () => {
      if (ambientOscillatorRef.current) {
        try {
          ambientOscillatorRef.current.stop();
        } catch (e) {}
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (e) {}
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
      if (e.key === 'm' || e.key === 'M') toggleSound();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  const currentImage = images[currentIndex];

  if (!currentImage) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[200] bg-[#0d0d0d] text-white flex flex-col justify-between overflow-hidden select-none cursor-none sm:cursor-default"
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
            {/* Title & Counter */}
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-sans tracking-[0.3em] uppercase text-amber-200/90 font-bold flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Modo Zen
              </span>
              <span className="text-white/60 font-mono text-xs">
                {currentIndex + 1} <span className="opacity-40">/</span> {images.length}
              </span>
            </div>

            {/* Top Right Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSound}
                className={`p-2.5 rounded-full border transition-all ${
                  !isMuted 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : 'bg-black/40 text-white/70 border-white/15 hover:text-white'
                }`}
                title={isMuted ? 'Ativar Som Ambiente Zen (M)' : 'Silenciar Som Ambiente (M)'}
              >
                {!isMuted ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              <button
                onClick={() => setShowInfo(!showInfo)}
                className={`p-2.5 rounded-full border transition-all ${
                  showInfo 
                    ? 'bg-white/20 text-white border-white/40' 
                    : 'bg-black/40 text-white/50 border-white/15 hover:text-white'
                }`}
                title="Alternar Legendas e Informações (I)"
              >
                <Info size={16} />
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2.5 rounded-full bg-black/40 text-white/70 border border-white/15 hover:text-white transition-all"
                title="Configurações da Apresentação"
              >
                <Sliders size={16} />
              </button>

              <button
                onClick={onClose}
                className="p-2.5 rounded-full bg-black/50 text-white/80 border border-white/20 hover:bg-white hover:text-black transition-all ml-2"
                title="Sair do Modo Zen (Esc)"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Image Display Canvas with Smooth Transitions */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage.id || currentIndex}
            initial={{ opacity: 0, scale: effect === 'kenburns' ? 1.08 : 1 }}
            animate={{ 
              opacity: 1, 
              scale: effect === 'kenburns' ? 1.01 : 1,
              x: effect === 'slide' ? [30, 0] : 0 
            }}
            exit={{ opacity: 0, scale: effect === 'kenburns' ? 0.98 : 1 }}
            transition={{ 
              duration: effect === 'kenburns' ? speedSeconds : 1.2, 
              ease: [0.25, 1, 0.5, 1] 
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
                className="absolute left-6 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white bg-black/30 hover:bg-black/60 rounded-full border border-white/10 transition-all z-[210]"
              >
                <ChevronLeft size={28} />
              </button>

              <button
                onClick={() => {
                  setCurrentIndex(prev => (prev + 1) % images.length);
                  setProgress(0);
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white bg-black/30 hover:bg-black/60 rounded-full border border-white/10 transition-all z-[210]"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Info Bar Overlay */}
      <AnimatePresence>
        {showInfo && controlsVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-8 left-6 right-6 md:left-12 md:right-12 z-[220] flex flex-col md:flex-row justify-between items-end gap-4 pointer-events-none"
          >
            <div className="bg-black/60 backdrop-blur-md p-5 rounded-xl border border-white/10 max-w-xl pointer-events-auto shadow-2xl">
              <h3 className="text-xl md:text-2xl font-sans font-light tracking-wide text-white mb-1">
                {currentImage.title}
              </h3>
              {currentImage.subtitle && (
                <p className="text-amber-200/90 text-xs tracking-widest uppercase font-sans mb-2">
                  {currentImage.subtitle}
                </p>
              )}
              {currentImage.cameraSettings && (
                <p className="text-white/60 font-mono text-[11px] flex items-center gap-1.5">
                  <Camera size={13} className="text-white/40" /> {currentImage.cameraSettings}
                </p>
              )}
            </div>

            {/* Playback Controls Center / Bottom Right */}
            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-3 rounded-full border border-white/10 pointer-events-auto">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2.5 rounded-full bg-white text-black hover:bg-amber-200 transition-colors shadow-lg"
                title={isPlaying ? 'Pausar (Espaço)' : 'Iniciar (Espaço)'}
              >
                {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" className="ml-0.5" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-20 right-20 z-[230] bg-black/90 backdrop-blur-xl p-6 rounded-2xl border border-white/20 w-80 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-3 border-b border-white/15">
              <span className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2">
                <Sliders size={14} className="text-amber-400" /> Definições Zen
              </span>
              <button onClick={() => setShowSettings(false)} className="text-white/60 hover:text-white">
                <X size={14} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/60 block mb-2 font-bold">
                  Velocidade de Transição ({speedSeconds}s)
                </label>
                <input
                  type="range"
                  min={3}
                  max={15}
                  step={1}
                  value={speedSeconds}
                  onChange={(e) => setSpeedSeconds(Number(e.target.value))}
                  className="w-full accent-amber-400 bg-white/20 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-white/40 mt-1">
                  <span>Rápido (3s)</span>
                  <span>Lento (15s)</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/60 block mb-2 font-bold">
                  Efeito Visual
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
