"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AddStudentDialogProps {
  courseId: string;
  courseName: string;
  createStudent: (studentData: {
    courseId: string;
    displayName: string;
    internalCode: string;
    emoji: string;
  }) => Promise<boolean>;
}

export function AddStudentDialog({ courseId, courseName, createStudent }: AddStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    displayName: '',
    internalCode: '',
    avatarEmoji: '👤',
  });

  const handleAddStudent = async () => {
    if (!newStudent.displayName.trim() || !newStudent.internalCode.trim()) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    const success = await createStudent({
      courseId: courseId,
      displayName: newStudent.displayName,
      internalCode: newStudent.internalCode,
      emoji: newStudent.avatarEmoji,
    });

    if (success) {
      setNewStudent({ displayName: '', internalCode: '', avatarEmoji: '👤' });
      setOpen(false);
      toast.success('Schüler erfolgreich hinzugefügt');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Schüler hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neuen Schüler hinzufügen</DialogTitle>
          <DialogDescription>
            Fügen Sie einen neuen Schüler zu {courseName} hinzu.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Max Mustermann"
              value={newStudent.displayName}
              onChange={(e) =>
                setNewStudent({ ...newStudent, displayName: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Interner Code *</Label>
            <Input
              id="code"
              placeholder="MM2024"
              value={newStudent.internalCode}
              onChange={(e) =>
                setNewStudent({ ...newStudent, internalCode: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emoji">Avatar Emoji</Label>
            <Select
              value={newStudent.avatarEmoji}
              onValueChange={(value) =>
                setNewStudent({ ...newStudent, avatarEmoji: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="👤">👤 Standard</SelectItem>
                <SelectItem value="👦">👦 Junge</SelectItem>
                <SelectItem value="👧">👧 Mädchen</SelectItem>
                <SelectItem value="👨">👨 Mann</SelectItem>
                <SelectItem value="👩">👩 Frau</SelectItem>
                <SelectItem value="😊">😊 Lächeln</SelectItem>
                <SelectItem value="🤓">🤓 Streber</SelectItem>
                <SelectItem value="😎">😎 Cool</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleAddStudent} className="flex-1">
              Hinzufügen
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Abbrechen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
