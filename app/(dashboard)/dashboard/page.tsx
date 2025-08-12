"use client";

import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, TrendingUp, Plus, Clock } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { courses, students, currentCourse, setCurrentCourse } = useAppStore();

  const activeCourses = courses.filter(c => !c.archived);
  const totalStudents = students.length;
  const avgLevel = students.reduce((sum, s) => sum + s.currentLevel, 0) / students.length || 0;

  const recentActivities = [
    { id: '1', text: 'Anna M. erreichte Level 3', time: '2 Min' },
    { id: '2', text: 'Ben K. erhielt +5 XP', time: '5 Min' },
    { id: '3', text: 'Clara W. löste Belohnung ein', time: '10 Min' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Willkommen zurück! Hier ist Ihre Übersicht.</p>
        </div>
        <Link href="/courses/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Neuer Kurs
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Kurse</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              {courses.length - activeCourses.length} archiviert
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schüler gesamt</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Über alle Kurse
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durchschnittslevel</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgLevel.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              +12% seit letztem Monat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heutiger Unterricht</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Stunden geplant
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Aktive Kurse</CardTitle>
            <CardDescription>Ihre aktuellen Klassen im Überblick</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCourses.map((course) => {
              const courseStudents = students.filter(s => s.courseId === course.id);
              const isCurrentCourse = currentCourse?.id === course.id;
              
              return (
                <div
                  key={course.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    isCurrentCourse ? 'border-primary bg-primary/5' : 'border-gray-200'
                  }`}
                  onClick={() => setCurrentCourse(course)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{course.name}</h3>
                      <p className="text-sm text-gray-600">{course.subject}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">
                        {courseStudents.length} Schüler
                      </Badge>
                      {isCurrentCourse && (
                        <div className="text-xs text-primary mt-1">Aktiv</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {activeCourses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="mx-auto h-12 w-12 mb-4" />
                <p>Noch keine Kurse erstellt</p>
                <Link href="/courses/new">
                  <Button variant="outline" className="mt-2">
                    Ersten Kurs erstellen
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Letzte Aktivitäten</CardTitle>
            <CardDescription>Was ist in Ihren Kursen passiert</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <span className="text-sm">{activity.text}</span>
                  <Badge variant="outline" className="text-xs">
                    vor {activity.time}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {currentCourse && (
        <Card>
          <CardHeader>
            <CardTitle>Schnellzugriff - {currentCourse.name}</CardTitle>
            <CardDescription>Direkter Zugang zu wichtigen Funktionen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              <Link href={`/courses/${currentCourse.id}/live`}>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Users className="w-6 h-6" />
                  <span>Live Unterricht</span>
                </Button>
              </Link>
              
              <Link href={`/courses/${currentCourse.id}/students`}>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Users className="w-6 h-6" />
                  <span>Schüler</span>
                </Button>
              </Link>
              
              <Link href={`/courses/${currentCourse.id}/rewards`}>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Badge className="w-6 h-6" />
                  <span>Belohnungen</span>
                </Button>
              </Link>
              
              <Link href={`/courses/${currentCourse.id}/board`}>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Users className="w-6 h-6" />
                  <span>Tafelmodus</span>
                </Button>
              </Link>
              
              <Link href="/reports">
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <TrendingUp className="w-6 h-6" />
                  <span>Reports</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}