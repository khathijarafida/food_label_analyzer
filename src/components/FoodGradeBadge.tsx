import { gradeColor } from '@/lib/colors';

interface FoodGradeBadgeProps {
  grade: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FoodGradeBadge({ grade, size = 'md' }: FoodGradeBadgeProps) {
  const sizes = {
    sm: 'h-7 w-7 text-sm',
    md: 'h-12 w-12 text-xl',
    lg: 'h-16 w-16 text-2xl',
  };
  return (
    <div
      className={`${sizes[size]} ${gradeColor(grade)} rounded-xl flex items-center justify-center font-bold font-display shadow-md`}
    >
      {grade}
    </div>
  );
}
