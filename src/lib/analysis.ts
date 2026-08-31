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
  recommendations: Record<
    string,
    {
      suitable: boolean;
      reason: string;
    }
  >;
  warnings: string[];
  positives: string[];
  scoreBreakdown: {
    label: string;
    points: number;
    max: number;
  }[];
}
 
export const ALLERGENS = [
  'milk',
  'egg',
  'soy',
  'gluten',
  'wheat',
  'peanut',
  'tree nut',
  'tree nuts',
  'shellfish',
  'fish',
  'sesame',
  'mustard',
  'celery',
  'sulphite',
  'lupin',
] as const;
 
const ALLERGEN_ALIASES: Record<string, string[]> = {
  milk: [
    'milk',
    'cream',
    'butter',
    'cheese',
    'whey',
    'casein',
    'lactose',
    'ghee',
    'milk powder',
    'skim milk',
    'milkfat',
  ],
  egg: [
    'egg',
    'albumin',
    'ovalbumin',
    'mayonnaise',
    'eggnog',
    'egg white',
    'egg yolk',
  ],
  soy: [
    'soy',
    'soya',
    'soybean',
    'tofu',
    'tempeh',
    'edamame',
    'soy sauce',
    'soy lecithin',
  ],
  gluten: [
    'wheat',
    'gluten',
    'barley',
    'rye',
    'spelt',
    'semolina',
    'durum',
    'farro',
    'couscous',
    'bread',
    'flour',
  ],
  peanut: ['peanut', 'groundnut', 'arachis'],
  'tree nuts': [
    'almond',
    'cashew',
    'walnut',
    'pecan',
    'hazelnut',
    'pistachio',
    'brazil nut',
    'macadamia',
    'pine nut',
  ],
  shellfish: [
    'shrimp',
    'prawn',
    'crab',
    'lobster',
    'crayfish',
    'scampi',
  ],
  fish: [
    'fish',
    'tuna',
    'salmon',
    'cod',
    'mackerel',
    'sardine',
    'anchovy',
    'tilapia',
    'halibut',
  ],
  sesame: ['sesame', 'sesame oil', 'tahini', 'sesamum'],
};
 
const HARMFUL_INGREDIENTS: Record<string, string> = {
  'high fructose corn syrup':
    'High in added sugar and should be limited as part of a balanced diet.',
  'partially hydrogenated':
    'Indicates partially hydrogenated fat, which may contain industrial trans fat.',
  hydrogenated:
    'Hydrogenated fats should be limited, especially when they contribute trans fat.',
  bha: 'Synthetic preservative that should be limited when present frequently in the diet.',
  bht: 'Synthetic preservative. Intake should be kept moderate.',
  'sodium nitrite':
    'Preservative commonly used in processed meats. Frequent consumption of processed meats should be limited.',
  'sodium nitrate':
    'Preservative used in processed foods. Frequent consumption should be limited.',
  'potassium bromate':
    'Flour treatment agent that is restricted or banned in some countries.',
  'brominated vegetable oil':
    'Food additive that is restricted in some countries.',
  tbhq: 'Synthetic antioxidant preservative. Intake should be limited as part of a varied diet.',
  'red 40':
    'Artificial food coloring that some people may prefer to limit.',
  'red 3':
    'Artificial food coloring that is restricted in some regions.',
  'yellow 5':
    'Artificial food coloring that some sensitive individuals may react to.',
  'yellow 6':
    'Artificial food coloring that some people may prefer to limit.',
  'blue 1':
    'Artificial food coloring that some people may prefer to limit.',
  'blue 2':
    'Artificial food coloring that should remain within regulated food-use levels.',
  'caramel color':
    'Food coloring used in many processed foods.',
  msg: 'Flavor enhancer commonly used in processed foods.',
  'monosodium glutamate':
    'Flavor enhancer. Generally permitted in foods; individual sensitivity can vary.',
  sulfite:
    'Preservative that can cause reactions in sensitive individuals.',
  sulphite:
    'Preservative that can cause reactions in sensitive individuals.',
  'sodium benzoate':
    'Common preservative used within regulated limits.',
  'acesulfame k':
    'Artificial sweetener. Intake should remain within recommended limits.',
  'acesulfame potassium':
    'Artificial sweetener. Intake should remain within recommended limits.',
  aspartame:
    'Artificial sweetener. People with phenylketonuria need to avoid it.',
  sucralose:
    'Artificial sweetener. Suitable within recommended intake levels.',
  saccharin:
    'Artificial sweetener. Suitable within regulated intake levels.',
  'sodium aluminum phosphate':
    'Leavening ingredient containing aluminum. Intake should remain moderate.',
  'aluminum lake':
    'Color additive containing aluminum and used in processed foods.',
};
 
const MODERATE_INGREDIENTS: Record<string, string> = {
  sugar:
    'Added sugar. Excessive intake can contribute to excess calorie intake and dental problems.',
  'cane sugar': 'Added sugar. Should be consumed in moderation.',
  'brown sugar':
    'Added sugar with a similar nutritional effect to other added sugars.',
  dextrose: 'Simple sugar that can raise blood glucose quickly.',
  maltodextrin: 'Processed carbohydrate with a high glycemic index.',
  'corn syrup': 'Added sugar. Frequent high intake should be limited.',
  'invert syrup': 'Added sugar that contributes to total sugar intake.',
  'palm oil':
    'Contains a relatively high amount of saturated fat. Moderate intake is recommended.',
  'canola oil':
    'Refined cooking oil. Moderate consumption is generally acceptable.',
  'soybean oil':
    'Refined vegetable oil. Overall dietary balance is more important than avoiding it completely.',
  'sunflower oil':
    'Refined seed oil. Moderate consumption is generally acceptable.',
  'cottonseed oil':
    'Refined vegetable oil commonly used in processed foods.',
  shortening:
    'Solid fat that may contain significant saturated fat and should be limited.',
  glycerin:
    'Food additive commonly used as a humectant. Generally permitted in foods.',
  'modified food starch':
    'Processed thickening ingredient with limited nutritional value.',
  'xanthan gum':
    'Thickener generally considered safe in normal food quantities.',
  carrageenan:
    'Thickener used in processed foods. Individual tolerance may vary.',
  'natural flavor':
    'Broad ingredient category that does not specify the exact flavoring substances.',
  'artificial flavor':
    'Synthetic flavoring category. Exact ingredients are not specified on the label.',
  inulin:
    'Added fiber that can cause digestive discomfort in some people at high amounts.',
  'potassium sorbate':
    'Common preservative used within regulated food-use levels.',
  'calcium sorbate':
    'Preservative generally used in small quantities.',
  'citric acid':
    'Common acidity regulator used in many foods.',
  'phosphoric acid':
    'Acidulant commonly found in soft drinks and processed beverages.',
  monoglycerides: 'Emulsifier used in processed foods.',
  diglycerides: 'Emulsifier used in processed foods.',
  'soy lecithin':
    'Common emulsifier. Soy-sensitive individuals should check allergen labeling.',
  lecithin: 'Common emulsifier used in many processed foods.',
};
 
const SAFE_INGREDIENTS: Record<string, string> = {
  water: 'Essential and naturally present in many foods.',
  'whole grain':
    'Whole grains provide fiber, vitamins, minerals, and sustained energy.',
  'whole wheat': 'Whole grain ingredient that provides fiber and nutrients.',
  oats: 'Whole grain rich in soluble fiber.',
  'brown rice': 'Whole grain providing fiber and minerals.',
  quinoa: 'Nutrient-dense grain-like food providing protein and fiber.',
  'sea salt': 'Provides sodium. Like other salt, it should be consumed in moderation.',
  salt: 'Provides sodium, which is essential but easy to consume in excess.',
  honey: 'Natural sweetener, but still contributes to total sugar intake.',
  'maple syrup': 'Natural sweetener that still contributes to total sugar intake.',
  fruit: 'Whole fruit provides vitamins, minerals, fiber, and antioxidants.',
  vegetable: 'Vegetables provide vitamins, minerals, fiber, and beneficial compounds.',
  tomato: 'Provides lycopene, vitamin C, and potassium.',
  onion: 'Provides antioxidants and prebiotic compounds.',
  garlic: 'Provides beneficial plant compounds.',
  'olive oil': 'Rich in monounsaturated fat and other beneficial compounds.',
  'extra virgin olive oil':
    'Provides monounsaturated fat and antioxidant compounds.',
  vinegar: 'Common food ingredient used for acidity and flavor.',
  'apple cider vinegar': 'Common vinegar used in foods and beverages.',
  herbs: 'Natural flavoring ingredients that can provide plant compounds.',
  spices: 'Natural flavoring ingredients that may provide antioxidants.',
  turmeric: 'Contains curcumin and other plant compounds.',
  ginger: 'Contains naturally occurring bioactive compounds.',
  cinnamon: 'Common spice containing antioxidant compounds.',
  'black pepper': 'Common spice containing piperine and other plant compounds.',
  lemon: 'Provides vitamin C and other plant compounds.',
  citrus: 'Provides vitamin C and flavonoids.',
  egg: 'Provides high-quality protein and several vitamins and minerals.',
  milk: 'Provides protein, calcium, and other nutrients.',
  yogurt: 'Can provide protein, calcium, and live cultures.',
  chicken: 'Provides protein and several nutrients.',
  beef: 'Provides protein, iron, and other nutrients.',
  fish: 'Provides protein and, depending on the type, omega-3 fatty acids.',
  salmon: 'Rich source of protein and omega-3 fatty acids.',
  'whey protein': 'High-quality protein source.',
  almond: 'Provides healthy fats, protein, fiber, and vitamin E.',
  cashew: 'Provides healthy fats, protein, and minerals.',
  walnut: 'Provides healthy fats and plant omega-3 fatty acids.',
  peanut: 'Provides protein and healthy fats. Peanut allergy should be considered.',
  lentil: 'Provides plant protein, fiber, iron, and folate.',
  chickpea: 'Provides plant protein, fiber, and minerals.',
  bean: 'Provides fiber and plant protein.',
  spinach: 'Provides folate, vitamins, minerals, and plant compounds.',
  kale: 'Nutrient-dense leafy vegetable.',
  carrot: 'Provides beta-carotene and other nutrients.',
  broccoli: 'Provides fiber, vitamins, and plant compounds.',
  potato: 'Provides carbohydrates, potassium, and vitamin C depending on preparation.',
  'sugar cane':
    'Source of sugar. Once processed into sugar, it contributes to added sugar intake.',
  yeast: 'Common food ingredient used for fermentation and leavening.',
  'baking soda': 'Common leavening agent used in small quantities.',
  enzyme: 'Enzymes are commonly used during food processing.',
  'vinegar culture': 'Used in fermentation processes.',
  probiotic: 'Beneficial microorganisms used in some fermented foods.',
  'ascorbic acid': 'Vitamin C used as an antioxidant and food preservative.',
  'vitamin c': 'Essential vitamin with antioxidant functions.',
  'vitamin e': 'Antioxidant vitamin.',
  iron: 'Essential mineral involved in oxygen transport.',
  calcium: 'Essential mineral important for bones and teeth.',
  potassium: 'Essential mineral important for nerve and muscle function.',
  magnesium: 'Essential mineral involved in many body processes.',
  zinc: 'Essential mineral involved in immune function and metabolism.',
};
 
function normalize(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[.,;:()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ');
}
 
function containsIngredient(ingredient: string, key: string): boolean {
  const text = ` ${normalize(ingredient)} `;
  const target = ` ${normalize(key)} `;
 
  return text.includes(target);
}
 
function classifyIngredient(raw: string): IngredientInfo {
  const cleanName = raw.trim();
  const name = normalize(cleanName);
 
  if (!name) {
    return {
      name: cleanName,
      classification: 'safe',
      reason: 'Empty ingredient entry.',
      isAdditive: false,
      isArtificial: false,
    };
  }
 
  for (const [key, reason] of Object.entries(HARMFUL_INGREDIENTS)) {
    if (containsIngredient(name, key)) {
      return {
        name: cleanName,
        classification: 'harmful',
        reason,
        isAdditive: true,
        isArtificial:
          /dye|color|red|yellow|blue|lake|artificial|hydrogenated|bromat/i.test(
            key
          ),
      };
    }
  }
 
  for (const [key, reason] of Object.entries(MODERATE_INGREDIENTS)) {
    if (containsIngredient(name, key)) {
      return {
        name: cleanName,
        classification: 'moderate',
        reason,
        isAdditive:
          /gum|emulsif|preserv|starch|flavor|acid|sorbate|lecithin/i.test(
            key
          ),
        isArtificial: /artificial|synthetic/i.test(key),
      };
    }
  }
 
  for (const [key, reason] of Object.entries(SAFE_INGREDIENTS)) {
    if (containsIngredient(name, key)) {
      return {
        name: cleanName,
        classification: 'safe',
        reason,
        isAdditive: false,
        isArtificial: false,
      };
    }
  }
 
  return {
    name: cleanName,
    classification: 'moderate',
    reason:
      'This ingredient is not in the current assessment database and should be reviewed rather than automatically considered safe.',
    isAdditive: false,
    isArtificial: false,
  };
}
 
function detectAllergens(ingredients: string[]): string[] {
  const found = new Set<string>();
 
  const text = ingredients.map(normalize).join(' ');
 
  for (const [allergen, aliases] of Object.entries(ALLERGEN_ALIASES)) {
    const detected = aliases.some((alias) =>
      text.includes(normalize(alias))
    );
 
    if (detected) {
      found.add(allergen);
    }
  }
 
  return [...found];
}
 
function computeHealthScore(
  nutrition: NutritionFacts,
  ingredientAnalysis: IngredientInfo[]
): {
  score: number;
  breakdown: {
    label: string;
    points: number;
    max: number;
  }[];
} {
  const breakdown: {
    label: string;
    points: number;
    max: number;
  }[] = [];
 
  let score = 50;
 
  const harmful = ingredientAnalysis.filter(
    (item) => item.classification === 'harmful'
  ).length;
 
  const moderate = ingredientAnalysis.filter(
    (item) => item.classification === 'moderate'
  ).length;
 
  const safe = ingredientAnalysis.filter(
    (item) => item.classification === 'safe'
  ).length;
 
  let ingredientPoints = 0;
 
  ingredientPoints -= Math.min(harmful * 8, 24);
  ingredientPoints -= Math.min(moderate * 2, 12);
 
  if (
    ingredientAnalysis.length > 0 &&
    safe / ingredientAnalysis.length >= 0.7
  ) {
    ingredientPoints += 10;
  }
 
  ingredientPoints = Math.max(-30, Math.min(10, ingredientPoints));
 
  breakdown.push({
    label: 'Ingredients',
    points: ingredientPoints,
    max: 10,
  });
 
  score += ingredientPoints;
 
  if (nutrition.sodium != null) {
    let points = 0;
 
    if (nutrition.sodium > 800) {
      points = -12;
    } else if (nutrition.sodium > 500) {
      points = -8;
    } else if (nutrition.sodium > 300) {
      points = -4;
    } else if (nutrition.sodium < 120) {
      points = 5;
    }
 
    breakdown.push({
      label: 'Sodium',
      points,
      max: 5,
    });
 
    score += points;
  }
 
  if (nutrition.sugar != null) {
    let points = 0;
 
    if (nutrition.sugar > 25) {
      points = -15;
    } else if (nutrition.sugar > 15) {
      points = -10;
    } else if (nutrition.sugar > 10) {
      points = -5;
    } else if (nutrition.sugar < 5) {
      points = 5;
    }
 
    breakdown.push({
      label: 'Sugar',
      points,
      max: 5,
    });
 
    score += points;
  }
 
  if (nutrition.addedSugar != null) {
    let points = 0;
 
    if (nutrition.addedSugar > 15) {
      points = -10;
    } else if (nutrition.addedSugar > 8) {
      points = -6;
    } else if (nutrition.addedSugar > 5) {
      points = -3;
    } else if (nutrition.addedSugar === 0) {
      points = 5;
    }
 
    breakdown.push({
      label: 'Added Sugar',
      points,
      max: 5,
    });
 
    score += points;
  }
 
  if (nutrition.saturatedFat != null) {
    let points = 0;
 
    if (nutrition.saturatedFat > 5) {
      points = -10;
    } else if (nutrition.saturatedFat > 3) {
      points = -6;
    } else if (nutrition.saturatedFat > 1) {
      points = -2;
    } else {
      points = 4;
    }
 
    breakdown.push({
      label: 'Saturated Fat',
      points,
      max: 4,
    });
 
    score += points;
  }
 
  if (nutrition.transFat != null) {
    const points = nutrition.transFat > 0 ? -12 : 5;
 
    breakdown.push({
      label: 'Trans Fat',
      points,
      max: 5,
    });
 
    score += points;
  }
 
  if (nutrition.cholesterol != null) {
    let points = 0;
 
    if (nutrition.cholesterol > 100) {
      points = -8;
    } else if (nutrition.cholesterol > 60) {
      points = -4;
    } else if (nutrition.cholesterol > 20) {
      points = -1;
    } else {
      points = 3;
    }
 
    breakdown.push({
      label: 'Cholesterol',
      points,
      max: 3,
    });
 
    score += points;
  }
 
  if (nutrition.fiber != null) {
    let points = 0;
 
    if (nutrition.fiber > 6) {
      points = 8;
    } else if (nutrition.fiber > 3) {
      points = 5;
    } else if (nutrition.fiber < 1) {
      points = -3;
    }
 
    breakdown.push({
      label: 'Fiber',
      points,
      max: 8,
    });
 
    score += points;
  }
 
  if (nutrition.protein != null) {
    let points = 0;
 
    if (nutrition.protein > 15) {
      points = 8;
    } else if (nutrition.protein > 8) {
      points = 5;
    } else if (nutrition.protein > 5) {
      points = 2;
    }
 
    breakdown.push({
      label: 'Protein',
      points,
      max: 8,
    });
 
    score += points;
  }
 
  if (nutrition.calories != null) {
    let points = 0;
 
    if (nutrition.calories > 500) {
      points = -8;
    } else if (nutrition.calories > 400) {
      points = -5;
    } else if (nutrition.calories > 300) {
      points = -2;
    } else if (nutrition.calories < 150) {
      points = 3;
    }
 
    breakdown.push({
      label: 'Calories',
      points,
      max: 3,
    });
 
    score += points;
  }
 
  const availableNutrition = [
    nutrition.sodium,
    nutrition.sugar,
    nutrition.addedSugar,
    nutrition.saturatedFat,
    nutrition.transFat,
    nutrition.cholesterol,
    nutrition.fiber,
    nutrition.protein,
    nutrition.calories,
  ].filter((value) => value != null).length;
 
  if (availableNutrition === 0) {
    score -= 10;
 
    breakdown.push({
      label: 'Nutrition Data',
      points: -10,
      max: 0,
    });
  }
 
  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    breakdown,
  };
}
 
function scoreToGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}
 
function generateRecommendations(
  nutrition: NutritionFacts,
  ingredientAnalysis: IngredientInfo[],
  allergens: string[]
): Record<
  string,
  {
    suitable: boolean;
    reason: string;
  }
> {
  const recommendations: Record<
    string,
    {
      suitable: boolean;
      reason: string;
    }
  > = {};
 
  const harmful = ingredientAnalysis.filter(
    (item) => item.classification === 'harmful'
  );
 
  const sugar = nutrition.sugar ?? 0;
  const addedSugar = nutrition.addedSugar ?? nutrition.sugar ?? 0;
  const sodium = nutrition.sodium ?? 0;
  const saturatedFat = nutrition.saturatedFat ?? 0;
  const transFat = nutrition.transFat ?? 0;
  const cholesterol = nutrition.cholesterol ?? 0;
  const carbs = nutrition.carbs ?? 0;
  const fiber = nutrition.fiber ?? 0;
  const protein = nutrition.protein ?? 0;
  const calories = nutrition.calories ?? 0;
 
  recommendations.diabetic = {
    suitable: addedSugar < 8 && sugar < 12 && carbs < 30,
    reason:
      addedSugar >= 8 || sugar >= 12
        ? `This product contains ${sugar}g of sugar per 100g. Consider a lower-sugar option.`
        : carbs >= 30
          ? `This product contains ${carbs}g of total carbohydrates per 100g.`
          : 'Sugar and carbohydrate content are relatively low. Portion size should still be considered.',
  };
 
  recommendations.weight_loss = {
    suitable: calories < 250 && sugar < 10 && fiber > 2,
    reason:
      calories >= 250
        ? `This product contains ${calories} calories per 100g.`
        : sugar >= 10
          ? `This product contains ${sugar}g sugar per 100g.`
          : fiber <= 2
            ? 'Fiber content is relatively low for a weight-management food.'
            : 'Lower calorie and sugar content with useful fiber.',
  };
 
  recommendations.gym = {
    suitable: protein > 8 && sugar < 15,
    reason:
      protein <= 8
        ? `Protein is ${protein}g per 100g. Higher-protein foods may be more useful for muscle recovery.`
        : `Provides ${protein}g protein per 100g and may support protein intake.`,
  };
 
  const artificialConcern = harmful.some((item) =>
    /dye|color|red|yellow|blue|aspartame|acesulfame|sucralose/i.test(
      item.name
    )
  );
 
  recommendations.kid = {
    suitable: !artificialConcern && sugar < 12,
    reason: artificialConcern
      ? 'Contains ingredients that some parents may prefer to limit in children.'
      : sugar >= 12
        ? `Sugar is ${sugar}g per 100g, which is relatively high.`
        : 'No major flagged artificial-color or sweetener concern was detected.',
  };
 
  const pregnancyConcern = harmful.some((item) =>
    /nitrite|nitrate|bromat|aspartame|acesulfame|saccharin/i.test(
      item.name
    )
  );
 
  recommendations.pregnant = {
    suitable: !pregnancyConcern,
    reason: pregnancyConcern
      ? 'Some ingredients in this product may require additional dietary consideration during pregnancy.'
      : 'No pregnancy-specific flagged ingredients were detected.',
  };
 
  recommendations.heart_patient = {
    suitable:
      sodium < 400 &&
      saturatedFat < 3 &&
      transFat === 0 &&
      cholesterol < 60,
    reason:
      transFat > 0
        ? 'Contains trans fat, which should be avoided as much as possible.'
        : cholesterol >= 60
          ? `This product has ${cholesterol}mg cholesterol per 100g.`
          : sodium >= 400 || saturatedFat >= 3
            ? `This product has ${sodium}mg sodium and ${saturatedFat}g saturated fat per 100g.`
            : 'Relatively low sodium, saturated fat, and cholesterol with no detected trans fat.',
  };
 
  recommendations.high_bp = {
    suitable: sodium < 300,
    reason:
      sodium >= 300
        ? `Sodium is ${sodium}mg per 100g. A lower-sodium product may be preferable.`
        : `Sodium is ${sodium}mg per 100g.`,
  };
 
  recommendations.allergen_safe = {
    suitable: allergens.length === 0,
    reason:
      allergens.length > 0
        ? `Detected allergens: ${allergens.join(', ')}.`
        : 'No listed allergens were detected in the ingredient text.',
  };
 
  return recommendations;
}
 
function generateWarnings(
  nutrition: NutritionFacts,
  ingredientAnalysis: IngredientInfo[],
  allergens: string[]
): string[] {
  const warnings: string[] = [];
 
  if (nutrition.transFat != null && nutrition.transFat > 0) {
    warnings.push('Contains trans fat.');
  }
 
  if (nutrition.sodium != null && nutrition.sodium > 800) {
    warnings.push(
      `Very high sodium (${nutrition.sodium}mg per 100g).`
    );
  }
 
  if (nutrition.sugar != null && nutrition.sugar > 20) {
    warnings.push(
      `High sugar content (${nutrition.sugar}g per 100g).`
    );
  }
 
  if (nutrition.addedSugar != null && nutrition.addedSugar > 15) {
    warnings.push(
      `High added sugar (${nutrition.addedSugar}g per 100g).`
    );
  }
 
  if (
    nutrition.saturatedFat != null &&
    nutrition.saturatedFat > 5
  ) {
    warnings.push(
      `High saturated fat (${nutrition.saturatedFat}g per 100g).`
    );
  }
 
  if (nutrition.cholesterol != null && nutrition.cholesterol > 100) {
    warnings.push(
      `High cholesterol (${nutrition.cholesterol}mg per 100g).`
    );
  }
 
  if (allergens.length > 0) {
    warnings.push(
      `Detected allergens: ${allergens.join(', ')}.`
    );
  }
 
  const harmful = ingredientAnalysis.filter(
    (item) => item.classification === 'harmful'
  );
 
  if (harmful.length > 0) {
    const names = harmful.map((item) => item.name);
 
    warnings.push(
      `Flagged ingredients: ${names.slice(0, 3).join(', ')}${
        names.length > 3 ? '…' : ''
      }`
    );
  }
 
  return warnings;
}
 
function generatePositives(
  nutrition: NutritionFacts,
  ingredientAnalysis: IngredientInfo[]
): string[] {
  const positives: string[] = [];
 
  if (nutrition.fiber != null && nutrition.fiber > 4) {
    positives.push(
      `Good fiber content (${nutrition.fiber}g per 100g).`
    );
  }
 
  if (nutrition.protein != null && nutrition.protein > 8) {
    positives.push(
      `Good protein content (${nutrition.protein}g per 100g).`
    );
  }
 
  if (nutrition.sugar != null && nutrition.sugar < 5) {
    positives.push('Low sugar content.');
  }
 
  if (nutrition.sodium != null && nutrition.sodium < 120) {
    positives.push('Low sodium content.');
  }
 
  if (
    nutrition.saturatedFat != null &&
    nutrition.saturatedFat < 1
  ) {
    positives.push('Low saturated fat.');
  }
 
  if (nutrition.cholesterol != null && nutrition.cholesterol < 20) {
    positives.push('Low cholesterol.');
  }
 
  if (ingredientAnalysis.some((item) => {
    const name = item.name.toLowerCase();
 
    return (
      name.includes('whole grain') ||
      name.includes('whole wheat')
    );
  })) {
    positives.push('Contains whole grains.');
  }
 
  const safeCount = ingredientAnalysis.filter(
    (item) => item.classification === 'safe'
  ).length;
 
  if (
    ingredientAnalysis.length > 0 &&
    safeCount / ingredientAnalysis.length > 0.7
  ) {
    positives.push(
      'Most recognized ingredients have a favorable classification.'
    );
  }
 
  return positives;
}
 
export function analyzeProduct(
  ingredients: string[],
  nutrition: NutritionFacts
): AnalysisResult {
  const cleanIngredients = ingredients
    .map((ingredient) => ingredient.trim())
    .filter((ingredient) => ingredient.length > 0);
 
  const ingredientAnalysis = cleanIngredients.map(
    classifyIngredient
  );
 
  const allergens = detectAllergens(cleanIngredients);
 
  const additives = ingredientAnalysis
    .filter(
      (item) =>
        item.isAdditive ||
        item.classification === 'harmful'
    )
    .map((item) => item.name);
 
  const { score, breakdown } = computeHealthScore(
    nutrition,
    ingredientAnalysis
  );
 
  const foodGrade = scoreToGrade(score);
 
  const recommendations = generateRecommendations(
    nutrition,
    ingredientAnalysis,
    allergens
  );
 
  const warnings = generateWarnings(
    nutrition,
    ingredientAnalysis,
    allergens
  );
 
  const positives = generatePositives(
    nutrition,
    ingredientAnalysis
  );
 
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
 
function looksLikeIngredient(item: string): boolean {
  const letters = item.replace(/[^a-zA-Z]/g, '').length;
  if (letters === 0) return false;
  if (letters / item.length < 0.6) return false;
 
  const isShort = item.length <= 5;
  const upperRatio = item.replace(/[^A-Z]/g, '').length / letters;
  if (!isShort && upperRatio > 0.8) return false;
 
  if (/[»\\|~^_{}[\]#$%£@]/.test(item)) return false;
 
  const words = item.split(/\s+/).filter(Boolean);
  const shortWordRatio =
    words.filter((w) => w.replace(/[^a-zA-Z]/g, '').length <= 2).length /
    words.length;
  if (words.length > 2 && shortWordRatio > 0.5) return false;
 
  return true;
}
 
export function parseIngredients(raw: string): string[] {
  if (!raw.trim()) {
    return [];
  }
 
  return raw
    .replace(/\([^)]*\)/g, (match) =>
      match.slice(1, -1).replace(/[,;]/g, ' ')
    )
    .split(/[,;]+/)
    .map((item) => item.trim())
    .filter(
      (item) =>
        item.length > 1 &&
        item.length < 100 &&
        looksLikeIngredient(item)
    );
}
 
