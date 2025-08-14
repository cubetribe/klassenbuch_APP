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
import { Plus, Trophy, Edit, Trash2, Gift } from 'lucide-react';
import { Reward } from '@/types';
import { EmojiPicker } from '@/components/ui/emoji-picker';

export default function CourseRewardsPage() {
  const params = useParams();
  const courseId = params.id as string;
  
  const { 
    courses, 
    rewards, 
    rewardsLoading,
    fetchRewards,
    createReward,
    updateReward,
    deleteReward
  } = useAppStore();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    costXP: 10,
    costLevel: 0,
    weeklyLimit: 0,
    category: 'Sonstiges',
    emoji: '🎁'
  });

  const course = (courses || []).find(c => c.id === courseId);

  useEffect(() => {
    if (courseId) {
      fetchRewards(courseId);
    }
  }, [courseId, fetchRewards]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build a clean data object based on the validation schema
    const rewardData: any = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      emoji: formData.emoji,
    };

    // Handle optional costs, respecting the schema (must be positive)
    if (formData.costXP > 0) {
      rewardData.costXP = formData.costXP;
    }
    if (formData.costLevel > 0) {
      rewardData.costLevel = formData.costLevel;
    }

    // Handle optional weekly limit
    if (formData.weeklyLimit > 0) {
      rewardData.weeklyLimit = formData.weeklyLimit;
    }

    if (editingReward) {
      await updateReward(editingReward.id, rewardData);
      setEditingReward(null);
    } else {
      await createReward(rewardData);
      setIsCreateDialogOpen(false);
    }

    // Reset form
    setFormData({
      name: '',
      description: '',
      costXP: 10,
      costLevel: 0,
      weeklyLimit: 0,
      category: 'Sonstiges',
      emoji: '🎁'
    });
  };

  const handleEdit = (reward: Reward) => {
    setFormData({
      name: reward.name,
      description: reward.description || '',
      costXP: reward.costXP || 0,
      costLevel: reward.costLevel || 0,
      weeklyLimit: reward.weeklyLimit || 0,
      category: reward.category,
      emoji: reward.emoji || '🎁'
    });
    setEditingReward(reward);
  };

  const handleDelete = async (rewardId: string) => {
    if (confirm('Sind Sie sicher, dass Sie diese Belohnung löschen möchten?')) {
      await deleteReward(rewardId);
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
          <h1 className="text-3xl font-bold text-foreground">Belohnungen</h1>
          <p className="text-muted-foreground">{course.name} - {course.subject}</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Neue Belohnung
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neue Belohnung erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie eine neue Belohnung für Ihre Schüler
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
                      placeholder="🎁"
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="costXP">XP Kosten</Label>
                    <Input
                      id="costXP"
                      type="number"
                      value={formData.costXP}
                      onChange={(e) => setFormData({...formData, costXP: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weeklyLimit">Wöchentliches Limit</Label>
                    <Input
                      id="weeklyLimit"
                      type="number"
                      value={formData.weeklyLimit}
                      onChange={(e) => setFormData({...formData, weeklyLimit: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="category">Kategorie</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Privilegien">Privilegien</SelectItem>
                      <SelectItem value="Aktivitäten">Aktivitäten</SelectItem>
                      <SelectItem value="Materialien">Materialien</SelectItem>
                      <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                    </SelectContent>
                  </Select>
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

      {/* Rewards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rewards.map((reward) => (
          <Card key={reward.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{reward.emoji}</span>
                  <div>
                    <CardTitle className="text-lg">{reward.name}</CardTitle>
                    <Badge variant="outline">{reward.category}</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(reward)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(reward.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {reward.description && (
                <p className="text-sm text-muted-foreground">{reward.description}</p>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <span>XP Kosten:</span>
                <Badge variant="secondary">{reward.costXP || 0} XP</Badge>
              </div>
              
              {reward.weeklyLimit && (
                <div className="flex items-center justify-between text-sm">
                  <span>Wöchentliches Limit:</span>
                  <Badge variant="outline">{reward.weeklyLimit}x</Badge>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <span>Status:</span>
                <Badge variant={reward.active ? "default" : "secondary"}>
                  {reward.active ? "Aktiv" : "Inaktiv"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {rewards.length === 0 && !rewardsLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Noch keine Belohnungen erstellt
            </h3>
            <p className="text-muted-foreground mb-4">
              Erstellen Sie Belohnungen, die Ihre Schüler mit XP einlösen können
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Erste Belohnung erstellen
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingReward} onOpenChange={() => setEditingReward(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Belohnung bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie die Belohnung
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
                    placeholder="🎁"
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-costXP">XP Kosten</Label>
                  <Input
                    id="edit-costXP"
                    type="number"
                    value={formData.costXP}
                    onChange={(e) => setFormData({...formData, costXP: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-weeklyLimit">Wöchentliches Limit</Label>
                  <Input
                    id="edit-weeklyLimit"
                    type="number"
                    value={formData.weeklyLimit}
                    onChange={(e) => setFormData({...formData, weeklyLimit: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-category">Kategorie</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Privilegien">Privilegien</SelectItem>
                    <SelectItem value="Aktivitäten">Aktivitäten</SelectItem>
                    <SelectItem value="Materialien">Materialien</SelectItem>
                    <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setEditingReward(null)}>
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