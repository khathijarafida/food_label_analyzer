import { useEffect, useState } from 'react';
import {
  User,
  Target,
  Utensils,
  AlertTriangle,
  Save,
  Check,
} from 'lucide-react';

const dietOptions = [
  'No Preference',
  'Vegetarian',
  'Vegan',
  'Eggetarian',
  'Non-Vegetarian',
];

const goalOptions = [
  'Healthy Eating',
  'Weight Management',
  'Muscle Gain',
  'Low Sugar',
  'Low Sodium',
  'High Protein',
];

const restrictionOptions = [
  'No Restrictions',
  'Gluten Free',
  'Lactose Free',
  'Nut Free',
  'No Added Sugar',
];

interface Preferences {
  name: string;
  age: string;
  diet: string;
  goal: string;
  restriction: string;
  allergy: string;
}

const defaultPreferences: Preferences = {
  name: '',
  age: '',
  diet: 'No Preference',
  goal: 'Healthy Eating',
  restriction: 'No Restrictions',
  allergy: '',
};

export default function Personalization() {
  const [preferences, setPreferences] =
    useState<Preferences>(defaultPreferences);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('foodAnalyzerPreferences');

    if (stored) {
      try {
        setPreferences(JSON.parse(stored));
      } catch {
        localStorage.removeItem('foodAnalyzerPreferences');
      }
    }
  }, []);

  const updatePreference = (
    field: keyof Preferences,
    value: string
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSaved(false);
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
            Tell us about your diet, health goals, and dietary
            restrictions. We'll use these preferences to provide
            more personalized food recommendations.
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

        {/* Health Goal */}
        <section className="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
              <Target className="h-5 w-5 text-purple-600" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                Health Goal
              </h2>

              <p className="text-sm text-slate-500">
                What would you like to focus on?
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {goalOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  updatePreference('goal', option)
                }
                className={`rounded-xl border p-4 text-left text-sm font-medium transition ${
                  preferences.goal === option
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-slate-200 text-slate-700 hover:border-purple-300'
                }`}
              >
                {option}

                {preferences.goal === option && (
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
                Select restrictions that apply to you
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {restrictionOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  updatePreference('restriction', option)
                }
                className={`rounded-xl border p-4 text-left text-sm font-medium transition ${
                  preferences.restriction === option
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-slate-200 text-slate-700 hover:border-purple-300'
                }`}
              >
                {option}

                {preferences.restriction === option && (
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