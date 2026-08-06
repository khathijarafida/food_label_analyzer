import { jsPDF } from 'jspdf';
import type { PendingScan } from '@/context/ScanContext';
import { scoreLabel } from './colors';

export function generateReport(scan: PendingScan) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Header
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('NutriScan — Food Analysis Report', margin, 19);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString(), pageWidth - margin, 19, { align: 'right' });

  y = 42;
  doc.setTextColor(30, 41, 59);

  // Product info
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(scan.productName.slice(0, 50), margin, y);
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (scan.brand) { doc.text(`Brand: ${scan.brand}`, margin, y); y += 5; }
  if (scan.barcode) { doc.text(`Barcode: ${scan.barcode}`, margin, y); y += 5; }
  if (scan.category) { doc.text(`Category: ${scan.category.slice(0, 60)}`, margin, y); y += 5; }
  y += 3;

  // Score & Grade
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Health Score: ${scan.analysis.healthScore}/100  (${scoreLabel(scan.analysis.healthScore)})`, margin, y);
  y += 6;
  doc.text(`Food Grade: ${scan.analysis.foodGrade}`, margin, y);
  y += 8;

  // Nutrition facts
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Nutrition Facts (per serving)', margin, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const n = scan.nutrition;
  const facts: [string, string | undefined][] = [
    ['Calories', n.calories != null ? `${n.calories} kcal` : undefined],
    ['Protein', n.protein != null ? `${n.protein} g` : undefined],
    ['Total Fat', n.fat != null ? `${n.fat} g` : undefined],
    ['Saturated Fat', n.saturatedFat != null ? `${n.saturatedFat} g` : undefined],
    ['Trans Fat', n.transFat != null ? `${n.transFat} g` : undefined],
    ['Carbohydrates', n.carbs != null ? `${n.carbs} g` : undefined],
    ['Sugar', n.sugar != null ? `${n.sugar} g` : undefined],
    ['Added Sugar', n.addedSugar != null ? `${n.addedSugar} g` : undefined],
    ['Fiber', n.fiber != null ? `${n.fiber} g` : undefined],
    ['Sodium', n.sodium != null ? `${n.sodium} mg` : undefined],
    ['Cholesterol', n.cholesterol != null ? `${n.cholesterol} mg` : undefined],
  ];
  for (const [label, val] of facts) {
    if (val != null) {
      doc.text(`${label}: ${val}`, margin, y);
      y += 5;
    }
  }
  y += 4;

  // Allergens
  if (scan.allergens.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text(`Allergens: ${scan.allergens.join(', ')}`, margin, y);
    y += 8;
    doc.setTextColor(30, 41, 59);
  }

  // Warnings
  if (scan.analysis.warnings.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Warnings', margin, y);
    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    for (const w of scan.analysis.warnings.slice(0, 6)) {
      const lines = doc.splitTextToSize(`• ${w}`, contentWidth);
      for (const line of lines) {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(line, margin, y);
        y += 5;
      }
    }
    y += 4;
  }

  // Positives
  if (scan.analysis.positives.length > 0) {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text('Positives', margin, y);
    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    for (const p of scan.analysis.positives) {
      const lines = doc.splitTextToSize(`• ${p}`, contentWidth);
      for (const line of lines) {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(line, margin, y);
        y += 5;
      }
    }
    y += 4;
    doc.setTextColor(30, 41, 59);
  }

  // Ingredient analysis
  if (scan.analysis.ingredientAnalysis.length > 0) {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Ingredient Analysis', margin, y);
    y += 6;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    for (const ing of scan.analysis.ingredientAnalysis.slice(0, 25)) {
      const label = ing.classification === 'safe' ? '[SAFE]' : ing.classification === 'moderate' ? '[MOD]' : '[HARM]';
      const lines = doc.splitTextToSize(`${label} ${ing.name}: ${ing.reason}`, contentWidth);
      for (const line of lines) {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(line, margin, y);
        y += 4;
      }
    }
    y += 4;
  }

  // Recommendations
  const recs = Object.entries(scan.analysis.recommendations);
  if (recs.length > 0) {
    if (y > 230) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Recommendations', margin, y);
    y += 6;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    for (const [goal, rec] of recs) {
      const lines = doc.splitTextToSize(`${goal.replace('_', ' ')}: ${rec.suitable ? 'Suitable' : 'Not recommended'} — ${rec.reason}`, contentWidth);
      for (const line of lines) {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(line, margin, y);
        y += 4;
      }
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text('Generated by NutriScan AI Food Analyzer', margin, 287);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, 287, { align: 'right' });
  }

  doc.save(`nutriscan-${scan.productName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`);
}
