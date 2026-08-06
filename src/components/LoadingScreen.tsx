import { Leaf } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-mint-50 via-white to-primary-50">
      <div className="relative">
        <div className="absolute inset-0 animate-pulse-ring rounded-full bg-primary-300/30" />
        <div className="relative h-20 w-20 rounded-2xl bg-primary-500 flex items-center justify-center shadow-emerald">
          <Leaf className="h-10 w-10 text-white" />
        </div>
      </div>
      <p className="mt-6 text-slate-600 font-medium animate-pulse">Loading…</p>
    </div>
  );
}
