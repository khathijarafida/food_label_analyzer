import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, Loader2, Barcode, X, ScanLine } from 'lucide-react';
import { searchProducts, lookupBarcode } from '@/lib/barcode';
import { analyzeProduct, type NutritionFacts } from '@/lib/analysis';
import { useScan, type PendingScan } from '@/context/ScanContext';
import { FoodGradeBadge } from '@/components/FoodGradeBadge';
import type { SearchResult } from '@/lib/barcode';

export default function Search() {
  const navigate = useNavigate();
  const { setPendingScan } = useScan();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    const data = await searchProducts(query);
    setResults(data);
    setLoading(false);
  }, [query]);

  const handleBarcodeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (barcodeInput.trim().length < 6) return;
    setLoading(true);
    setSearched(true);
    const product = await lookupBarcode(barcodeInput.trim());
    const analysis = analyzeProduct(product.ingredients, product.nutrition);
    const pending: PendingScan = {
      barcode: product.barcode,
      productName: product.productName,
      brand: product.brand,
      category: product.category,
      imageUrl: product.imageUrl,
      ingredients: product.ingredients,
      nutrition: product.nutrition,
      allergens: product.allergens,
      additives: product.additives,
      analysis,
    };
    setPendingScan(pending);
    navigate('/analysis');
  };

  const handleResultClick = async (result: SearchResult) => {
    setLoading(true);
    const product = await lookupBarcode(result.barcode);
    const nutrition: NutritionFacts = result.nutrition;
    const analysis = analyzeProduct(product.ingredients.length > 0 ? product.ingredients : [], nutrition);
    setPendingScan({
      barcode: result.barcode,
      productName: result.productName,
      brand: result.brand,
      category: result.category,
      imageUrl: result.imageUrl,
      ingredients: product.ingredients,
      nutrition,
      allergens: product.allergens,
      additives: product.additives,
      analysis,
    });
    navigate('/analysis');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-slate-900 dark:text-white">Search Products</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Search by product name, brand, or enter a barcode directly</p>
      </div>

      <div className="glass-card p-5">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-field pl-11"
              placeholder="Search products, brands, categories…"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchIcon className="h-4 w-4" />}
            Search
          </button>
        </form>

        <div className="mt-3 border-t border-slate-200 dark:border-slate-700 pt-3">
          <form onSubmit={handleBarcodeSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="input-field pl-11"
                placeholder="Or enter a barcode number (e.g. 3017620422003)"
                inputMode="numeric"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-ghost">
              <Barcode className="h-4 w-4" /> Look Up
            </button>
          </form>
        </div>
      </div>

      {loading && (
        <div className="glass-card p-8 flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          <p className="mt-3 text-slate-500 text-sm">Searching products…</p>
        </div>
      )}

      <AnimatePresence>
        {!loading && searched && results.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
            <SearchIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No products found. Try a different search term.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && results.length > 0 && (
        <div>
          <p className="text-sm text-slate-500 mb-3">{results.length} products found</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((result) => (
              <motion.button
                key={result.barcode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleResultClick(result)}
                className="glass-card p-4 text-left hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="flex items-start gap-3">
                  {result.imageUrl ? (
                    <img src={result.imageUrl} alt="" className="h-16 w-16 rounded-xl object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <div className="h-16 w-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <ScanLine className="h-6 w-6 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white text-sm line-clamp-2">{result.productName}</p>
                    <p className="text-xs text-slate-500 truncate">{result.brand || 'Unknown'}</p>
                    {result.nutrition.calories != null && (
                      <p className="text-xs text-slate-400 mt-1">{result.nutrition.calories} kcal / 100g</p>
                    )}
                  </div>
                  {result.nutriscoreGrade && (
                    <FoodGradeBadge grade={result.nutriscoreGrade.toUpperCase()} size="sm" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
