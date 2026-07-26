import React, { useState, useEffect, useRef, useMemo } from 'react';
import ExifReader from 'exifreader';
import { auth, db, storage, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, onSnapshot, setDoc, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { 
  Upload, Trash2, LogOut, LogIn, Loader2, Tags, Check, Plus, X, Edit2, AlertCircle, 
  Settings as SettingsIcon, LayoutDashboard, Camera, Info, ArrowLeft, ArrowRight, 
  ArrowUp, ArrowDown, GripVertical, CheckSquare, Square, Layers, Move, RefreshCw, 
  Save, CheckCircle2, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SettingsPanel from './components/SettingsPanel';
import { ImageProps, SiteSettings } from './types';

interface ExifData {
  camera?: string;
  lens?: string;
  aperture?: string;
  shutter?: string;
  iso?: string;
  focalLength?: string;
  location?: string;
  date?: string;
}

interface PendingPhoto {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  subtitle: string;
  category: string;
  cameraSettings: string;
  description: string;
  exif?: ExifData;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

async function extractExifFromFile(file: File): Promise<{ exif: ExifData; cameraSettings: string } | null> {
  try {
    const tags = await ExifReader.load(file);
    const make = tags.Make?.description || '';
    const model = tags.Model?.description || '';
    let camera = '';
    if (model) {
      camera = make && !model.toLowerCase().includes(make.toLowerCase()) ? `${make} ${model}` : model;
    } else {
      camera = make;
    }

    const lens = tags.LensModel?.description || tags.Lens?.description || '';
    
    let aperture = '';
    if (tags.FNumber?.description) {
      const fVal = String(tags.FNumber.description);
      aperture = fVal.startsWith('f/') ? fVal : `f/${fVal}`;
    }
    
    let shutter = tags.ExposureTime?.description ? String(tags.ExposureTime.description) : '';
    if (shutter && !shutter.includes('/') && !shutter.endsWith('s')) {
      shutter = `${shutter}s`;
    }

    const iso = tags.ISOSpeedRatings?.description ? String(tags.ISOSpeedRatings.description) : (tags.ISO?.description ? String(tags.ISO.description) : '');
    
    let focalLength = tags.FocalLength?.description ? String(tags.FocalLength.description) : '';
    if (focalLength && !focalLength.toLowerCase().includes('mm')) {
      focalLength = `${focalLength}mm`;
    }

    const dateRaw = tags.DateTimeOriginal?.description ? String(tags.DateTimeOriginal.description) : (tags.DateTime?.description ? String(tags.DateTime.description) : '');
    let date = dateRaw;
    if (dateRaw && dateRaw.includes(':')) {
      const parts = dateRaw.split(' ')[0].split(':');
      if (parts.length === 3) {
        date = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }

    const settingsParts = [];
    if (camera) settingsParts.push(camera);
    if (focalLength) settingsParts.push(focalLength);
    if (aperture) settingsParts.push(aperture);
    if (shutter) settingsParts.push(shutter);
    if (iso) settingsParts.push(`ISO ${iso}`);

    return {
      exif: {
        camera,
        lens,
        aperture,
        shutter,
        iso,
        focalLength,
        date
      },
      cameraSettings: settingsParts.join(' • ')
    };
  } catch (err) {
    return null;
  }
}

async function compressImage(file: File, maxDimension: number, quality: number, enableSharpen?: boolean, sharpenAmount?: number): Promise<File | Blob> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/') || file.type === 'image/gif') {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        if (enableSharpen && sharpenAmount && sharpenAmount > 0) {
          try {
            const strength = (sharpenAmount / 100) * 0.8;
            const imgData = ctx.getImageData(0, 0, width, height);
            const data = imgData.data;
            const src = new Uint8ClampedArray(data);
            const w = width;
            const h = height;

            const c = 1 + 4 * strength;
            const s = -strength;

            for (let y = 1; y < h - 1; y++) {
              for (let x = 1; x < w - 1; x++) {
                const idx = (y * w + x) * 4;
                for (let channel = 0; channel < 3; channel++) {
                  const i = idx + channel;
                  const prevRow = ((y - 1) * w + x) * 4 + channel;
                  const nextRow = ((y + 1) * w + x) * 4 + channel;
                  const left = (y * w + (x - 1)) * 4 + channel;
                  const right = (y * w + (x + 1)) * 4 + channel;

                  const val = src[i] * c + (src[prevRow] + src[nextRow] + src[left] + src[right]) * s;
                  data[i] = Math.min(255, Math.max(0, val));
                }
              }
            }
            ctx.putImageData(imgData, 0, 0);
          } catch (err) {
            console.warn("Failed to apply sharpen filter:", err);
          }
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export default function AdminPanel({ images, setImages, onLogout }: { images: ImageProps[], setImages: React.Dispatch<React.SetStateAction<ImageProps[]>>, onLogout?: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'gallery' | 'settings'>('gallery');
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showDeleteCategoryConfirm, setShowDeleteCategoryConfirm] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  
  // Selection & Bulk Operations State
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState<boolean>(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);

  // Bulk Edit State
  const [showBulkEditModal, setShowBulkEditModal] = useState<boolean>(false);
  const [isBulkEditing, setIsBulkEditing] = useState<boolean>(false);
  const [bulkCategory, setBulkCategory] = useState<string>('');
  const [bulkSubtitle, setBulkSubtitle] = useState<string>('');
  const [bulkCameraSettings, setBulkCameraSettings] = useState<string>('');
  const [bulkDescription, setBulkDescription] = useState<string>('');

  // Pointer-based Drag & Drop state
  const [pointerDrag, setPointerDrag] = useState<{
    activeId: string;
    overId: string | null;
    cursorX: number;
    cursorY: number;
    isDragging: boolean;
    item: ImageProps;
  } | null>(null);

  const startPosRef = useRef<{ x: number; y: number; id: string; item: ImageProps } | null>(null);

  // Reordering & Position UI State
  const [isReorderMode, setIsReorderMode] = useState<boolean>(false);
  const [savingOrder, setSavingOrder] = useState<boolean>(false);
  const [orderNotice, setOrderNotice] = useState<string | null>(null);
  const [movingPhotoModalImg, setMovingPhotoModalImg] = useState<ImageProps | null>(null);
  const [targetPositionInput, setTargetPositionInput] = useState<string>('1');
  
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []) as File[];
    if (selectedFiles.length === 0) return;

    if (editingId) {
      const selectedFile = selectedFiles[0];
      setFile(selectedFile);
      const parsed = await extractExifFromFile(selectedFile);
      if (parsed) {
        if (parsed.cameraSettings && !cameraSettings) {
          setCameraSettings(parsed.cameraSettings);
        }
      }
    } else {
      const newPendingProms = selectedFiles.map(async f => {
        const lastDot = f.name.lastIndexOf('.');
        const nameWithoutExt = lastDot !== -1 ? f.name.substring(0, lastDot) : f.name;
        const defaultTitle = nameWithoutExt
          .replace(/[_-]/g, ' ')
          .replace(/\b\w/g, char => char.toUpperCase());

        const parsed = await extractExifFromFile(f);

        return {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          file: f,
          previewUrl: URL.createObjectURL(f),
          title: defaultTitle,
          subtitle: subtitle || '',
          category: category || '',
          cameraSettings: parsed?.cameraSettings || cameraSettings || '',
          description: description || '',
          exif: parsed?.exif || {},
          status: 'pending' as const
        };
      });

      const newPending = await Promise.all(newPendingProms);

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

  const updatePendingPhotoField = (id: string, field: keyof PendingPhoto, value: string | boolean) => {
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

  const [siteSettings, setSiteSettings] = useState<Partial<SiteSettings> | null>(null);
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

  const handleDeleteCategory = (catToDelete: string) => {
    setShowDeleteCategoryConfirm(catToDelete);
  };

  const executeDeleteCategory = async (catToDelete: string) => {
    try {
      const updatedCategories = currentCategories.filter((c: string) => c !== catToDelete);
      await setDoc(doc(db, 'settings', 'site'), {
        ...siteSettings,
        categories: updatedCategories
      }, { merge: true });

      if (category === catToDelete) {
        setCategory('');
      }
      setShowDeleteCategoryConfirm(null);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const filteredImages = useMemo(() => {
    let list = selectedCategory === 'TODAS' ? [...images] : images.filter(img => img.category === selectedCategory);
    return list.sort((a, b) => {
      const orderA = a.order !== undefined && a.order !== null ? Number(a.order) : Infinity;
      const orderB = b.order !== undefined && b.order !== null ? Number(b.order) : Infinity;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  }, [images, selectedCategory]);

  // Reordering & Position Swapping Helper Functions
  const saveImagePositions = async (reorderedList: ImageProps[]) => {
    setSavingOrder(true);
    try {
      const batch = writeBatch(db);
      reorderedList.forEach((img, idx) => {
        const docRef = doc(db, 'images', String(img.id));
        batch.update(docRef, { order: idx });
      });
      await batch.commit();
      setOrderNotice('Ordem das fotografias guardada com sucesso!');
      setTimeout(() => setOrderNotice(null), 3500);
    } catch (err) {
      console.error("Error saving photo positions:", err);
      alert("Erro ao guardar a ordem das fotografias.");
    } finally {
      setSavingOrder(false);
    }
  };

  const handleMovePhoto = async (id: string, direction: 'left' | 'right' | 'first' | 'last') => {
    const list = [...filteredImages];
    const currentIndex = list.findIndex(i => i.id === id);
    if (currentIndex === -1) return;

    let targetIndex = currentIndex;
    if (direction === 'left') targetIndex = Math.max(0, currentIndex - 1);
    if (direction === 'right') targetIndex = Math.min(list.length - 1, currentIndex + 1);
    if (direction === 'first') targetIndex = 0;
    if (direction === 'last') targetIndex = list.length - 1;

    if (targetIndex === currentIndex) return;

    const [movedItem] = list.splice(currentIndex, 1);
    list.splice(targetIndex, 0, movedItem);

    await saveImagePositions(list);
  };

  const handleMoveToPosition = async (id: string, newPosition1Based: number) => {
    const list = [...filteredImages];
    const currentIndex = list.findIndex(i => i.id === id);
    if (currentIndex === -1) return;

    const targetIndex = Math.max(0, Math.min(list.length - 1, newPosition1Based - 1));
    if (targetIndex === currentIndex) return;

    const [movedItem] = list.splice(currentIndex, 1);
    list.splice(targetIndex, 0, movedItem);

    await saveImagePositions(list);
    setMovingPhotoModalImg(null);
  };

  const handleDragDropReorder = async (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;
    const list = [...filteredImages];
    const fromIndex = list.findIndex(i => i.id === draggedId);
    const toIndex = list.findIndex(i => i.id === targetId);

    if (fromIndex === -1 || toIndex === -1) return;

    const [movedItem] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, movedItem);

    setPointerDrag(null);
    startPosRef.current = null;

    await saveImagePositions(list);
  };

  // Global Pointer Event Listeners for smooth drag-and-drop
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!startPosRef.current) return;

      const dx = e.clientX - startPosRef.current.x;
      const dy = e.clientY - startPosRef.current.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 4) {
        // Find photo card element directly under cursor
        const element = document.elementFromPoint(e.clientX, e.clientY);
        const card = element?.closest('[data-photo-id]') as HTMLElement | null;
        const overId = card?.dataset.photoId || null;

        setPointerDrag({
          activeId: startPosRef.current.id,
          overId: overId !== startPosRef.current.id ? overId : null,
          cursorX: e.clientX,
          cursorY: e.clientY,
          isDragging: true,
          item: startPosRef.current.item
        });
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (startPosRef.current && pointerDrag?.isDragging) {
        const activeId = startPosRef.current.id;
        const element = document.elementFromPoint(e.clientX, e.clientY);
        const card = element?.closest('[data-photo-id]') as HTMLElement | null;
        const targetId = card?.dataset.photoId || null;

        if (targetId && targetId !== activeId) {
          handleDragDropReorder(activeId, targetId);
        }
      }

      startPosRef.current = null;
      setPointerDrag(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [filteredImages, pointerDrag?.isDragging]);

  const handleAutoSortOrder = async (sortBy: 'recent' | 'oldest' | 'title-asc' | 'title-desc') => {
    const list = [...filteredImages];
    list.sort((a, b) => {
      if (sortBy === 'title-asc') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'title-desc') return (b.title || '').localeCompare(a.title || '');
      if (sortBy === 'oldest') {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeA - timeB;
      }
      // recent
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });

    await saveImagePositions(list);
  };

  // Selection & Bulk Delete Functions
  const toggleSelectPhoto = (id: string) => {
    setSelectedPhotoIds(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      if (next.length > 0) {
        setIsSelectionMode(true);
      } else {
        setIsSelectionMode(false);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedPhotoIds.length === filteredImages.length && filteredImages.length > 0) {
      setSelectedPhotoIds([]);
      setIsSelectionMode(false);
    } else {
      setSelectedPhotoIds(filteredImages.map(img => img.id));
      setIsSelectionMode(true);
    }
  };

  const executeBulkDelete = async () => {
    if (selectedPhotoIds.length === 0) return;
    setIsBulkDeleting(true);

    try {
      const deletedCount = selectedPhotoIds.length;
      for (const id of selectedPhotoIds) {
        const img = images.find(i => i.id === id);
        await deleteDoc(doc(db, 'images', id));
        if (img && img.storagePath) {
          try {
            const fileRef = ref(storage, img.storagePath);
            await deleteObject(fileRef);
          } catch (storageErr) {
            console.warn("Error deleting storage object for", id, storageErr);
          }
        }
      }
      setSelectedPhotoIds([]);
      setIsSelectionMode(false);
      setShowBulkDeleteModal(false);
      setOrderNotice(`${deletedCount} fotografias eliminadas com sucesso!`);
      setTimeout(() => setOrderNotice(null), 3500);
    } catch (err) {
      console.error("Bulk delete failed:", err);
      alert("Ocorreu um erro ao eliminar algumas fotografias.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const openBulkEditModal = () => {
    setBulkCategory('');
    setBulkSubtitle('');
    setBulkCameraSettings('');
    setBulkDescription('');
    setShowBulkEditModal(true);
  };

  const handleBulkEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPhotoIds.length === 0) return;
    setIsBulkEditing(true);

    try {
      let updatedCount = 0;
      for (const id of selectedPhotoIds) {
        const imgRef = doc(db, 'images', id);
        const updates: Partial<ImageProps> = {};
        if (bulkCategory) updates.category = bulkCategory;
        if (bulkSubtitle) updates.subtitle = bulkSubtitle;
        if (bulkCameraSettings) updates.cameraSettings = bulkCameraSettings;
        if (bulkDescription) updates.description = bulkDescription;

        if (Object.keys(updates).length > 0) {
          await updateDoc(imgRef, updates);
          updatedCount++;
        }
      }
      setShowBulkEditModal(false);
      setSelectedPhotoIds([]);
      setIsSelectionMode(false);
      setOrderNotice(`${updatedCount} fotografias atualizadas com sucesso!`);
      setTimeout(() => setOrderNotice(null), 3500);
    } catch (err) {
      console.error("Bulk edit failed:", err);
      alert("Ocorreu um erro ao atualizar as fotografias.");
    } finally {
      setIsBulkEditing(false);
    }
  };

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

  const openEditPhotoModal = (img: ImageProps) => {
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
        const updates: Partial<ImageProps> = {
          title: title || 'Sem título',
          subtitle: subtitle || '',
          category: category || '',
          cameraSettings: cameraSettings || '',
          description: description || ''
        };
        
        if (file) {
          let fileToUpload: File | Blob = file;
          const compressQual = (siteSettings?.compressQuality !== undefined) ? (siteSettings.compressQuality / 100) : 0.8;
          let maxDim = 1800;
          if (siteSettings?.importQuality === 'Original') {
            maxDim = Infinity;
          } else if (siteSettings?.importQuality === '1200 px') {
            maxDim = 1200;
          } else if (siteSettings?.importQuality === '800 px') {
            maxDim = 800;
          } else if (siteSettings?.importQuality) {
            const match = siteSettings.importQuality.match(/\d+/);
            if (match) maxDim = parseInt(match[0], 10);
          }

          if (maxDim !== Infinity || compressQual < 1.0 || siteSettings?.enableSharpen) {
            try {
              fileToUpload = await compressImage(file, maxDim, compressQual, siteSettings?.enableSharpen, siteSettings?.sharpenAmount);
            } catch (err) {
              console.warn("Failed to compress edit image:", err);
            }
          }

          const storageRef = ref(storage, `portfolio/${Date.now()}_${file.name}`);
          const snapshot = await uploadBytes(storageRef, fileToUpload);
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
            let fileToUpload: File | Blob = pending.file;
            const compressQual = (siteSettings?.compressQuality !== undefined) ? (siteSettings.compressQuality / 100) : 0.8;
            let maxDim = 1800;
            if (siteSettings?.importQuality === 'Original') {
              maxDim = Infinity;
            } else if (siteSettings?.importQuality === '1200 px') {
              maxDim = 1200;
            } else if (siteSettings?.importQuality === '800 px') {
              maxDim = 800;
            } else if (siteSettings?.importQuality) {
              const match = siteSettings.importQuality.match(/\d+/);
              if (match) maxDim = parseInt(match[0], 10);
            }

            if (maxDim !== Infinity || compressQual < 1.0 || siteSettings?.enableSharpen) {
              try {
                fileToUpload = await compressImage(pending.file, maxDim, compressQual, siteSettings?.enableSharpen, siteSettings?.sharpenAmount);
              } catch (err) {
                console.warn("Failed to compress batch image:", err);
              }
            }

            const storageRef = ref(storage, `portfolio/${Date.now()}_${pending.file.name}`);
            const snapshot = await uploadBytes(storageRef, fileToUpload);
            const downloadURL = await getDownloadURL(snapshot.ref);

            await addDoc(collection(db, 'images'), {
              url: downloadURL,
              title: pending.title || 'Sem título',
              subtitle: pending.subtitle || '',
              category: pending.category || '',
              cameraSettings: pending.cameraSettings || '',
              description: pending.description || '',
              exif: pending.exif || {},
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
          <div className="space-y-4">
            {/* Top Controls Bar */}
            <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4">
              {/* Categories list */}
              <div className="flex flex-wrap items-center gap-2">
                <button 
                  onClick={() => {
                    setSelectedCategory('TODAS');
                    setSelectedPhotoIds([]);
                    setIsSelectionMode(false);
                  }}
                  className={`px-4 py-2 border transition-colors text-[10px] tracking-[0.1em] uppercase font-medium ${selectedCategory === 'TODAS' ? 'bg-[#4a4a4a] text-white border-[#4a4a4a]' : 'border-[#4a4a4a]/10 text-[#7a7a7a] hover:text-[#4a4a4a] hover:border-[#4a4a4a]/30'}`}
                >
                  TODAS ({images.length})
                </button>
                {allCategories.map(cat => {
                  const count = images.filter(i => i.category === cat).length;
                  return (
                    <button 
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setSelectedPhotoIds([]);
                        setIsSelectionMode(false);
                      }}
                      className={`px-4 py-2 border transition-colors text-[10px] tracking-[0.1em] uppercase font-medium ${selectedCategory === cat ? 'bg-[#4a4a4a] text-white border-[#4a4a4a]' : 'border-[#4a4a4a]/10 text-[#7a7a7a] hover:text-[#4a4a4a] hover:border-[#4a4a4a]/30'}`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
              
              {/* Mode Toggles & Add Photo Button */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Toggle Multi-Select Mode */}
                <button 
                  onClick={() => {
                    if (isSelectionMode) {
                      setIsSelectionMode(false);
                      setSelectedPhotoIds([]);
                    } else {
                      setIsSelectionMode(true);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 border text-[10px] tracking-widest uppercase transition-all font-semibold ${
                    isSelectionMode
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'border-[#4a4a4a]/20 text-[#4a4a4a] hover:bg-[#4a4a4a]/5 bg-white'
                  }`}
                  title="Selecionar várias fotografias para apagar em lote"
                >
                  <CheckSquare size={14} />
                  <span>Seleção Múltipla {selectedPhotoIds.length > 0 && `(${selectedPhotoIds.length})`}</span>
                </button>

                {/* Toggle Reorder Mode */}
                <button 
                  onClick={() => setIsReorderMode(!isReorderMode)}
                  className={`flex items-center gap-1.5 px-3 py-2 border text-[10px] tracking-widest uppercase transition-all font-semibold ${
                    isReorderMode
                      ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-sm'
                      : 'border-[#4a4a4a]/20 text-[#4a4a4a] hover:bg-[#4a4a4a]/5 bg-white'
                  }`}
                  title="Alterar a ordem e posição das fotografias na galeria"
                >
                  <ArrowUpDown size={14} />
                  <span>Reordenar Posições</span>
                </button>

                {/* Add Photo Button */}
                <button 
                  onClick={openNewPhotoModal}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border border-[#4a4a4a]/20 text-[#4a4a4a] hover:bg-[#4a4a4a]/5 transition-colors text-[10px] tracking-widest uppercase font-semibold bg-white"
                >
                  <Plus size={14} /> Nova Fotografia
                </button>
              </div>
            </div>

            {/* Bulk Selection Bar (Shows when selection mode is active) */}
            <AnimatePresence>
              {isSelectionMode && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-[#1a1a1a] text-white p-3.5 px-5 rounded-sm flex flex-wrap items-center justify-between gap-4 shadow-lg border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <CheckSquare size={18} className="text-red-400" />
                    <span className="text-xs font-mono uppercase tracking-widest font-bold">
                      {selectedPhotoIds.length} de {filteredImages.length} fotografias selecionadas
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button 
                      onClick={handleSelectAll}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] uppercase tracking-widest transition-colors font-semibold border border-white/20"
                    >
                      {selectedPhotoIds.length === filteredImages.length && filteredImages.length > 0 ? 'Desselecionar Todas' : 'Selecionar Todas'}
                    </button>
                    {selectedPhotoIds.length > 0 && (
                      <button 
                        onClick={() => {
                          setSelectedPhotoIds([]);
                          setIsSelectionMode(false);
                        }}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] uppercase tracking-widest transition-colors border border-white/20"
                      >
                        Limpar Seleção
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        if (selectedPhotoIds.length === 1) {
                          const imgToEdit = images.find(i => i.id === selectedPhotoIds[0]);
                          if (imgToEdit) openEditPhotoModal(imgToEdit);
                        } else if (selectedPhotoIds.length > 1) {
                          openBulkEditModal();
                        }
                      }}
                      disabled={selectedPhotoIds.length === 0}
                      className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-[10px] uppercase tracking-widest transition-all font-bold flex items-center gap-1.5 shadow-md"
                      title={selectedPhotoIds.length === 1 ? "Editar detalhes da fotografia selecionada" : "Editar detalhes em lote das fotografias selecionadas"}
                    >
                      <Edit2 size={14} /> Editar {selectedPhotoIds.length > 0 ? `(${selectedPhotoIds.length})` : ''}
                    </button>
                    <button 
                      onClick={() => setShowBulkDeleteModal(true)}
                      disabled={selectedPhotoIds.length === 0}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-[10px] uppercase tracking-widest transition-all font-bold flex items-center gap-1.5 shadow-md"
                    >
                      <Trash2 size={14} /> Eliminar {selectedPhotoIds.length > 0 ? `(${selectedPhotoIds.length})` : ''}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reorder Mode Helper Bar */}
            <AnimatePresence>
              {isReorderMode && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-[#faf9f6] border border-[#e2ddd5] p-3.5 px-5 rounded-sm flex flex-wrap items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-2 text-xs text-[#4a4a4a]">
                    <Move size={16} className="text-[#8e8a82]" />
                    <span>Arraste as fotografias ou utilize os botões ◄ / ► em cada miniatura para alterar a ordem no site.</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-[#8e8a82] tracking-wider mr-1">Predefinições:</span>
                    <button 
                      onClick={() => handleAutoSortOrder('recent')}
                      className="px-2.5 py-1 text-[9px] uppercase tracking-wider border border-[#d8d3c9] hover:bg-[#efece6] text-[#4a4a4a] font-semibold bg-white transition-colors"
                      title="Ordenar por data mais recente"
                    >
                      Mais Recente
                    </button>
                    <button 
                      onClick={() => handleAutoSortOrder('oldest')}
                      className="px-2.5 py-1 text-[9px] uppercase tracking-wider border border-[#d8d3c9] hover:bg-[#efece6] text-[#4a4a4a] font-semibold bg-white transition-colors"
                      title="Ordenar por data mais antiga"
                    >
                      Mais Antiga
                    </button>
                    <button 
                      onClick={() => handleAutoSortOrder('title-asc')}
                      className="px-2.5 py-1 text-[9px] uppercase tracking-wider border border-[#d8d3c9] hover:bg-[#efece6] text-[#4a4a4a] font-semibold bg-white transition-colors"
                      title="Ordenar por título de A a Z"
                    >
                      A-Z
                    </button>
                    {savingOrder && (
                      <span className="text-xs font-mono text-amber-800 animate-pulse flex items-center gap-1.5 ml-2 font-bold">
                        <Loader2 size={13} className="animate-spin" /> Guardar ordem...
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Temporary Success Notice Banner */}
            <AnimatePresence>
              {orderNotice && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 px-4 text-xs font-medium flex items-center justify-between rounded-sm"
                >
                  <span className="flex items-center gap-2 font-sans">
                    <CheckCircle2 size={16} className="text-emerald-600" /> {orderNotice}
                  </span>
                  <button onClick={() => setOrderNotice(null)} className="text-emerald-700 hover:text-emerald-900">
                    <X size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Main Content */}
      {activeTab === 'gallery' ? (
        <div 
          className="grid gap-4 mt-6" 
          style={{ 
            gridTemplateColumns: `repeat(auto-fill, minmax(${siteSettings?.adminThumbSizePx || 200}px, 1fr))` 
          }}
        >
          {filteredImages.map((img, index) => {
            const isSelected = selectedPhotoIds.includes(img.id);
            const isBeingDragged = pointerDrag?.isDragging && pointerDrag?.activeId === img.id;
            const isDragTarget = pointerDrag?.isDragging && pointerDrag?.overId === img.id;

            return (
              <div 
                key={img.id} 
                data-photo-id={img.id}
                onPointerDown={(e) => {
                  if ((e.target as HTMLElement).closest('button, input, a, label')) {
                    return;
                  }
                  if (e.button !== 0) return;

                  startPosRef.current = {
                    x: e.clientX,
                    y: e.clientY,
                    id: img.id,
                    item: img
                  };
                }}
                className={`relative group aspect-[4/3] bg-[#dcd7cf] overflow-hidden rounded-sm transition-all duration-150 border cursor-grab active:cursor-grabbing select-none ${
                  isSelected 
                    ? 'ring-2 ring-red-600 border-red-600 shadow-lg scale-[0.99]' 
                    : isDragTarget 
                      ? 'ring-4 ring-amber-500 border-amber-500 scale-[1.03] shadow-2xl z-30'
                      : isBeingDragged
                        ? 'opacity-25 border-2 border-dashed border-[#1a1a1a] scale-95'
                        : 'border-[#1a1a1a]/10 hover:border-[#1a1a1a]/30'
                }`}
              >
                {/* Photo Thumbnail Image */}
                <img 
                  src={img.url} 
                  alt={img.title} 
                  draggable={false} 
                  className="w-full h-full object-contain pointer-events-none select-none" 
                />
                
                {/* Position Badge Top-Left */}
                <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 pointer-events-none">
                  <span className="bg-black/70 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm backdrop-blur-md shadow-md border border-white/10">
                    #{index + 1}
                  </span>
                  {isReorderMode && (
                    <span className="bg-amber-500 text-black p-1 rounded-sm shadow-md flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider">
                      <GripVertical size={12} /> Arrastar
                    </span>
                  )}
                </div>

                {/* Multi-Select Checkbox Top-Right */}
                <div className="absolute top-2 right-2 z-20 pointer-events-auto" onMouseDown={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    draggable={false}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectPhoto(img.id);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onDragStart={(e) => e.stopPropagation()}
                    className={`p-1.5 rounded-sm transition-all shadow-md backdrop-blur-md ${
                      isSelected 
                        ? 'bg-red-600 text-white' 
                        : 'bg-black/50 text-white/80 hover:bg-black/80 hover:text-white border border-white/20'
                    }`}
                    title={isSelected ? "Desselecionar fotografia" : "Selecionar fotografia"}
                  >
                    {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </div>

                {/* Overlay on Drag Target */}
                {isDragTarget && (
                  <div className="absolute inset-0 bg-amber-500/90 backdrop-blur-xs z-40 flex flex-col items-center justify-center text-black font-sans p-2 text-center shadow-2xl border-2 border-amber-300 animate-pulse pointer-events-none">
                    <ArrowUpDown size={28} className="mb-1 text-black" />
                    <span className="text-xs font-bold uppercase tracking-wider">Mover para a Posição #{index + 1}</span>
                    <span className="text-[10px] opacity-80 font-mono mt-0.5">Largar o botão do rato aqui</span>
                  </div>
                )}

                {/* Overlay on Dragging Source */}
                {isBeingDragged && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-xs z-40 flex flex-col items-center justify-center text-white p-2 text-center border-2 border-dashed border-white pointer-events-none">
                    <Move size={24} className="mb-1 animate-bounce text-amber-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">A Arrastar...</span>
                  </div>
                )}

                {/* Overlay with Actions */}
                <div className={`absolute inset-0 bg-black/50 transition-opacity flex flex-col justify-between p-3 z-10 pointer-events-none ${
                  isReorderMode || isSelectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <div className="flex justify-between items-center w-full pt-6 pointer-events-auto" onMouseDown={(e) => e.stopPropagation()}>
                    {/* Position Move Buttons Left / Right */}
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm p-1 rounded-sm border border-white/10" onMouseDown={(e) => e.stopPropagation()}>
                      <button 
                        type="button"
                        draggable={false}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMovePhoto(img.id, 'left');
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onDragStart={(e) => e.stopPropagation()}
                        disabled={index === 0}
                        className="p-1 hover:bg-white/20 disabled:opacity-30 transition-colors text-white rounded-xs"
                        title="Mover para a esquerda / cima"
                      >
                        <ArrowLeft size={14} />
                      </button>
                      <button 
                        type="button"
                        draggable={false}
                        onClick={(e) => {
                          e.stopPropagation();
                          setMovingPhotoModalImg(img);
                          setTargetPositionInput(String(index + 1));
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onDragStart={(e) => e.stopPropagation()}
                        className="px-1.5 py-0.5 hover:bg-white/20 text-amber-200 text-[9px] font-mono font-bold tracking-wider"
                        title="Ir para posição específica"
                      >
                        #{index + 1}
                      </button>
                      <button 
                        type="button"
                        draggable={false}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMovePhoto(img.id, 'right');
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onDragStart={(e) => e.stopPropagation()}
                        disabled={index === filteredImages.length - 1}
                        className="p-1 hover:bg-white/20 disabled:opacity-30 transition-colors text-white rounded-xs"
                        title="Mover para a direita / baixo"
                      >
                        <ArrowRight size={14} />
                      </button>
                    </div>

                    {/* Edit and Single Delete Buttons */}
                    <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
                      <button 
                        type="button"
                        draggable={false}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditPhotoModal(img);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onDragStart={(e) => e.stopPropagation()}
                        className="p-1.5 bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-colors rounded-sm text-white"
                        title="Editar Detalhes"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        type="button"
                        draggable={false}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(img.id);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onDragStart={(e) => e.stopPropagation()}
                        className="p-1.5 bg-red-500/80 hover:bg-red-600 backdrop-blur-sm transition-colors rounded-sm text-white"
                        title="Eliminar Fotografia"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Category Info at bottom */}
                  <div className="bg-black/60 backdrop-blur-sm p-2 rounded-sm border border-white/10 pointer-events-none">
                    <p className="text-white font-sans text-[10px] tracking-widest uppercase truncate font-semibold">{img.title || 'Sem Título'}</p>
                    {img.category && (
                      <p className="text-white/70 font-sans text-[8px] tracking-widest uppercase mt-0.5 truncate">{img.category}</p>
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

      {/* Category Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteCategoryConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
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
              <h4 className="font-sans text-xl text-[#1a1a1a] mb-2">Eliminar Categoria?</h4>
              <p className="text-sm text-[#8e8a82] mb-8">
                Tem a certeza que deseja eliminar a categoria <strong className="text-[#1a1a1a]">"{showDeleteCategoryConfirm}"</strong>?
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  type="button"
                  onClick={() => setShowDeleteCategoryConfirm(null)}
                  className="flex-1 py-3 border border-[#1a1a1a]/10 bg-white text-[#8e8a82] hover:text-[#1a1a1a] transition-colors uppercase tracking-widest text-[10px] font-semibold"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={() => executeDeleteCategory(showDeleteCategoryConfirm)}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white transition-colors uppercase tracking-widest text-[10px] font-semibold"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Edit Modal */}
      <AnimatePresence>
        {showBulkEditModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#f5f2ed] p-8 w-full max-w-lg relative shadow-2xl rounded-sm max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-[#1a1a1a]/10 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                    <Edit2 className="text-amber-700" size={18} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-sans text-lg text-[#1a1a1a] font-semibold">
                      Editar {selectedPhotoIds.length} Fotografias Selecionadas
                    </h4>
                    <p className="text-[10px] text-[#8e8a82] uppercase tracking-wider">Edição em Lote</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowBulkEditModal(false)}
                  className="text-[#8e8a82] hover:text-[#1a1a1a]"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-xs text-[#8e8a82] mb-4 leading-relaxed text-left">
                Preencha apenas os campos que pretende atualizar em todas as {selectedPhotoIds.length} fotografias selecionadas. Os campos deixados em branco não serão alterados.
              </p>

              {/* Grid of selected thumbnails preview */}
              <div className="w-full max-h-28 overflow-y-auto grid grid-cols-5 gap-2 p-2 bg-white/80 border border-[#e2ddd5] mb-6 rounded-sm">
                {selectedPhotoIds.map(id => {
                  const img = images.find(i => i.id === id);
                  if (!img) return null;
                  return (
                    <div key={id} className="aspect-square bg-[#dcd7cf] overflow-hidden rounded-xs border border-[#1a1a1a]/10 relative">
                      <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleBulkEditSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#1a1a1a] mb-1.5 font-semibold">
                    NOVA CATEGORIA
                  </label>
                  <select 
                    value={bulkCategory}
                    onChange={e => setBulkCategory(e.target.value)}
                    className="w-full bg-white border border-[#1a1a1a]/10 px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#1a1a1a]/30 transition-colors"
                  >
                    <option value="">-- Manter categoria atual --</option>
                    {currentCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#1a1a1a] mb-1.5 font-semibold">
                    NOVO LOCAL / SUBTÍTULO
                  </label>
                  <input 
                    type="text"
                    value={bulkSubtitle}
                    onChange={e => setBulkSubtitle(e.target.value)}
                    placeholder="Deixe em branco para manter original"
                    className="w-full bg-white border border-[#1a1a1a]/10 px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#1a1a1a]/30 transition-colors placeholder:text-[#8e8a82]/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#1a1a1a] mb-1.5 font-semibold">
                    NOVAS DEFINIÇÕES DE CÂMARA
                  </label>
                  <input 
                    type="text"
                    value={bulkCameraSettings}
                    onChange={e => setBulkCameraSettings(e.target.value)}
                    placeholder="Ex: ISO 100 • f/4 • 1/500s"
                    className="w-full bg-white border border-[#1a1a1a]/10 px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#1a1a1a]/30 transition-colors placeholder:text-[#8e8a82]/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#1a1a1a] mb-1.5 font-semibold">
                    NOVA DESCRIÇÃO
                  </label>
                  <textarea 
                    value={bulkDescription}
                    onChange={e => setBulkDescription(e.target.value)}
                    placeholder="Deixe em branco para manter original"
                    className="w-full bg-white border border-[#1a1a1a]/10 px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#1a1a1a]/30 transition-colors placeholder:text-[#8e8a82]/50 min-h-[70px] resize-y"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-[#1a1a1a]/10">
                  <button 
                    type="button"
                    onClick={() => setShowBulkEditModal(false)}
                    disabled={isBulkEditing}
                    className="flex-1 py-3 border border-[#1a1a1a]/10 bg-white text-[#8e8a82] hover:text-[#1a1a1a] transition-colors uppercase tracking-widest text-[10px] font-semibold"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isBulkEditing}
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white transition-colors uppercase tracking-widest text-[10px] font-bold flex items-center justify-center gap-2 shadow-md"
                  >
                    {isBulkEditing ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> A guardar...
                      </>
                    ) : (
                      `Guardar em ${selectedPhotoIds.length} Fotos`
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Delete Confirmation Modal */}
      <AnimatePresence>
        {showBulkDeleteModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#f5f2ed] p-8 w-full max-w-md relative shadow-2xl flex flex-col items-center text-center rounded-sm"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <h4 className="font-sans text-xl text-[#1a1a1a] mb-2 font-semibold">
                Eliminar {selectedPhotoIds.length} Fotografias?
              </h4>
              <p className="text-xs text-[#8e8a82] mb-6 leading-relaxed">
                Esta ação é irreversível. As {selectedPhotoIds.length} fotografias selecionadas serão permanentemente removidas do portfólio e do servidor de ficheiros.
              </p>

              {/* Grid of selected thumbnails preview */}
              <div className="w-full max-h-40 overflow-y-auto grid grid-cols-4 gap-2 p-2 bg-white/60 border border-[#e2ddd5] mb-6 rounded-sm">
                {selectedPhotoIds.map(id => {
                  const img = images.find(i => i.id === id);
                  if (!img) return null;
                  return (
                    <div key={id} className="aspect-square bg-[#dcd7cf] overflow-hidden rounded-xs border border-[#1a1a1a]/10">
                      <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                    </div>
                  );
                })}
              </div>
              
              <div className="flex gap-3 w-full">
                <button 
                  type="button"
                  onClick={() => setShowBulkDeleteModal(false)}
                  disabled={isBulkDeleting}
                  className="flex-1 py-3 border border-[#1a1a1a]/10 bg-white text-[#8e8a82] hover:text-[#1a1a1a] transition-colors uppercase tracking-widest text-[10px] font-semibold"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={executeBulkDelete}
                  disabled={isBulkDeleting}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white transition-colors uppercase tracking-widest text-[10px] font-semibold flex items-center justify-center gap-2"
                >
                  {isBulkDeleting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> A eliminar...
                    </>
                  ) : (
                    `Eliminar (${selectedPhotoIds.length})`
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Jump to Position Modal */}
      <AnimatePresence>
        {movingPhotoModalImg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#f5f2ed] p-6 w-full max-w-sm relative shadow-2xl space-y-4 rounded-sm"
            >
              <div className="flex justify-between items-center border-b border-[#1a1a1a]/10 pb-3">
                <h4 className="font-sans text-lg text-[#1a1a1a] font-semibold">Alterar Posição da Foto</h4>
                <button onClick={() => setMovingPhotoModalImg(null)} className="text-[#8e8a82] hover:text-[#1a1a1a]">
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-center gap-3 bg-white p-3 border border-[#e2ddd5] rounded-sm">
                <img src={movingPhotoModalImg.url} alt={movingPhotoModalImg.title} className="w-14 h-14 object-cover rounded-xs" />
                <div className="truncate">
                  <p className="text-xs font-bold text-[#1a1a1a] truncate">{movingPhotoModalImg.title || 'Sem título'}</p>
                  <p className="text-[10px] text-[#8e8a82] uppercase tracking-wider">
                    Posição Atual: #{filteredImages.findIndex(i => i.id === movingPhotoModalImg.id) + 1} de {filteredImages.length}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#1a1a1a] tracking-wider block">
                  NOVA POSIÇÃO (1 a {filteredImages.length})
                </label>
                <input 
                  type="number"
                  min="1"
                  max={filteredImages.length}
                  value={targetPositionInput}
                  onChange={(e) => setTargetPositionInput(e.target.value)}
                  className="w-full bg-white border border-[#e2ddd5] px-4 py-2.5 text-sm font-mono text-center focus:outline-none focus:border-[#1a1a1a]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setMovingPhotoModalImg(null)}
                  className="flex-1 py-2.5 border border-[#1a1a1a]/10 bg-white text-[#8e8a82] uppercase text-[10px] tracking-widest font-semibold"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={() => handleMoveToPosition(movingPhotoModalImg.id, Number(targetPositionInput))}
                  className="flex-1 py-2.5 bg-[#1a1a1a] hover:bg-[#333] text-white uppercase text-[10px] tracking-widest font-semibold"
                >
                  Mover Foto
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Drag Preview Element */}
      {pointerDrag?.isDragging && pointerDrag.item && (
        <div 
          className="fixed pointer-events-none z-[9999] w-48 aspect-[4/3] bg-[#1a1a1a] p-1.5 shadow-2xl rounded-md border-2 border-amber-400 opacity-90 transition-none flex flex-col justify-between"
          style={{
            left: `${pointerDrag.cursorX - 96}px`,
            top: `${pointerDrag.cursorY - 64}px`,
          }}
        >
          <img src={pointerDrag.item.url} alt="" className="w-full h-full object-cover rounded-xs" />
          <div className="absolute inset-x-0 bottom-0 bg-black/85 text-amber-300 text-[9px] font-mono p-1 text-center font-bold uppercase truncate border-t border-amber-400/50">
            A Mover: {pointerDrag.item.title || 'Fotografia'}
          </div>
        </div>
      )}

    </div>
  );
}
