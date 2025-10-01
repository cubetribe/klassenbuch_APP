"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CheckCircle2, Mail } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

export default function ResendVerificationPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await apiClient.auth.resendVerification(email);
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.message ||
        'Fehler beim Versenden der Email. Bitte versuchen Sie es erneut.'
      );
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
              Email versendet!
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Bestätigungs-Email wurde erneut versendet
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
              <AlertDescription className="text-sm">
                Wir haben Ihnen eine neue Bestätigungs-Email an <strong>{email}</strong> gesendet.
                Bitte klicken Sie auf den Link in der Email, um Ihr Konto zu aktivieren.
              </AlertDescription>
            </Alert>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Email nicht erhalten?</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Prüfen Sie Ihren Spam-Ordner</li>
                <li>Stellen Sie sicher, dass die Email-Adresse korrekt ist</li>
                <li>Warten Sie einige Minuten, die Zustellung kann etwas dauern</li>
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
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <Mail className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">Bestätigungs-Email erneut senden</CardTitle>
          <CardDescription>
            Geben Sie Ihre Email-Adresse ein, um einen neuen Bestätigungslink zu erhalten
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
                  Email wird versendet...
                </span>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Bestätigungs-Email senden
                </>
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Zurück zum{' '}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
