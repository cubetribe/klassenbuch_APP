"use client";

import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/stores/app-store';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ColorRating {
  color: 'blue' | 'green' | 'yellow' | 'red';
  label: string;
  xpChange: number;
  className: string;
}

const ratings: ColorRating[] = [
  { 
    color: 'blue', 
    label: 'Exzellent', 
    xpChange: 10, 
    className: 'bg-blue-500 hover:bg-blue-600 text-white' 
  },
  { 
    color: 'green', 
    label: 'Gut', 
    xpChange: 5, 
    className: 'bg-green-500 hover:bg-green-600 text-white' 
  },
  { 
    color: 'yellow', 
    label: 'Warnung', 
    xpChange: -5, 
    className: 'bg-yellow-500 hover:bg-yellow-600 text-white' 
  },
  { 
    color: 'red', 
    label: 'Kritisch', 
    xpChange: -10, 
    className: 'bg-red-500 hover:bg-red-600 text-white' 
  },
];

export function ColorRating() {
  const { 
    selectedStudents, 
    students,
    currentCourse,
    createBulkEvents,
    clearSelectedStudents,
    updateStudent
  } = useAppStore();

  const handleRatingClick = async (rating: ColorRating) => {
    if (selectedStudents.length === 0) {
      toast.error('Bitte wählen Sie mindestens einen Schüler aus');
      return;
    }

    if (!currentCourse) {
      toast.error('Kein Kurs ausgewählt');
      return;
    }

    try {
      // Create behavior events for tracking. The backend will handle the XP/color updates.
      const events = selectedStudents.map(studentId => ({
        studentId,
        courseId: currentCourse.id,
        type: 'XP_CHANGE', // Use XP_CHANGE to trigger the correct backend logic
        payload: { 
          label: rating.label,
          xpChange: rating.xpChange
        },
        notes: `Bewertung: ${rating.label}`
      }));

      await createBulkEvents(events);

      toast.success(
        `${selectedStudents.length} Schüler als "${rating.label}" bewertet`
      );
      
      clearSelectedStudents();
    } catch (error) {
      console.error('Rating error:', error);
      toast.error('Fehler beim Bewerten der Schüler');
    }
  };

  if (selectedStudents.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Bewertung für {selectedStudents.length} Schüler
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {ratings.map((rating) => (
            <Button
              key={rating.color}
              onClick={() => handleRatingClick(rating)}
              className={rating.className}
              size="lg"
            >
              <div className="flex flex-col items-center">
                <span className="font-semibold">{rating.label}</span>
                <span className="text-xs opacity-90">
                  {rating.xpChange > 0 ? '+' : ''}{rating.xpChange} XP
                </span>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}