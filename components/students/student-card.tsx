"use client";

import { Student } from '@/types';
import { getColorClasses, getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/lib/stores/app-store';

interface StudentCardProps {
  student: Student;
  onClick?: () => void;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StudentCard({ 
  student, 
  onClick, 
  showDetails = true, 
  size = 'md' 
}: StudentCardProps) {
  const { selectedStudents, addSelectedStudent, removeSelectedStudent } = useAppStore();
  const isSelected = selectedStudents.includes(student.id);
  const colors = getColorClasses(student.currentColor);

  const sizeClasses = {
    sm: 'p-3 min-h-[80px]',
    md: 'p-4 min-h-[120px]',
    lg: 'p-6 min-h-[160px]'
  };

  const handleClick = () => {
    if (isSelected) {
      removeSelectedStudent(student.id);
    } else {
      addSelectedStudent(student.id);
    }
    onClick?.();
  };

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        sizeClasses[size],
        colors.bg,
        colors.text,
        isSelected && 'ring-2 ring-white ring-offset-2',
        !student.active && 'opacity-50'
      )}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center justify-center h-full text-center">
        {/* Avatar */}
        <div className="text-2xl mb-2">
          {student.avatarEmoji || getInitials(student.displayName)}
        </div>

        {/* Name - Fixed for dark/light mode */}
        <h3 className="font-medium text-sm mb-1 text-foreground">
          {student.displayName}
        </h3>

        {/* Details - Fixed for dark/light mode */}
        {showDetails && (
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-1">
              <Badge 
                variant="outline" 
                className="text-xs border-foreground/50 text-foreground"
              >
                Level {student.currentLevel}
              </Badge>
            </div>
            <div className="text-foreground/80">
              {student.currentXP} XP
            </div>
          </div>
        )}

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2">
            <div className="w-3 h-3 bg-white rounded-full border border-current" />
          </div>
        )}
      </div>
    </Card>
  );
}