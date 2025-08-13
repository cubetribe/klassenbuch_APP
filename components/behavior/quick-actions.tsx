"use client";

import { QuickAction } from '@/types';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/stores/app-store';
import { toast } from 'sonner';

interface QuickActionsProps {
  actions: QuickAction[];
  onActionClick?: (action: QuickAction) => void;
}

export function QuickActions({ actions = [], onActionClick }: QuickActionsProps) {
  const { 
    selectedStudents, 
    students,
    currentCourse,
    createBulkEvents,
    clearSelectedStudents 
  } = useAppStore();

  const handleActionClick = async (action: QuickAction) => {
    if (selectedStudents.length === 0) {
      toast.error('Bitte wählen Sie mindestens einen Schüler aus');
      return;
    }

    if (!currentCourse) {
      toast.error('Kein Kurs ausgewählt');
      return;
    }

    // Create behavior events for selected students
    const events = selectedStudents.map(studentId => {
      const student = students.find(s => s.id === studentId);
      if (!student) return null;

      return {
        studentId,
        courseId: currentCourse.id,
        type: 'QUICK_ACTION',
        payload: { 
          action: action.label, 
          xpChange: action.xpChange,
          icon: action.icon
        },
        notes: `Quick Action: ${action.label}`
      };
    }).filter(Boolean) as any[];

    if (events.length > 0) {
      await createBulkEvents(events);
      toast.success(`"${action.label}" wurde auf ${selectedStudents.length} Schüler angewendet`);
      clearSelectedStudents();
      onActionClick?.(action);
    }
  };

  if (selectedStudents.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-background rounded-lg shadow-lg border p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium">
            {selectedStudents.length} Schüler ausgewählt
          </span>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {(actions || []).map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={() => handleActionClick(action)}
              className="flex items-center gap-1"
            >
              <span>{action.icon}</span>
              <span>{action.label}</span>
              {action.hotkey && (
                <kbd className="ml-1 px-1 py-0.5 text-xs bg-gray-100 rounded">
                  {action.hotkey}
                </kbd>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}