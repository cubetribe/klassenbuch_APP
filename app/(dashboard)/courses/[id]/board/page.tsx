"use client";

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { Button } from '@/components/ui/button';
import { StudentGrid } from '@/components/students/student-grid';
import { getColorClasses } from '@/lib/utils';
import { X, Settings, Maximize } from 'lucide-react';
import Link from 'next/link';

interface BoardPageProps {
  params: { id: string };
}

export default function BoardPage({ params }: BoardPageProps) {
  const { courses, students, setBoardMode } = useAppStore();
  const [fullscreen, setFullscreen] = useState(false);
  
  const course = (courses || []).find(c => c.id === params.id);
  const courseStudents = (students || []).filter(s => s.courseId === params.id && s.active);

  useEffect(() => {
    setBoardMode(true);
    return () => setBoardMode(false);
  }, [setBoardMode]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  if (!course) {
    return <div className="text-center p-8">Kurs nicht gefunden</div>;
  }

  const stats = {
    blue: courseStudents.filter(s => s.currentColor === 'blue').length,
    green: courseStudents.filter(s => s.currentColor === 'green').length,
    yellow: courseStudents.filter(s => s.currentColor === 'yellow').length,
    red: courseStudents.filter(s => s.currentColor === 'red').length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Board Header */}
      <div className="bg-primary text-primary-foreground p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">{course.name}</h1>
            <p className="text-xl text-gray-300">{course.subject}</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Stats */}
            <div className="flex gap-6 text-lg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>{stats.blue}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>{stats.green}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>{stats.yellow}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>{stats.red}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-primary-foreground hover:bg-primary/80"
              >
                <Maximize className="w-5 h-5" />
              </Button>
              
              <Link href={`/courses/${course.id}/live`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground hover:bg-primary/80"
                >
                  <X className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Student Display */}
      <div className="p-8">
        {courseStudents.length > 0 ? (
          <StudentGrid
            students={courseStudents}
            size="lg"
            columns={6}
          />
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-3xl font-bold text-muted-foreground mb-2">
              Keine Schüler
            </h2>
            <p className="text-xl text-muted-foreground">
              Fügen Sie Schüler hinzu, um sie hier anzuzeigen
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm opacity-90">
            Klassenbuch App - {new Date().toLocaleDateString('de-DE')}
          </div>
          <div className="text-sm opacity-90">
            {courseStudents.length} Schüler aktiv
          </div>
        </div>
      </div>
    </div>
  );
}