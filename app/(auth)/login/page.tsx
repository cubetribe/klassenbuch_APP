"use client";

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/stores';
import { mockUser } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { setUser } = useAppStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Mock authentication - in real app, this would be an API call
      if (email === 'teacher@school.com' && password === 'demo123') {
        setUser(mockUser);
        router.push('/dashboard');
      } else {
        setError('Ungültige Anmeldedaten');
      }
    } catch (err) {
      setError('Fehler bei der Anmeldung');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Klassenbuch App</CardTitle>
          <CardDescription>
            Melden Sie sich an, um fortzufahren
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="ihre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                placeholder="Passwort eingeben"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Anmelden...' : 'Anmelden'}
            </Button>

            <div className="text-center space-y-2">
              <Link 
                href="/reset-password" 
                className="text-sm text-primary hover:underline"
              >
                Passwort vergessen?
              </Link>
              <div className="text-sm text-muted-foreground">
                Noch kein Konto?{' '}
                <Link href="/register" className="text-primary hover:underline">
                  Registrieren
                </Link>
              </div>
            </div>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Demo-Zugang:</p>
            <p className="text-sm text-blue-600 dark:text-blue-400">E-Mail: teacher@school.com</p>
            <p className="text-sm text-blue-600 dark:text-blue-400">Passwort: demo123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}