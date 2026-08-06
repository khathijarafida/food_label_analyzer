export function gradeColor(grade: string): string {
  switch (grade) {
    case 'A+': return 'bg-gradient-to-br from-primary-400 to-primary-500 text-white';
    case 'A': return 'bg-gradient-to-br from-primary-400 to-primary-500 text-white';
    case 'B': return 'bg-gradient-to-br from-info-400 to-info-500 text-white';
    case 'C': return 'bg-gradient-to-br from-gold-300 to-gold-400 text-slate-800';
    case 'D': return 'bg-gradient-to-br from-accent-400 to-accent-500 text-white';
    case 'F': return 'bg-gradient-to-br from-danger-400 to-danger-500 text-white';
    default: return 'bg-slate-400 text-white';
  }
}

export function scoreColor(score: number): string {
  if (score >= 90) return 'text-primary-600';
  if (score >= 70) return 'text-info-500';
  if (score >= 50) return 'text-gold-500';
  if (score >= 40) return 'text-accent-500';
  return 'text-danger-600';
}

export function scoreLabel(score: number): string {
  if (score >= 90) return 'Excellent Choice';
  if (score >= 75) return 'Good Choice';
  if (score >= 60) return 'Average';
  if (score >= 40) return 'Poor';
  return 'Very Unhealthy';
}

export function healthRating(score: number): { label: string; emoji: string; explanation: string } {
  if (score >= 90) return {
    label: 'Excellent',
    emoji: '⭐⭐⭐⭐⭐',
    explanation: 'This product is an excellent choice. It contains mostly clean ingredients with good nutritional value and minimal additives.',
  };
  if (score >= 75) return {
    label: 'Good',
    emoji: '⭐⭐⭐⭐',
    explanation: 'This is a good product with balanced nutrition. It has some minor concerns but is generally a healthy option for regular consumption.',
  };
  if (score >= 60) return {
    label: 'Average',
    emoji: '⭐⭐⭐',
    explanation: 'This product is average. It has a mix of good and concerning ingredients. Consume in moderation and look for healthier alternatives.',
  };
  if (score >= 40) return {
    label: 'Poor',
    emoji: '⭐⭐',
    explanation: 'This product has poor nutritional quality with multiple concerns. Limit consumption and seek healthier alternatives when possible.',
  };
  return {
    label: 'Very Unhealthy',
    emoji: '⭐',
    explanation: 'This product is very unhealthy with high levels of concerning additives or poor nutrition. Avoid regular consumption.',
  };
}

export function scoreStroke(score: number): string {
  if (score >= 90) return '#22c55e';
  if (score >= 70) return '#3b82f6';
  if (score >= 50) return '#facc15';
  if (score >= 40) return '#fb923c';
  return '#ef4444';
}

export function scoreStrokeBg(score: number): string {
  if (score >= 90) return '#dcfce7';
  if (score >= 70) return '#dbeafe';
  if (score >= 50) return '#fef9c3';
  if (score >= 40) return '#ffedd5';
  return '#fee2e2';
}

export function ingredientClassColor(cls: string): string {
  switch (cls) {
    case 'safe': return 'bg-primary-100 text-primary-700';
    case 'moderate': return 'bg-gold-100 text-gold-700';
    case 'harmful': return 'bg-danger-100 text-danger-700';
    default: return 'bg-slate-100 text-slate-700';
  }
}

export function ingredientClassDot(cls: string): string {
  switch (cls) {
    case 'safe': return 'bg-primary-500';
    case 'moderate': return 'bg-gold-400';
    case 'harmful': return 'bg-danger-500';
    default: return 'bg-slate-400';
  }
}

export function ingredientClassLabel(cls: string): string {
  switch (cls) {
    case 'safe': return 'Healthy';
    case 'moderate': return 'Moderate';
    case 'harmful': return 'Avoid';
    default: return 'Unknown';
  }
}

export function ingredientClassIcon(cls: string): string {
  switch (cls) {
    case 'safe': return '✅';
    case 'moderate': return '⚠️';
    case 'harmful': return '❌';
    default: return '•';
  }
}

export function ingredientClassGroupTitle(cls: string): string {
  switch (cls) {
    case 'safe': return 'Healthy Ingredients';
    case 'moderate': return 'Consume in Moderation';
    case 'harmful': return 'Ingredients to Avoid';
    default: return 'Other';
  }
}

export function ingredientClassGroupExplanation(cls: string): string {
  switch (cls) {
    case 'safe': return 'These ingredients are natural, safe, and beneficial for your health.';
    case 'moderate': return 'These ingredients are acceptable in small amounts but should not be consumed excessively.';
    case 'harmful': return 'These ingredients may pose health risks. Consider avoiding products that contain them.';
    default: return '';
  }
}
