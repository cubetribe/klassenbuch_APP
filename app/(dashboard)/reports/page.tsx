"use client";

import { useState } from 'react';
import { useAppStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Download, TrendingUp, Users, Trophy, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

const COLORS = {
  blue: '#3B82F6',
  green: '#10B981',
  yellow: '#F59E0B',
  red: '#EF4444'
};

export default function ReportsPage() {
  const { courses, students, currentCourse } = useAppStore();
  const [selectedCourse, setSelectedCourse] = useState(currentCourse?.id || '');
  const [timeRange, setTimeRange] = useState('30');

  const courseData = courses.find(c => c.id === selectedCourse);
  const courseStudents = students.filter(s => s.courseId === selectedCourse);

  // Color distribution data
  const colorDistribution = [
    { name: 'Exzellent', value: courseStudents.filter(s => s.currentColor === 'blue').length, color: COLORS.blue },
    { name: 'Gut', value: courseStudents.filter(s => s.currentColor === 'green').length, color: COLORS.green },
    { name: 'Warnung', value: courseStudents.filter(s => s.currentColor === 'yellow').length, color: COLORS.yellow },
    { name: 'Kritisch', value: courseStudents.filter(s => s.currentColor === 'red').length, color: COLORS.red },
  ].filter(item => item.value > 0);

  // Mock trend data
  const trendData = [
    { date: '01.01', avgXP: 45, avgLevel: 1.2 },
    { date: '08.01', avgXP: 52, avgLevel: 1.4 },
    { date: '15.01', avgXP: 58, avgLevel: 1.6 },
    { date: '22.01', avgXP: 61, avgLevel: 1.8 },
    { date: '29.01', avgXP: 67, avgLevel: 2.1 },
  ];

  // Level distribution
  const levelDistribution = [
    { level: 'Level 1', count: courseStudents.filter(s => s.currentLevel === 1).length },
    { level: 'Level 2', count: courseStudents.filter(s => s.currentLevel === 2).length },
    { level: 'Level 3', count: courseStudents.filter(s => s.currentLevel === 3).length },
    { level: 'Level 4', count: courseStudents.filter(s => s.currentLevel === 4).length },
  ].filter(item => item.count > 0);

  const stats = {
    totalStudents: courseStudents.length,
    avgXP: Math.round(courseStudents.reduce((sum, s) => sum + s.currentXP, 0) / courseStudents.length || 0),
    avgLevel: (courseStudents.reduce((sum, s) => sum + s.currentLevel, 0) / courseStudents.length || 0).toFixed(1),
    topPerformers: courseStudents.filter(s => s.currentXP >= 80).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Statistiken</h1>
          <p className="text-gray-600">Detaillierte Auswertungen Ihrer Kurse</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <CalendarDays className="w-4 h-4 mr-2" />
            Zeitraum wählen
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Exportieren
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger>
              <SelectValue placeholder="Kurs auswählen" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name} - {course.subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Letzte 7 Tage</SelectItem>
            <SelectItem value="30">Letzte 30 Tage</SelectItem>
            <SelectItem value="90">Letzte 3 Monate</SelectItem>
            <SelectItem value="365">Letztes Jahr</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {courseData ? (
        <>
          {/* Stats Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Schüler gesamt</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">Aktive Schüler</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">⌀ XP</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgXP}</div>
                <p className="text-xs text-muted-foreground">Durchschnittliche Punkte</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">⌀ Level</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgLevel}</div>
                <p className="text-xs text-muted-foreground">Durchschnittslevel</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.topPerformers}</div>
                <p className="text-xs text-muted-foreground">≥80 XP</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Color Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Verhaltensverteilung</CardTitle>
                <CardDescription>Aktuelle Farbverteilung der Schüler</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={colorDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {colorDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Level Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Level-Verteilung</CardTitle>
                <CardDescription>Anzahl Schüler pro Level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={levelDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="level" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Trend Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Entwicklung über Zeit</CardTitle>
              <CardDescription>Durchschnittliche XP und Level-Entwicklung</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgXP"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="⌀ XP"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgLevel"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="⌀ Level"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Performers & Improvements */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performer</CardTitle>
                <CardDescription>Schüler mit den höchsten XP</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courseStudents
                    .sort((a, b) => b.currentXP - a.currentXP)
                    .slice(0, 5)
                    .map((student, index) => (
                      <div key={student.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="text-2xl">{student.avatarEmoji}</span>
                          <span className="font-medium">{student.displayName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>Level {student.currentLevel}</Badge>
                          <span className="font-medium">{student.currentXP} XP</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Verbesserungsbedarf</CardTitle>
                <CardDescription>Schüler mit niedrigen XP</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courseStudents
                    .sort((a, b) => a.currentXP - b.currentXP)
                    .slice(0, 5)
                    .map((student) => (
                      <div key={student.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          <span className="text-2xl">{student.avatarEmoji}</span>
                          <span className="font-medium">{student.displayName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Level {student.currentLevel}</Badge>
                          <span className="font-medium">{student.currentXP} XP</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Kurs auswählen
            </h3>
            <p className="text-gray-600">
              Wählen Sie einen Kurs aus, um detaillierte Reports zu sehen
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}