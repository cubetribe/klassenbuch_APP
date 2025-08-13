"use client";

import { Student } from '@/types';
import { StudentCard } from './student-card';
import { cn } from '@/lib/utils';

interface StudentGridProps {
  students: Student[];
  onStudentClick?: (student: Student) => void;
  size?: 'sm' | 'md' | 'lg';
  columns?: number;
}

export function StudentGrid({ 
  students, 
  onStudentClick, 
  size = 'md',
  columns 
}: StudentGridProps) {
  const gridClasses = columns 
    ? `grid-cols-${columns}`
    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';

  return (
    <div className={cn('grid gap-4', gridClasses)}>
      {students && students.length > 0 ? (
        students
          .filter(student => student.active)
          .map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onClick={() => onStudentClick?.(student)}
              size={size}
            />
          ))
      ) : (
        <div className="col-span-full text-center text-muted-foreground py-8">
          Keine aktiven Schüler gefunden
        </div>
      )}
    </div>
  );
}