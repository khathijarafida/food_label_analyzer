import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Save, Download, GitCompareArrows, AlertTriangle,
  ThumbsUp, ChevronDown, ChevronUp, Send, Bot, Sparkles, Cookie,
  Beef, Droplet, Flame, Wheat, Candy, Pill, User as UserIcon,
  CheckCircle2, Loader2, Star, Heart, Activity, TrendingUp, Lightbulb,
} from 'lucide-react';
import { useScan } from '@/context/ScanContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { HealthScoreRing } from '@/components/HealthScoreRing';
import { FoodGradeBadge } from '@/components/FoodGradeBadge';
import { generateReport } from '@/lib/report';
import {
  ingredientClassColor, ingredientClassDot, ingredientClassLabel,
  ingredientClassIcon, ingredientClassGroupTitle, ingredientClassGroupExplanation,
  healthRating,
} from '@/lib/colors';
import type { AnalysisResult, NutritionFacts } from '@/lib/analysis';

interface ChatMessage { role: 'user' | 'bot'; text: string }

function generateBotReply(question: string, productName: string, analysis: AnalysisResult, nutrition: NutritionFacts): string {
  const q = question.toLowerCase();
  if (/sugar/.test(q)) {
    const s = nutrition.sugar;
    return s != null
      ? `This product has ${s}g of sugar per serving. ${s > 15 ? 'That is quite high — regular consumption can spike blood sugar and contribute to weight gain.' : s > 5 ? 'Moderate sugar content. Fine in moderation.' : 'Low sugar, which is good.'}`
      : 'Sugar data is not available for this product.';
  }
  if (/protein/.test(q)) {
    const p = nutrition.protein;
    return p != null
      ? `This product has ${p}g of protein per serving. ${p > 10 ? 'Great protein content for muscle support.' : p > 5 ? 'Decent protein content.' : 'Low protein — look for richer sources if protein is your goal.'}`
      : 'Protein data is not available for this product.';
  }
  if (/calorie|energy/.test(q)) {
    const c = nutrition.calories;
    return c != null
      ? `This product has ${c} calories per serving. ${c > 400 ? 'That is calorie-dense — be mindful of portion sizes.' : c > 200 ? 'Moderate calories per serving.' : 'Low in calories per serving.'}`
      : 'Calorie data is not available for this product.';
  }
  if (/sodium|salt/.test(q)) {
    const s = nutrition.sodium;
    return s != null
      ? `This product has ${s}mg of sodium per serving. ${s > 400 ? 'High sodium — watch out if you have blood pressure concerns.' : 'Sodium is within a reasonable range.'}`
      : 'Sodium data is not available for this product.';
  }
  if (/safe|healthy|good|bad|recommend/.test(q)) {
    return `Based on my analysis, this product has a health score of ${analysis.healthScore}/100 (grade ${analysis.foodGrade}). ${analysis.warnings.length > 0 ? `Concerns: ${analysis.warnings[0]}` : 'No major concerns detected.'} ${analysis.positives.length > 0 ? `Positives: ${analysis.positives[0]}` : ''}`;
  }
  if (/ingredient/.test(q)) {
    const harmful = analysis.ingredientAnalysis.filter((i) => i.classification === 'harmful');
    if (harmful.length > 0) return `There are ${harmful.length} ingredient(s) flagged as harmful. For example: ${harmful[0].name} — ${harmful[0].reason}`;
    return 'No harmful ingredients were detected. Most ingredients appear safe.';
  }
  if (/allerg/.test(q)) {
    return analysis.allergens.length > 0
      ? `This product contains these allergens: ${analysis.allergens.join(', ')}. Avoid if you are sensitive to any of them.`
      : 'No common allergens were detected in the ingredient list.';
  }
  return `I can answer questions about ${productName}'s nutrition, ingredients, allergens, and whether it suits your health goals. Try asking about sugar, protein, calories, sodium, or ingredient safety.`;
}

function nutritionCard(
  label: string, value: number | undefined, unit: string, max: number,
  icon: React.ReactNode, gradient: string
) {
  const display = value != null ? value : 0;
  const pct = Math.min((display / max) * 100, 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`h-10 w-10 rounded-xl ${gradient} flex items-center justify-center`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold font-display text-slate-900">
            {value != null ? `${value}` : '—'}
          </p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">{unit}</p>
        </div>
      </div>
      <p className="text-sm font-medium text-slate-700 mb-2">{label}</p>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${gradient}`}
        />
      </div>
    </motion.div>
  );
}

export default function AnalysisResult() {
  const navigate = useNavigate();
  const { pendingScan, compareLeft, setCompareLeft, setCompareRight } = useScan();
  const { profile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedIngredient, setExpandedIngredient] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (!pendingScan) navigate('/scan');
  }, [pendingScan, navigate]);

  if (!pendingScan) return null;
  const { analysis } = pendingScan;
  const rating = healthRating(analysis.healthScore);

  const handleSave = async () => {
  if (!profile) return;
  setSaving(true);
  const { error } = await supabase.from('scans').insert({
    user_id: profile.id,
    barcode: pendingScan.barcode, product_name: pendingScan.productName, brand: pendingScan.brand,
    category: pendingScan.category, image_url: pendingScan.imageUrl, nutrition: pendingScan.nutrition,
    ingredients: pendingScan.ingredients, allergens: pendingScan.allergens, additives: pendingScan.additives,
    health_score: analysis.healthScore, food_grade: analysis.foodGrade,
    ingredient_analysis: analysis.ingredientAnalysis, recommendations: analysis.recommendations,
  });
  setSaving(false);
  if (!error) {
    setSaved(true);
  } else {
    console.error('Save scan error:', error);
    alert(`Could not save scan: ${error.message}`);
  }
};

  const handleDownload = () => generateReport(pendingScan);

  const handleCompare = () => {
    if (!compareLeft) { setCompareLeft(pendingScan); navigate('/compare'); }
    else { setCompareRight(pendingScan); navigate('/compare'); }
  };

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const reply = generateBotReply(chatInput, pendingScan.productName, analysis, pendingScan.nutrition);
    setChatMessages((m) => [...m, { role: 'user', text: chatInput }, { role: 'bot', text: reply }]);
    setChatInput('');
  };

  const userGoals = profile?.health_goals ?? [];
  const grouped = {
    safe: analysis.ingredientAnalysis.filter((i) => i.classification === 'safe'),
    moderate: analysis.ingredientAnalysis.filter((i) => i.classification === 'moderate'),
    harmful: analysis.ingredientAnalysis.filter((i) => i.classification === 'harmful'),
  };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/scan')} className="flex items-center gap-2 text-slate-600 hover:text-primary-600 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Scan
      </button>

      {/* Health Score Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 lg:p-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Health Score</h2>
          <HealthScoreRing score={analysis.healthScore} size={180} />
          <div className="mt-4 flex items-center gap-3">
            <FoodGradeBadge grade={analysis.foodGrade} size="md" />
            <span className="text-lg font-display font-bold text-slate-900">{pendingScan.productName}</span>
          </div>
          {pendingScan.brand && <p className="text-slate-500 mt-1">{pendingScan.brand}</p>}
          {pendingScan.barcode && <p className="text-xs text-slate-400 mt-1">Barcode: {pendingScan.barcode}</p>}
        </div>

        {pendingScan.imageUrl && (
          <div className="mt-6 flex justify-center">
            <img src={pendingScan.imageUrl} alt={pendingScan.productName} className="h-32 w-32 rounded-2xl object-cover shadow-md" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <button onClick={handleSave} disabled={saving || saved} className="btn-primary">
            {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved</> : saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save Scan</>}
          </button>
          <button onClick={handleDownload} className="btn-ghost"><Download className="h-4 w-4" /> PDF Report</button>
          <button onClick={handleCompare} className="btn-ghost"><GitCompareArrows className="h-4 w-4" /> Compare</button>
          <button onClick={() => setShowChat((s) => !s)} className="btn-ghost"><Bot className="h-4 w-4" /> Ask AI</button>
        </div>
      </motion.div>

      {/* Health Rating Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-100 to-mint-100 flex items-center justify-center">
            <Star className="h-7 w-7 text-primary-600 fill-primary-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-display font-bold text-xl text-slate-900">{rating.label}</h3>
              <span className="text-lg">{rating.emoji}</span>
            </div>
            <p className="text-sm text-slate-600 mt-2">{rating.explanation}</p>
          </div>
        </div>
      </motion.div>

      {/* AI Recommendations */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6">
        <h3 className="font-display font-semibold text-lg text-slate-900 flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary-500" /> AI Recommendations
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary-50 to-mint-50">
            <Activity className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-slate-900 text-sm">Overall Health Assessment</p>
              <p className="text-sm text-slate-600 mt-0.5">
                {analysis.healthScore >= 75 ? 'This product is a healthy choice with good nutritional quality.' : analysis.healthScore >= 50 ? 'This product has mixed nutritional quality. Consume in moderation.' : 'This product has poor nutritional quality. Consider healthier alternatives.'}
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-info-50">
              <TrendingUp className="h-5 w-5 text-info-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900 text-sm">Nutritional Strengths</p>
                <p className="text-sm text-slate-600 mt-0.5">
                  {analysis.positives.length > 0 ? analysis.positives.slice(0, 2).join(' ') : 'No significant nutritional strengths identified.'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-warning-50">
              <AlertTriangle className="h-5 w-5 text-warning-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900 text-sm">Nutritional Concerns</p>
                <p className="text-sm text-slate-600 mt-0.5">
                  {analysis.warnings.length > 0 ? analysis.warnings.slice(0, 2).join(' ') : 'No major nutritional concerns detected.'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-mint-50">
            <Lightbulb className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-slate-900 text-sm">Suggested Consumption Frequency</p>
              <p className="text-sm text-slate-600 mt-0.5">
                {analysis.healthScore >= 90 ? 'Can be consumed daily as part of a healthy diet.' : analysis.healthScore >= 75 ? 'Suitable for regular consumption, a few times per week.' : analysis.healthScore >= 50 ? 'Best limited to occasional consumption, 1-2 times per week.' : 'Avoid regular consumption. Seek healthier alternatives.'}
              </p>
            </div>
          </div>
          {analysis.healthScore < 75 && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary-50">
              <Heart className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900 text-sm">Healthier Alternatives</p>
                <p className="text-sm text-slate-600 mt-0.5">
                  Look for products with fewer additives, lower sugar and sodium, and more fiber and protein. Whole food options are always a better choice.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* AI Chatbot */}
      {showChat && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="card p-5">
          <h3 className="font-display font-semibold text-lg text-slate-900 flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary-500" /> Nutrition Assistant
          </h3>
          <div className="max-h-64 overflow-y-auto space-y-3 mb-3">
            {chatMessages.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Ask me anything about this product's nutrition or ingredients.</p>}
            {chatMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.role === 'user' ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={sendChat} className="flex gap-2">
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="input-field flex-1" placeholder="Ask about sugar, protein, ingredients…" />
            <button type="submit" className="btn-primary"><Send className="h-4 w-4" /></button>
          </form>
        </motion.div>
      )}

      {/* Warnings & Positives */}
      <div className="grid md:grid-cols-2 gap-4">
        {analysis.warnings.length > 0 && (
          <div className="card p-5">
            <h3 className="font-display font-semibold text-lg text-danger-600 flex items-center gap-2 mb-3"><AlertTriangle className="h-5 w-5" /> Warnings</h3>
            <ul className="space-y-2">
              {analysis.warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600"><span className="h-1.5 w-1.5 rounded-full bg-danger-500 mt-2 flex-shrink-0" />{w}</li>
              ))}
            </ul>
          </div>
        )}
        {analysis.positives.length > 0 && (
          <div className="card p-5">
            <h3 className="font-display font-semibold text-lg text-success-600 flex items-center gap-2 mb-3"><ThumbsUp className="h-5 w-5" /> Positives</h3>
            <ul className="space-y-2">
              {analysis.positives.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600"><span className="h-1.5 w-1.5 rounded-full bg-success-500 mt-2 flex-shrink-0" />{p}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Score breakdown */}
      <div className="card p-6">
        <h3 className="font-display font-semibold text-lg text-slate-900 mb-4">Score Breakdown</h3>
        <div className="space-y-3">
          {analysis.scoreBreakdown.map((b) => (
            <div key={b.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">{b.label}</span>
                <span className={`font-medium ${b.points >= 0 ? 'text-success-600' : 'text-danger-600'}`}>{b.points > 0 ? '+' : ''}{b.points}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(Math.abs(b.points) / b.max * 100, 100)}%` }} transition={{ duration: 0.8 }} className={`h-full rounded-full ${b.points >= 0 ? 'bg-success-500' : 'bg-danger-500'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nutrition facts — modern cards with progress bars */}
      <div className="card p-6">
        <h3 className="font-display font-semibold text-lg text-slate-900 mb-4">Nutrition Analysis</h3>
        {pendingScan.nutrition.servingSize && <p className="text-sm text-slate-500 mb-4">Serving size: {pendingScan.nutrition.servingSize}</p>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {nutritionCard('Calories', pendingScan.nutrition.calories as number | undefined, 'kcal', 500, <Flame className="h-5 w-5 text-white" />, 'bg-gradient-to-r from-warning-400 to-warning-500')}
          {nutritionCard('Protein', pendingScan.nutrition.protein as number | undefined, 'g', 30, <Beef className="h-5 w-5 text-white" />, 'bg-gradient-to-r from-danger-400 to-danger-500')}
          {nutritionCard('Sugar', pendingScan.nutrition.sugar as number | undefined, 'g', 30, <Candy className="h-5 w-5 text-white" />, 'bg-gradient-to-r from-pink-400 to-pink-500')}
          {nutritionCard('Total Fat', pendingScan.nutrition.fat as number | undefined, 'g', 30, <Droplet className="h-5 w-5 text-white" />, 'bg-gradient-to-r from-info-400 to-info-500')}
          {nutritionCard('Fiber', pendingScan.nutrition.fiber as number | undefined, 'g', 15, <Wheat className="h-5 w-5 text-white" />, 'bg-gradient-to-r from-success-400 to-success-500')}
          {nutritionCard('Sodium', pendingScan.nutrition.sodium as number | undefined, 'mg', 1000, <Pill className="h-5 w-5 text-white" />, 'bg-gradient-to-r from-info-400 to-info-500')}
        </div>
        <div className="mt-4 grid sm:grid-cols-2 gap-x-8 pt-4 border-t border-slate-100">
          {[
            ['Saturated Fat', pendingScan.nutrition.saturatedFat, 'g'],
            ['Trans Fat', pendingScan.nutrition.transFat, 'g'],
            ['Added Sugar', pendingScan.nutrition.addedSugar, 'g'],
            ['Carbohydrates', pendingScan.nutrition.carbs, 'g'],
            ['Cholesterol', pendingScan.nutrition.cholesterol, 'mg'],
          ].map(([label, val, unit]) => (
            <div key={label as string} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
              <span className="text-sm text-slate-600">{label}</span>
              <span className="font-medium text-slate-900 text-sm">{val != null ? `${val} ${unit}` : '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Allergens */}
      {analysis.allergens.length > 0 && (
        <div className="card p-6">
          <h3 className="font-display font-semibold text-lg text-slate-900 flex items-center gap-2 mb-4"><AlertTriangle className="h-5 w-5 text-warning-500" /> Allergen Detection</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.allergens.map((a) => <span key={a} className="badge bg-warning-100 text-warning-700">{a}</span>)}
          </div>
        </div>
      )}

      {/* Ingredient analysis — grouped by category */}
      {analysis.ingredientAnalysis.length > 0 && (
        <div className="card p-6">
          <h3 className="font-display font-semibold text-lg text-slate-900 mb-4">Ingredient Analysis</h3>
          <div className="space-y-6">
            {(['safe', 'moderate', 'harmful'] as const).map((cls) => {
              const items = grouped[cls];
              if (items.length === 0) return null;
              return (
                <div key={cls}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{ingredientClassIcon(cls)}</span>
                    <h4 className="font-medium text-slate-900">{ingredientClassGroupTitle(cls)}</h4>
                    <span className={`badge ml-auto ${ingredientClassColor(cls)}`}>{items.length}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{ingredientClassGroupExplanation(cls)}</p>
                  <div className="space-y-2">
                    {items.map((ing, idx) => {
                      const realIdx = analysis.ingredientAnalysis.indexOf(ing);
                      return (
                        <div key={idx} className="rounded-xl border border-slate-100 overflow-hidden">
                          <button
                            onClick={() => setExpandedIngredient(expandedIngredient === realIdx ? null : realIdx)}
                            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`h-3 w-3 rounded-full ${ingredientClassDot(cls)}`} />
                              <span className="text-sm font-medium text-slate-900">{ing.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`badge ${ingredientClassColor(cls)}`}>{ingredientClassLabel(cls)}</span>
                              {expandedIngredient === realIdx ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                            </div>
                          </button>
                          {expandedIngredient === realIdx && (
                            <div className="px-4 pb-3 pt-1 text-sm text-slate-600 border-t border-slate-100">{ing.reason}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Personalized recommendations */}
      {userGoals.length > 0 ? (
        <div className="card p-6">
          <h3 className="font-display font-semibold text-lg text-slate-900 flex items-center gap-2 mb-4">
            <UserIcon className="h-5 w-5 text-primary-500" /> Personalized Recommendations
          </h3>
          <div className="space-y-3">
            {userGoals.map((goal) => {
              const rec = analysis.recommendations[goal];
              if (!rec) return null;
              return (
                <div key={goal} className={`p-4 rounded-2xl ${rec.suitable ? 'bg-success-50' : 'bg-danger-50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {rec.suitable ? <ThumbsUp className="h-4 w-4 text-success-600" /> : <AlertTriangle className="h-4 w-4 text-danger-600" />}
                    <span className="font-medium text-slate-900 capitalize">{goal.replace('_', ' ')}</span>
                    <span className={`badge ml-auto ${rec.suitable ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'}`}>
                      {rec.suitable ? 'Suitable' : 'Not Recommended'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{rec.reason}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card p-6 text-center">
          <Cookie className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">Set your health goals in your profile to get personalized recommendations for this product.</p>
          <button onClick={() => navigate('/profile')} className="btn-ghost mt-3">Set Health Goals</button>
        </div>
      )}
    </div>
  );
}
