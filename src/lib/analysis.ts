export type IngredientClass = 'safe' | 'moderate' | 'harmful';

export interface IngredientInfo {
  name: string;
  classification: IngredientClass;
  reason: string;
  isAdditive: boolean;
  isArtificial: boolean;
}

export interface NutritionFacts {
  calories?: number;
  servingSize?: string;
  protein?: number;
  fat?: number;
  saturatedFat?: number;
  transFat?: number;
  sugar?: number;
  addedSugar?: number;
  sodium?: number;
  fiber?: number;
  cholesterol?: number;
  carbs?: number;
  vitamins?: Record<string, number>;
  minerals?: Record<string, number>;
}

export interface AnalysisResult {
  healthScore: number;
  foodGrade: string;
  ingredientAnalysis: IngredientInfo[];
  allergens: string[];
  additives: string[];
  recommendations: Record<string, { suitable: boolean; reason: string }>;
  warnings: string[];
  positives: string[];
  scoreBreakdown: { label: string; points: number; max: number }[];
}

export const ALLERGENS = [
  'milk', 'egg', 'soy', 'gluten', 'wheat', 'peanut', 'tree nut', 'tree nuts',
  'shellfish', 'fish', 'sesame', 'mustard', 'celery', 'sulphite', 'lupin',
] as const;

const ALLERGEN_ALIASES: Record<string, string[]> = {
  milk: ['milk', 'cream', 'butter', 'cheese', 'whey', 'casein', 'lactose', 'ghee', 'milk powder', 'skim milk', 'milkfat'],
  egg: ['egg', 'albumin', 'ovalbumin', 'mayonnaise', 'eggnog', 'egg white', 'egg yolk', 'lecithin'],
  soy: ['soy', 'soya', 'soybean', 'tofu', 'tempeh', 'edamame', 'soy sauce', 'soy lecithin'],
  gluten: ['wheat', 'gluten', 'barley', 'rye', 'spelt', 'semolina', 'durum', 'farro', 'couscous', 'bread', 'flour'],
  peanut: ['peanut', 'groundnut', 'arachis'],
  'tree nuts': ['almond', 'cashew', 'walnut', 'pecan', 'hazelnut', 'pistachio', 'brazil nut', 'macadamia', 'pine nut'],
  shellfish: ['shrimp', 'prawn', 'crab', 'lobster', 'crayfish', 'scampi'],
  fish: ['fish', 'tuna', 'salmon', 'cod', 'mackerel', 'sardine', 'anchovy', 'tilapia', 'halibut'],
  sesame: ['sesame', 'sesame oil', 'tahini', 'sesamum'],
};

const HARMFUL_INGREDIENTS: Record<string, string> = {
  'high fructose corn syrup': 'High in added sugar. Regular consumption may increase obesity, type 2 diabetes, and fatty liver risk.',
  'partially hydrogenated': 'Contains trans fat. Raises bad cholesterol and lowers good cholesterol, strongly linked to heart disease.',
  'hydrogenated': 'May contain trans fat. Linked to cardiovascular disease; intake should be minimized.',
  'bha': 'Butylated hydroxyanisole — synthetic preservative classified as a possible human carcinogen by IARC.',
  'bht': 'Butylated hydroxytoluene — synthetic preservative with controversial long-term safety data.',
  'sodium nitrite': 'Preservative used in processed meats. Can form nitrosamines linked to increased cancer risk, especially colorectal cancer.',
  'sodium nitrate': 'Preservative that converts to nitrite in the body, carrying similar risks to sodium nitrite.',
  'potassium bromate': 'Flour improver banned in many countries. Classified as a possible human carcinogen.',
  'propyl gallate': 'Synthetic preservative with possible endocrine-disrupting effects.',
  'propylene glycol': 'Synthetic additive used as humectant. High amounts can affect the nervous system.',
  'brominated vegetable oil': 'Banned in many countries; linked to neurological issues and iodine imbalance.',
  'tbhq': 'Tertiary butylhydroquinone — synthetic preservative linked to immune effects in high doses.',
  'red 40': 'Artificial food dye. Associated with hyperactivity in some children; banned or restricted in parts of Europe.',
  'red 3': 'Artificial dye linked to thyroid tumors in animal studies.',
  'yellow 5': 'Artificial dye (tartrazine). May cause allergic reactions and hyperactivity in sensitive individuals.',
  'yellow 6': 'Artificial dye that may contain carcinogenic contaminants.',
  'blue 1': 'Artificial dye with potential sensitivity reactions.',
  'blue 2': 'Artificial dye with inconclusive long-term safety data.',
  'caramel color': 'May contain 4-MEI, a compound classified as possibly carcinogenic; varies by manufacturing process.',
  'msg': 'Flavor enhancer that can cause headaches and reactions in sensitive individuals; often indicates ultra-processed food.',
  'monosodium glutamate': 'Flavor enhancer that can cause headaches and reactions in sensitive individuals.',
  'sulfite': 'Preservative that can trigger asthma and allergic reactions in sensitive people.',
  'sulphite': 'Preservative that can trigger asthma and allergic reactions in sensitive people.',
  'sodium benzoate': 'Preservative that can form benzene (a carcinogen) when combined with vitamin C (ascorbic acid).',
  'acesulfame k': 'Artificial sweetener with debated long-term safety; some animal studies raise concerns.',
  'acesulfame potassium': 'Artificial sweetener with debated long-term safety.',
  'aspartame': 'Artificial sweetener classified as possibly carcinogenic to humans by IARC.',
  'sucralose': 'Artificial sweetener that may affect gut bacteria and insulin response with long-term use.',
  'saccharin': 'Artificial sweetener with historical cancer concerns; still restricted in some regions.',
  'sodium aluminum phosphate': 'Leavening agent containing aluminum; high intake not recommended.',
  'aluminum lake': 'Colorant derived from aluminum; accumulation in the body is a concern.',
};

const MODERATE_INGREDIENTS: Record<string, string> = {
  'sugar': 'Added sugar. Excessive intake contributes to weight gain, diabetes, and dental cavities.',
  'cane sugar': 'Added sugar. Consume in moderation to avoid metabolic issues.',
  'brown sugar': 'Added sugar with minimal nutritional difference from white sugar.',
  'dextrose': 'Simple sugar that spikes blood glucose quickly.',
  'maltodextrin': 'Processed carbohydrate with a very high glycemic index; spikes blood sugar.',
  'corn syrup': 'Added sugar. High intake linked to metabolic problems.',
  'invert syrup': 'Added sugar form; contributes to excessive sugar intake.',
  'palm oil': 'High in saturated fat. Frequent consumption raises cardiovascular risk.',
  'canola oil': 'Refined oil; moderate use is fine but heavily processed forms are less ideal.',
  'soybean oil': 'High in omega-6 fatty acids; excessive intake may promote inflammation.',
  'sunflower oil': 'Refined seed oil; moderate consumption is acceptable.',
  'cottonseed oil': 'Highly processed oil often containing pesticide residues.',
  'shortening': 'Solid fat high in saturated or trans fats; limit intake.',
  'glycerin': 'Food additive generally safe but indicates processed food.',
  'modified food starch': 'Processed thickener with little nutritional value.',
  'xanthan gum': 'Thickener generally safe but can cause digestive issues in large amounts.',
  'carrageenan': 'Thickener derived from seaweed; controversial links to inflammation.',
  'natural flavor': 'Vague term that can include many extracts; hard to assess without specifics.',
  'artificial flavor': 'Synthetic flavoring; safety depends on the specific compounds used.',
  'inulin': 'Fiber additive that can cause bloating in high amounts.',
  'potassium sorbate': 'Preservative generally recognized as safe but indicates processed food.',
  'calcium sorbate': 'Preservative; generally safe in small quantities.',
  'citric acid': 'Common preservative and acidulant; safe but often industrially produced.',
  'phosphoric acid': 'Acidulant linked to lower bone density with excessive cola consumption.',
  'monoglycerides': 'Emulsifier generally safe but indicates processed food.',
  'diglycerides': 'Emulsifier generally safe but indicates processed food.',
  'soy lecithin': 'Emulsifier generally safe in small amounts; indicates processed food.',
  'lecithin': 'Emulsifier generally safe; indicates processed food.',
};

const SAFE_INGREDIENTS: Record<string, string> = {
  'water': 'Essential and naturally present in many foods.',
  'whole grain': 'Whole grains provide fiber, vitamins, and sustained energy.',
  'whole wheat': 'Whole grain flour retaining bran and germ for better nutrition.',
  'oats': 'Whole grain rich in soluble fiber that supports heart health.',
  'brown rice': 'Whole grain providing fiber and minerals.',
  'quinoa': 'Complete protein whole grain with fiber and minerals.',
  'sea salt': 'Natural salt; provides sodium but in less processed form.',
  'salt': 'Sodium source; necessary in small amounts but easy to overconsume.',
  'honey': 'Natural sweetener with antioxidants; still a sugar — moderate use.',
  'maple syrup': 'Natural sweetener with minerals; still a sugar — moderate use.',
  'fruit': 'Whole fruit provides vitamins, fiber, and antioxidants.',
  'vegetable': 'Vegetables provide vitamins, minerals, and fiber.',
  'tomato': 'Rich in lycopene, vitamin C, and potassium.',
  'onion': 'Contains antioxidants and prebiotic fiber.',
  'garlic': 'Contains allicin with antimicrobial and heart-health benefits.',
  'olive oil': 'Heart-healthy monounsaturated fat rich in antioxidants.',
  'extra virgin olive oil': 'Highest quality olive oil with strong anti-inflammatory properties.',
  'vinegar': 'May help regulate blood sugar; safe in normal amounts.',
  'apple cider vinegar': 'May aid blood sugar control; consume diluted.',
  'herbs': 'Natural flavorings with antioxidants and no downside.',
  'spices': 'Natural flavorings with antioxidants and potential health benefits.',
  'turmeric': 'Contains curcumin, a powerful anti-inflammatory compound.',
  'ginger': 'Aids digestion and has anti-inflammatory properties.',
  'cinnamon': 'May help regulate blood sugar; safe in culinary amounts.',
  'black pepper': 'Enhances nutrient absorption; safe culinary spice.',
  'lemon': 'Rich in vitamin C and antioxidants.',
  'citrus': 'Provides vitamin C and flavonoids.',
  'egg': 'High-quality complete protein with vitamins and choline.',
  'milk': 'Good source of protein, calcium, and vitamin D.',
  'yogurt': 'Provides probiotics, protein, and calcium.',
  'chicken': 'Lean protein source.',
  'beef': 'Protein and iron source; lean cuts preferred.',
  'fish': 'Excellent protein and omega-3 source supporting heart and brain health.',
  'salmon': 'Rich in omega-3 fatty acids beneficial for heart and brain.',
  'whey protein': 'High-quality protein; well-absorbed.',
  'almond': 'Nutrient-dense nut with healthy fats and vitamin E.',
  'cashew': 'Nut providing healthy fats and minerals.',
  'walnut': 'Rich in omega-3 plant fats and antioxidants.',
  'peanut': 'Protein and fat source; watch for aflatoxin and allergies.',
  'lentil': 'High-fiber legume with plant protein and iron.',
  'chickpea': 'Legume rich in protein, fiber, and folate.',
  'bean': 'High in fiber and plant protein.',
  'spinach': 'Leafy green rich in iron, folate, and vitamins.',
  'kale': 'Nutrient-dense leafy green loaded with vitamins and antioxidants.',
  'carrot': 'Rich in beta-carotene for eye and immune health.',
  'broccoli': 'Cruciferous vegetable with vitamins and cancer-fighting compounds.',
  'potato': 'Provides potassium and vitamin C; nutrient profile depends on preparation.',
  'sugar cane': 'Whole form of sugar; still contributes to sugar intake when processed.',
  'yeast': 'Natural leavening agent; safe and traditional.',
  'baking soda': 'Common leavening agent; safe in normal amounts.',
  'enzyme': 'Natural proteins used in processing; generally safe.',
  'vinegar culture': 'Used in fermentation; safe.',
  'probiotic': 'Beneficial bacteria supporting gut health.',
  'ascorbic acid': 'Vitamin C; antioxidant and preservative that is beneficial.',
  'vitamin c': 'Essential vitamin with antioxidant properties.',
  'vitamin e': 'Antioxidant vitamin beneficial for skin and cells.',
  'iron': 'Essential mineral for oxygen transport in blood.',
  'calcium': 'Essential mineral for bones and teeth.',
  'potassium': 'Important mineral for heart and muscle function.',
  'magnesium': 'Essential mineral for hundreds of bodily processes.',
  'zinc': 'Essential mineral for immune function.',
};

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/[.,;()]/g, '').replace(/\s+/g, ' ');
}

function classifyIngredient(raw: string): IngredientInfo {
  const name = normalize(raw);
  if (!name) return { name: raw.trim(), classification: 'safe', reason: 'Unrecognized ingredient; cannot fully assess.', isAdditive: false, isArtificial: false };

  for (const [key, reason] of Object.entries(HARMFUL_INGREDIENTS)) {
    if (name.includes(key)) {
      return { name: raw.trim(), classification: 'harmful', reason, isAdditive: true, isArtificial: /dye|color|red|yellow|blue|green|lake|artificial|hydrogenated|bromat/i.test(key) };
    }
  }
  for (const [key, reason] of Object.entries(MODERATE_INGREDIENTS)) {
    if (name.includes(key)) {
      return { name: raw.trim(), classification: 'moderate', reason, isAdditive: /gum|emulsif|preserv|starch|flavor|acid/i.test(key), isArtificial: false };
    }
  }
  for (const [key, reason] of Object.entries(SAFE_INGREDIENTS)) {
    if (name.includes(key)) {
      return { name: raw.trim(), classification: 'safe', reason, isAdditive: false, isArtificial: false };
    }
  }
  return { name: raw.trim(), classification: 'safe', reason: 'Unrecognized ingredient; generally assumed safe but not fully assessed.', isAdditive: false, isArtificial: false };
}

function detectAllergens(ingredients: string[]): string[] {
  const found = new Set<string>();
  const text = ingredients.map(normalize).join(' ');
  for (const [allergen, aliases] of Object.entries(ALLERGEN_ALIASES)) {
    if (aliases.some((a) => text.includes(a))) {
      found.add(allergen);
    }
  }
  return [...found];
}

function computeHealthScore(
  nutrition: NutritionFacts,
  ingredientAnalysis: IngredientInfo[]
): { score: number; breakdown: { label: string; points: number; max: number }[] } {
  const breakdown: { label: string; points: number; max: number }[] = [];
  let score = 100;

  const harmful = ingredientAnalysis.filter((i) => i.classification === 'harmful').length;
  const moderate = ingredientAnalysis.filter((i) => i.classification === 'moderate').length;
  let pts = 0;
  pts -= harmful * 7;
  pts -= Math.min(moderate * 3, 18);
  breakdown.push({ label: 'Additives & Preservatives', points: Math.max(pts, -25), max: 25 });
  score += Math.max(pts, -25);

  if (nutrition.sodium != null) {
    let s = 0;
    if (nutrition.sodium > 800) s = -10;
    else if (nutrition.sodium > 400) s = -5;
    else if (nutrition.sodium < 120) s = 5;
    breakdown.push({ label: 'Sodium', points: s, max: 10 });
    score += s;
  }

  if (nutrition.sugar != null) {
    let s = 0;
    if (nutrition.sugar > 20) s = -12;
    else if (nutrition.sugar > 10) s = -6;
    else if (nutrition.sugar < 5) s = 5;
    breakdown.push({ label: 'Sugar', points: s, max: 12 });
    score += s;
  }

  if (nutrition.addedSugar != null) {
    let s = 0;
    if (nutrition.addedSugar > 15) s = -10;
    else if (nutrition.addedSugar > 8) s = -5;
    else if (nutrition.addedSugar === 0) s = 5;
    breakdown.push({ label: 'Added Sugar', points: s, max: 10 });
    score += s;
  }

  if (nutrition.saturatedFat != null) {
    let s = 0;
    if (nutrition.saturatedFat > 5) s = -8;
    else if (nutrition.saturatedFat > 3) s = -4;
    else if (nutrition.saturatedFat < 1) s = 4;
    breakdown.push({ label: 'Saturated Fat', points: s, max: 8 });
    score += s;
  }

  if (nutrition.transFat != null && nutrition.transFat > 0) {
    breakdown.push({ label: 'Trans Fat', points: -8, max: 8 });
    score -= 8;
  }

  if (nutrition.fiber != null) {
    let s = 0;
    if (nutrition.fiber > 5) s = 8;
    else if (nutrition.fiber > 3) s = 5;
    else if (nutrition.fiber < 1) s = -3;
    breakdown.push({ label: 'Fiber', points: s, max: 8 });
    score += s;
  }

  if (nutrition.protein != null) {
    let s = 0;
    if (nutrition.protein > 10) s = 6;
    else if (nutrition.protein > 5) s = 3;
    else if (nutrition.protein < 2) s = -2;
    breakdown.push({ label: 'Protein', points: s, max: 6 });
    score += s;
  }

  if (nutrition.calories != null) {
    let s = 0;
    if (nutrition.calories > 500) s = -5;
    else if (nutrition.calories > 300) s = -2;
    else if (nutrition.calories < 150) s = 3;
    breakdown.push({ label: 'Calories (per serving)', points: s, max: 5 });
    score += s;
  }

  const scoreInt = Math.max(0, Math.min(100, Math.round(score)));
  return { score: scoreInt, breakdown };
}

function scoreToGrade(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

function generateRecommendations(
  nutrition: NutritionFacts,
  ingredientAnalysis: IngredientInfo[],
  allergens: string[]
): Record<string, { suitable: boolean; reason: string }> {
  const recs: Record<string, { suitable: boolean; reason: string }> = {};
  const harmful = ingredientAnalysis.filter((i) => i.classification === 'harmful');
  const sugar = nutrition.sugar ?? 0;
  const addedSugar = nutrition.addedSugar ?? nutrition.sugar ?? 0;
  const sodium = nutrition.sodium ?? 0;
  const satFat = nutrition.saturatedFat ?? 0;
  const transFat = nutrition.transFat ?? 0;
  const fiber = nutrition.fiber ?? 0;
  const protein = nutrition.protein ?? 0;
  const calories = nutrition.calories ?? 0;

  recs.diabetic = {
    suitable: addedSugar < 8 && sugar < 12,
    reason:
      addedSugar >= 8 || sugar >= 12
        ? `This product contains ${sugar}g of sugar per serving which is high. Not recommended for diabetic users as it can spike blood glucose.`
        : 'Sugar content is moderate to low. May be acceptable for diabetic users in controlled portions.',
  };

  recs.weight_loss = {
    suitable: calories < 250 && sugar < 10 && fiber > 2,
    reason:
      calories >= 250 || sugar >= 10
        ? `At ${calories} calories per serving with ${sugar}g sugar, this is calorie-dense and not ideal for weight loss goals.`
        : 'Lower in calories and sugar with decent fiber — suitable for a weight loss plan.',
  };

  recs.gym = {
    suitable: protein > 8 && sugar < 15,
    reason:
      protein <= 8
        ? `Only ${protein}g protein per serving. For fitness goals, look for higher protein options to support muscle recovery.`
        : `Good protein content (${protein}g). Supports muscle repair and satiety for active individuals.`,
  };

  recs.kid = {
    suitable: harmful.filter((h) => /dye|color|red|yellow|blue|aspartame|acesulfame|sucralose/i.test(h.name)).length === 0 && sugar < 12,
    reason:
      harmful.some((h) => /dye|color|red|yellow|blue|aspartame|acesulfame|sucralose/i.test(h.name))
        ? 'Contains artificial colors or sweeteners that may affect children. Consider alternatives for kids.'
        : sugar >= 12
          ? `High sugar (${sugar}g) is not ideal for children and may contribute to hyperactivity and dental issues.`
          : 'Free of concerning artificial additives and moderate in sugar. Acceptable for children in reasonable portions.',
  };

  recs.pregnant = {
    suitable: harmful.filter((h) => /nitrite|nitrate|bromat|aspartame|acesulfame|saccharin/i.test(h.name)).length === 0,
    reason:
      harmful.some((h) => /nitrite|nitrate|bromat|aspartame|acesulfame|saccharin/i.test(h.name))
        ? 'Contains additives (nitrates, artificial sweeteners, or bromates) best avoided during pregnancy.'
        : 'No pregnancy-flagged additives detected. Generally acceptable; always consult your doctor for dietary decisions.',
  };

  recs.heart_patient = {
    suitable: sodium < 400 && satFat < 3 && transFat === 0,
    reason:
      transFat > 0
        ? 'Contains trans fat which is strongly harmful for heart health. Avoid this product.'
        : sodium >= 400 || satFat >= 3
          ? `High ${sodium >= 400 ? `sodium (${sodium}mg) ` : ''}${satFat >= 3 ? `and saturated fat (${satFat}g) ` : ''}make this unsuitable for heart patients.`
          : 'Low sodium and saturated fat with no trans fat — compatible with a heart-healthy diet.',
  };

  recs.high_bp = {
    suitable: sodium < 300,
    reason:
      sodium >= 300
        ? `Sodium is ${sodium}mg per serving which is high. Not recommended for individuals with high blood pressure.`
        : `Sodium is ${sodium}mg — within a reasonable range for blood pressure management.`,
  };

  return recs;
}

function generateWarnings(
  nutrition: NutritionFacts,
  ingredientAnalysis: IngredientInfo[],
  allergens: string[]
): string[] {
  const warnings: string[] = [];
  if (nutrition.transFat && nutrition.transFat > 0) warnings.push('Contains trans fat — strongly linked to heart disease.');
  if (nutrition.sodium && nutrition.sodium > 800) warnings.push(`Very high sodium (${nutrition.sodium}mg per serving).`);
  if (nutrition.sugar && nutrition.sugar > 20) warnings.push(`High sugar content (${nutrition.sugar}g per serving).`);
  if (nutrition.addedSugar && nutrition.addedSugar > 15) warnings.push(`High added sugar (${nutrition.addedSugar}g per serving).`);
  if (nutrition.saturatedFat && nutrition.saturatedFat > 5) warnings.push(`High saturated fat (${nutrition.saturatedFat}g per serving).`);
  if (allergens.length > 0) warnings.push(`Contains allergens: ${allergens.join(', ')}.`);
  if (ingredientAnalysis.some((i) => i.classification === 'harmful')) {
    const names = ingredientAnalysis.filter((i) => i.classification === 'harmful').map((i) => i.name);
    warnings.push(`Contains concerning additives: ${names.slice(0, 3).join(', ')}${names.length > 3 ? '…' : ''}`);
  }
  return warnings;
}

function generatePositives(nutrition: NutritionFacts, ingredientAnalysis: IngredientInfo[]): string[] {
  const positives: string[] = [];
  if (nutrition.fiber && nutrition.fiber > 4) positives.push(`Good fiber content (${nutrition.fiber}g per serving).`);
  if (nutrition.protein && nutrition.protein > 8) positives.push(`Good protein content (${nutrition.protein}g per serving).`);
  if (nutrition.sugar != null && nutrition.sugar < 5) positives.push('Low sugar content.');
  if (nutrition.sodium != null && nutrition.sodium < 120) positives.push('Low sodium content.');
  if (nutrition.saturatedFat != null && nutrition.saturatedFat < 1) positives.push('Low saturated fat.');
  if (ingredientAnalysis.some((i) => i.name.toLowerCase().includes('whole grain') || i.name.toLowerCase().includes('whole wheat'))) {
    positives.push('Contains whole grains.');
  }
  const safeCount = ingredientAnalysis.filter((i) => i.classification === 'safe').length;
  if (ingredientAnalysis.length > 0 && safeCount / ingredientAnalysis.length > 0.7) {
    positives.push('Most ingredients are clean and recognizable.');
  }
  return positives;
}

export function analyzeProduct(
  ingredients: string[],
  nutrition: NutritionFacts
): AnalysisResult {
  const ingredientAnalysis = ingredients
    .filter((i) => i.trim().length > 0)
    .map(classifyIngredient);

  const allergens = detectAllergens(ingredients);
  const additives = ingredientAnalysis
    .filter((i) => i.isAdditive || i.classification === 'harmful')
    .map((i) => i.name);
  const { score, breakdown } = computeHealthScore(nutrition, ingredientAnalysis);
  const foodGrade = scoreToGrade(score);
  const recommendations = generateRecommendations(nutrition, ingredientAnalysis, allergens);
  const warnings = generateWarnings(nutrition, ingredientAnalysis, allergens);
  const positives = generatePositives(nutrition, ingredientAnalysis);

  return {
    healthScore: score,
    foodGrade,
    ingredientAnalysis,
    allergens,
    additives,
    recommendations,
    warnings,
    positives,
    scoreBreakdown: breakdown,
  };
}

export function parseIngredients(raw: string): string[] {
  return raw
    .split(/[,;()]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 60);
}
