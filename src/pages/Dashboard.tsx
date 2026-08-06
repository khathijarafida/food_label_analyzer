import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ScanLine, TrendingUp, TrendingDown, Heart, BarChart3, Award,
  Activity, ArrowRight, Calendar, Flame, Droplet, Candy, Beef, Wheat,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { FoodGradeBadge } from '@/components/FoodGradeBadge';
import { scoreColor } from '@/lib/colors';
import type { Scan } from '@/types';

export default function Dashboard() {
  const { profile } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayWater, setTodayWater] = useState(0);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', profile.id)
        .order('scanned_at', { ascending: false })
        .limit(100);
      setScans((data as Scan[]) ?? []);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: water } = await supabase
        .from('water_intake')
        .select('amount_ml')
        .eq('user_id', profile.id)
        .gte('logged_at', today.toISOString());
      setTodayWater((water ?? []).reduce((sum, w) => sum + (w as { amount_ml: number }).amount_ml, 0));
      setLoading(false);
    })();
  }, [profile]);

  const totalScans = scans.length;
  const healthyCount = scans.filter((s) => s.health_score >= 75).length;
  const unhealthyCount = scans.filter((s) => s.health_score < 40).length;
  const avgScore = totalScans > 0 ? Math.round(scans.reduce((sum, s) => sum + s.health_score, 0) / totalScans) : 0;
  const favoriteCount = scans.filter((s) => s.is_favorite).length;

  const brandCounts: Record<string, number> = {};
  scans.forEach((s) => {
    if (s.brand) brandCounts[s.brand] = (brandCounts[s.brand] ?? 0) + 1;
  });
  const topBrands = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name: name.slice(0, 15), count }));

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    const count = scans.filter((s) => {
      const sd = new Date(s.scanned_at);
      return sd >= d && sd < next;
    }).length;
    return { day: d.toLocaleDateString('en', { weekday: 'short' }), scans: count };
  });

  const gradeDistribution: { grade: string; count: number }[] = ['A+', 'A', 'B', 'C', 'D', 'F']
    .map((g) => ({ grade: g, count: scans.filter((s) => s.food_grade === g).length }))
    .filter((d) => d.count > 0);
  const gradeColors: Record<string, string> = { 'A+': '#10b981', A: '#34d399', B: '#84cc16', C: '#f59e0b', D: '#fb923c', F: '#ef4444' };

  // Today's nutrition from scans
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayScans = scans.filter((s) => new Date(s.scanned_at) >= today);
  const todayNutrition = todayScans.reduce(
    (acc, s) => ({
      calories: acc.calories + (typeof s.nutrition.calories === 'number' ? s.nutrition.calories : 0),
      sugar: acc.sugar + (typeof s.nutrition.sugar === 'number' ? s.nutrition.sugar : 0),
      protein: acc.protein + (typeof s.nutrition.protein === 'number' ? s.nutrition.protein : 0),
      fat: acc.fat + (typeof s.nutrition.fat === 'number' ? s.nutrition.fat : 0),
      fiber: acc.fiber + (typeof s.nutrition.fiber === 'number' ? s.nutrition.fiber : 0),
    }),
    { calories: 0, sugar: 0, protein: 0, fat: 0, fiber: 0 }
  );

  const recentScans = scans.slice(0, 5);

  if (loading) {
    return <div className="glass-card p-8 text-center text-slate-500">Loading your dashboard…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-slate-900 dark:text-white">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}!
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Here's your food analysis overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
              <ScanLine className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold font-display text-slate-900 dark:text-white">{totalScans}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Scans</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold font-display text-slate-900 dark:text-white">{healthyCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Healthy Products</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-danger-100 dark:bg-danger-900/40 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-danger-600 dark:text-danger-400" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold font-display text-slate-900 dark:text-white">{unhealthyCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Unhealthy Products</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-accent-100 dark:bg-accent-900/40 flex items-center justify-center">
              <Award className="h-5 w-5 text-accent-600 dark:text-accent-400" />
            </div>
          </div>
          <p className={`mt-3 text-2xl font-bold font-display ${scoreColor(avgScore)}`}>{avgScore}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Avg Health Score</p>
        </motion.div>
      </div>

      {/* Today's intake */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary-500" /> Today's Intake
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Calories', value: todayNutrition.calories, unit: 'kcal', icon: Flame, color: 'text-warning-500' },
            { label: 'Sugar', value: Math.round(todayNutrition.sugar * 10) / 10, unit: 'g', icon: Candy, color: 'text-pink-500' },
            { label: 'Protein', value: Math.round(todayNutrition.protein * 10) / 10, unit: 'g', icon: Beef, color: 'text-danger-500' },
            { label: 'Fat', value: Math.round(todayNutrition.fat * 10) / 10, unit: 'g', icon: Droplet, color: 'text-accent-500' },
            { label: 'Fiber', value: Math.round(todayNutrition.fiber * 10) / 10, unit: 'g', icon: Wheat, color: 'text-primary-500' },
          ].map((item) => (
            <div key={item.label} className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <item.icon className={`h-6 w-6 mx-auto ${item.color}`} />
              <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{item.value}</p>
              <p className="text-xs text-slate-500">{item.label} ({item.unit})</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 rounded-xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Droplet className="h-6 w-6 text-primary-500" />
            <div>
              <p className="font-medium text-slate-900 dark:text-white">{todayWater} ml</p>
              <p className="text-xs text-slate-500">Water today (goal: 2000ml)</p>
            </div>
          </div>
          <Link to="/tracker" className="btn-ghost text-sm">Log Water</Link>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary-500" /> Weekly Activity
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="scans" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary-500" /> Grade Distribution
          </h3>
          {gradeDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={gradeDistribution} dataKey="count" nameKey="grade" cx="50%" cy="50%" outerRadius={80} label={(e: any) => `${e.grade}: ${e.count}`}>
                  {gradeDistribution.map((d) => (
                    <Cell key={d.grade} fill={gradeColors[d.grade]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Top brands */}
      {topBrands.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary-500" /> Most Scanned Brands
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={topBrands} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} width={90} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Bar dataKey="count" fill="#34d399" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent scans */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white">Recent Scans</h3>
          <Link to="/history" className="text-sm text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {recentScans.length > 0 ? (
          <div className="space-y-2">
            {recentScans.map((scan) => (
              <div key={scan.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                {scan.image_url ? (
                  <img src={scan.image_url} alt="" className="h-12 w-12 rounded-lg object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <ScanLine className="h-5 w-5 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white truncate">{scan.product_name}</p>
                  <p className="text-xs text-slate-500">{scan.brand || 'Unknown brand'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${scoreColor(scan.health_score)}`}>{scan.health_score}</span>
                  <FoodGradeBadge grade={scan.food_grade} size="sm" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ScanLine className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">You haven't scanned any products yet.</p>
            <Link to="/scan" className="btn-primary">
              <ScanLine className="h-4 w-4" /> Scan Your First Product
            </Link>
          </div>
        )}
      </div>

      <div className="hidden">{favoriteCount}</div>
    </div>
  );
}
