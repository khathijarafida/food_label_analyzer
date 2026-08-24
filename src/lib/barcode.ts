import type { NutritionFacts } from './analysis';
import { parseIngredients } from './analysis';

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
  code?: string;
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

function round(value: number, decimals = 1): number {
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
}

function getNumber(
  data: Record<string, number>,
  keys: string[]
): number | undefined {
  for (const key of keys) {
    if (data[key] != null && Number.isFinite(data[key])) {
      return data[key];
    }
  }

  return undefined;
}

function getNutrition(
  nutriments: Record<string, number>
): NutritionFacts {
  const calories = getNumber(nutriments, [
    'energy-kcal_100g',
    'energy-kcal',
  ]);

  const energyKj = getNumber(nutriments, [
    'energy_100g',
    'energy-kj_100g',
  ]);

  const protein = getNumber(nutriments, [
    'proteins_100g',
    'protein_100g',
  ]);

  const fat = getNumber(nutriments, [
    'fat_100g',
  ]);

  const saturatedFat = getNumber(nutriments, [
    'saturated-fat_100g',
  ]);

  const transFat = getNumber(nutriments, [
    'trans-fat_100g',
  ]);

  const sugar = getNumber(nutriments, [
    'sugars_100g',
    'sugar_100g',
  ]);

  const addedSugar = getNumber(nutriments, [
    'added-sugars_100g',
    'added-sugar_100g',
  ]);

  const sodiumGrams = getNumber(nutriments, [
    'sodium_100g',
  ]);

  const fiber = getNumber(nutriments, [
    'fiber_100g',
  ]);

  const cholesterolGrams = getNumber(nutriments, [
    'cholesterol_100g',
  ]);

  const carbs = getNumber(nutriments, [
    'carbohydrates_100g',
    'carbohydrate_100g',
  ]);

  let finalCalories: number | undefined;

  if (calories != null) {
    finalCalories = Math.round(calories);
  } else if (energyKj != null) {
    finalCalories = Math.round(energyKj / 4.184);
  }

  return {
    calories: finalCalories,

    protein:
      protein != null
        ? round(protein)
        : undefined,

    fat:
      fat != null
        ? round(fat)
        : undefined,

    saturatedFat:
      saturatedFat != null
        ? round(saturatedFat)
        : undefined,

    transFat:
      transFat != null
        ? round(transFat)
        : undefined,

    sugar:
      sugar != null
        ? round(sugar)
        : undefined,

    addedSugar:
      addedSugar != null
        ? round(addedSugar)
        : undefined,

    sodium:
      sodiumGrams != null
        ? Math.round(sodiumGrams * 1000)
        : undefined,

    fiber:
      fiber != null
        ? round(fiber)
        : undefined,

    cholesterol:
      cholesterolGrams != null
        ? Math.round(cholesterolGrams * 1000)
        : undefined,

    carbs:
      carbs != null
        ? round(carbs)
        : undefined,
  };
}

function parseAllergens(raw: string): string[] {
  if (!raw) {
    return [];
  }

  return raw
    .split(',')
    .map((item) =>
      item
        .replace(/^en:/i, '')
        .trim()
        .toLowerCase()
    )
    .filter(Boolean);
}

function parseAdditives(tags: string[]): string[] {
  return tags
    .map((tag) =>
      tag
        .replace(/^en:/i, '')
        .replace(/^additives:/i, '')
        .replace(/-/g, ' ')
        .trim()
    )
    .filter(Boolean);
}

export async function lookupBarcode(
  barcode: string
): Promise<ProductLookupResult> {
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

  if (!cleanBarcode) {
    return fallback;
  }

  try {
    const url =
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(cleanBarcode)}.json` +
      '?fields=code,product_name,brands,categories,image_url,image_front_url,ingredients_text,allergens,additives_tags,nutriments,serving_size,nutriscore_grade';

    const res = await fetch(url);

    if (!res.ok) {
      return fallback;
    }

    const data: OpenFoodFactsResponse =
      await res.json();

    if (
      data.status !== 1 ||
      !data.product
    ) {
      return fallback;
    }

    const product = data.product;
    const nutriments = product.nutriments ?? {};

    const ingredients = parseIngredients(
      product.ingredients_text ?? ''
    );

    const nutrition = getNutrition(
      nutriments
    );

    const allergens = parseAllergens(
      product.allergens ?? ''
    );

    const additives = parseAdditives(
      product.additives_tags ?? []
    );

    return {
      barcode: cleanBarcode,

      productName:
        product.product_name?.trim() ||
        'Unknown Product',

      brand:
        product.brands?.trim() || '',

      category:
        product.categories?.trim() || '',

      imageUrl:
        product.image_front_url ||
        product.image_url ||
        '',

      ingredients,

      nutrition,

      allergens,

      additives,

      servingSize:
        product.serving_size?.trim() || '',

      nutriscoreGrade:
        product.nutriscore_grade,

      found: true,
    };
  } catch (error) {
    console.error(
      'Open Food Facts lookup error:',
      error
    );

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

export async function searchProducts(
  query: string
): Promise<SearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    const url =
      'https://world.openfoodfacts.org/cgi/search.pl' +
      `?search_terms=${encodeURIComponent(query)}` +
      '&search_simple=1' +
      '&action=process' +
      '&json=1' +
      '&page_size=20';

    const res = await fetch(url);

    if (!res.ok) {
      return [];
    }

    const data = await res.json();

    if (
      !data.products ||
      !Array.isArray(data.products)
    ) {
      return [];
    }

    return data.products
      .slice(0, 20)
      .map(
        (
          product: OpenFoodFactsProduct
        ): SearchResult => {
          const nutriments =
            product.nutriments ?? {};

          return {
            barcode:
              product.code ?? '',

            productName:
              product.product_name ??
              'Unknown',

            brand:
              product.brands ?? '',

            category:
              product.categories ?? '',

            imageUrl:
              product.image_front_url ??
              product.image_url ??
              '',

            nutriscoreGrade:
              product.nutriscore_grade,

            nutrition:
              getNutrition(
                nutriments
              ),
          };
        }
      )
      .filter(
        (product: SearchResult) =>
          product.productName !== 'Unknown' ||
          product.barcode !== ''
      );
  } catch (error) {
    console.error(
      'Product search error:',
      error
    );

    return [];
  }
}