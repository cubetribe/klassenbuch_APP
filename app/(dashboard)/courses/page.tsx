"use client";

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreHorizontal, Archive, Copy, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function CoursesPage() {
  const { 
    courses, 
    students, 
    coursesLoading,
    setCurrentCourse, 
    fetchCourses,
    deleteCourse 
  } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const filteredCourses = (courses || [])
    .filter(course => showArchived || !course.archived)
    .filter(course => 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getCourseStats = (courseId: string) => {
    const courseStudents = (students || []).filter(s => s.courseId === courseId);
    const avgXP = courseStudents.reduce((sum, s) => sum + s.currentXP, 0) / courseStudents.length || 0;
    return {
      studentCount: courseStudents.length,
      avgXP: Math.round(avgXP)
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kurse</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihre Klassen und Kurse</p>
        </div>
        <Link href="/courses/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Neuer Kurs
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Kurse suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={showArchived ? "default" : "outline"}
          onClick={() => setShowArchived(!showArchived)}
          className="whitespace-nowrap"
        >
          <Archive className="w-4 h-4 mr-2" />
          {showArchived ? 'Alle anzeigen' : 'Archivierte anzeigen'}
        </Button>
      </div>

      {/* Course Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => {
          const stats = getCourseStats(course.id);
          
          return (
            <Card key={course.id} className={course.archived ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <CardDescription>{course.subject}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setCurrentCourse(course)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Als aktuell setzen
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplizieren
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="w-4 h-4 mr-2" />
                        {course.archived ? 'Wiederherstellen' : 'Archivieren'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Schuljahr:</span>
                  <Badge variant="outline">{course.schoolYear}</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Schüler:</span>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{stats.studentCount}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">⌀ XP:</span>
                  <span className="font-medium">{stats.avgXP}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Zuletzt aktiv:</span>
                  <span className="text-xs">{formatDate(course.updatedAt)}</span>
                </div>
                
                {course.archived && (
                  <Badge variant="secondary" className="w-full justify-center">
                    Archiviert
                  </Badge>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Link href={`/courses/${course.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Öffnen
                    </Button>
                  </Link>
                  <Link href={`/courses/${course.id}/live`} className="flex-1">
                    <Button size="sm" className="w-full">
                      Live Unterricht
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Users className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchTerm ? 'Keine Kurse gefunden' : 'Noch keine Kurse erstellt'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? 'Versuchen Sie eine andere Suche' 
              : 'Erstellen Sie Ihren ersten Kurs, um zu beginnen'
            }
          </p>
          {!searchTerm && (
            <Link href="/courses/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ersten Kurs erstellen
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}