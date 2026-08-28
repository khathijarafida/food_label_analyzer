import { parseIngredients, type NutritionFacts } from './analysis';

export interface OCRResult {
  rawText: string;
  ingredients: string[];
  nutrition: NutritionFacts;
  productName: string;
}

function extractNumber(text: string, patterns: RegExp[]): number | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const num = parseFloat(match[1]);
      if (!Number.isNaN(num)) return num;
    }
  }
  return undefined;
}

function extractServingSize(text: string): string | undefined {
  const match = text.match(/serving\s*size[:\s]*([^\n]{1,40})/i);
  if (match) return match[1].trim();
  return undefined;
}

function extractProductName(text: string): string | undefined {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  return lines[0]?.slice(0, 60);
}

export async function runOCR(imageDataUrl: string): Promise<OCRResult> {
  const { default: Tesseract } = await import('tesseract.js');
  const result = await Tesseract.recognize(imageDataUrl, 'eng', {
    logger: () => {},
  });
  const rawText = result.data.text || '';

  const lower = rawText.toLowerCase();
  const nutrition: NutritionFacts = {};

  const num = (p: RegExp[]) => extractNumber(lower, p);

  nutrition.calories = num([
    /calories?\s*[:\s]*(\d+(?:\.\d+)?)/,
    /energy\s*[:\s]*(\d+(?:\.\d+)?)\s*kcal/,
    /(\d+(?:\.\d+)?)\s*kcal/,
    /kcal\s*[:\s]*(\d+(?:\.\d+)?)/,
  ]);
  nutrition.servingSize = extractServingSize(lower);
  nutrition.protein = num([/protein\s*[:\s]*(\d+(?:\.\d+)?)\s*g/, /protein\s*[:\s]*(\d+(?:\.\d+)?)/]);
  nutrition.fat = num([/total\s*fat\s*[:\s]*(\d+(?:\.\d+)?)\s*g/, /fat\s*[:\s]*(\d+(?:\.\d+)?)\s*g/, /total\s*fat\s*[:\s]*(\d+(?:\.\d+)?)/]);
  nutrition.saturatedFat = num([/saturat[a-z]*\s*fat\s*[:\s]*(\d+(?:\.\d+)?)\s*g/, /saturat[a-z]*\s*[:\s]*(\d+(?:\.\d+)?)\s*g/]);
  nutrition.transFat = num([/trans\s*fat\s*[:\s]*(\d+(?:\.\d+)?)\s*g/, /trans\s*[:\s]*(\d+(?:\.\d+)?)/]);
  nutrition.sugar = num([/total\s*sugars?\s*[:\s]*(\d+(?:\.\d+)?)\s*g/, /sugars?\s*[:\s]*(\d+(?:\.\d+)?)\s*g/, /sugars?\s*[:\s]*(\d+(?:\.\d+)?)/]);
  nutrition.addedSugar = num([/added\s*sugars?\s*[:\s]*(\d+(?:\.\d+)?)\s*g/, /added\s*sugars?\s*[:\s]*(\d+(?:\.\d+)?)/]);
  nutrition.sodium = num([/sodium\s*[:\s]*(\d+(?:\.\d+)?)\s*mg/, /sodium\s*[:\s]*(\d+(?:\.\d+)?)/]);
  nutrition.fiber = num([/dietary\s*fiber\s*[:\s]*(\d+(?:\.\d+)?)\s*g/, /fiber\s*[:\s]*(\d+(?:\.\d+)?)\s*g/, /fiber\s*[:\s]*(\d+(?:\.\d+)?)/]);
  nutrition.cholesterol = num([/cholesterol\s*[:\s]*(\d+(?:\.\d+)?)\s*mg/, /cholesterol\s*[:\s]*(\d+(?:\.\d+)?)/]);
  nutrition.carbs = num([/total\s*carbohydrate[s]?\s*[:\s]*(\d+(?:\.\d+)?)\s*g/, /carbohydrate[s]?\s*[:\s]*(\d+(?:\.\d+)?)\s*g/]);

  let ingredients: string[] = [];

  // Bounded capture: stop at the next label section instead of running
  // to the end of the OCR text (this was swallowing nutrition/allergen/
  // manufacturer text as "ingredients" before).
  const ingMatch = rawText.match(
    /ingredients?:?\s*([\s\S]*?)(?=\n\s*(nutrition\s*facts|nutrition\s*information|allergen|contains\s*:|may\s*contain|manufactured|distributed|packed\s*by|best\s*before|expiry|net\s*wt|net\s*weight|batch\s*no|barcode|storage)|$)/i
  );

  if (ingMatch) {
    ingredients = parseIngredients(ingMatch[1]);
  }
  if (ingredients.length === 0) {
    ingredients = parseIngredients(rawText);
  }

  return {
    rawText,
    ingredients,
    nutrition,
    productName: extractProductName(rawText) ?? 'Scanned Product',
  };
}