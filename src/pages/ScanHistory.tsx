import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Trash2, Heart, Download, ScanLine, Filter, X, Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { FoodGradeBadge } from '@/components/FoodGradeBadge';
import { scoreColor } from '@/lib/colors';
import { generateReport } from '@/lib/report';
import type { Scan as ScanType } from '@/types';
import type { AnalysisResult, NutritionFacts } from '@/lib/analysis';

export default function ScanHistory() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [scans, setScans] = useState<ScanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'favorite' | 'healthy' | 'unhealthy'>('all');

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', profile.id)
        .order('scanned_at', { ascending: false });
      setScans((data as ScanType[]) ?? []);
      setLoading(false);
    })();
  }, [profile]);

  const filtered = scans.filter((s) => {
    if (filter === 'favorite' && !s.is_favorite) return false;
    if (filter === 'healthy' && s.health_score < 75) return false;
    if (filter === 'unhealthy' && s.health_score >= 40) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.product_name.toLowerCase().includes(q) ||
        s.brand.toLowerCase().includes(q) ||
        (s.barcode ?? '').includes(q)
      );
    }
    return true;
  });

  const toggleFavorite = async (id: string, current: boolean) => {
    await supabase.from('scans').update({ is_favorite: !current }).eq('id', id);
    setScans((prev) => prev.map((s) => (s.id === id ? { ...s, is_favorite: !current } : s)));
  };

  const deleteScan = async (id: string) => {
    await supabase.from('scans').delete().eq('id', id);
    setScans((prev) => prev.filter((s) => s.id !== id));
  };

  const downloadReport = (scan: ScanType) => {
    const analysis: AnalysisResult = {
      healthScore: scan.health_score,
      foodGrade: scan.food_grade,
      ingredientAnalysis: scan.ingredient_analysis ?? [],
      allergens: scan.allergens ?? [],
      additives: scan.additives ?? [],
      recommendations: scan.recommendations ?? {},
      warnings: [],
      positives: [],
      scoreBreakdown: [],
    };
    generateReport({
      barcode: scan.barcode,
      productName: scan.product_name,
      brand: scan.brand,
      category: scan.category,
      imageUrl: scan.image_url,
      ingredients: scan.ingredients,
      nutrition: scan.nutrition as NutritionFacts,
      allergens: scan.allergens,
      additives: scan.additives,
      analysis,
    });
  };

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'favorite', label: 'Favorites' },
    { id: 'healthy', label: 'Healthy' },
    { id: 'unhealthy', label: 'Unhealthy' },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-slate-900 dark:text-white">Scan History</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Search, filter, and manage your past scans</p>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-11"
              placeholder="Search by name, brand, or barcode…"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-8 text-center text-slate-500">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <ScanLine className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 mb-4">No scans found. Start by scanning a product.</p>
          <button onClick={() => navigate('/scan')} className="btn-primary">
            <ScanLine className="h-4 w-4" /> Scan Product
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((scan) => (
              <motion.div
                key={scan.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card p-4 flex flex-col"
              >
                <div className="flex items-start gap-3">
                  {scan.image_url ? (
                    <img src={scan.image_url} alt="" className="h-16 w-16 rounded-xl object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <div className="h-16 w-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <ScanLine className="h-6 w-6 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">{scan.product_name}</p>
                    <p className="text-xs text-slate-500 truncate">{scan.brand || 'Unknown'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(scan.scanned_at).toLocaleDateString()}</p>
                  </div>
                  <FoodGradeBadge grade={scan.food_grade} size="sm" />
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full ${scan.health_score >= 75 ? 'bg-primary-500' : scan.health_score >= 40 ? 'bg-accent-500' : 'bg-danger-500'}`}
                      style={{ width: `${scan.health_score}%` }}
                    />
                  </div>
                  <span className={`text-sm font-bold ${scoreColor(scan.health_score)}`}>{scan.health_score}</span>
                </div>

                {scan.allergens.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {scan.allergens.slice(0, 3).map((a) => (
                      <span key={a} className="badge bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300 text-[10px]">
                        {a}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(scan.id, scan.is_favorite)}
                    className={`p-2 rounded-lg transition-all ${scan.is_favorite ? 'text-danger-500 bg-danger-50 dark:bg-danger-950/30' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    title="Favorite"
                  >
                    <Heart className={`h-4 w-4 ${scan.is_favorite ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => downloadReport(scan)}
                    className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    title="Download report"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteScan(scan.id)}
                    className="p-2 rounded-lg text-slate-400 hover:bg-danger-50 hover:text-danger-500 dark:hover:bg-danger-950/30 transition-all ml-auto"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
