"use client";

import { QuickAction } from '@/types';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/stores';
import { toast } from 'sonner';
import { generateId } from '@/lib/utils';

interface QuickActionsProps {
  actions: QuickAction[];
  onActionClick?: (action: QuickAction) => void;
}

export function QuickActions({ actions, onActionClick }: QuickActionsProps) {
  const { 
    selectedStudents, 
    students, 
    updateStudent, 
    addPendingEvent, 
    clearSelectedStudents 
  } = useAppStore();

  const handleActionClick = (action: QuickAction) => {
    if (selectedStudents.length === 0) {
      toast.error('Bitte wählen Sie mindestens einen Schüler aus');
      return;
    }

    // Apply action to selected students
    selectedStudents.forEach(studentId => {
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      const newXP = Math.max(0, Math.min(100, student.currentXP + action.xpChange));
      
      // Update student
      updateStudent(studentId, { 
        currentXP: newXP,
        updatedAt: new Date() 
      });

      // Add event to pending
      addPendingEvent({
        id: generateId(),
        studentId,
        courseId: student.courseId,
        type: 'color_change',
        payload: { 
          action: action.label, 
          xpChange: action.xpChange,
          oldXP: student.currentXP,
          newXP
        },
        createdBy: 'current-user',
        createdAt: new Date()
      });
    });

    toast.success(`"${action.label}" wurde auf ${selectedStudents.length} Schüler angewendet`);
    clearSelectedStudents();
    onActionClick?.(action);
  };

  if (selectedStudents.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-lg shadow-lg border p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium">
            {selectedStudents.length} Schüler ausgewählt
          </span>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {actions.map((action) => (
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