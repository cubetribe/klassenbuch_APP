"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/stores/app-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RewardsPage() {
  const { currentCourse, courses, fetchCourses } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if ((courses || []).length === 0) {
      fetchCourses();
    }
  }, [courses, fetchCourses]);

  useEffect(() => {
    // If there's a current course, redirect to its rewards page
    if (currentCourse) {
      router.push(`/courses/${currentCourse.id}/rewards`);
    }
  }, [currentCourse, router]);

  // If no current course is selected, show course selection
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Belohnungen verwalten</h1>
        <p className="text-muted-foreground">Wählen Sie einen Kurs aus, um Belohnungen zu verwalten</p>
      </div>

      {/* Course Selection */}
      <div className="max-w-4xl mx-auto">
        {(courses || []).length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(courses || [])
              .filter(course => !course.archived)
              .map((course) => (
                <Card key={course.id} className="hover-card cursor-pointer">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      {course.name}
                    </CardTitle>
                    <CardDescription>{course.subject}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Schuljahr: {course.schoolYear}
                      </div>
                      <Link href={`/courses/${course.id}/rewards`}>
                        <Button size="sm" className="flex items-center gap-1">
                          <Trophy className="w-4 h-4" />
                          Belohnungen
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
              <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Keine Kurse vorhanden
              </h3>
              <p className="text-muted-foreground mb-4">
                Erstellen Sie zuerst einen Kurs, um Belohnungen zu verwalten
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