import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanLine, Camera, Upload, Barcode, X, Loader2, Sparkles,
  AlertCircle, Search, Zap, Target, CheckCircle2,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { lookupBarcode } from '@/lib/barcode';
import { runOCR } from '@/lib/ocr';
import { analyzeProduct, type NutritionFacts, type AnalysisResult } from '@/lib/analysis';
import { useScan, type PendingScan } from '@/context/ScanContext';

type Mode = 'idle' | 'barcode' | 'upload';

export default function Scan() {
  const navigate = useNavigate();
  const { setPendingScan } = useScan();
  const [mode, setMode] = useState<Mode>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch { /* ignore */ }
      scannerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => { void stopScanner(); };
  }, [stopScanner]);

  const processResult = useCallback(
    (pending: PendingScan) => { setPendingScan(pending); navigate('/analysis'); },
    [navigate, setPendingScan]
  );

  const startBarcodeScanner = async () => {
    setError('');
    setMode('barcode');
    setScanning(true);
    setStatus('Starting camera…');
    setTimeout(async () => {
      try {
        const html5Qr = new Html5Qrcode('barcode-scanner-region');
        scannerRef.current = html5Qr;
        await html5Qr.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decodedText) => {
            setStatus(`Barcode found: ${decodedText}`);
            setScanning(false);
            void stopScanner();
            void handleBarcode(decodedText);
          },
          () => {}
        );
        setStatus('Point camera at a barcode');
      } catch {
        setError('Could not access camera. You can enter the barcode manually below, or upload a photo instead.');
        setStatus('');
        setScanning(false);
      }
    }, 100);
  };

  const handleBarcode = async (barcode: string) => {
    setLoading(true);
    setStatus('Looking up product in database…');
    try {
      const product = await lookupBarcode(barcode);
      setStatus('Running AI analysis…');
      const analysis = analyzeProduct(product.ingredients, product.nutrition);
      processResult({
        barcode: product.barcode, productName: product.productName, brand: product.brand,
        category: product.category, imageUrl: product.imageUrl, ingredients: product.ingredients,
        nutrition: product.nutrition, allergens: product.allergens, additives: product.additives, analysis,
      });
    } catch {
      setError('Could not analyze this product. Try uploading a label photo instead.');
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const handleManualBarcode = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim().length < 6) { setError('Please enter a valid barcode number.'); return; }
    void handleBarcode(manualBarcode.trim());
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setLoading(true);
    setStatus('Scanning image with OCR engine…');
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreviewImage(dataUrl);
      try {
        const ocr = await runOCR(dataUrl);
        setStatus('Running AI analysis…');
        const nutrition: NutritionFacts = ocr.nutrition;
        const analysis: AnalysisResult = analyzeProduct(ocr.ingredients, nutrition);
        processResult({
          barcode: null, productName: ocr.productName, brand: '', category: '',
          imageUrl: dataUrl, ingredients: ocr.ingredients, nutrition,
          allergens: analysis.allergens, additives: analysis.additives, analysis,
        });
      } catch {
        setError('Could not read text from this image. Try a clearer photo of the nutrition label.');
        setLoading(false);
        setStatus('');
      }
    };
    reader.readAsDataURL(file);
  };

  const closeScanner = async () => {
    await stopScanner();
    setMode('idle');
    setStatus('');
    setScanning(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl lg:text-3xl gradient-text">Scan Food Product</h1>
        <p className="text-slate-500 mt-1">Scan a barcode or upload a nutrition label for instant AI analysis</p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-4 rounded-2xl bg-danger-50 text-danger-700 text-sm">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {mode === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Main scan cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={startBarcodeScanner}
                className="group card p-8 flex flex-col items-center text-center hover:-translate-y-1"
              >
                <div className="h-16 w-16 rounded-2xl bg-primary-500 flex items-center justify-center shadow-emerald group-hover:scale-110 transition-transform duration-300">
                  <Barcode className="h-8 w-8 text-white" />
                </div>
                <h3 className="mt-4 font-display font-semibold text-lg text-slate-900">Scan Barcode</h3>
                <p className="text-sm text-slate-500 mt-1">Use your camera to scan a product barcode</p>
                <span className="mt-3 badge bg-primary-50 text-primary-700">Recommended</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="group card p-8 flex flex-col items-center text-center hover:-translate-y-1"
              >
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-info-400 to-info-500 flex items-center justify-center shadow-md shadow-info-400/30 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <h3 className="mt-4 font-display font-semibold text-lg text-slate-900">Upload Label Photo</h3>
                <p className="text-sm text-slate-500 mt-1">Upload a photo of the nutrition label</p>
                <span className="mt-3 badge bg-info-50 text-info-700">OCR Powered</span>
              </button>

              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </div>

            {/* Feature highlights */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="card p-5">
                <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <Barcode className="h-5 w-5 text-primary-600" />
                </div>
                <h4 className="mt-3 font-medium text-slate-900">Barcode Lookup</h4>
                <p className="text-sm text-slate-500 mt-1">Accesses millions of products via Open Food Facts.</p>
              </div>
              <div className="card p-5">
                <div className="h-10 w-10 rounded-xl bg-info-100 flex items-center justify-center">
                  <ScanLine className="h-5 w-5 text-info-600" />
                </div>
                <h4 className="mt-3 font-medium text-slate-900">OCR Text Reading</h4>
                <p className="text-sm text-slate-500 mt-1">Reads nutrition facts and ingredients from label photos.</p>
              </div>
              <div className="card p-5">
                <div className="h-10 w-10 rounded-xl bg-mint-100 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary-600" />
                </div>
                <h4 className="mt-3 font-medium text-slate-900">AI Analysis</h4>
                <p className="text-sm text-slate-500 mt-1">Evaluates ingredient safety and personalized advice.</p>
              </div>
            </div>
          </motion.div>
        )}

        {mode === 'barcode' && (
          <motion.div
            key="barcode"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg text-slate-900 flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary-600" /> Camera Scanner
              </h3>
              <button onClick={closeScanner} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scanner viewport with overlay */}
            <div className="relative scan-frame rounded-2xl overflow-hidden bg-slate-900">
              <div id="barcode-scanner-region" className="w-full aspect-video" />
              {scanning && (
                <>
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="scan-line top-[15%]" />
                  </div>
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/90 text-white text-xs font-medium backdrop-blur-sm">
                    <Target className="h-3.5 w-3.5 animate-pulse" />
                    Scanning…
                  </div>
                </>
              )}
              {/* Corner brackets */}
              <div className="absolute top-8 left-8 w-8 h-8 border-t-[3px] border-l-[3px] border-primary-400 rounded-tl-xl pointer-events-none" />
              <div className="absolute top-8 right-8 w-8 h-8 border-t-[3px] border-r-[3px] border-primary-400 rounded-tr-xl pointer-events-none" />
              <div className="absolute bottom-8 left-8 w-8 h-8 border-b-[3px] border-l-[3px] border-primary-400 rounded-bl-xl pointer-events-none" />
              <div className="absolute bottom-8 right-8 w-8 h-8 border-b-[3px] border-r-[3px] border-primary-400 rounded-br-xl pointer-events-none" />
            </div>

            {status && (
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                {status}
              </div>
            )}

            <div className="mt-6 border-t border-slate-100 pt-6">
              <p className="text-sm text-slate-500 mb-2">No camera? Enter the barcode manually:</p>
              <form onSubmit={handleManualBarcode} className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  className="input-field flex-1"
                  placeholder="e.g. 3017620422003"
                />
                <button type="submit" disabled={loading} className="btn-primary">
                  <Search className="h-4 w-4" /> Look Up
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && mode !== 'barcode' && (
        <div className="card p-8 flex flex-col items-center text-center">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse-ring rounded-full bg-primary-300/30" />
            <div className="relative h-16 w-16 rounded-2xl bg-primary-500 flex items-center justify-center shadow-emerald">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          </div>
          <p className="mt-4 font-medium text-slate-700 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary-500" />
            {status || 'Analyzing…'}
          </p>
          <div className="mt-3 flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                className="h-2 w-2 rounded-full bg-primary-400"
              />
            ))}
          </div>
        </div>
      )}

      {previewImage && !loading && mode === 'idle' && (
        <div className="card p-4">
          <p className="text-sm text-slate-500 mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success-500" /> Uploaded image:
          </p>
          <img src={previewImage} alt="Uploaded" className="max-h-64 rounded-2xl mx-auto" />
        </div>
      )}
    </div>
  );
}
