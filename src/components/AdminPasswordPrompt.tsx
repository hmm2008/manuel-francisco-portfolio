import React, { useState, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminPasswordPromptProps {
  correctPassword?: string;
  onUnlock: () => void;
  onCancel?: () => void;
}

export default function AdminPasswordPrompt({ correctPassword = 'manuel2026', onUnlock, onCancel }: AdminPasswordPromptProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      onUnlock();
    } else {
      setError(true);
      setAttempts(prev => prev + 1);
      // Auto-focus and clear input on error
      setPassword('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div id="admin-password-container" className="w-full h-full flex items-center justify-center p-6 bg-[#f5f2ed]">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white border border-[#4a4a4a]/10 p-8 md:p-12 shadow-sm rounded-sm text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-[#fdfdfd] border border-[#1a1a1a]/5 rounded-full text-[#4a4a4a]/60">
            <Lock size={28} strokeWidth={1} />
          </div>
        </div>

        <p className="text-[#7a7a7a] tracking-[0.2em] text-[10px] uppercase font-sans mb-2">Área Reservada</p>
        <h2 className="font-sans font-semibold text-3xl text-[#1a1a1a] mb-6 tracking-wide">Administração</h2>
        
        <p className="text-xs text-[#8e8a82] font-sans leading-relaxed mb-8">
          Esta secção é restrita ao administrador do site. Introduza a palavra-passe para continuar.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              ref={inputRef}
              type={showPassword ? "text" : "password"}
              placeholder="Palavra-passe"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              className={`w-full py-4 pl-5 pr-12 bg-[#fafafa] border text-xs tracking-widest font-sans rounded-sm transition-all focus:outline-none focus:bg-white focus:ring-1 ${
                error 
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-400' 
                  : 'border-[#4a4a4a]/10 focus:border-[#1a1a1a] focus:ring-[#1a1a1a]'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7a7a7a]/60 hover:text-[#1a1a1a] transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 text-red-500 text-[10px] tracking-widest font-sans uppercase"
            >
              <AlertCircle size={14} />
              <span>Palavra-passe incorreta</span>
            </motion.div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-[#1a1a1a] hover:bg-black text-white text-[10px] tracking-[0.2em] font-bold uppercase transition-all rounded-sm flex items-center justify-center gap-3"
          >
            <span>ENTRAR</span>
            <ArrowRight size={14} />
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-4 border border-[#4a4a4a]/20 hover:border-[#1a1a1a] hover:bg-[#1a1a1a]/5 text-[#4a4a4a] hover:text-[#1a1a1a] text-[10px] tracking-[0.2em] font-bold uppercase transition-all rounded-sm flex items-center justify-center"
            >
              CANCELAR
            </button>
          )}
        </form>

        <p className="text-[9px] text-[#7a7a7a]/40 font-mono mt-8 tracking-wider uppercase">
          Acesso monitorizado e encriptado
        </p>
      </motion.div>
    </div>
  );
}
