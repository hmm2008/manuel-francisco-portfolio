import React, { useState, useEffect } from 'react';
import { ExternalLink, Plus, X } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import Footer from './Footer';

interface LinksProps {
  settings: any;
  isAdminUnlocked: boolean;
  setActiveView: (view: any) => void;
  onOpenTerms: () => void;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  createdAt: any;
}

export default function Links({ settings, isAdminUnlocked, setActiveView, onOpenTerms }: LinksProps) {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'links'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const linksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LinkItem[];
      
      setLinks(linksData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching links:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let formattedUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'links'), {
        title: newTitle.trim(),
        url: formattedUrl,
        description: newDescription.trim(),
        createdAt: serverTimestamp()
      });
      setNewTitle('');
      setNewUrl('');
      setNewDescription('');
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding link:", error);
      alert("Ocorreu um erro ao adicionar o link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto p-6 md:p-10 flex flex-col items-center justify-between">
      <div className="w-full flex-1 max-w-5xl mx-auto flex flex-col">
        {/* Header Section */}
        <div className="text-center mb-10 w-full flex-shrink-0">
          <div className="border-y border-[#4a4a4a]/10 py-4 mb-4">
            <h1 className="font-sans text-lg md:text-xl text-[#4a4a4a] tracking-widest uppercase font-semibold">
              {settings?.siteName || 'Manuel Francisco Fotografia'}
            </h1>
          </div>
        </div>

        {/* Content Container */}
        <div className="w-full max-w-[600px] mx-auto flex-1 pb-12 pt-10">
          <div className="mb-10 text-left flex justify-between items-end">
            <div>
              <p className="text-[#7a7a7a] tracking-widest text-[10px] uppercase font-sans mb-3">
                RECURSOS
              </p>
              <h2 className="font-serif text-4xl text-[#4a4a4a] font-light">
                Links
              </h2>
            </div>
            
            {isAdminUnlocked && (
              <button 
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 border border-[#4a4a4a]/20 hover:border-[#4a4a4a]/50 text-[#4a4a4a] transition-colors text-[10px] tracking-widest uppercase font-sans bg-transparent"
              >
                <Plus size={14} />
                <span>ADICIONAR</span>
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12 opacity-50">
              <div className="w-6 h-6 border-2 border-[#4a4a4a]/20 border-t-[#4a4a4a] rounded-full animate-spin"></div>
            </div>
          ) : links.length > 0 ? (
            <div className="space-y-4">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-6 border border-[#4a4a4a]/10 hover:border-[#4a4a4a]/30 transition-colors bg-white/50 group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg text-[#4a4a4a] font-sans group-hover:text-black transition-colors font-light">{link.title}</h3>
                    <ExternalLink size={14} className="text-[#7a7a7a] group-hover:text-[#4a4a4a] transition-colors" />
                  </div>
                  <p className="text-[#7a7a7a] text-xs font-sans tracking-wide">
                    {link.url}
                  </p>
                  {link.description && (
                    <p className="text-[#4a4a4a]/80 text-sm font-sans mt-3">
                      {link.description}
                    </p>
                  )}
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-[#4a4a4a]/10 text-[#7a7a7a] text-sm font-sans">
              Ainda não existem links adicionados.
            </div>
          )}
        </div>
      </div>
      
      <div className="w-full flex-shrink-0 mt-auto">
        <Footer 
          activeView="links" 
          setActiveView={setActiveView} 
          settings={settings} 
          onOpenTerms={onOpenTerms} 
        />
      </div>

      {/* Modal Centrado */}
      {showAddForm && isAdminUnlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          <div 
            className="absolute inset-0 bg-[#2a2a2a]/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowAddForm(false)}
          ></div>
          <div className="relative w-full max-w-md bg-[#f4f4f4] border border-[#4a4a4a]/10 shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-8 border-b border-[#4a4a4a]/10">
              <h2 className="font-serif text-3xl text-[#4a4a4a] font-light">Novo Link</h2>
              <button 
                onClick={() => setShowAddForm(false)} 
                className="text-[#7a7a7a] hover:text-[#1a1a1a] transition-colors"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>
            
            <div className="p-8 flex-1 overflow-y-auto">
              <form id="add-link-form" onSubmit={handleAddLink} className="space-y-6 text-left">
                <div className="space-y-2">
                  <label className="block text-[10px] font-sans tracking-[0.2em] uppercase text-[#4a4a4a] font-semibold">
                    TÍTULO *
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Nome do site"
                    className="w-full bg-[#fafafa] border border-[#4a4a4a]/20 px-4 py-3 text-sm font-sans text-[#4a4a4a] focus:outline-none focus:border-[#4a4a4a]/60 placeholder:text-[#4a4a4a]/40"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-[10px] font-sans tracking-[0.2em] uppercase text-[#4a4a4a] font-semibold">
                    URL *
                  </label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://exemplo.com"
                    className="w-full bg-[#fafafa] border border-[#4a4a4a]/20 px-4 py-3 text-sm font-sans text-[#4a4a4a] focus:outline-none focus:border-[#4a4a4a]/60 placeholder:text-[#4a4a4a]/40"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-[10px] font-sans tracking-[0.2em] uppercase text-[#4a4a4a] font-semibold">
                    DESCRIÇÃO
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Breve descrição do site..."
                    rows={4}
                    className="w-full bg-[#fafafa] border border-[#4a4a4a]/20 px-4 py-3 text-sm font-sans text-[#4a4a4a] focus:outline-none focus:border-[#4a4a4a]/60 resize-none placeholder:text-[#4a4a4a]/40"
                  />
                </div>
              </form>
            </div>
            
            <div className="p-8 border-t border-[#4a4a4a]/10 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="w-full py-4 text-[10px] uppercase tracking-[0.2em] text-[#4a4a4a] border border-[#4a4a4a]/20 bg-[#fafafa] hover:border-[#4a4a4a]/50 transition-colors font-semibold"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                form="add-link-form"
                disabled={isSubmitting}
                className="w-full bg-[#1a1a1a] text-white py-4 text-[10px] uppercase tracking-[0.2em] hover:bg-[#333] transition-colors disabled:opacity-50 font-semibold"
              >
                {isSubmitting ? 'A ADICIONAR...' : 'ADICIONAR'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
