import { parseIngredients, type NutritionFacts } from './analysis';

export interface OCRResult {
  rawText: string;
  ingredients: string[];
  nutrition: NutritionFacts;
  productName: string;
}

// --- Preprocessing: grayscale + contrast stretch + upscale ---
async function preprocessImage(imageDataUrl: string): Promise<string> {
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = imageDataUrl;
  });

  // Upscale small images — Tesseract struggles below ~1000px on the long edge
  const scale = img.width < 1000 ? 2 : 1;
  const canvas = document.createElement('canvas');
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Grayscale + simple contrast stretch (histogram min/max)
  let min = 255, max = 0;
  const gray = new Uint8ClampedArray(data.length / 4);
  for (let i = 0; i < data.length; i += 4) {
    const g = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    gray[i / 4] = g;
    if (g < min) min = g;
    if (g > max) max = g;
  }
  const range = Math.max(max - min, 1);
  for (let i = 0; i < data.length; i += 4) {
    const stretched = ((gray[i / 4] - min) / range) * 255;
    data[i] = data[i + 1] = data[i + 2] = stretched;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

// --- Clean common OCR misreads before parsing ingredients ---
function cleanOcrArtifacts(text: string): string {
  return text
    .replace(/-\n/g, '')          // rejoin hyphenated line breaks
    .replace(/\n(?=[a-z])/g, ' ') // join lines that got broken mid-sentence
    .replace(/[|]/g, 'I');        // common vertical-bar misread
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
  const { createWorker, PSM } = await import('tesseract.js');

  const processedImage = await preprocessImage(imageDataUrl);

  let worker;
  let rawText = '';
  try {
    worker = await createWorker('eng');
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      preserve_interword_spaces: '1',
    });

    const result = await worker.recognize(processedImage);
    rawText = result.data.text || '';

    if (result.data.confidence < 40) {
      console.warn('Low OCR confidence:', result.data.confidence);
    }
  } catch (err) {
    console.error('OCR failed:', err);
    throw new Error('Could not read the label. Try a clearer photo.');
  } finally {
    await worker?.terminate();
  }

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
    ingredients = parseIngredients(cleanOcrArtifacts(ingMatch[1]));
  }
  if (ingredients.length === 0) {
    ingredients = parseIngredients(cleanOcrArtifacts(rawText));
  }

  return {
    rawText,
    ingredients,
    nutrition,
    productName: extractProductName(rawText) ?? 'Scanned Product',
  };
}