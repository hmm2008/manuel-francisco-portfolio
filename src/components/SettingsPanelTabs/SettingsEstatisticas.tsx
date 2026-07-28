import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, Legend 
} from 'recharts';
import { 
  Heart, Eye, Image as ImageIcon, Sparkles, TrendingUp, Award, Layers, RefreshCw
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { ImageProps } from '../../types';

interface SettingsEstatisticasProps {
  // Optional override or fallback images
}

export default function SettingsEstatisticas() {
  const [loading, setLoading] = useState(true);
  const [photosList, setPhotosList] = useState<ImageProps[]>([]);
  const [sortByField, setSortByField] = useState<'likes' | 'views' | 'title'>('likes');

  // Fetch photos and real statistics from Firestore
  const fetchStats = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'images'));
      const loadedPhotos: ImageProps[] = [];
      snap.forEach(docSnap => {
        const data = docSnap.data();
        loadedPhotos.push({
          id: docSnap.id,
          title: data.title || 'Sem Título',
          subtitle: data.subtitle || '',
          category: data.category || 'Geral',
          url: data.url || data.imageUrl || '',
          likes: typeof data.likes === 'number' ? data.likes : 0,
          views: typeof data.views === 'number' ? data.views : 0,
          order: data.order || 0
        } as any);
      });

      if (loadedPhotos.length === 0) {
        // Fallback demo data if database is empty
        const demoPhotos: ImageProps[] = [
          { id: '1', title: 'Serenidade ao Pôr do Sol', category: 'Paisagem', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800', likes: 84, views: 520 },
          { id: '2', title: 'Olhares em Preto e Branco', category: 'Retrato', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800', likes: 67, views: 410 },
          { id: '3', title: 'Arquitetura Contemporânea', category: 'Arquitetura', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800', likes: 52, views: 380 },
          { id: '4', title: 'Reflexos Urbanos', category: 'Urbano', url: 'https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?w=800', likes: 49, views: 290 },
          { id: '5', title: 'Silêncio da Montanha', category: 'Paisagem', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', likes: 45, views: 310 },
          { id: '6', title: 'Detalhes da Natureza', category: 'Macro', url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800', likes: 38, views: 240 },
          { id: '7', title: 'Luzes da Noite', category: 'Urbano', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800', likes: 31, views: 195 },
          { id: '8', title: 'Expressões Humanas', category: 'Retrato', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', likes: 29, views: 180 },
        ] as any;
        setPhotosList(demoPhotos);
      } else {
        setPhotosList(loadedPhotos);
      }
    } catch (e) {
      console.error('Error loading stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Calculate totals
  const totalPhotos = photosList.length;
  const totalLikes = useMemo(() => photosList.reduce((acc, p) => acc + (p.likes || 0), 0), [photosList]);
  const totalViews = useMemo(() => photosList.reduce((acc, p) => acc + (p.views || 0), 0), [photosList]);
  
  const mostPopularPhoto = useMemo(() => {
    if (photosList.length === 0) return null;
    return [...photosList].sort((a, b) => (b.likes || 0) - (a.likes || 0))[0];
  }, [photosList]);

  // Data for Top Liked Photos chart
  const topLikedData = useMemo(() => {
    return [...photosList]
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 7)
      .map(p => ({
        name: p.title.length > 18 ? p.title.substring(0, 16) + '...' : p.title,
        likes: p.likes || 0,
        fullTitle: p.title
      }));
  }, [photosList]);

  // Data for Top Viewed Photos chart
  const topViewedData = useMemo(() => {
    return [...photosList]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 7)
      .map(p => ({
        name: p.title.length > 18 ? p.title.substring(0, 16) + '...' : p.title,
        views: p.views || 0,
        fullTitle: p.title
      }));
  }, [photosList]);

  // Data for Category breakdown
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    photosList.forEach(p => {
      const cat = p.category || 'Geral';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [photosList]);

  const COLORS = ['#1a1a1a', '#d97706', '#4b5563', '#9ca3af', '#6b7280', '#059669', '#d97706'];

  // Table sorted list
  const sortedTablePhotos = useMemo(() => {
    return [...photosList].sort((a, b) => {
      if (sortByField === 'likes') return (b.likes || 0) - (a.likes || 0);
      if (sortByField === 'views') return (b.views || 0) - (a.views || 0);
      return a.title.localeCompare(b.title);
    });
  }, [photosList, sortByField]);

  return (
    <div className="space-y-8 text-[#1a1a1a]">
      {/* Header section with refresh button */}
      <div className="bg-white p-6 rounded-xl border border-[#e5e0d8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-[0.2em] text-[#8e8a82] uppercase font-bold block mb-1 flex items-center gap-1.5">
            <TrendingUp size={14} className="text-amber-600" /> Relatório de Atividade do Portfólio
          </span>
          <h2 className="font-serif text-2xl text-[#1a1a1a]">Estatísticas & Desempenho</h2>
          <p className="text-xs text-[#666] mt-0.5">Visão detalhada sobre a interação dos visitantes com as suas obras fotográficas.</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#f8f7f5] hover:bg-[#eae6df] border border-[#d8d3c9] text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] rounded-lg transition-all"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'A Atualizar...' : 'Atualizar Dados'}
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#e5e0d8] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#8e8a82] font-semibold block">Total de Fotos</span>
            <span className="text-2xl font-bold font-mono text-[#1a1a1a]">{totalPhotos}</span>
            <span className="text-[10px] text-[#8e8a82] block mt-0.5">no portfólio</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#f8f7f5] flex items-center justify-center text-[#1a1a1a]">
            <ImageIcon size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e5e0d8] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#8e8a82] font-semibold block">Total de Curtidas</span>
            <span className="text-2xl font-bold font-mono text-red-600">{totalLikes}</span>
            <span className="text-[10px] text-[#8e8a82] block mt-0.5">refeitas por visitantes</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <Heart size={20} fill="currentColor" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e5e0d8] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#8e8a82] font-semibold block">Visualizações Totais</span>
            <span className="text-2xl font-bold font-mono text-amber-600">{totalViews}</span>
            <span className="text-[10px] text-[#8e8a82] block mt-0.5">em sessões ativas</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <Eye size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e5e0d8] shadow-xs flex items-center justify-between">
          <div className="overflow-hidden pr-2">
            <span className="text-[10px] uppercase tracking-wider text-[#8e8a82] font-semibold block">Fotografia Mais Popular</span>
            <span className="text-sm font-bold text-[#1a1a1a] truncate block" title={mostPopularPhoto?.title}>
              {mostPopularPhoto?.title || 'N/A'}
            </span>
            <span className="text-[10px] text-red-500 font-semibold block mt-0.5 flex items-center gap-1">
              <Heart size={10} fill="currentColor" /> {mostPopularPhoto?.likes || 0} curtidas
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <Award size={20} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Most Liked Photos */}
        <div className="bg-white p-6 rounded-xl border border-[#e5e0d8] shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#f0ece5]">
            <div>
              <h3 className="font-serif text-lg text-[#1a1a1a] flex items-center gap-2">
                <Heart size={16} className="text-red-500 fill-red-500" /> Fotografias Mais Curtidas
              </h3>
              <p className="text-[11px] text-[#7a7a7a]">Top 7 fotos com maior número de corações recebidos.</p>
            </div>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topLikedData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#666' }} 
                  interval={0} 
                  angle={-15} 
                  textAnchor="end" 
                />
                <YAxis tick={{ fontSize: 10, fill: '#666' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                />
                <Bar dataKey="likes" radius={[4, 4, 0, 0]}>
                  {topLikedData.map((_, index) => (
                    <Cell key={`cell-like-${index}`} fill={index === 0 ? '#ef4444' : '#f87171'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Most Viewed Photos */}
        <div className="bg-white p-6 rounded-xl border border-[#e5e0d8] shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#f0ece5]">
            <div>
              <h3 className="font-serif text-lg text-[#1a1a1a] flex items-center gap-2">
                <Eye size={16} className="text-amber-600" /> Fotografias Mais Visualizadas
              </h3>
              <p className="text-[11px] text-[#7a7a7a]">Top 7 fotos mais abertas em visualização completa / lightbox.</p>
            </div>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topViewedData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#666' }} 
                  interval={0} 
                  angle={-15} 
                  textAnchor="end" 
                />
                <YAxis tick={{ fontSize: 10, fill: '#666' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                />
                <Bar dataKey="views" radius={[4, 4, 0, 0]}>
                  {topViewedData.map((_, index) => (
                    <Cell key={`cell-view-${index}`} fill={index === 0 ? '#d97706' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Distribution by Category */}
      <div className="bg-white p-6 rounded-xl border border-[#e5e0d8] shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-[#f0ece5]">
          <div>
            <h3 className="font-serif text-lg text-[#1a1a1a] flex items-center gap-2">
              <Layers size={16} className="text-[#1a1a1a]" /> Distribuição por Categoria
            </h3>
            <p className="text-[11px] text-[#7a7a7a]">Proporção do acervo fotográfico categorizado no site.</p>
          </div>
        </div>
        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {categoryData.map((_, index) => (
                  <Cell key={`cell-cat-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }} />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Photo Table */}
      <div className="bg-white p-6 rounded-xl border border-[#e5e0d8] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-[#f0ece5]">
          <div>
            <h3 className="font-serif text-lg text-[#1a1a1a]">Desempenho Detalhado do Acervo</h3>
            <p className="text-[11px] text-[#7a7a7a]">Lista completa das fotografias e respetivos indicadores de interesse.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8e8a82]">Ordenar por:</span>
            <select
              value={sortByField}
              onChange={(e) => setSortByField(e.target.value as any)}
              className="px-3 py-1.5 bg-[#f8f7f5] border border-[#d8d3c9] text-xs font-medium rounded-md focus:outline-none"
            >
              <option value="likes">Mais Curtidas</option>
              <option value="views">Mais Visualizadas</option>
              <option value="title">Título (A-Z)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e5e0d8] text-[#8e8a82] uppercase text-[10px] tracking-wider">
                <th className="py-3 px-2">Fotografia</th>
                <th className="py-3 px-2">Título</th>
                <th className="py-3 px-2">Categoria</th>
                <th className="py-3 px-2 text-center">Curtidas</th>
                <th className="py-3 px-2 text-center">Visualizações</th>
                <th className="py-3 px-2 text-right">Métrica Envolvimento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece5]">
              {sortedTablePhotos.map((photo, idx) => {
                const engagement = photo.views ? Math.min(100, Math.round(((photo.likes || 0) / photo.views) * 100)) : 0;
                return (
                  <tr key={photo.id || idx} className="hover:bg-[#fcfbf9] transition-colors">
                    <td className="py-2.5 px-2">
                      <div className="w-12 h-9 rounded bg-gray-100 overflow-hidden border border-[#e5e0d8]">
                        <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="py-2.5 px-2 font-semibold text-[#1a1a1a]">
                      {photo.title}
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#f0ece5] text-[#555] text-[10px] uppercase tracking-wider font-semibold">
                        {photo.category || 'Geral'}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-semibold text-red-600">
                      {photo.likes || 0}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-semibold text-amber-700">
                      {photo.views || 0}
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        engagement > 15 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        <Sparkles size={10} /> {engagement}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
