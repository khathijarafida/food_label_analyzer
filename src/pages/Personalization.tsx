import { useEffect, useState } from 'react';
import {
  User,
  Target,
  Utensils,
  AlertTriangle,
  Save,
  Check,
  Globe,
  X,
  Loader2,
} from 'lucide-react';
// NOTE: adjust this import to match your actual Supabase client
// file's path and export name if it differs.
import { supabase } from '../lib/supabase';

const dietOptions = [
  'No Preference',
  'Vegetarian',
  'Vegan',
  'Eggetarian',
  'Non-Vegetarian',
];

const activityLevelOptions = [
  'Sedentary',
  'Lightly Active',
  'Moderately Active',
  'Very Active',
];

const goalOptions = [
  'Weight Management',
  'Muscle Gain',
  'Healthy Eating',
  'Heart Health',
  'Blood Sugar Management',
  'Better Hydration',
  'High Protein',
  'Low Sugar',
  'Low Sodium',
  'High Fiber',
  'Lower Calories',
];

const restrictionOptions = [
  'No Restrictions',
  'Gluten Free',
  'Lactose Free',
  'Nut Free',
  'No Added Sugar',
];

const foodPreferenceOptions = [
  'No Preference',
  'North Indian',
  'South Indian',
  'Indo-Chinese',
  'Continental',
  'Italian',
  'Mexican',
  'Mediterranean',
  'Thai',
  'Street Food',
];

const languageOptions = [
  'English',
  'Hindi',
  'Kannada',
  'Tamil',
  'Telugu',
  'Malayalam',
  'Marathi',
  'Bengali',
  'Gujarati',
  'Punjabi',
];

interface Preferences {
  name: string;
  age: string;
  height: string;
  weight: string;
  activityLevel: string;
  preferredLanguage: string;
  countryRegion: string;
  diet: string;
  goals: string[];
  restrictions: string[];
  otherAllergies: string[];
  foodPreferences: string[];
  foodsToAvoid: string[];
}

const defaultPreferences: Preferences = {
  name: '',
  age: '',
  height: '',
  weight: '',
  activityLevel: 'Sedentary',
  preferredLanguage: 'English',
  countryRegion: '',
  diet: 'No Preference',
  goals: [],
  restrictions: ['No Restrictions'],
  otherAllergies: [],
  foodPreferences: [],
  foodsToAvoid: [],
};

// Maps a `profiles` row from Supabase into the component's shape.
function fromProfileRow(row: any): Preferences {
  return {
    name: row?.full_name ?? '',
    age: row?.age != null ? String(row.age) : '',
    height: row?.height_cm != null ? String(row.height_cm) : '',
    weight: row?.weight_kg != null ? String(row.weight_kg) : '',
    activityLevel: row?.activity_level ?? 'Sedentary',
    preferredLanguage: row?.preferred_language ?? 'English',
    countryRegion: row?.country_region ?? '',
    diet: row?.diet ?? 'No Preference',
    goals: Array.isArray(row?.health_goals) ? row.health_goals : [],
    restrictions: Array.isArray(row?.dietary_restrictions) && row.dietary_restrictions.length
      ? row.dietary_restrictions
      : ['No Restrictions'],
    otherAllergies: Array.isArray(row?.allergies) ? row.allergies : [],
    foodPreferences: Array.isArray(row?.food_preferences) ? row.food_preferences : [],
    foodsToAvoid: Array.isArray(row?.foods_to_avoid) ? row.foods_to_avoid : [],
  };
}

// Maps the component's state into a `profiles` row for upsert.
function toProfileRow(userId: string, prefs: Preferences) {
  return {
    id: userId,
    full_name: prefs.name,
    age: prefs.age ? Number(prefs.age) : null,
    height_cm: prefs.height ? Number(prefs.height) : null,
    weight_kg: prefs.weight ? Number(prefs.weight) : null,
    activity_level: prefs.activityLevel,
    preferred_language: prefs.preferredLanguage,
    country_region: prefs.countryRegion,
    diet: prefs.diet,
    health_goals: prefs.goals,
    dietary_restrictions: prefs.restrictions,
    allergies: prefs.otherAllergies,
    food_preferences: prefs.foodPreferences,
    foods_to_avoid: prefs.foodsToAvoid,
  };
}

export default function Personalization() {
  const [preferences, setPreferences] =
    useState<Preferences>(defaultPreferences);

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avoidInput, setAvoidInput] = useState('');
  const [allergyInput, setAllergyInput] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        if (isMounted) {
          setError('You need to be signed in to load your personalization settings.');
          setLoading(false);
        }
        return;
      }

      if (isMounted) setUserId(user.id);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!isMounted) return;

      if (fetchError) {
        setError('Could not load your saved preferences. You can still fill the form in and save.');
      } else if (data) {
        setPreferences(fromProfileRow(data));
      }

      setLoading(false);
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const updatePreference = <K extends keyof Preferences>(
    field: K,
    value: Preferences[K]
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSaved(false);
  };

  // Toggle a value inside a multi-select array field.
  const toggleMultiValue = (
    field: 'goals' | 'restrictions' | 'foodPreferences',
    option: string
  ) => {
    setPreferences((prev) => {
      const current = prev[field];

      // "No Restrictions" / "No Preference" behave as exclusive
      // choices: picking them clears everything else, and picking
      // anything else clears them.
      const exclusiveValues = ['No Restrictions', 'No Preference'];

      let next: string[];

      if (exclusiveValues.includes(option)) {
        next = current.includes(option) ? [] : [option];
      } else if (current.includes(option)) {
        next = current.filter((item) => item !== option);
      } else {
        next = [...current.filter((item) => !exclusiveValues.includes(item)), option];
      }

      return { ...prev, [field]: next };
    });

    setSaved(false);
  };

  const addTag = (
    field: 'foodsToAvoid' | 'otherAllergies',
    value: string,
    clearInput: () => void
  ) => {
    const trimmed = value.trim();

    if (!trimmed) return;

    const current = preferences[field];

    if (!current.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      updatePreference(field, [...current, trimmed]);
    }

    clearInput();
  };

  const removeTag = (field: 'foodsToAvoid' | 'otherAllergies', item: string) => {
    updatePreference(
      field,
      preferences[field].filter((food) => food !== item)
    );
  };

  const handleSave = async () => {
    if (!userId) {
      setError('You need to be signed in to save your personalization settings.');
      return;
    }

    setSaving(true);
    setError(null);

    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert(toProfileRow(userId, preferences), { onConflict: 'id' });

    setSaving(false);

    if (upsertError) {
      setError('Something went wrong saving your preferences. Please try again.');
      return;
    }

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100">
              <User className="h-6 w-6 text-purple-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Personalization
              </h1>

              <p className="text-sm text-slate-500">
                Customize your food analysis experience
              </p>
            </div>
          </div>

          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            Tell us about yourself, your diet, health goals, and dietary
            restrictions. We'll use these preferences to provide more
            personalized food recommendations.
          </p>

          {error && (
            <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* Personal Information */}
        <section className="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
              <User className="h-5 w-5 text-purple-600" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                Personal Information
              </h2>

              <p className="text-sm text-slate-500">
                Basic information for your profile
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Name
              </label>

              <input
                type="text"
                value={preferences.name}
                onChange={(e) =>
                  updatePreference('name', e.target.value)
                }
                placeholder="Enter your name"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Age
              </label>

              <input
                type="number"
                min="1"
                max="120"
                value={preferences.age}
                onChange={(e) =>
                  updatePreference('age', e.target.value)
                }
                placeholder="Enter your age"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Height (cm)
              </label>

              <input
                type="number"
                min="1"
                value={preferences.height}
                onChange={(e) =>
                  updatePreference('height', e.target.value)
                }
                placeholder="e.g. 170"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Weight (kg)
              </label>

              <input
                type="number"
                min="1"
                value={preferences.weight}
                onChange={(e) =>
                  updatePreference('weight', e.target.value)
                }
                placeholder="e.g. 65"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Preferred Language
              </label>

              <select
                value={preferences.preferredLanguage}
                onChange={(e) =>
                  updatePreference('preferredLanguage', e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                {languageOptions.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Country/Region
              </label>

              <input
                type="text"
                value={preferences.countryRegion}
                onChange={(e) =>
                  updatePreference('countryRegion', e.target.value)
                }
                placeholder="e.g. Karnataka, India"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Activity Level
            </label>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {activityLevelOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    updatePreference('activityLevel', option)
                  }
                  className={`rounded-xl border p-4 text-left text-sm font-medium transition ${
                    preferences.activityLevel === option
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-slate-200 text-slate-700 hover:border-purple-300'
                  }`}
                >
                  {option}

                  {preferences.activityLevel === option && (
                    <Check className="float-right h-5 w-5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Diet Preference */}
        <section className="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
              <Utensils className="h-5 w-5 text-purple-600" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                Diet Preference
              </h2>

              <p className="text-sm text-slate-500">
                Select your preferred diet
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dietOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  updatePreference('diet', option)
                }
                className={`rounded-xl border p-4 text-left text-sm font-medium transition ${
                  preferences.diet === option
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-slate-200 text-slate-700 hover:border-purple-300'
                }`}
              >
                {option}

                {preferences.diet === option && (
                  <Check className="float-right h-5 w-5" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Food Preferences (cuisine) */}
        <section className="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
              <Globe className="h-5 w-5 text-purple-600" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                Food Preferences
              </h2>

              <p className="text-sm text-slate-500">
                Select the cuisines you enjoy most (choose any that apply)
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {foodPreferenceOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleMultiValue('foodPreferences', option)}
                className={`rounded-xl border p-4 text-left text-sm font-medium transition ${
                  preferences.foodPreferences.includes(option)
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-slate-200 text-slate-700 hover:border-purple-300'
                }`}
              >
                {option}

                {preferences.foodPreferences.includes(option) && (
                  <Check className="float-right h-5 w-5" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Health Goal */}
        <section className="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
              <Target className="h-5 w-5 text-purple-600" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                Health Goals
              </h2>

              <p className="text-sm text-slate-500">
                What would you like to focus on? (choose any that apply)
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {goalOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleMultiValue('goals', option)}
                className={`rounded-xl border p-4 text-left text-sm font-medium transition ${
                  preferences.goals.includes(option)
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-slate-200 text-slate-700 hover:border-purple-300'
                }`}
              >
                {option}

                {preferences.goals.includes(option) && (
                  <Check className="float-right h-5 w-5" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Dietary Restrictions */}
        <section className="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
              <AlertTriangle className="h-5 w-5 text-purple-600" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                Dietary Restrictions
              </h2>

              <p className="text-sm text-slate-500">
                Select restrictions that apply to you (choose any that apply)
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {restrictionOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleMultiValue('restrictions', option)}
                className={`rounded-xl border p-4 text-left text-sm font-medium transition ${
                  preferences.restrictions.includes(option)
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-slate-200 text-slate-700 hover:border-purple-300'
                }`}
              >
                {option}

                {preferences.restrictions.includes(option) && (
                  <Check className="float-right h-5 w-5" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Other Allergies / Restrictions
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag('otherAllergies', allergyInput, () => setAllergyInput(''));
                  }
                }}
                placeholder="Example: Soy, shellfish, sesame..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />

              <button
                type="button"
                onClick={() => addTag('otherAllergies', allergyInput, () => setAllergyInput(''))}
                className="shrink-0 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-purple-300"
              >
                Add
              </button>
            </div>

            {preferences.otherAllergies.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {preferences.otherAllergies.map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-sm text-purple-700"
                  >
                    {item}

                    <button
                      type="button"
                      onClick={() => removeTag('otherAllergies', item)}
                      aria-label={`Remove ${item}`}
                      className="ml-1 rounded-full p-0.5 hover:bg-purple-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Foods to Avoid
            </label>

            <p className="mb-2 text-xs text-slate-500">
              Type an item and press Enter to add it (e.g. mushrooms, seafood, spicy foods)
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={avoidInput}
                onChange={(e) => setAvoidInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag('foodsToAvoid', avoidInput, () => setAvoidInput(''));
                  }
                }}
                placeholder="e.g. mushrooms"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />

              <button
                type="button"
                onClick={() => addTag('foodsToAvoid', avoidInput, () => setAvoidInput(''))}
                className="shrink-0 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-purple-300"
              >
                Add
              </button>
            </div>

            {preferences.foodsToAvoid.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {preferences.foodsToAvoid.map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-sm text-purple-700"
                  >
                    {item}

                    <button
                      type="button"
                      onClick={() => removeTag('foodsToAvoid', item)}
                      aria-label={`Remove ${item}`}
                      className="ml-1 rounded-full p-0.5 hover:bg-purple-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Save */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="h-5 w-5" />
                Preferences Saved
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Preferences
              </>
            )}
          </button>
        </div>

        {saved && (
          <p className="mt-3 text-right text-sm text-green-600">
            Your personalization settings have been saved successfully.
          </p>
        )}

      </div>
    </div>
  );
}
