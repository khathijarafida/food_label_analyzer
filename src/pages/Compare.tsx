import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitCompareArrows, X, ScanLine, Trophy, Check, ArrowRight } from 'lucide-react';
import { useScan, type PendingScan } from '@/context/ScanContext';
import { HealthScoreRing } from '@/components/HealthScoreRing';
import { FoodGradeBadge } from '@/components/FoodGradeBadge';
import { scoreColor } from '@/lib/colors';

export default function Compare() {
  const navigate = useNavigate();
  const { compareLeft, compareRight, setCompareLeft, setCompareRight } = useScan();
  const [winner, setWinner] = useState<'left' | 'right' | 'tie' | null>(null);

  useEffect(() => {
    if (compareLeft && compareRight) {
      if (compareLeft.analysis.healthScore > compareRight.analysis.healthScore) setWinner('left');
      else if (compareRight.analysis.healthScore > compareLeft.analysis.healthScore) setWinner('right');
      else setWinner('tie');
    } else {
      setWinner(null);
    }
  }, [compareLeft, compareRight]);

  const startScanFor = (side: 'left' | 'right') => {
    navigate('/scan');
  };

  const renderSlot = (scan: PendingScan | null, side: 'left' | 'right') => {
    const setter = side === 'left' ? setCompareLeft : setCompareRight;
    if (!scan) {
      return (
        <div className="glass-card p-8 flex flex-col items-center text-center min-h-[400px] justify-center">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <ScanLine className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 mb-4">Scan a product to compare</p>
          <button onClick={() => startScanFor(side)} className="btn-primary">
            <ScanLine className="h-4 w-4" /> Scan Product
          </button>
        </div>
      );
    }
    return (
      <div className={`glass-card p-6 ${winner === side ? 'ring-2 ring-primary-500' : ''}`}>
        <div className="flex items-start justify-between mb-4">
          {scan.imageUrl ? (
            <img src={scan.imageUrl} alt="" className="h-20 w-20 rounded-xl object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          ) : (
            <div className="h-20 w-20 rounded-xl bg-slate-100 dark:bg-slate-800" />
          )}
          <button onClick={() => setter(null)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="h-4 w-4" />
          </button>
        </div>
        <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white truncate">{scan.productName}</h3>
        <p className="text-sm text-slate-500 mb-4">{scan.brand || 'Unknown brand'}</p>

        <div className="flex items-center justify-center gap-6 mb-4">
          <HealthScoreRing score={scan.analysis.healthScore} size={100} />
          <FoodGradeBadge grade={scan.analysis.foodGrade} size="lg" />
        </div>

        {winner === side && (
          <div className="mb-4 flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400 font-medium">
            <Trophy className="h-5 w-5" /> Healthier Option
          </div>
        )}

        <div className="space-y-2">
          {[
            { label: 'Calories', l: scan.nutrition.calories, unit: 'kcal' },
            { label: 'Protein', l: scan.nutrition.protein, unit: 'g' },
            { label: 'Sugar', l: scan.nutrition.sugar, unit: 'g' },
            { label: 'Fat', l: scan.nutrition.fat, unit: 'g' },
            { label: 'Saturated Fat', l: scan.nutrition.saturatedFat, unit: 'g' },
            { label: 'Sodium', l: scan.nutrition.sodium, unit: 'mg' },
            { label: 'Fiber', l: scan.nutrition.fiber, unit: 'g' },
          ].map((row) => (
            <div key={row.label} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0 text-sm">
              <span className="text-slate-600 dark:text-slate-300">{row.label}</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {row.l != null ? `${row.l} ${row.unit}` : '—'}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium text-slate-500 mb-2">Ingredients: {scan.ingredients.length}</p>
          <div className="flex gap-2 flex-wrap">
            <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              Safe: {scan.analysis.ingredientAnalysis.filter((i) => i.classification === 'safe').length}
            </span>
            <span className="badge bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">
              Moderate: {scan.analysis.ingredientAnalysis.filter((i) => i.classification === 'moderate').length}
            </span>
            <span className="badge bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-300">
              Harmful: {scan.analysis.ingredientAnalysis.filter((i) => i.classification === 'harmful').length}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-slate-900 dark:text-white flex items-center gap-2">
          <GitCompareArrows className="h-7 w-7 text-primary-500" /> Compare Products
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Compare two products side by side to find the healthier option</p>
      </div>

      {winner && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 flex items-center gap-3"
        >
          <Trophy className="h-6 w-6 text-primary-500 flex-shrink-0" />
          <p className="text-slate-700 dark:text-slate-200">
            {winner === 'tie'
              ? "It's a tie — both products have the same health score."
              : `${winner === 'left' ? compareLeft?.productName : compareRight?.productName} is the healthier choice with a higher health score.`}
          </p>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        {renderSlot(compareLeft, 'left')}
        {renderSlot(compareRight, 'right')}
      </div>

      {compareLeft && compareRight && (
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-4">Detailed Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">Metric</th>
                  <th className="text-center py-3 px-2 text-slate-900 dark:text-white font-medium">{compareLeft.productName.slice(0, 20)}</th>
                  <th className="text-center py-3 px-2 text-slate-900 dark:text-white font-medium">{compareRight.productName.slice(0, 20)}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 dark:border-slate-700/50">
                  <td className="py-3 px-2 text-slate-600 dark:text-slate-300">Health Score</td>
                  <td className={`text-center py-3 px-2 font-bold ${scoreColor(compareLeft.analysis.healthScore)}`}>{compareLeft.analysis.healthScore}</td>
                  <td className={`text-center py-3 px-2 font-bold ${scoreColor(compareRight.analysis.healthScore)}`}>{compareRight.analysis.healthScore}</td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-700/50">
                  <td className="py-3 px-2 text-slate-600 dark:text-slate-300">Food Grade</td>
                  <td className="text-center py-3 px-2"><FoodGradeBadge grade={compareLeft.analysis.foodGrade} size="sm" /></td>
                  <td className="text-center py-3 px-2"><FoodGradeBadge grade={compareRight.analysis.foodGrade} size="sm" /></td>
                </tr>
                {[
                  { label: 'Calories', l: compareLeft.nutrition.calories, r: compareRight.nutrition.calories, unit: 'kcal', lower: true },
                  { label: 'Sugar', l: compareLeft.nutrition.sugar, r: compareRight.nutrition.sugar, unit: 'g', lower: true },
                  { label: 'Sodium', l: compareLeft.nutrition.sodium, r: compareRight.nutrition.sodium, unit: 'mg', lower: true },
                  { label: 'Saturated Fat', l: compareLeft.nutrition.saturatedFat, r: compareRight.nutrition.saturatedFat, unit: 'g', lower: true },
                  { label: 'Protein', l: compareLeft.nutrition.protein, r: compareRight.nutrition.protein, unit: 'g', lower: false },
                  { label: 'Fiber', l: compareLeft.nutrition.fiber, r: compareRight.nutrition.fiber, unit: 'g', lower: false },
                ].map((row) => (
                  <tr key={row.label} className="border-b border-slate-100 dark:border-slate-700/50">
                    <td className="py-3 px-2 text-slate-600 dark:text-slate-300">{row.label}</td>
                    <td className={`text-center py-3 px-2 ${row.l != null && row.r != null && ((row.lower && row.l < row.r) || (!row.lower && row.l > row.r)) ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-slate-700 dark:text-slate-200'}`}>
                      {row.l != null ? `${row.l} ${row.unit}` : '—'}
                    </td>
                    <td className={`text-center py-3 px-2 ${row.l != null && row.r != null && ((row.lower && row.r < row.l) || (!row.lower && row.r > row.l)) ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-slate-700 dark:text-slate-200'}`}>
                      {row.r != null ? `${row.r} ${row.unit}` : '—'}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="py-3 px-2 text-slate-600 dark:text-slate-300">Allergens</td>
                  <td className="text-center py-3 px-2 text-slate-700 dark:text-slate-200">{compareLeft.allergens.length > 0 ? compareLeft.allergens.join(', ') : 'None'}</td>
                  <td className="text-center py-3 px-2 text-slate-700 dark:text-slate-200">{compareRight.allergens.length > 0 ? compareRight.allergens.join(', ') : 'None'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-2">
        <Check className="h-4 w-4 text-primary-500" />
        <p className="text-sm text-slate-500">Green values indicate the better option for that metric.</p>
      </div>
    </div>
  );
}
