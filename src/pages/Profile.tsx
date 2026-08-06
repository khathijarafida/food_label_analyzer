import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  User as UserIcon, Target, AlertTriangle, Save, Check, Mail, Calendar,
  Flame, Activity, Heart, Baby, TrendingDown, Dumbbell, Gauge,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { HEALTH_GOALS, COMMON_ALLERGIES } from '@/types';

const goalIcons: Record<string, React.ElementType> = {
  diabetic: Activity,
  weight_loss: TrendingDown,
  gym: Dumbbell,
  kid: Baby,
  pregnant: Heart,
  heart_patient: Heart,
  high_bp: Gauge,
};

export default function Profile() {
  const { profile, user, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [goals, setGoals] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setCalorieGoal(profile.daily_calorie_goal);
      setGoals(profile.health_goals ?? []);
      setAllergies(profile.allergies ?? []);
    }
  }, [profile]);

  const toggleGoal = (id: string) => {
    setGoals((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  };

  const toggleAllergy = (id: string) => {
    setAllergies((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        daily_calorie_goal: calorieGoal,
        health_goals: goals,
        allergies,
      })
      .eq('id', profile.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-slate-900 dark:text-white">Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your health goals and preferences</p>
      </div>

      {/* Profile header */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-primary-500 flex items-center justify-center shadow-emerald">
            <UserIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-xl text-slate-900 dark:text-white">{fullName || 'User'}</h2>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {user?.email}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Joined {new Date(profile.created_at).toLocaleDateString()}</span>
            </div>
            {profile.is_admin && (
              <span className="inline-flex items-center gap-1 mt-2 badge bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                Administrator
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-4">Account Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Daily Calorie Goal</label>
            <div className="relative">
              <Flame className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="number"
                min={1000}
                max={5000}
                step={50}
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(Number(e.target.value))}
                className="input-field pl-11"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Health goals */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white flex items-center gap-2 mb-2">
          <Target className="h-5 w-5 text-primary-500" /> Health Goals
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Select your goals to get personalized product recommendations</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {HEALTH_GOALS.map((goal) => {
            const Icon = goalIcons[goal.id] ?? Target;
            const selected = goals.includes(goal.id);
            return (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  selected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${selected ? 'bg-primary-100 dark:bg-primary-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  <Icon className={`h-5 w-5 ${selected ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`} />
                </div>
                <span className={`text-sm font-medium ${selected ? 'text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-slate-300'}`}>
                  {goal.label}
                </span>
                {selected && <Check className="h-4 w-4 text-primary-500 ml-auto" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Allergies */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-warning-500" /> Allergies & Intolerances
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">We'll warn you when scanned products contain these allergens</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_ALLERGIES.map((allergy) => {
            const selected = allergies.includes(allergy);
            return (
              <button
                key={allergy}
                onClick={() => toggleAllergy(allergy)}
                className={`badge px-4 py-2 text-sm transition-all ${
                  selected
                    ? 'bg-warning-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {allergy}
                {selected && <Check className="h-3.5 w-3.5 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saved ? <><Check className="h-4 w-4" /> Saved!</> : saving ? 'Saving…' : <><Save className="h-4 w-4" /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}
