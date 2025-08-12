'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Users, 
  Trophy, 
  AlertTriangle, 
  BarChart3, 
  Zap,
  BookOpen,
  Settings,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/stores/app-store';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const { 
    courses, 
    students,
    fetchCourses,
    fetchStudents,
    coursesLoading,
    studentsLoading 
  } = useAppStore();
  
  const [course, setCourse] = useState<any>(null);
  const [stats, setStats] = useState({
    studentCount: 0,
    avgXP: 0,
    activeToday: 0,
    topPerformer: null as any
  });

  useEffect(() => {
    fetchCourses();
    if (courseId) {
      fetchStudents(courseId);
    }
  }, [courseId, fetchCourses, fetchStudents]);

  useEffect(() => {
    const foundCourse = courses.find(c => c.id === courseId);
    setCourse(foundCourse);
  }, [courses, courseId]);

  useEffect(() => {
    const courseStudents = students.filter(s => s.courseId === courseId);
    const avgXP = courseStudents.length > 0 
      ? courseStudents.reduce((sum, s) => sum + (s.currentXP || 0), 0) / courseStudents.length
      : 0;
    
    const topStudent = courseStudents.reduce((top, student) => {
      if (!top || (student.currentXP || 0) > (top.currentXP || 0)) {
        return student;
      }
      return top;
    }, null as any);

    setStats({
      studentCount: courseStudents.length,
      avgXP: Math.round(avgXP),
      activeToday: Math.floor(courseStudents.length * 0.7), // Mock for now
      topPerformer: topStudent
    });
  }, [students, courseId]);

  if (coursesLoading || !course) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Schüler',
      description: `${stats.studentCount} Schüler verwalten`,
      icon: Users,
      href: `/courses/${courseId}/students`,
      color: 'text-blue-600'
    },
    {
      title: 'Live Board',
      description: 'Echtzeit-Klassenübersicht',
      icon: Zap,
      href: `/courses/${courseId}/live`,
      color: 'text-purple-600'
    },
    {
      title: 'Belohnungen',
      description: 'Punkte und Achievements',
      icon: Trophy,
      href: `/courses/${courseId}/rewards`,
      color: 'text-yellow-600'
    },
    {
      title: 'Konsequenzen',
      description: 'Regeln und Maßnahmen',
      icon: AlertTriangle,
      href: `/courses/${courseId}/consequences`,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/courses">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{course.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{course.subject}</Badge>
              <Badge variant="secondary">{course.schoolYear}</Badge>
            </div>
          </div>
        </div>
        <Link href={`/courses/${courseId}/board`}>
          <Button>
            <BookOpen className="w-4 h-4 mr-2" />
            Zum Board
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schüler</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.studentCount}</div>
            <p className="text-xs text-muted-foreground">
              Aktive Schüler
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durchschnitt XP</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgXP}</div>
            <p className="text-xs text-muted-foreground">
              Erfahrungspunkte
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heute aktiv</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeToday}</div>
            <p className="text-xs text-muted-foreground">
              Schüler heute
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.topPerformer ? stats.topPerformer.displayName : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.topPerformer ? `${stats.topPerformer.currentXP || 0} XP` : 'Noch keine Daten'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <action.icon className={`h-8 w-8 ${action.color}`} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Letzte Aktivitäten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground text-center py-8">
              Noch keine Aktivitäten vorhanden
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}