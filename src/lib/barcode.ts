import type { NutritionFacts } from './analysis';

export interface OpenFoodFactsProduct {
  product_name?: string;
  brands?: string;
  categories?: string;
  image_url?: string;
  image_front_url?: string;
  ingredients_text?: string;
  allergens?: string;
  additives_tags?: string[];
  nutriments?: Record<string, number>;
  serving_size?: string;
  nutriscore_grade?: string;
}

export interface OpenFoodFactsResponse {
  status?: number;
  product?: OpenFoodFactsProduct;
}

export interface ProductLookupResult {
  barcode: string;
  productName: string;
  brand: string;
  category: string;
  imageUrl: string;
  ingredients: string[];
  nutrition: NutritionFacts;
  allergens: string[];
  additives: string[];
  servingSize: string;
  nutriscoreGrade?: string;
  found: boolean;
}

export async function lookupBarcode(barcode: string): Promise<ProductLookupResult> {
  const cleanBarcode = barcode.trim();
  const fallback: ProductLookupResult = {
    barcode: cleanBarcode,
    productName: 'Unknown Product',
    brand: '',
    category: '',
    imageUrl: '',
    ingredients: [],
    nutrition: {},
    allergens: [],
    additives: [],
    servingSize: '',
    found: false,
  };

  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`);
    if (!res.ok) return fallback;
    const data: OpenFoodFactsResponse = await res.json();
    if (!data.product || data.status !== 1) return fallback;

    const p = data.product;
    const n = p.nutriments ?? {};

    const nutrition: NutritionFacts = {
      calories: n['energy-kcal_100g'] ?? n['energy-kcal'] ?? n['energy_100g'] ? Math.round((n['energy-kcal_100g'] ?? n['energy-kcal'] ?? 0)) : undefined,
      protein: n['proteins_100g'] != null ? Math.round(n['proteins_100g'] * 10) / 10 : undefined,
      fat: n['fat_100g'] != null ? Math.round(n['fat_100g'] * 10) / 10 : undefined,
      saturatedFat: n['saturated-fat_100g'] != null ? Math.round(n['saturated-fat_100g'] * 10) / 10 : undefined,
      transFat: n['trans-fat_100g'] != null ? Math.round(n['trans-fat_100g'] * 10) / 10 : undefined,
      sugar: n['sugars_100g'] != null ? Math.round(n['sugars_100g'] * 10) / 10 : undefined,
      sodium: n['sodium_100g'] != null ? Math.round(n['sodium_100g'] * 10) / 10 : undefined,
      fiber: n['fiber_100g'] != null ? Math.round(n['fiber_100g'] * 10) / 10 : undefined,
      cholesterol: n['cholesterol_100g'] != null ? Math.round(n['cholesterol_100g'] * 10) / 10 : undefined,
      carbs: n['carbohydrates_100g'] != null ? Math.round(n['carbohydrates_100g'] * 10) / 10 : undefined,
    };

    if (nutrition.calories == null && n['energy_100g'] != null) {
      nutrition.calories = Math.round(n['energy_100g'] / 4.184);
    }

    const ingredients = (p.ingredients_text ?? '')
      .split(/[,;().]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 60);

    const allergens = (p.allergens ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const additives = (p.additives_tags ?? []).map((t) => t.replace('en:', '').replace(/-/g, ' '));

    return {
      barcode: cleanBarcode,
      productName: p.product_name ?? 'Unknown Product',
      brand: p.brands ?? '',
      category: p.categories ?? '',
      imageUrl: p.image_front_url ?? p.image_url ?? '',
      ingredients,
      nutrition,
      allergens,
      additives,
      servingSize: p.serving_size ?? '',
      nutriscoreGrade: p.nutriscore_grade,
      found: true,
    };
  } catch {
    return fallback;
  }
}

export interface SearchResult {
  barcode: string;
  productName: string;
  brand: string;
  category: string;
  imageUrl: string;
  nutrition: NutritionFacts;
  nutriscoreGrade?: string;
}

export async function searchProducts(query: string): Promise<SearchResult[]> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.products) return [];
    return data.products.slice(0, 20).map((p: OpenFoodFactsProduct & { code?: string; nutriments?: Record<string, number> }) => {
      const n = p.nutriments ?? {};
      return {
        barcode: p.code ?? '',
        productName: p.product_name ?? 'Unknown',
        brand: p.brands ?? '',
        category: p.categories ?? '',
        imageUrl: p.image_front_url ?? p.image_url ?? '',
        nutriscoreGrade: p.nutriscore_grade,
        nutrition: {
          calories: n['energy-kcal_100g'] != null ? Math.round(n['energy-kcal_100g']) : undefined,
          protein: n['proteins_100g'] != null ? Math.round(n['proteins_100g'] * 10) / 10 : undefined,
          fat: n['fat_100g'] != null ? Math.round(n['fat_100g'] * 10) / 10 : undefined,
          saturatedFat: n['saturated-fat_100g'] != null ? Math.round(n['saturated-fat_100g'] * 10) / 10 : undefined,
          sugar: n['sugars_100g'] != null ? Math.round(n['sugars_100g'] * 10) / 10 : undefined,
          sodium: n['sodium_100g'] != null ? Math.round(n['sodium_100g'] * 10) / 10 : undefined,
          fiber: n['fiber_100g'] != null ? Math.round(n['fiber_100g'] * 10) / 10 : undefined,
        },
      };
    });
  } catch {
    return [];
  }
}
