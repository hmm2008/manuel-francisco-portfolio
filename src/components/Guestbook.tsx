import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenTool, X, Trash2, Calendar } from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import Footer from './Footer';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface Signature {
  id: string;
  name: string;
  message: string;
  createdAt: any;
}

interface GuestbookProps {
  settings: any;
  isAdminUnlocked: boolean;
  setActiveView: (view: any) => void;
  onOpenTerms: () => void;
}

export default function Guestbook({ settings, isAdminUnlocked, setActiveView, onOpenTerms }: GuestbookProps) {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const path = 'signatures';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Signature[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          name: data.name || '',
          message: data.message || '',
          createdAt: data.createdAt,
        });
      });
      setSignatures(list);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setIsSubmitting(true);
    const path = 'signatures';
    try {
      await addDoc(collection(db, path), {
        name: name.trim(),
        message: message.trim(),
        createdAt: serverTimestamp()
      });
      
      setName('');
      setMessage('');
      setIsOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja eliminar este registo permanentemente?')) return;
    const path = `signatures/${id}`;
    try {
      await deleteDoc(doc(db, 'signatures', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="w-full h-full overflow-y-auto p-6 md:p-10 flex flex-col justify-between">
      <div className="w-full max-w-5xl mx-auto flex-shrink-0">
        {/* Same header as Gallery */}
        <div className="text-center mb-6 w-full flex-shrink-0">
          <div className="border-y border-[#4a4a4a]/10 py-4 mb-4">
            <h1 className="font-sans text-lg md:text-xl text-[#4a4a4a] tracking-widest uppercase font-semibold">
              {settings?.siteName || 'Manuel Francisco Fotografia'}
            </h1>
          </div>
        </div>

        {/* Dynamic header stats and action */}
        <div className="flex justify-between items-end w-full border-b border-[#4a4a4a]/10 pb-4 mb-10">
          <div>
            <p className="text-[#7a7a7a] tracking-widest text-[10px] md:text-xs uppercase font-sans mb-1">
              {signatures.length} {signatures.length === 1 ? 'REGISTO' : 'REGISTOS'}
            </p>
            <h2 className="font-sans font-medium text-xl md:text-2xl text-[#4a4a4a] tracking-wide">
              Livro de Visitas
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-[#4a4a4a]/20 text-[#4a4a4a] hover:bg-[#4a4a4a]/5 hover:border-[#4a4a4a]/40 uppercase font-sans text-xs tracking-widest transition-all duration-200"
          >
            <PenTool className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Assinar</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#4a4a4a]/25 border-t-[#4a4a4a] rounded-full animate-spin"></div>
          </div>
        ) : signatures.length === 0 ? (
          <div className="text-center py-32 flex flex-col items-center">
            <p className="text-lg md:text-xl text-[#7a7a7a] font-light font-sans">
              Ainda sem registos
            </p>
            <p className="text-xs md:text-sm text-[#7a7a7a]/60 font-sans tracking-wide mt-1">
              Seja o primeiro a assinar o livro
            </p>
          </div>
        ) : (
          <div className="space-y-8 max-w-3xl mx-auto mb-16">
            {signatures.map((sig, index) => (
              <motion.div
                key={sig.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.5) }}
                className="group border-b border-[#4a4a4a]/5 pb-6 last:border-0"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-sans font-medium text-sm md:text-base text-[#4a4a4a] tracking-wide">
                      {sig.name}
                    </h4>
                    <p className="text-[10px] text-[#7a7a7a]/60 font-sans uppercase tracking-widest mt-0.5">
                      {formatDate(sig.createdAt)}
                    </p>
                  </div>
                  {isAdminUnlocked && (
                    <button
                      onClick={() => handleDelete(sig.id)}
                      className="text-[#7a7a7a]/60 hover:text-red-500 transition-colors p-1"
                      title="Eliminar comentário"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
                <div className="border-l border-[#4a4a4a]/10 pl-4 py-0.5 mt-3">
                  <p className="font-sans text-xs md:text-sm text-[#4a4a4a]/85 leading-relaxed whitespace-pre-line text-left">
                    {sig.message}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="w-full max-w-5xl mx-auto flex-shrink-0">
        <Footer 
          activeView="livro" 
          setActiveView={setActiveView} 
          settings={settings} 
          onOpenTerms={onOpenTerms} 
        />
      </div>

      {/* Signature Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-md bg-[#fafafa] shadow-xl border border-[#4a4a4a]/10 p-8 z-[210] flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 text-[#4a4a4a]/60 hover:text-[#4a4a4a] transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>

              <h3 className="font-sans font-medium text-xl md:text-2xl text-[#4a4a4a] tracking-wide mb-8">
                Assinar o Livro
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-[#7a7a7a] font-semibold mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="O seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-[#f5f4f0] border border-[#4a4a4a]/10 focus:border-[#4a4a4a]/30 outline-none text-[#4a4a4a] px-4 py-3 text-sm font-sans placeholder-[#7a7a7a]/40 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-[#7a7a7a] font-semibold mb-2">
                    Mensagem *
                  </label>
                  <textarea
                    required
                    maxLength={1000}
                    rows={5}
                    placeholder="Deixe a sua mensagem..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-[#f5f4f0] border border-[#4a4a4a]/10 focus:border-[#4a4a4a]/30 outline-none text-[#4a4a4a] px-4 py-3 text-sm font-sans placeholder-[#7a7a7a]/40 resize-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1a1a1a] hover:bg-[#2c2c2c] disabled:bg-[#1a1a1a]/50 text-white py-3.5 uppercase text-xs tracking-widest font-sans font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    'Publicar'
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
