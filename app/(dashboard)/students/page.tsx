"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/stores/app-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Users, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function StudentsPage() {
  const { courses, fetchCourses } = useAppStore();
  const router = useRouter();
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    // Auto-select first course if available and nothing selected
    if (!selectedCourseId && courses && courses.length > 0) {
      const activeCourses = courses.filter(c => !c.archived);
      if (activeCourses.length > 0) {
        setSelectedCourseId(activeCourses[0].id);
      }
    }
  }, [courses, selectedCourseId]);

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    if (courseId) {
      router.push(`/courses/${courseId}/students`);
    }
  };

  const activeCourses = (courses || []).filter(c => !c.archived);

  return (
    <div className="space-y-6">
      {/* Header with Course Selection */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Schüler verwalten</h1>
          <p className="text-muted-foreground">Wählen Sie einen Kurs aus, um Schüler zu verwalten</p>
        </div>
        
        {activeCourses.length > 0 && (
          <div className="flex items-center gap-2">
            <Label htmlFor="course-select" className="text-sm font-medium">Kurs:</Label>
            <Select value={selectedCourseId} onValueChange={handleCourseChange}>
              <SelectTrigger id="course-select" className="w-[250px]">
                <SelectValue placeholder="Kurs auswählen" />
              </SelectTrigger>
              <SelectContent>
                {activeCourses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name} - {course.subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Course Selection */}
      <div className="max-w-4xl mx-auto">
        {(courses || []).length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(courses || [])
              .filter(course => !course.archived)
              .map((course) => (
                <Card key={course.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      {course.name}
                    </CardTitle>
                    <CardDescription>{course.subject}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Schuljahr: {course.schoolYear}
                      </div>
                      <Link href={`/courses/${course.id}/students`}>
                        <Button size="sm" className="flex items-center gap-1">
                          Schüler
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Keine Kurse vorhanden
              </h3>
              <p className="text-muted-foreground mb-4">
                Erstellen Sie zuerst einen Kurs, um Schüler zu verwalten
              </p>
              <Link href="/courses/new">
                <Button>
                  Ersten Kurs erstellen
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Navigation */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Oder navigieren Sie zurück zum Dashboard
        </p>
        <Link href="/dashboard">
          <Button variant="outline">
            Zum Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}