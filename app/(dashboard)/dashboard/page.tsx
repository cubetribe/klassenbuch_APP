"use client";

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, TrendingUp, Plus, Clock, Activity } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

export default function DashboardPage() {
  const { courses, students, events, currentCourse, setCurrentCourse, fetchCourses, fetchStudents, fetchEvents } = useAppStore();
  const [todaysClasses, setTodaysClasses] = useState(0);

  useEffect(() => {
    fetchCourses();
    fetchStudents();
    fetchEvents();
  }, [fetchCourses, fetchStudents, fetchEvents]);

  const activeCourses = (courses || []).filter(c => !c.archived);
  
  // Calculate real statistics
  const allStudents = (students || []);
  const activeStudents = allStudents.filter(s => s.active);
  const totalStudents = activeStudents.length;
  const avgLevel = activeStudents.length > 0 
    ? activeStudents.reduce((sum, s) => sum + s.currentLevel, 0) / activeStudents.length 
    : 0;
  
  // Calculate today's classes (courses with recent activity today)
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEvents = (events || []).filter(e => {
      const eventDate = new Date(e.createdAt);
      return eventDate >= today;
    });
    
    const uniqueCourses = new Set(todayEvents.map(e => e.courseId));
    setTodaysClasses(uniqueCourses.size);
  }, [events]);

  // Get real recent activities from events
  const recentActivities = (events || [])
    .slice(0, 5)
    .map(event => {
      const student = allStudents.find(s => s.id === event.studentId);
      let text = '';
      
      if (event.type === 'COLOR_CHANGE') {
        const colorMap = {
          'BLUE': 'Exzellent',
          'GREEN': 'Gut', 
          'YELLOW': 'Warnung',
          'RED': 'Kritisch'
        };
        text = `${student?.displayName || 'Schüler'} wurde als ${colorMap[event.payload?.color] || event.payload?.color} bewertet`;
      } else if (event.type === 'XP_CHANGE') {
        const xpChange = event.payload?.xpChange || 0;
        text = `${student?.displayName || 'Schüler'} erhielt ${xpChange > 0 ? '+' : ''}${xpChange} XP`;
      } else if (event.type === 'LEVEL_CHANGE') {
        text = `${student?.displayName || 'Schüler'} erreichte Level ${event.payload?.newLevel || '?'}`;
      } else {
        text = `${student?.displayName || 'Schüler'} - ${event.type}`;
      }
      
      return {
        id: event.id,
        text,
        time: formatDistanceToNow(new Date(event.createdAt), { locale: de, addSuffix: true })
      };
    });

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
              {(courses || []).length - activeCourses.length} archiviert
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
              Alle aktiven Schüler
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heutiger Unterricht</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysClasses}</div>
            <p className="text-xs text-muted-foreground">
              {todaysClasses === 1 ? 'Kurs aktiv' : 'Kurse aktiv'}
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
              const courseStudents = (students || []).filter(s => s.courseId === course.id);
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
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <span className="text-sm">{activity.text}</span>
                    <Badge variant="outline" className="text-xs">
                      {activity.time}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="mx-auto h-12 w-12 mb-4" />
                  <p>Noch keine Aktivitäten</p>
                  <p className="text-xs mt-1">Bewerten Sie Schüler im Live-Unterricht</p>
                </div>
              )}
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