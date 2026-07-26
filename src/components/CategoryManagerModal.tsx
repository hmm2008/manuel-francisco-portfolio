import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Tags, Trash2 } from 'lucide-react';
import { ImageProps } from '../types';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  images: ImageProps[];
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  onAddCategory: () => void;
  onDeleteCategory: (cat: string) => void;
}

export const CategoryManagerModal = React.memo(function CategoryManagerModal({
  isOpen,
  onClose,
  categories,
  images,
  newCategoryName,
  setNewCategoryName,
  onAddCategory,
  onDeleteCategory,
}: CategoryManagerModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
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
            className="bg-[#f5f2ed] p-8 w-full max-w-md relative shadow-2xl rounded-sm max-h-[90vh] flex flex-col"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h4 className="font-sans text-xl text-[#1a1a1a] mb-1 font-semibold">
                  Criar e Eliminar Categorias
                </h4>
                <p className="text-[10px] text-[#8e8a82] uppercase tracking-wider">Gerir Categorias da Galeria</p>
              </div>
              <button 
                onClick={onClose}
                className="text-[#8e8a82] hover:text-[#1a1a1a]"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6 flex gap-2">
              <input 
                type="text" 
                placeholder="Nova Categoria..." 
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                className="flex-1 bg-white border border-[#1a1a1a]/10 px-3 py-2 text-sm focus:outline-none focus:border-[#1a1a1a]/30 placeholder:text-[#8e8a82]/40"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onAddCategory();
                  }
                }}
              />
              <button 
                type="button"
                onClick={onAddCategory}
                className="bg-[#1a1a1a] text-white px-4 py-2 text-xs font-bold hover:bg-black transition-colors flex items-center justify-center gap-1"
              >
                <Plus size={14} /> ADICIONAR
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
              {categories.length === 0 && (
                <p className="text-sm text-[#8e8a82] text-center py-4">Nenhuma categoria criada.</p>
              )}
              {categories.map(cat => {
                const count = images.filter(i => i.category === cat).length;
                return (
                  <div key={cat} className="flex items-center justify-between bg-white border border-[#1a1a1a]/10 p-3 rounded-sm">
                    <div className="flex items-center gap-3">
                      <Tags size={14} className="text-[#8e8a82]" />
                      <span className="text-sm font-medium text-[#1a1a1a]">{cat}</span>
                      <span className="text-[10px] text-[#8e8a82] bg-[#f5f2ed] px-2 py-0.5 rounded-full">{count} fotos</span>
                    </div>
                    <button
                      onClick={() => onDeleteCategory(cat)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Eliminar categoria"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
