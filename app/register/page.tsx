"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'TEACHER' as 'TEACHER' | 'CO_TEACHER',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein');
      setIsLoading(false);
      return;
    }

    try {
      await apiClient.auth.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-600 dark:text-green-400">
              Registrierung erfolgreich!
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Bestätigungs-Email wurde versendet
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription className="text-sm">
                Wir haben Ihnen eine Bestätigungs-Email an <strong>{formData.email}</strong> gesendet.
                Bitte klicken Sie auf den Link in der Email, um Ihr Konto zu aktivieren.
              </AlertDescription>
            </Alert>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Email nicht erhalten?</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Prüfen Sie Ihren Spam-Ordner</li>
                <li>Stellen Sie sicher, dass die Email-Adresse korrekt ist</li>
                <li>
                  <Link href="/resend-verification" className="text-primary hover:underline">
                    Bestätigungs-Email erneut senden
                  </Link>
                </li>
              </ul>
            </div>

            <Button
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Zurück zum Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Konto erstellen</CardTitle>
          <CardDescription>
            Registrieren Sie sich für die Klassenbuch App
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
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ihr vollständiger Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="ihre@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rolle</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'TEACHER' | 'CO_TEACHER') =>
                  setFormData({ ...formData, role: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEACHER">Lehrkraft</SelectItem>
                  <SelectItem value="CO_TEACHER">Co-Lehrkraft</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Co-Lehrkräfte können Kurse bearbeiten, aber keine eigenen Kurse erstellen
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mindestens 8 Zeichen"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Passwort wiederholen"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Registrierung läuft...
                </span>
              ) : (
                'Konto erstellen'
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Bereits registriert?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Jetzt anmelden
              </Link>
            </div>
          </form>

          <div className="mt-6 text-xs text-center text-muted-foreground">
            <p>
              Mit der Registrierung stimmen Sie unseren{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Nutzungsbedingungen
              </Link>{' '}
              und der{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Datenschutzerklärung
              </Link>{' '}
              zu.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}