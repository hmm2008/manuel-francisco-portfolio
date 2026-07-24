import React, { useState, useEffect, useRef, useMemo } from 'react';
import { auth, db, storage, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, onSnapshot, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Upload, Trash2, LogOut, LogIn, Loader2, Tags, Check, Plus, X, Edit2, AlertCircle, Settings as SettingsIcon, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SettingsPanel from './components/SettingsPanel';

interface PendingPhoto {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  subtitle: string;
  category: string;
  cameraSettings: string;
  description: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function AdminPanel({ images, setImages, onLogout }: { images: any[], setImages: any, onLogout?: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'gallery' | 'settings'>('gallery');
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('');
  const [cameraSettings, setCameraSettings] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Batch Upload States
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [selectedPendingId, setSelectedPendingId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []) as File[];
    if (selectedFiles.length === 0) return;

    if (editingId) {
      setFile(selectedFiles[0]);
    } else {
      const newPending: PendingPhoto[] = selectedFiles.map(f => {
        const lastDot = f.name.lastIndexOf('.');
        const nameWithoutExt = lastDot !== -1 ? f.name.substring(0, lastDot) : f.name;
        const defaultTitle = nameWithoutExt
          .replace(/[_-]/g, ' ')
          .replace(/\b\w/g, char => char.toUpperCase());

        return {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          file: f,
          previewUrl: URL.createObjectURL(f),
          title: defaultTitle,
          subtitle: subtitle || '',
          category: category || '',
          cameraSettings: cameraSettings || '',
          description: description || '',
          status: 'pending'
        };
      });

      setPendingPhotos(prev => {
        const updated = [...prev, ...newPending];
        if (!selectedPendingId && updated.length > 0) {
          setSelectedPendingId(updated[0].id);
        }
        return updated;
      });
    }
  };

  const removePendingPhoto = (id: string) => {
    setPendingPhotos(prev => {
      const target = prev.find(p => p.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      const updated = prev.filter(p => p.id !== id);
      if (selectedPendingId === id) {
        setSelectedPendingId(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
  };

  const updatePendingPhotoField = (id: string, field: keyof PendingPhoto, value: any) => {
    setPendingPhotos(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const applyCategoryToAll = () => {
    const active = pendingPhotos.find(p => p.id === selectedPendingId);
    if (!active) return;
    setPendingPhotos(prev => prev.map(p => ({ ...p, category: active.category })));
  };

  const applySubtitleToAll = () => {
    const active = pendingPhotos.find(p => p.id === selectedPendingId);
    if (!active) return;
    setPendingPhotos(prev => prev.map(p => ({ ...p, subtitle: active.subtitle })));
  };

  const applyCameraSettingsToAll = () => {
    const active = pendingPhotos.find(p => p.id === selectedPendingId);
    if (!active) return;
    setPendingPhotos(prev => prev.map(p => ({ ...p, cameraSettings: active.cameraSettings })));
  };

  const selectedPendingPhoto = useMemo(() => {
    return pendingPhotos.find(p => p.id === selectedPendingId) || null;
  }, [pendingPhotos, selectedPendingId]);

  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'site'), (docSnap) => {
      if (docSnap.exists()) {
        setSiteSettings(docSnap.data());
      }
    }, (error) => {
      console.error("Error listening to settings in Admin:", error);
    });
    return () => unsubscribeSettings();
  }, []);

  const currentCategories = useMemo(() => {
    if (siteSettings && siteSettings.categories && Array.isArray(siteSettings.categories)) {
      return siteSettings.categories;
    }
    return ['Paisagem', 'Retrato', 'Rua', 'Arquitetura', 'Natureza', 'Abstrato', 'Documentário', 'Animais'];
  }, [siteSettings]);

  const allCategories = useMemo(() => {
    const fromImages = images.map(img => img.category).filter(Boolean);
    const unique = Array.from(new Set([...currentCategories, ...fromImages]));
    return unique.filter(Boolean);
  }, [images, currentCategories]);

  const handleAddCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (currentCategories.includes(trimmed)) {
      alert("Esta categoria já existe.");
      return;
    }

    try {
      const updatedCategories = [...currentCategories, trimmed];
      await setDoc(doc(db, 'settings', 'site'), {
        ...siteSettings,
        categories: updatedCategories
      }, { merge: true });
      
      setCategory(trimmed); // Select the newly created category
      setNewCategoryName('');
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Erro ao adicionar a categoria.");
    }
  };

  const handleDeleteCategory = async (catToDelete: string) => {
    if (window.confirm(`Tem a certeza que deseja eliminar a categoria "${catToDelete}"?`)) {
      try {
        const updatedCategories = currentCategories.filter((c: string) => c !== catToDelete);
        await setDoc(doc(db, 'settings', 'site'), {
          ...siteSettings,
          categories: updatedCategories
        }, { merge: true });

        if (category === catToDelete) {
          setCategory('');
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Erro ao eliminar a categoria.");
      }
    }
  };

  const filteredImages = useMemo(() => {
    if (selectedCategory === 'TODAS') return images;
    return images.filter(img => img.category === selectedCategory);
  }, [images, selectedCategory]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      if (onLogout) onLogout();
    }).catch((err) => {
      console.error("Sign out error", err);
      if (onLogout) onLogout();
    });
  };

  const handleExit = () => {
    if (onLogout) onLogout();
  };

  const openNewPhotoModal = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setCategory('');
    setCameraSettings('');
    setDescription('');
    setFile(null);
    // Revoke old object URLs to avoid memory leaks
    pendingPhotos.forEach(p => URL.revokeObjectURL(p.previewUrl));
    setPendingPhotos([]);
    setSelectedPendingId(null);
    setShowUploadModal(true);
  };

  const openEditPhotoModal = (img: any) => {
    setEditingId(img.id);
    setTitle(img.title || '');
    setSubtitle(img.subtitle || '');
    setCategory(img.category || '');
    setCameraSettings(img.cameraSettings || '');
    setDescription(img.description || '');
    setFile(null);
    pendingPhotos.forEach(p => URL.revokeObjectURL(p.previewUrl));
    setPendingPhotos([]);
    setSelectedPendingId(null);
    setShowUploadModal(true);
  };

  const handleUploadOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (user.email?.toLowerCase() !== 'manuel.francisco3@gmail.com') {
      alert("Acesso negado. Apenas o administrador pode fazer upload.");
      return;
    }

    setUploading(true);
    try {
      if (editingId) {
        // Edit mode (single photo)
        const imgRef = doc(db, 'images', editingId);
        const updates: any = {
          title: title || 'Sem título',
          subtitle: subtitle || '',
          category: category || '',
          cameraSettings: cameraSettings || '',
          description: description || ''
        };
        
        if (file) {
          const storageRef = ref(storage, `portfolio/${Date.now()}_${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          updates.url = downloadURL;
          updates.storagePath = snapshot.ref.fullPath;
        }
        
        await updateDoc(imgRef, updates);
        setShowUploadModal(false);
      } else {
        // Create mode (batch upload)
        const photosToUpload = pendingPhotos.filter(p => p.status === 'pending' || p.status === 'error');
        if (photosToUpload.length === 0) {
          if (pendingPhotos.length > 0 && pendingPhotos.every(p => p.status === 'success')) {
            setShowUploadModal(false);
            pendingPhotos.forEach(p => URL.revokeObjectURL(p.previewUrl));
            setPendingPhotos([]);
            setSelectedPendingId(null);
          } else {
            alert("Por favor, selecione pelo menos uma imagem.");
          }
          setUploading(false);
          return;
        }

        let hasError = false;

        for (const pending of photosToUpload) {
          setPendingPhotos(prev => prev.map(p => p.id === pending.id ? { ...p, status: 'uploading' } : p));
          
          try {
            const storageRef = ref(storage, `portfolio/${Date.now()}_${pending.file.name}`);
            const snapshot = await uploadBytes(storageRef, pending.file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            await addDoc(collection(db, 'images'), {
              url: downloadURL,
              title: pending.title || 'Sem título',
              subtitle: pending.subtitle || '',
              category: pending.category || '',
              cameraSettings: pending.cameraSettings || '',
              description: pending.description || '',
              createdAt: serverTimestamp(),
              storagePath: snapshot.ref.fullPath
            });

            setPendingPhotos(prev => prev.map(p => p.id === pending.id ? { ...p, status: 'success' } : p));
          } catch (itemError) {
            console.error(`Failed to upload ${pending.file.name}`, itemError);
            setPendingPhotos(prev => prev.map(p => p.id === pending.id ? { ...p, status: 'error', error: 'Falha no upload' } : p));
            hasError = true;
          }
        }

        if (!hasError) {
          pendingPhotos.forEach(p => URL.revokeObjectURL(p.previewUrl));
          setPendingPhotos([]);
          setSelectedPendingId(null);
          setShowUploadModal(false);
        } else {
          alert("Algumas fotografias falharam o upload. Pode tentar novamente para as fotos em falta.");
        }
      }
    } catch (error) {
      console.error("Save failed:", error);
      alert("Erro ao guardar as fotografias.");
    } finally {
      setUploading(false);
    }
  };

  const executeDelete = async (id: string) => {
    const img = images.find(i => i.id === id);
    if (!img) return;
    
    try {
      await deleteDoc(doc(db, 'images', id));
      if (img.storagePath) {
        const fileRef = ref(storage, img.storagePath);
        await deleteObject(fileRef);
      }
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Delete failed for", id, error);
      alert("Erro ao eliminar a imagem.");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-[#5a5a40]" /></div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] space-y-6 p-8 bg-[#f5f2ed]">
        <h2 className="font-sans font-semibold text-2xl text-[#1a1a1a]">Área Reservada</h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
          <button 
            onClick={handleLogin}
            className="flex-1 px-6 py-3 bg-[#1a1a1a] text-white flex items-center justify-center gap-3 rounded-sm hover:bg-[#5a5a40] transition-colors uppercase tracking-widest text-[10px]"
          >
            <LogIn size={16} /> Entrar com Google
          </button>
          <button 
            onClick={handleExit}
            className="flex-1 px-6 py-3 border border-[#1a1a1a]/20 text-[#1a1a1a] flex items-center justify-center gap-3 rounded-sm hover:bg-[#1a1a1a]/5 transition-colors uppercase tracking-widest text-[10px]"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  if (user.email?.toLowerCase() !== 'manuel.francisco3@gmail.com') {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 text-center bg-[#f5f2ed]">
        <p className="text-red-500 font-sans tracking-widest text-xs uppercase">Acesso Não Autorizado</p>
        <p className="text-sm text-[#8e8a82]">Esta conta ({user.email}) não tem permissões de administrador.</p>
        <button onClick={handleLogout} className="px-6 py-3 border border-[#1a1a1a]/20 text-[#1a1a1a] flex items-center gap-3 rounded-sm hover:bg-[#1a1a1a]/5 transition-colors uppercase tracking-widest text-[10px]">
          Sair
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 lg:p-16 max-w-7xl mx-auto h-full overflow-y-auto bg-[#f0f0f0]">
      
      {/* Header Area */}
      <div className="flex flex-col mb-12 gap-8">
        <div className="flex flex-col xl:flex-row xl:justify-between xl:items-end gap-6">
          <div>
            <p className="text-[#7a7a7a] tracking-[0.2em] text-[9px] uppercase font-sans mb-3">ADMINISTRAÇÃO</p>
            <h2 className="font-sans font-semibold text-5xl md:text-6xl text-[#4a4a4a] tracking-wide">
              {activeTab === 'gallery' ? 'Galeria' : 'Configurações'}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-[#e8e8e8] p-1 rounded-sm mr-4">
              <button 
                onClick={() => setActiveTab('gallery')}
                className={`flex items-center gap-2 px-4 py-2 text-[10px] tracking-widest uppercase transition-all ${activeTab === 'gallery' ? 'bg-white text-[#4a4a4a] shadow-sm' : 'text-[#7a7a7a] hover:text-[#4a4a4a]'}`}
              >
                <LayoutDashboard size={14} /> Gerir Galeria
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-4 py-2 text-[10px] tracking-widest uppercase transition-all ${activeTab === 'settings' ? 'bg-white text-[#4a4a4a] shadow-sm' : 'text-[#7a7a7a] hover:text-[#4a4a4a]'}`}
              >
                <SettingsIcon size={14} /> Configurações Gerais
              </button>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-2 border border-[#4a4a4a]/20 text-[#4a4a4a] hover:bg-[#4a4a4a]/5 transition-colors text-[10px] tracking-widest uppercase bg-transparent">
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>

        {activeTab === 'gallery' && (
          <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-6">
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => setSelectedCategory('TODAS')}
                className={`px-4 py-2 border transition-colors text-[10px] tracking-[0.1em] uppercase ${selectedCategory === 'TODAS' ? 'bg-[#4a4a4a] text-white border-[#4a4a4a]' : 'border-[#4a4a4a]/10 text-[#7a7a7a] hover:text-[#4a4a4a] hover:border-[#4a4a4a]/30'}`}
              >
                TODAS
              </button>
              {allCategories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 border transition-colors text-[10px] tracking-[0.1em] uppercase ${selectedCategory === cat ? 'bg-[#4a4a4a] text-white border-[#4a4a4a]' : 'border-[#4a4a4a]/10 text-[#7a7a7a] hover:text-[#4a4a4a] hover:border-[#4a4a4a]/30'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <button 
              onClick={openNewPhotoModal}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border border-[#4a4a4a]/10 text-[#4a4a4a] hover:bg-[#4a4a4a]/5 transition-colors text-[10px] tracking-widest uppercase bg-transparent"
            >
              <Plus size={14} /> Nova Fotografia
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      {activeTab === 'gallery' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredImages.map(img => {
            return (
              <div 
                key={img.id} 
                className="relative group aspect-[4/3] bg-[#dcd7cf] overflow-hidden"
              >
                <img src={img.url} alt={img.title} className="w-full h-full object-contain" />
                
                {/* Overlay with Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => openEditPhotoModal(img)}
                      className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-colors rounded-sm text-white"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(img.id)}
                      className="p-2 bg-red-500/80 hover:bg-red-600 backdrop-blur-sm transition-colors rounded-sm text-white"
                      title="Apagar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div>
                    <p className="text-white font-sans text-[10px] tracking-widest uppercase truncate">{img.title}</p>
                    {img.category && (
                      <p className="text-white/70 font-sans text-[8px] tracking-widest uppercase mt-1 truncate">{img.category}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <SettingsPanel onBackToGallery={() => setActiveTab('gallery')} />
      )}

      {/* Upload/Edit Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={`bg-[#f5f2ed] p-8 md:p-10 w-full relative shadow-2xl overflow-y-auto max-h-[95vh] transition-all duration-300 ${!editingId && pendingPhotos.length > 0 ? 'max-w-5xl' : 'max-w-2xl'}`}
            >
              <div className="flex items-center justify-between mb-8 border-b border-[#1a1a1a]/10 pb-4">
                <h3 className="font-sans text-3xl text-[#1a1a1a]">
                  {editingId 
                    ? 'Editar Fotografia' 
                    : pendingPhotos.length > 0 
                      ? `Nova Fotografia • Lote (${pendingPhotos.length})` 
                      : 'Nova Fotografia'
                  }
                </h3>
                <button 
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="text-[#8e8a82] hover:text-[#1a1a1a] transition-colors"
                >
                  <X size={24} strokeWidth={1} />
                </button>
              </div>

              <form onSubmit={handleUploadOrEdit} className="space-y-6">
                {editingId ? (
                  // Edit existing photo form (Single Mode)
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-[#1a1a1a] mb-2 font-semibold">
                        FOTOGRAFIA (Opcional)
                      </label>
                      <input 
                        type="file" 
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border border-dashed border-[#1a1a1a]/20 bg-white p-12 text-center cursor-pointer hover:bg-[#1a1a1a]/5 transition-colors flex flex-col items-center gap-3"
                      >
                        <Upload size={24} className="text-[#8e8a82]" strokeWidth={1} />
                        {file ? (
                          <p className="text-xs text-[#1a1a1a] font-medium">{file.name}</p>
                        ) : (
                          <p className="text-[10px] uppercase tracking-widest text-[#8e8a82]">
                            Clique para substituir a imagem
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-[#1a1a1a] mb-2 font-semibold">TÍTULO *</label>
                      <input 
                        type="text" 
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full bg-white border border-[#1a1a1a]/10 px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a1a]/30 transition-colors placeholder:text-[#8e8a82]/50"
                        placeholder="Nome da fotografia"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-[10px] uppercase tracking-widest text-[#1a1a1a] font-semibold">
                            CATEGORIA
                          </label>
                          <button 
                            type="button"
                            onClick={() => setShowCategoryManager(!showCategoryManager)}
                            className="text-[9px] uppercase tracking-wider text-[#8e8a82] hover:text-[#1a1a1a] transition-colors underline underline-offset-2 font-bold"
                          >
                            {showCategoryManager ? 'Fechar Gestor' : 'Gerir Categorias'}
                          </button>
                        </div>
                        <select 
                          value={category}
                          onChange={e => setCategory(e.target.value)}
                          className="w-full bg-white border border-[#1a1a1a]/10 px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a1a]/30 transition-colors"
                        >
                          <option value="">Selecione...</option>
                          {currentCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>

                        {showCategoryManager && (
                          <motion.div 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 p-4 bg-white border border-[#1a1a1a]/10 rounded-sm space-y-4 shadow-sm"
                          >
                            <div>
                              <p className="text-[9px] uppercase tracking-wider text-[#8e8a82] font-semibold mb-2">Nova Categoria</p>
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  placeholder="Nome da categoria"
                                  value={newCategoryName}
                                  onChange={e => setNewCategoryName(e.target.value)}
                                  className="flex-1 bg-white border border-[#1a1a1a]/10 px-3 py-2 text-xs focus:outline-none focus:border-[#1a1a1a]/30 placeholder:text-[#8e8a82]/40"
                                />
                                <button 
                                  type="button"
                                  onClick={handleAddCategory}
                                  className="bg-[#1a1a1a] text-white px-4 py-2 text-xs font-bold hover:bg-black transition-colors flex items-center justify-center gap-1"
                                >
                                  <Plus size={14} /> ADICIONAR
                                </button>
                              </div>
                            </div>

                            <div className="space-y-2 max-h-[150px] overflow-y-auto pt-2 border-t border-[#1a1a1a]/5">
                              <p className="text-[9px] uppercase tracking-wider text-[#8e8a82] font-semibold">Categorias Atuais (clique no X para eliminar)</p>
                              <div className="flex flex-wrap gap-1.5">
                                {currentCategories.map(cat => (
                                  <div key={cat} className="flex items-center gap-1 bg-[#f5f2ed] border border-[#1a1a1a]/5 px-2.5 py-1 text-xs">
                                    <span className="text-[#4a4a4a]">{cat}</span>
                                    <button 
                                      type="button"
                                      onClick={() => handleDeleteCategory(cat)}
                                      className="text-[#8e8a82] hover:text-red-600 transition-colors p-0.5 ml-1"
                                      title={`Eliminar categoria ${cat}`}
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-[#1a1a1a] mb-2 font-semibold">LOCAL</label>
                        <input 
                          type="text" 
                          value={subtitle}
                          onChange={e => setSubtitle(e.target.value)}
                          className="w-full bg-white border border-[#1a1a1a]/10 px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a1a]/30 transition-colors placeholder:text-[#8e8a82]/50"
                          placeholder="Ex: Lisboa, Portugal"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-[#1a1a1a] mb-2 font-semibold">CÂMARA / DEFINIÇÕES</label>
                      <input 
                        type="text" 
                        value={cameraSettings}
                        onChange={e => setCameraSettings(e.target.value)}
                        className="w-full bg-white border border-[#1a1a1a]/10 px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a1a]/30 transition-colors placeholder:text-[#8e8a82]/50"
                        placeholder="Ex: ISO 400 • f/2.8 • 1/250s"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-[#1a1a1a] mb-2 font-semibold">DESCRIÇÃO</label>
                      <textarea 
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full bg-white border border-[#1a1a1a]/10 px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a1a]/30 transition-colors placeholder:text-[#8e8a82]/50 min-h-[100px] resize-y"
                        placeholder="Descrição opcional..."
                      />
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-[#1a1a1a]/10">
                      <button 
                        type="button"
                        onClick={() => setShowUploadModal(false)}
                        className="flex-1 py-4 border border-[#1a1a1a]/10 bg-white text-[#8e8a82] hover:text-[#1a1a1a] transition-colors uppercase tracking-widest text-[10px] font-semibold"
                      >
                        CANCELAR
                      </button>
                      <button 
                        type="submit" 
                        disabled={uploading || !title}
                        className="flex-1 py-4 bg-[#8e8a82] hover:bg-[#5a5a40] text-white transition-colors uppercase tracking-widest text-[10px] font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {uploading ? (
                          <><Loader2 className="animate-spin w-4 h-4" /> A aguardar...</>
                        ) : (
                          'GUARDAR'
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Create Mode (Batch Upload flow)
                  pendingPhotos.length === 0 ? (
                    // Step 1: Select files (supports drag & drop / multiple selection)
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-[#1a1a1a] mb-2 font-semibold">
                          FOTOGRAFIAS *
                        </label>
                        <input 
                          type="file" 
                          accept="image/*"
                          multiple
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border border-dashed border-[#1a1a1a]/20 bg-white p-16 text-center cursor-pointer hover:bg-[#1a1a1a]/5 transition-colors flex flex-col items-center justify-center gap-4 rounded-sm min-h-[250px]"
                        >
                          <Upload size={36} className="text-[#8e8a82]" strokeWidth={1} />
                          <div className="space-y-1">
                            <p className="text-xs text-[#1a1a1a] font-semibold uppercase tracking-widest">Importar Imagens</p>
                            <p className="text-[10px] text-[#8e8a82] uppercase tracking-widest">
                              Pode selecionar várias imagens em simultâneo
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4 border-t border-[#1a1a1a]/10">
                        <button 
                          type="button"
                          onClick={() => setShowUploadModal(false)}
                          className="flex-1 py-4 border border-[#1a1a1a]/10 bg-white text-[#8e8a82] hover:text-[#1a1a1a] transition-colors uppercase tracking-widest text-[10px] font-semibold"
                        >
                          CANCELAR
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Step 2: Configure details for selected files (Split-Panel design)
                    <div className="flex flex-col md:flex-row gap-8 min-h-[450px]">
                      
                      {/* Left Column - List of pending photos */}
                      <div className="w-full md:w-1/3 md:border-r border-[#1a1a1a]/10 md:pr-8 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center pb-2 border-b border-[#1a1a1a]/5">
                            <span className="text-[10px] uppercase tracking-widest font-semibold text-[#1a1a1a]">
                              Fotos Carregadas ({pendingPhotos.length})
                            </span>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-[9px] uppercase tracking-wider text-[#8e8a82] hover:text-[#1a1a1a] transition-colors underline font-bold"
                            >
                              + Adicionar
                            </button>
                          </div>

                          <input 
                            type="file" 
                            accept="image/*"
                            multiple
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                          />

                          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                            {pendingPhotos.map((photo, idx) => {
                              const isSelected = photo.id === selectedPendingId;
                              return (
                                <button
                                  key={photo.id}
                                  type="button"
                                  onClick={() => setSelectedPendingId(photo.id)}
                                  className={`flex items-center gap-3 p-2 cursor-pointer transition-all border rounded-sm text-left w-full ${
                                    isSelected 
                                      ? 'bg-white border-[#8e8a82] shadow-sm' 
                                      : 'bg-transparent border-[#1a1a1a]/5 hover:bg-[#1a1a1a]/5'
                                  }`}
                                >
                                  <div className="w-12 h-12 flex-shrink-0 bg-white border border-[#1a1a1a]/10 overflow-hidden rounded-sm relative">
                                    <img 
                                      src={photo.previewUrl} 
                                      alt="Preview" 
                                      className="w-full h-full object-contain"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-semibold text-[#1a1a1a] truncate">
                                      {photo.title || `Foto ${idx + 1}`}
                                    </p>
                                    <p className="text-[8px] text-[#8e8a82] tracking-wider uppercase truncate mt-0.5">
                                      {photo.category || 'Sem categoria'}
                                    </p>
                                  </div>
                                  
                                  <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                                    {photo.status === 'uploading' && (
                                      <Loader2 size={12} className="animate-spin text-[#8e8a82]" />
                                    )}
                                    {photo.status === 'success' && (
                                      <Check size={12} className="text-green-600" />
                                    )}
                                    {photo.status === 'error' && (
                                      <AlertCircle size={12} className="text-red-500" title={photo.error} />
                                    )}
                                    
                                    {photo.status === 'pending' && (
                                      <button
                                        type="button"
                                        onClick={() => removePendingPhoto(photo.id)}
                                        className="p-1 text-[#8e8a82] hover:text-red-600 transition-colors"
                                        title="Remover"
                                      >
                                        <X size={12} />
                                      </button>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Modal Footer (left side on desktop) */}
                        <div className="hidden md:flex flex-col gap-2 pt-6 border-t border-[#1a1a1a]/5 mt-auto">
                          <button 
                            type="button"
                            onClick={() => {
                              pendingPhotos.forEach(p => URL.revokeObjectURL(p.previewUrl));
                              setPendingPhotos([]);
                              setSelectedPendingId(null);
                              setShowUploadModal(false);
                            }}
                            className="w-full py-3 border border-[#1a1a1a]/10 bg-white text-[#8e8a82] hover:text-[#1a1a1a] transition-colors uppercase tracking-widest text-[9px] font-semibold"
                          >
                            CANCELAR
                          </button>
                          <button 
                            type="submit" 
                            disabled={uploading || pendingPhotos.length === 0}
                            className="w-full py-3 bg-[#8e8a82] hover:bg-[#5a5a40] text-white transition-colors uppercase tracking-widest text-[9px] font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {uploading ? (
                              <><Loader2 className="animate-spin w-3 h-3" /> A publicar...</>
                            ) : (
                              `PUBLICAR (${pendingPhotos.length})`
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Right Column - Active Selected Pending Photo details */}
                      <div className="flex-1 space-y-5">
                        {selectedPendingPhoto ? (
                          <div className="space-y-5">
                            <div className="flex items-center gap-4 pb-2 border-b border-[#1a1a1a]/5">
                              <span className="text-[10px] uppercase tracking-widest font-semibold text-[#1a1a1a]">
                                Detalhes da Fotografia Selecionada
                              </span>
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-[#1a1a1a] mb-2 font-semibold">TÍTULO *</label>
                              <input 
                                type="text" 
                                value={selectedPendingPhoto.title}
                                onChange={e => updatePendingPhotoField(selectedPendingId!, 'title', e.target.value)}
                                className="w-full bg-white border border-[#1a1a1a]/10 px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a1a]/30 transition-colors placeholder:text-[#8e8a82]/50"
                                placeholder="Nome da fotografia"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <label className="block text-[10px] uppercase tracking-widest text-[#1a1a1a] font-semibold">
                                    CATEGORIA
                                  </label>
                                  <div className="flex gap-2">
                                    <button 
                                      type="button"
                                      onClick={applyCategoryToAll}
                                      className="text-[9px] uppercase tracking-wider text-[#8e8a82] hover:text-[#1a1a1a] transition-colors underline font-bold"
                                      title="Aplica esta categoria a todas as fotos da lista"
                                    >
                                      Aplicar a todas
                                    </button>
                                    <span className="text-[#1a1a1a]/10">|</span>
                                    <button 
                                      type="button"
                                      onClick={() => setShowCategoryManager(!showCategoryManager)}
                                      className="text-[9px] uppercase tracking-wider text-[#8e8a82] hover:text-[#1a1a1a] transition-colors underline font-bold"
                                    >
                                      {showCategoryManager ? 'Fechar' : 'Gerir'}
                                    </button>
                                  </div>
                                </div>
                                <select 
                                  value={selectedPendingPhoto.category}
                                  onChange={e => updatePendingPhotoField(selectedPendingId!, 'category', e.target.value)}
                                  className="w-full bg-white border border-[#1a1a1a]/10 px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a1a]/30 transition-colors"
                                >
                                  <option value="">Selecione...</option>
                                  {currentCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                                </select>

                                {showCategoryManager && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-3 p-4 bg-white border border-[#1a1a1a]/10 rounded-sm space-y-4 shadow-sm"
                                  >
                                    <div>
                                      <p className="text-[9px] uppercase tracking-wider text-[#8e8a82] font-semibold mb-2">Nova Categoria</p>
                                      <div className="flex gap-2">
                                        <input 
                                          type="text"
                                          placeholder="Nome da categoria"
                                          value={newCategoryName}
                                          onChange={e => setNewCategoryName(e.target.value)}
                                          className="flex-1 bg-white border border-[#1a1a1a]/10 px-3 py-2 text-xs focus:outline-none focus:border-[#1a1a1a]/30 placeholder:text-[#8e8a82]/40"
                                        />
                                        <button 
                                          type="button"
                                          onClick={handleAddCategory}
                                          className="bg-[#1a1a1a] text-white px-4 py-2 text-xs font-bold hover:bg-black transition-colors flex items-center justify-center gap-1"
                                        >
                                          <Plus size={14} /> ADICIONAR
                                        </button>
                                      </div>
                                    </div>

                                    <div className="space-y-2 max-h-[120px] overflow-y-auto pt-2 border-t border-[#1a1a1a]/5">
                                      <p className="text-[9px] uppercase tracking-wider text-[#8e8a82] font-semibold">Categorias Atuais (clique no X para eliminar)</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {currentCategories.map(cat => (
                                          <div key={cat} className="flex items-center gap-1 bg-[#f5f2ed] border border-[#1a1a1a]/5 px-2.5 py-1 text-xs">
                                            <span className="text-[#4a4a4a]">{cat}</span>
                                            <button 
                                              type="button"
                                              onClick={() => handleDeleteCategory(cat)}
                                              className="text-[#8e8a82] hover:text-red-600 transition-colors p-0.5 ml-1"
                                              title={`Eliminar categoria ${cat}`}
                                            >
                                              <X size={12} />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <label className="block text-[10px] uppercase tracking-widest text-[#1a1a1a] font-semibold">LOCAL</label>
                                  <button 
                                    type="button"
                                    onClick={applySubtitleToAll}
                                    className="text-[9px] uppercase tracking-wider text-[#8e8a82] hover:text-[#1a1a1a] transition-colors underline font-bold"
                                    title="Aplica este local a todas as fotos da lista"
                                  >
                                    Aplicar a todas
                                  </button>
                                </div>
                                <input 
                                  type="text" 
                                  value={selectedPendingPhoto.subtitle}
                                  onChange={e => updatePendingPhotoField(selectedPendingId!, 'subtitle', e.target.value)}
                                  className="w-full bg-white border border-[#1a1a1a]/10 px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a1a]/30 transition-colors placeholder:text-[#8e8a82]/50"
                                  placeholder="Ex: Lisboa, Portugal"
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <label className="block text-[10px] uppercase tracking-widest text-[#1a1a1a] font-semibold">CÂMARA / DEFINIÇÕES</label>
                                <button 
                                  type="button"
                                  onClick={applyCameraSettingsToAll}
                                  className="text-[9px] uppercase tracking-wider text-[#8e8a82] hover:text-[#1a1a1a] transition-colors underline font-bold"
                                  title="Aplica estas definições a todas as fotos da lista"
                                >
                                  Aplicar a todas
                                </button>
                              </div>
                              <input 
                                type="text" 
                                value={selectedPendingPhoto.cameraSettings}
                                onChange={e => updatePendingPhotoField(selectedPendingId!, 'cameraSettings', e.target.value)}
                                className="w-full bg-white border border-[#1a1a1a]/10 px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a1a]/30 transition-colors placeholder:text-[#8e8a82]/50"
                                placeholder="Ex: ISO 400 • f/2.8 • 1/250s"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-[#1a1a1a] mb-2 font-semibold">DESCRIÇÃO</label>
                              <textarea 
                                value={selectedPendingPhoto.description}
                                onChange={e => updatePendingPhotoField(selectedPendingId!, 'description', e.target.value)}
                                className="w-full bg-white border border-[#1a1a1a]/10 px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a1a]/30 transition-colors placeholder:text-[#8e8a82]/50 min-h-[100px] resize-y"
                                placeholder="Descrição opcional..."
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#1a1a1a]/10 bg-white/50 rounded-sm">
                            <p className="text-xs text-[#8e8a82] uppercase tracking-widest">
                              Selecione uma fotografia da lista à esquerda para editar os seus detalhes.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#f5f2ed] p-8 w-full max-w-sm relative shadow-2xl flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-6">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <h4 className="font-sans text-xl text-[#1a1a1a] mb-2">Eliminar Fotografia?</h4>
              <p className="text-sm text-[#8e8a82] mb-8">
                Esta ação é irreversível. A fotografia será removida permanentemente do portfólio.
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  type="button"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-3 border border-[#1a1a1a]/10 bg-white text-[#8e8a82] hover:text-[#1a1a1a] transition-colors uppercase tracking-widest text-[10px] font-semibold"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={() => executeDelete(showDeleteConfirm)}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white transition-colors uppercase tracking-widest text-[10px] font-semibold"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
