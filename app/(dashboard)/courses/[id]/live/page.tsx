"use client";

import { useEffect } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { StudentGrid } from '@/components/students/student-grid';
import { QuickActions } from '@/components/behavior/quick-actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Monitor, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface LivePageProps {
  params: { id: string };
}

export default function LivePage({ params }: LivePageProps) {
  const { 
    courses, 
    students, 
    currentCourse, 
    setCurrentCourse, 
    selectedStudents,
    clearSelectedStudents,
    realtimeConnection,
    fetchCourses,
    fetchStudents,
    createEvent,
    createBulkEvents
  } = useAppStore();

  const course = courses.find(c => c.id === params.id);
  const courseStudents = students.filter(s => s.courseId === params.id && s.active);

  useEffect(() => {
    fetchCourses();
    fetchStudents(params.id);
  }, [params.id, fetchCourses, fetchStudents]);
  
  useEffect(() => {
    if (course && course.id !== currentCourse?.id) {
      setCurrentCourse(course);
    }
  }, [course, currentCourse, setCurrentCourse]);

  if (!course) {
    return <div>Kurs nicht gefunden</div>;
  }

  const stats = {
    total: courseStudents.length,
    blue: courseStudents.filter(s => s.currentColor === 'blue').length,
    green: courseStudents.filter(s => s.currentColor === 'green').length,
    yellow: courseStudents.filter(s => s.currentColor === 'yellow').length,
    red: courseStudents.filter(s => s.currentColor === 'red').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Live Unterricht</h1>
          <p className="text-muted-foreground">{course.name} - {course.subject}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            realtimeConnection === 'connected' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              realtimeConnection === 'connected' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            {realtimeConnection === 'connected' ? 'Live' : 'Offline'}
          </div>
          
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
          
          <Link href={`/courses/${course.id}/board`}>
            <Button variant="outline" size="sm">
              <Monitor className="w-4 h-4 mr-2" />
              Tafelmodus
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Gesamt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">
              Exzellent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.blue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              Gut
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.green}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">
              Warnung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.yellow}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">
              Kritisch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.red}</div>
          </CardContent>
        </Card>
      </div>

      {/* Selection Info */}
      {selectedStudents.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge variant="default">
              {selectedStudents.length} Schüler ausgewählt
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearSelectedStudents}
          >
            Auswahl aufheben
          </Button>
        </div>
      )}

      {/* Student Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Schüler ({courseStudents.length})</h2>
          <div className="text-sm text-muted-foreground">
            Klicken Sie auf Schüler, um sie auszuwählen
          </div>
        </div>

        {courseStudents.length > 0 ? (
          <StudentGrid
            students={courseStudents}
            size="md"
          />
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Keine aktiven Schüler
              </h3>
              <p className="text-muted-foreground mb-4">
                Fügen Sie Schüler hinzu, um den Live-Unterricht zu starten
              </p>
              <Link href={`/courses/${course.id}/students`}>
                <Button>
                  Schüler hinzufügen
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <QuickActions actions={course.settings.actions} />
    </div>
  );
}