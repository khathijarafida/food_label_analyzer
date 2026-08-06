export interface Profile {
  id: string;
  full_name: string;
  health_goals: string[];
  allergies: string[];
  is_admin: boolean;
  daily_calorie_goal: number;
  created_at: string;
}

export interface Scan {
  id: string;
  user_id: string;
  barcode: string | null;
  product_name: string;
  brand: string;
  category: string;
  image_url: string;
  nutrition: Record<string, number | string | undefined>;
  ingredients: string[];
  allergens: string[];
  additives: string[];
  health_score: number;
  food_grade: string;
  ingredient_analysis: Array<{
    name: string;
    classification: 'safe' | 'moderate' | 'harmful';
    reason: string;
    isAdditive: boolean;
    isArtificial: boolean;
  }>;
  recommendations: Record<string, { suitable: boolean; reason: string }>;
  is_favorite: boolean;
  scanned_at: string;
}

export interface WaterIntake {
  id: string;
  user_id: string;
  amount_ml: number;
  logged_at: string;
}

export const HEALTH_GOALS = [
  { id: 'diabetic', label: 'Diabetic', icon: 'activity' },
  { id: 'weight_loss', label: 'Weight Loss', icon: 'trending-down' },
  { id: 'gym', label: 'Gym / Fitness', icon: 'dumbbell' },
  { id: 'kid', label: 'For Kids', icon: 'baby' },
  { id: 'pregnant', label: 'Pregnant', icon: 'heart' },
  { id: 'heart_patient', label: 'Heart Patient', icon: 'heart-pulse' },
  { id: 'high_bp', label: 'High Blood Pressure', icon: 'gauge' },
] as const;

export const COMMON_ALLERGIES = [
  'milk', 'egg', 'soy', 'gluten', 'peanut', 'tree nuts', 'shellfish', 'fish', 'sesame',
] as const;
