import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Users, ScanLine, TrendingUp, TrendingDown, Award, BarChart3,
  Crown, Loader2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { FoodGradeBadge } from '@/components/FoodGradeBadge';
import { scoreColor } from '@/lib/colors';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  is_admin: boolean;
}

interface AdminScan {
  id: string;
  product_name: string;
  brand: string;
  health_score: number;
  food_grade: string;
  scanned_at: string;
  user_email: string;
}

export default function Admin() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [scans, setScans] = useState<AdminScan[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalScans: 0,
    healthyScans: 0,
    unhealthyScans: 0,
    avgScore: 0,
  });

  useEffect(() => {
    (async () => {
      // Load all scans via RPC (admin only — RLS still scopes to own data
      // for non-admins, but this panel is admin-gated client-side too)
      const { data: scanData } = await supabase
        .from('scans')
        .select('id, product_name, brand, health_score, food_grade, scanned_at, user_id')
        .order('scanned_at', { ascending: false })
        .limit(200);

      const allScans = (scanData ?? []) as Array<AdminScan & { user_id: string }>;
      const mappedScans: AdminScan[] = allScans.map((s) => ({ ...s, user_email: '' }));
      setScans(mappedScans);

      const totalScans = allScans.length;
      const healthyScans = allScans.filter((s) => s.health_score >= 75).length;
      const unhealthyScans = allScans.filter((s) => s.health_score < 40).length;
      const avgScore = totalScans > 0 ? Math.round(allScans.reduce((sum, s) => sum + s.health_score, 0) / totalScans) : 0;

      // Load profiles (accessible to admin via RLS? No — RLS scopes profiles to own.
      // We'll show stats from scans instead.)
      setStats({ totalUsers: 0, totalScans, healthyScans, unhealthyScans, avgScore });
      setLoading(false);
    })();
  }, []);

  const gradeDist = ['A+', 'A', 'B', 'C', 'D', 'F']
    .map((g) => ({ grade: g, count: scans.filter((s) => s.food_grade === g).length }))
    .filter((d) => d.count > 0);
  const gradeColors: Record<string, string> = { 'A+': '#10b981', A: '#34d399', B: '#84cc16', C: '#f59e0b', D: '#fb923c', F: '#ef4444' };

  const brandCounts: Record<string, number> = {};
  scans.forEach((s) => {
    if (s.brand) brandCounts[s.brand] = (brandCounts[s.brand] ?? 0) + 1;
  });
  const topBrands = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name: name.slice(0, 15), count }));

  if (loading) {
    return (
      <div className="glass-card p-8 flex flex-col items-center">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
        <p className="mt-3 text-slate-500 text-sm">Loading admin data…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary-500" /> Admin Panel
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Platform analytics and scan monitoring</p>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Crown className="h-4 w-4 text-accent-500" />
        Signed in as administrator: {profile?.full_name || profile?.id.slice(0, 8)}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Scans', value: stats.totalScans, icon: ScanLine, color: 'primary' },
          { label: 'Healthy Products', value: stats.healthyScans, icon: TrendingUp, color: 'primary' },
          { label: 'Unhealthy Products', value: stats.unhealthyScans, icon: TrendingDown, color: 'danger' },
          { label: 'Avg Health Score', value: stats.avgScore, icon: Award, color: 'accent' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5"
          >
            <div className={`h-10 w-10 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/40 flex items-center justify-center`}>
              <stat.icon className={`h-5 w-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
            </div>
            <p className="mt-3 text-2xl font-bold font-display text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary-500" /> Grade Distribution
          </h3>
          {gradeDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={gradeDist} dataKey="count" nameKey="grade" cx="50%" cy="50%" outerRadius={80} label={(e: any) => `${e.grade}: ${e.count}`}>
                  {gradeDist.map((d) => (
                    <Cell key={d.grade} fill={gradeColors[d.grade]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-slate-400 text-sm">No data</div>
          )}
        </div>

        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary-500" /> Top Scanned Brands
          </h3>
          {topBrands.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topBrands} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} width={90} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="count" fill="#34d399" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-slate-400 text-sm">No data</div>
          )}
        </div>
      </div>

      {/* Recent scans across platform */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <ScanLine className="h-5 w-5 text-primary-500" /> Recent Scanned Products
        </h3>
        {scans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">Product</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium hidden sm:table-cell">Brand</th>
                  <th className="text-center py-3 px-2 text-slate-500 font-medium">Score</th>
                  <th className="text-center py-3 px-2 text-slate-500 font-medium">Grade</th>
                  <th className="text-right py-3 px-2 text-slate-500 font-medium hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {scans.slice(0, 20).map((scan) => (
                  <tr key={scan.id} className="border-b border-slate-100 dark:border-slate-700/50">
                    <td className="py-3 px-2 text-slate-900 dark:text-white font-medium truncate max-w-[200px]">{scan.product_name}</td>
                    <td className="py-3 px-2 text-slate-500 hidden sm:table-cell">{scan.brand || '—'}</td>
                    <td className={`text-center py-3 px-2 font-bold ${scoreColor(scan.health_score)}`}>{scan.health_score}</td>
                    <td className="text-center py-3 px-2"><FoodGradeBadge grade={scan.food_grade} size="sm" /></td>
                    <td className="text-right py-3 px-2 text-slate-400 text-xs hidden sm:table-cell">{new Date(scan.scanned_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-8">No scans recorded yet.</p>
        )}
      </div>
    </div>
  );
}
