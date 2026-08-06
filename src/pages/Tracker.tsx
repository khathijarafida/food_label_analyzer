import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell, Droplet, Plus, Trash2, Flame, Candy, Beef, Wheat,
  TrendingUp, Calendar,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Scan, WaterIntake } from '@/types';

export default function Tracker() {
  const { profile } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [waterEntries, setWaterEntries] = useState<WaterIntake[]>([]);
  const [loading, setLoading] = useState(true);
  const [waterAmount, setWaterAmount] = useState(250);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { data: scanData } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', profile.id)
        .gte('scanned_at', weekAgo.toISOString())
        .order('scanned_at', { ascending: true });
      setScans((scanData as Scan[]) ?? []);

      const { data: waterData } = await supabase
        .from('water_intake')
        .select('*')
        .eq('user_id', profile.id)
        .order('logged_at', { ascending: false })
        .limit(50);
      setWaterEntries((waterData as WaterIntake[]) ?? []);
      setLoading(false);
    })();
  }, [profile]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayWater = waterEntries
    .filter((w) => new Date(w.logged_at) >= today)
    .reduce((sum, w) => sum + w.amount_ml, 0);

  const addWater = async () => {
    if (!profile || waterAmount <= 0) return;
    const { data } = await supabase
      .from('water_intake')
      .insert({ user_id: profile.id, amount_ml: waterAmount })
      .select()
      .maybeSingle();
    if (data) setWaterEntries((prev) => [data as WaterIntake, ...prev]);
  };

  const deleteWater = async (id: string) => {
    await supabase.from('water_intake').delete().eq('id', id);
    setWaterEntries((prev) => prev.filter((w) => w.id !== id));
  };

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    const dayScans = scans.filter((s) => {
      const sd = new Date(s.scanned_at);
      return sd >= d && sd < next;
    });
    return {
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      date: d.toISOString(),
      calories: dayScans.reduce((sum, s) => sum + ((s.nutrition.calories as number) ?? 0), 0),
      sugar: Math.round(dayScans.reduce((sum, s) => sum + ((s.nutrition.sugar as number) ?? 0), 0) * 10) / 10,
      protein: Math.round(dayScans.reduce((sum, s) => sum + ((s.nutrition.protein as number) ?? 0), 0) * 10) / 10,
      fat: Math.round(dayScans.reduce((sum, s) => sum + ((s.nutrition.fat as number) ?? 0), 0) * 10) / 10,
      fiber: Math.round(dayScans.reduce((sum, s) => sum + ((s.nutrition.fiber as number) ?? 0), 0) * 10) / 10,
      scans: dayScans.length,
    };
  });

  const todayScans = scans.filter((s) => new Date(s.scanned_at) >= today);
  const todayStats = {
    calories: todayScans.reduce((sum, s) => sum + ((s.nutrition.calories as number) ?? 0), 0),
    sugar: Math.round(todayScans.reduce((sum, s) => sum + ((s.nutrition.sugar as number) ?? 0), 0) * 10) / 10,
    protein: Math.round(todayScans.reduce((sum, s) => sum + ((s.nutrition.protein as number) ?? 0), 0) * 10) / 10,
    fat: Math.round(todayScans.reduce((sum, s) => sum + ((s.nutrition.fat as number) ?? 0), 0) * 10) / 10,
    fiber: Math.round(todayScans.reduce((sum, s) => sum + ((s.nutrition.fiber as number) ?? 0), 0) * 10) / 10,
  };

  const calorieGoal = profile?.daily_calorie_goal ?? 2000;
  const waterGoal = 2000;

  if (loading) return <div className="glass-card p-8 text-center text-slate-500">Loading tracker…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-slate-900 dark:text-white flex items-center gap-2">
          <Dumbbell className="h-7 w-7 text-primary-500" /> Daily Food Tracker
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track your nutrition and water intake</p>
      </div>

      {/* Today summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Calories', value: todayStats.calories, goal: calorieGoal, unit: 'kcal', icon: Flame, color: 'text-warning-500', bg: 'bg-warning-100 dark:bg-warning-900/40' },
          { label: 'Sugar', value: todayStats.sugar, goal: 50, unit: 'g', icon: Candy, color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-900/40' },
          { label: 'Protein', value: todayStats.protein, goal: 50, unit: 'g', icon: Beef, color: 'text-danger-500', bg: 'bg-danger-100 dark:bg-danger-900/40' },
          { label: 'Fat', value: todayStats.fat, goal: 70, unit: 'g', icon: Droplet, color: 'text-accent-500', bg: 'bg-accent-100 dark:bg-accent-900/40' },
          { label: 'Fiber', value: todayStats.fiber, goal: 30, unit: 'g', icon: Wheat, color: 'text-primary-500', bg: 'bg-primary-100 dark:bg-primary-900/40' },
        ].map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4"
          >
            <div className={`h-9 w-9 rounded-lg ${item.bg} flex items-center justify-center`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{item.value}</p>
            <p className="text-xs text-slate-500">/ {item.goal} {item.unit}</p>
            <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full ${item.value >= item.goal ? 'bg-primary-500' : 'bg-accent-400'}`}
                style={{ width: `${Math.min((item.value / item.goal) * 100, 100)}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Water tracker */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Droplet className="h-5 w-5 text-primary-500" /> Water Intake
        </h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-display text-primary-600 dark:text-primary-400">{todayWater}</span>
              <span className="text-slate-500 text-sm">/ {waterGoal} ml</span>
            </div>
            <div className="mt-2 h-4 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((todayWater / waterGoal) * 100, 100)}%` }}
                className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
              />
            </div>
          </div>
          {todayWater >= waterGoal && (
            <div className="flex items-center gap-1 text-primary-600 dark:text-primary-400 text-sm font-medium">
              <TrendingUp className="h-4 w-4" /> Goal reached!
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <select
            value={waterAmount}
            onChange={(e) => setWaterAmount(Number(e.target.value))}
            className="input-field flex-1"
          >
            <option value={100}>100 ml — small sip</option>
            <option value={250}>250 ml — glass</option>
            <option value={330}>330 ml — can</option>
            <option value={500}>500 ml — bottle</option>
            <option value={750}>750 ml — large bottle</option>
            <option value={1000}>1000 ml — 1 liter</option>
          </select>
          <button onClick={addWater} className="btn-primary">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          <AnimatePresence>
            {waterEntries
              .filter((w) => new Date(w.logged_at) >= today)
              .map((w) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                >
                  <Droplet className="h-4 w-4 text-primary-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-200">{w.amount_ml} ml</span>
                  <span className="text-xs text-slate-400 ml-auto">{new Date(w.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <button onClick={() => deleteWater(w.id)} className="p-1 rounded text-slate-400 hover:text-danger-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
          </AnimatePresence>
          {waterEntries.filter((w) => new Date(w.logged_at) >= today).length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No water logged today. Stay hydrated!</p>
          )}
        </div>
      </div>

      {/* Weekly charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-500" /> Weekly Calorie Intake
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Bar dataKey="calories" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Calories" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary-500" /> Nutrient Trends
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Legend />
              <Line type="monotone" dataKey="sugar" stroke="#ec4899" strokeWidth={2} dot={false} name="Sugar (g)" />
              <Line type="monotone" dataKey="protein" stroke="#ef4444" strokeWidth={2} dot={false} name="Protein (g)" />
              <Line type="monotone" dataKey="fiber" stroke="#10b981" strokeWidth={2} dot={false} name="Fiber (g)" />
              <Line type="monotone" dataKey="fat" stroke="#f59e0b" strokeWidth={2} dot={false} name="Fat (g)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Today's scanned foods */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-4">Today's Foods</h3>
        {todayScans.length > 0 ? (
          <div className="space-y-2">
            {todayScans.map((scan) => (
              <div key={scan.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                {scan.image_url ? (
                  <img src={scan.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white text-sm">{scan.product_name}</p>
                  <p className="text-xs text-slate-500">{scan.nutrition.calories ?? 0} kcal</p>
                </div>
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{scan.health_score}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-6">No foods scanned today yet.</p>
        )}
      </div>
    </div>
  );
}
