'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/lib/stores/app-store';

const SUBJECTS = [
  'Mathematik',
  'Deutsch', 
  'Englisch',
  'Physik',
  'Chemie',
  'Biologie',
  'Geschichte',
  'Geographie',
  'Musik',
  'Kunst',
  'Sport',
  'Informatik',
  'Religion/Ethik',
  'Sonstiges'
];

export default function NewCoursePage() {
  const router = useRouter();
  const { createCourse } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    schoolYear: new Date().getFullYear().toString()
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.subject) return;

    setIsLoading(true);
    try {
      await createCourse(formData);
      router.push('/courses');
    } catch (error) {
      console.error('Failed to create course:', error);
      alert('Fehler beim Erstellen des Kurses');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/courses"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zu Kurse
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center mb-6">
          <BookOpen className="w-8 h-8 text-primary mr-3" />
          <h1 className="text-2xl font-bold">Neuen Kurs erstellen</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Kursname *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="z.B. Klasse 7a"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-2">
              Fach *
            </label>
            <select
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Bitte wählen...</option>
              {SUBJECTS.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="schoolYear" className="block text-sm font-medium mb-2">
              Schuljahr
            </label>
            <input
              type="text"
              id="schoolYear"
              value={formData.schoolYear}
              onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
              placeholder="z.B. 2024/2025"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isLoading || !formData.name || !formData.subject}
              className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Erstelle...' : 'Kurs erstellen'}
            </button>
            <Link
              href="/courses"
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 text-center"
            >
              Abbrechen
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}