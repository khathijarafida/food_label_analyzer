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
} from 'lucide-react';

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
  allergy: string;
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
  allergy: '',
  foodPreferences: [],
  foodsToAvoid: [],
};

export default function Personalization() {
  const [preferences, setPreferences] =
    useState<Preferences>(defaultPreferences);

  const [saved, setSaved] = useState(false);
  const [avoidInput, setAvoidInput] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('foodAnalyzerPreferences');

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge with defaults so older saved data (single-select
        // goal/restriction, missing new fields) doesn't break the UI.
        setPreferences({
          ...defaultPreferences,
          ...parsed,
          goals: Array.isArray(parsed.goals)
            ? parsed.goals
            : parsed.goal
            ? [parsed.goal]
            : [],
          restrictions: Array.isArray(parsed.restrictions)
            ? parsed.restrictions
            : parsed.restriction
            ? [parsed.restriction]
            : ['No Restrictions'],
          foodPreferences: Array.isArray(parsed.foodPreferences)
            ? parsed.foodPreferences
            : [],
          foodsToAvoid: Array.isArray(parsed.foodsToAvoid)
            ? parsed.foodsToAvoid
            : [],
        });
      } catch {
        localStorage.removeItem('foodAnalyzerPreferences');
      }
    }
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

  const addFoodToAvoid = () => {
    const value = avoidInput.trim();

    if (!value) return;

    if (
      !preferences.foodsToAvoid.some(
        (item) => item.toLowerCase() === value.toLowerCase()
      )
    ) {
      updatePreference('foodsToAvoid', [...preferences.foodsToAvoid, value]);
    }

    setAvoidInput('');
  };

  const removeFoodToAvoid = (item: string) => {
    updatePreference(
      'foodsToAvoid',
      preferences.foodsToAvoid.filter((food) => food !== item)
    );
  };

  const handleSave = () => {
    localStorage.setItem(
      'foodAnalyzerPreferences',
      JSON.stringify(preferences)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

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

            <input
              type="text"
              value={preferences.allergy}
              onChange={(e) =>
                updatePreference('allergy', e.target.value)
              }
              placeholder="Example: Soy, shellfish, sesame..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
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
                    addFoodToAvoid();
                  }
                }}
                placeholder="e.g. mushrooms"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />

              <button
                type="button"
                onClick={addFoodToAvoid}
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
                      onClick={() => removeFoodToAvoid(item)}
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
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-purple-700"
          >
            {saved ? (
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
