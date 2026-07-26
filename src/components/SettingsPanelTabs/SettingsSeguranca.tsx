import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Code, Accessibility, Database, Download, Loader2, FileSpreadsheet } from 'lucide-react';
import { SiteSettings } from '../../types';
import { SettingRow, SettingToggle } from './SharedComponents';
import { db } from '../../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

interface SettingsSegurancaProps {
  settings: SiteSettings;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function SettingsSeguranca({ settings, handleChange }: SettingsSegurancaProps) {
  const [isExportingImages, setIsExportingImages] = useState(false);
  const [isExportingSignatures, setIsExportingSignatures] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const downloadCSV = (data: any[], headers: string[], keys: string[], filename: string) => {
    // Semicolon separator ; is standard for Portuguese and European Excel configurations
    const BOM = '\uFEFF'; // UTF-8 Byte Order Mark to ensure Excel parses accents (ã, ó, é, ç) correctly
    const csvContent = data.map(row => {
      return keys.map(key => {
        let val = row[key];
        if (val === undefined || val === null) {
          val = '';
        } else {
          // Escape quotes and convert value to string
          val = String(val).replace(/"/g, '""');
          // Wrap in quotes if it contains separator, newlines, or quotes
          if (val.includes(';') || val.includes('\n') || val.includes('\r') || val.includes('"')) {
            val = `"${val}"`;
          }
        }
        return val;
      }).join(';');
    }).join('\r\n');

    const csvString = BOM + headers.join(';') + '\r\n' + csvContent;
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportImages = async () => {
    setIsExportingImages(true);
    setExportError(null);
    setExportSuccess(null);
    try {
      const q = query(collection(db, 'images'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data: any[] = [];
      
      snapshot.forEach(doc => {
        const docData = doc.data();
        let dateStr = '';
        if (docData.createdAt) {
          if (typeof docData.createdAt.toDate === 'function') {
            dateStr = docData.createdAt.toDate().toLocaleString('pt-PT');
          } else if (docData.createdAt.seconds) {
            dateStr = new Date(docData.createdAt.seconds * 1000).toLocaleString('pt-PT');
          } else {
            dateStr = String(docData.createdAt);
          }
        }
        data.push({
          id: doc.id,
          title: docData.title || '',
          category: docData.category || '',
          description: docData.description || '',
          url: docData.url || '',
          originalUrl: docData.originalUrl || '',
          camera: docData.camera || '',
          lens: docData.lens || '',
          shutterSpeed: docData.shutterSpeed || '',
          aperture: docData.aperture || '',
          iso: docData.iso || '',
          focalLength: docData.focalLength || '',
          createdAt: dateStr
        });
      });

      const headers = [
        'ID Documento', 
        'Título', 
        'Categoria', 
        'Descrição', 
        'URL Miniatura', 
        'URL Original', 
        'Câmara', 
        'Lente', 
        'Velocidade', 
        'Abertura', 
        'ISO', 
        'Distância Focal', 
        'Data de Upload'
      ];

      const keys = [
        'id', 
        'title', 
        'category', 
        'description', 
        'url', 
        'originalUrl', 
        'camera', 
        'lens', 
        'shutterSpeed', 
        'aperture', 
        'iso', 
        'focalLength', 
        'createdAt'
      ];

      if (data.length === 0) {
        setExportError('A base de dados de imagens está vazia.');
        return;
      }

      downloadCSV(data, headers, keys, `galeria_fotos_${new Date().toISOString().split('T')[0]}.csv`);
      setExportSuccess('Galeria de fotos exportada com sucesso!');
    } catch (error) {
      console.error("Error exporting images:", error);
      setExportError('Erro ao exportar dados da galeria: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsExportingImages(false);
    }
  };

  const handleExportSignatures = async () => {
    setIsExportingSignatures(true);
    setExportError(null);
    setExportSuccess(null);
    try {
      const q = query(collection(db, 'signatures'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data: any[] = [];
      
      snapshot.forEach(doc => {
        const docData = doc.data();
        let dateStr = '';
        if (docData.createdAt) {
          if (typeof docData.createdAt.toDate === 'function') {
            dateStr = docData.createdAt.toDate().toLocaleString('pt-PT');
          } else if (docData.createdAt.seconds) {
            dateStr = new Date(docData.createdAt.seconds * 1000).toLocaleString('pt-PT');
          } else {
            dateStr = String(docData.createdAt);
          }
        }
        data.push({
          id: doc.id,
          name: docData.name || '',
          message: docData.message || '',
          createdAt: dateStr
        });
      });

      const headers = [
        'ID Registo', 
        'Nome do Autor', 
        'Mensagem / Comentário', 
        'Data de Assinatura'
      ];

      const keys = [
        'id', 
        'name', 
        'message', 
        'createdAt'
      ];

      if (data.length === 0) {
        setExportError('O livro de visitas está vazio.');
        return;
      }

      downloadCSV(data, headers, keys, `livro_visitas_${new Date().toISOString().split('T')[0]}.csv`);
      setExportSuccess('Livro de visitas exportado com sucesso!');
    } catch (error) {
      console.error("Error exporting signatures:", error);
      setExportError('Erro ao exportar dados do livro de visitas: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsExportingSignatures(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Segurança */}
      <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="border-b border-[#f0ece5] pb-4">
          <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
            <ShieldCheck size={20} className="text-[#8e8a82]" /> Acesso e Segurança
          </h2>
        </div>
        
        <SettingRow
          label="CÓDIGO DE ACESSO DO ADMINISTRADOR"
          name="adminPassword"
          type="password"
          value={settings.adminPassword}
          onChange={handleChange}
        />
        <p className="text-[11px] text-[#8e8a82] font-sans -mt-4">
          Esta palavra-passe é pedida caso a sessão do Google não seja reconhecida.
        </p>
      </div>

      {/* Exportação de Dados */}
      <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="border-b border-[#f0ece5] pb-4">
          <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
            <Database size={20} className="text-[#8e8a82]" /> Cópia de Segurança & Exportação
          </h2>
        </div>
        
        <p className="text-xs text-[#5a5a5a] font-sans leading-relaxed">
          Exporte os dados em formato CSV totalmente otimizado para o <strong>Microsoft Excel</strong>.
          Os ficheiros incluem cabeçalhos completos, separadores de ponto e vírgula (;) padrão português e codificação de caracteres UTF-8 para garantir a correta leitura de acentos e caracteres especiais.
        </p>

        {exportError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-sans rounded-sm">
            {exportError}
          </div>
        )}

        {exportSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs font-sans rounded-sm">
            {exportSuccess}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Export Images Button */}
          <button
            type="button"
            onClick={handleExportImages}
            disabled={isExportingImages}
            className="flex items-center justify-between gap-3 p-4 border border-[#e8e4dc] hover:border-[#1a1a1a]/50 hover:bg-[#fcfbf9] transition-all text-left rounded-sm group disabled:opacity-50"
          >
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="text-[#8e8a82] mt-0.5 shrink-0 group-hover:text-[#1a1a1a] transition-colors" size={20} />
              <div>
                <h4 className="font-sans font-bold text-xs text-[#1a1a1a] uppercase tracking-wider mb-0.5">Galeria de Fotos</h4>
                <p className="text-[10px] text-[#8e8a82] font-sans leading-normal">
                  Metadados, EXIF, descrições e links das fotografias.
                </p>
              </div>
            </div>
            {isExportingImages ? (
              <Loader2 size={16} className="animate-spin text-[#1a1a1a] shrink-0" />
            ) : (
              <Download size={16} className="text-[#8e8a82] shrink-0 group-hover:text-[#1a1a1a] transition-colors" />
            )}
          </button>

          {/* Export Guestbook Button */}
          <button
            type="button"
            onClick={handleExportSignatures}
            disabled={isExportingSignatures}
            className="flex items-center justify-between gap-3 p-4 border border-[#e8e4dc] hover:border-[#1a1a1a]/50 hover:bg-[#fcfbf9] transition-all text-left rounded-sm group disabled:opacity-50"
          >
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="text-[#8e8a82] mt-0.5 shrink-0 group-hover:text-[#1a1a1a] transition-colors" size={20} />
              <div>
                <h4 className="font-sans font-bold text-xs text-[#1a1a1a] uppercase tracking-wider mb-0.5">Livro de Visitas</h4>
                <p className="text-[10px] text-[#8e8a82] font-sans leading-normal">
                  Assinaturas, comentários, autores e datas de registo.
                </p>
              </div>
            </div>
            {isExportingSignatures ? (
              <Loader2 size={16} className="animate-spin text-[#1a1a1a] shrink-0" />
            ) : (
              <Download size={16} className="text-[#8e8a82] shrink-0 group-hover:text-[#1a1a1a] transition-colors" />
            )}
          </button>
        </div>
      </div>

      {/* Acessibilidade e Legal */}
      <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="border-b border-[#f0ece5] pb-4">
          <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
            <Accessibility size={20} className="text-[#8e8a82]" /> Preferências e Legal
          </h2>
        </div>

        <div className="space-y-4">
          <SettingToggle
            label="REDUZIR ANIMAÇÕES"
            name="reduceAnimations"
            checked={settings.reduceAnimations}
            onChange={handleChange}
            description="Desativa movimentos de transição para maior acessibilidade."
          />
          <SettingToggle
            label="AVISO DE COOKIES"
            name="enableCookieConsent"
            checked={settings.enableCookieConsent || false}
            onChange={handleChange}
            description="Apresenta o banner de consentimento de cookies na primeira visita."
          />
          <SettingToggle
            label="MODO DE MANUTENÇÃO"
            name="maintenanceMode"
            checked={settings.maintenanceMode || false}
            onChange={handleChange}
            description="Oculta o site para o público geral enquanto trabalha nele."
          />
        </div>
      </div>

      {/* Custom CSS */}
      <div className="bg-white border border-[#e8e4dc] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="border-b border-[#f0ece5] pb-4">
          <h2 className="font-serif text-xl text-[#1a1a1a] flex items-center gap-2">
            <Code size={20} className="text-[#8e8a82]" /> CSS Personalizado Avançado
          </h2>
        </div>

        <SettingRow
          label="CÓDIGO CSS"
          name="customCss"
          type="textarea"
          value={settings.customCss || ''}
          onChange={handleChange}
          rows={6}
          placeholder="/* Insira regras CSS globais aqui */&#10;.custom-class {&#10;  color: red;&#10;}"
        />
        <p className="text-[11px] text-[#8e8a82] font-sans -mt-4">
          Aviso: CSS mal formatado pode quebrar a estrutura visual do site.
        </p>
      </div>
    </motion.div>
  );
}
