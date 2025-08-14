"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppStore } from '@/lib/stores/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { Consequence } from '@/types';
import { EmojiPicker } from '@/components/ui/emoji-picker';

export default function CourseConsequencesPage() {
  const params = useParams();
  const courseId = params.id as string;
  
  const { 
    courses, 
    consequences, 
    consequencesLoading,
    fetchConsequences,
    createConsequence,
    updateConsequence,
    deleteConsequence
  } = useAppStore();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingConsequence, setEditingConsequence] = useState<Consequence | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    severity: 'MINOR' as 'MINOR' | 'MODERATE' | 'MAJOR',
    notesRequired: false,
    emoji: '⚠️'
  });

  const course = (courses || []).find(c => c.id === courseId);

  useEffect(() => {
    if (courseId) {
      fetchConsequences(courseId);
    }
  }, [courseId, fetchConsequences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const consequenceData = {
      ...formData,
      courseId,
      active: true,
    };

    if (editingConsequence) {
      await updateConsequence(editingConsequence.id, consequenceData);
      setEditingConsequence(null);
    } else {
      await createConsequence(consequenceData);
      setIsCreateDialogOpen(false);
    }

    // Reset form
    setFormData({
      name: '',
      description: '',
      severity: 'minor',
      notesRequired: false,
      emoji: '⚠️'
    });
  };

  const handleEdit = (consequence: Consequence) => {
    setFormData({
      name: consequence.name,
      description: consequence.description || '',
      severity: consequence.severity,
      notesRequired: consequence.notesRequired,
      emoji: consequence.emoji || '⚠️'
    });
    setEditingConsequence(consequence);
  };

  const handleDelete = async (consequenceId: string) => {
    if (confirm('Sind Sie sicher, dass Sie diese Konsequenz löschen möchten?')) {
      await deleteConsequence(consequenceId);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-yellow-100 text-yellow-800';
      case 'moderate': return 'bg-orange-100 text-orange-800';
      case 'major': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'minor': return 'Gering';
      case 'moderate': return 'Mittel';
      case 'major': return 'Schwer';
      default: return severity;
    }
  };

  if (!course) {
    return <div>Kurs nicht gefunden</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Konsequenzen</h1>
          <p className="text-muted-foreground">{course.name} - {course.subject}</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Neue Konsequenz
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neue Konsequenz erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie eine neue Konsequenz für Fehlverhalten
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="emoji">Emoji</Label>
                    <EmojiPicker
                      value={formData.emoji}
                      onChange={(emoji) => setFormData({...formData, emoji})}
                      placeholder="⚠️"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="severity">Schweregrad</Label>
                  <Select value={formData.severity} onValueChange={(value: any) => setFormData({...formData, severity: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Schweregrad wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MINOR">Gering</SelectItem>
                      <SelectItem value="MODERATE">Mittel</SelectItem>
                      <SelectItem value="MAJOR">Schwer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="notesRequired"
                    checked={formData.notesRequired}
                    onCheckedChange={(checked) => setFormData({...formData, notesRequired: checked})}
                  />
                  <Label htmlFor="notesRequired">Notizen erforderlich</Label>
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button type="submit">
                  Erstellen
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Consequences Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {consequences.map((consequence) => (
          <Card key={consequence.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{consequence.emoji}</span>
                  <div>
                    <CardTitle className="text-lg">{consequence.name}</CardTitle>
                    <Badge className={getSeverityColor(consequence.severity)}>
                      {getSeverityLabel(consequence.severity)}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(consequence)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(consequence.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {consequence.description && (
                <p className="text-sm text-muted-foreground">{consequence.description}</p>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <span>Notizen erforderlich:</span>
                <Badge variant={consequence.notesRequired ? "default" : "outline"}>
                  {consequence.notesRequired ? "Ja" : "Nein"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>Status:</span>
                <Badge variant={consequence.active ? "default" : "secondary"}>
                  {consequence.active ? "Aktiv" : "Inaktiv"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {consequences.length === 0 && !consequencesLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Noch keine Konsequenzen erstellt
            </h3>
            <p className="text-muted-foreground mb-4">
              Erstellen Sie Konsequenzen für verschiedene Arten von Fehlverhalten
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Erste Konsequenz erstellen
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingConsequence} onOpenChange={() => setEditingConsequence(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konsequenz bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie die Konsequenz
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-emoji">Emoji</Label>
                  <EmojiPicker
                    value={formData.emoji}
                    onChange={(emoji) => setFormData({...formData, emoji})}
                    placeholder="⚠️"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-description">Beschreibung</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-severity">Schweregrad</Label>
                <Select value={formData.severity} onValueChange={(value: any) => setFormData({...formData, severity: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Schweregrad wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MINOR">Gering</SelectItem>
                    <SelectItem value="MODERATE">Mittel</SelectItem>
                    <SelectItem value="MAJOR">Schwer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-notesRequired"
                  checked={formData.notesRequired}
                  onCheckedChange={(checked) => setFormData({...formData, notesRequired: checked})}
                />
                <Label htmlFor="edit-notesRequired">Notizen erforderlich</Label>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setEditingConsequence(null)}>
                Abbrechen
              </Button>
              <Button type="submit">
                Speichern
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}