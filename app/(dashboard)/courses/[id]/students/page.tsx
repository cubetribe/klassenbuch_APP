"use client";

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { Student } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Upload, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { getColorClasses, formatDate, generateId } from '@/lib/utils';
import { toast } from 'sonner';

interface StudentsPageProps {
  params: { id: string };
}

export default function StudentsPage({ params }: StudentsPageProps) {
  const { 
    courses, 
    students, 
    studentsLoading,
    fetchCourses,
    fetchStudents,
    createStudent,
    deleteStudent,
    importStudents,
    exportStudents 
  } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newStudent, setNewStudent] = useState({
    displayName: '',
    internalCode: '',
    avatarEmoji: '👤'
  });
  
  useEffect(() => {
    fetchCourses();
    fetchStudents(params.id);
  }, [params.id, fetchCourses, fetchStudents]);

  const course = courses.find(c => c.id === params.id);
  const courseStudents = students.filter(s => s.courseId === params.id);

  const filteredStudents = courseStudents.filter(student =>
    student.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.internalCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = async () => {
    if (!newStudent.displayName.trim() || !newStudent.internalCode.trim()) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    const success = await createStudent({
      courseId: params.id,
      displayName: newStudent.displayName,
      internalCode: newStudent.internalCode,
      emoji: newStudent.avatarEmoji
    });

    if (success) {
      setNewStudent({ displayName: '', internalCode: '', avatarEmoji: '👤' });
      setShowAddDialog(false);
    }
  };
  
  const handleCSVExport = () => {
    exportStudents(params.id);
  };
  
  const handleCSVImport = async (file: File) => {
    await importStudents(file, params.id);
  };

  if (!course) {
    return <div>Kurs nicht gefunden</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schüler verwalten</h1>
          <p className="text-gray-600">{course.name} - {courseStudents.length} Schüler</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            CSV Import
          </Button>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
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
                  Fügen Sie einen neuen Schüler zu {course.name} hinzu.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Max Mustermann"
                    value={newStudent.displayName}
                    onChange={(e) => setNewStudent({ ...newStudent, displayName: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="code">Interner Code *</Label>
                  <Input
                    id="code"
                    placeholder="MM2024"
                    value={newStudent.internalCode}
                    onChange={(e) => setNewStudent({ ...newStudent, internalCode: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emoji">Avatar Emoji</Label>
                  <Select 
                    value={newStudent.avatarEmoji} 
                    onValueChange={(value) => setNewStudent({ ...newStudent, avatarEmoji: value })}
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
                    onClick={() => setShowAddDialog(false)}
                    className="flex-1"
                  >
                    Abbrechen
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Schüler suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-600">Aktiv</div>
            <div className="text-2xl font-bold">
              {courseStudents.filter(s => s.active).length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">⌀ Level</div>
            <div className="text-2xl font-bold">
              {(courseStudents.reduce((sum, s) => sum + s.currentLevel, 0) / courseStudents.length || 0).toFixed(1)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">⌀ XP</div>
            <div className="text-2xl font-bold">
              {Math.round(courseStudents.reduce((sum, s) => sum + s.currentXP, 0) / courseStudents.length || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Schülerliste</CardTitle>
          <CardDescription>
            Alle Schüler in {course.name} verwalten
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStudents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Schüler</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>XP</TableHead>
                  <TableHead>Zuletzt aktiv</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const colors = getColorClasses(student.currentColor);
                  
                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{student.avatarEmoji}</div>
                          <div>
                            <div className="font-medium">{student.displayName}</div>
                            <div className="text-sm text-gray-600">{student.internalCode}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${colors.bg} ${colors.text}`}>
                          {student.currentColor === 'blue' && 'Exzellent'}
                          {student.currentColor === 'green' && 'Gut'}
                          {student.currentColor === 'yellow' && 'Warnung'}
                          {student.currentColor === 'red' && 'Kritisch'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Level {student.currentLevel}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{student.currentXP} XP</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {formatDate(student.updatedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? (
                <>
                  <Search className="mx-auto h-12 w-12 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Keine Schüler gefunden</h3>
                  <p>Versuchen Sie eine andere Suche</p>
                </>
              ) : (
                <>
                  <Plus className="mx-auto h-12 w-12 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Noch keine Schüler</h3>
                  <p className="mb-4">Fügen Sie Schüler hinzu, um zu beginnen</p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ersten Schüler hinzufügen
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}