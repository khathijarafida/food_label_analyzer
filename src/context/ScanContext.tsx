import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AnalysisResult, NutritionFacts } from '@/lib/analysis';

export interface PendingScan {
  barcode: string | null;
  productName: string;
  brand: string;
  category: string;
  imageUrl: string;
  ingredients: string[];
  nutrition: NutritionFacts;
  allergens: string[];
  additives: string[];
  analysis: AnalysisResult;
}

interface ScanContextValue {
  pendingScan: PendingScan | null;
  compareLeft: PendingScan | null;
  compareRight: PendingScan | null;
  setPendingScan: (s: PendingScan | null) => void;
  setCompareLeft: (s: PendingScan | null) => void;
  setCompareRight: (s: PendingScan | null) => void;
}

const ScanContext = createContext<ScanContextValue | undefined>(undefined);

export function ScanProvider({ children }: { children: ReactNode }) {
  const [pendingScan, setPendingScan] = useState<PendingScan | null>(null);
  const [compareLeft, setCompareLeft] = useState<PendingScan | null>(null);
  const [compareRight, setCompareRight] = useState<PendingScan | null>(null);

  return (
    <ScanContext.Provider
      value={{ pendingScan, compareLeft, compareRight, setPendingScan, setCompareLeft, setCompareRight }}
    >
      {children}
    </ScanContext.Provider>
  );
}

export function useScan() {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error('useScan must be used within ScanProvider');
  return ctx;
}
