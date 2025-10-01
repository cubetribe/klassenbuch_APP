"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResendDialog, setShowResendDialog] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Check for specific error messages
        if (result.error.includes('EMAIL_NOT_VERIFIED') || result.error.includes('nicht bestätigt')) {
          setError('Bitte bestätigen Sie zuerst Ihre Email-Adresse');
          setResendEmail(email);
        } else {
          setError('Ungültige Anmeldedaten');
        }
      } else if (result?.ok) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendError('');
    setResendLoading(true);

    try {
      await apiClient.auth.resendVerification(resendEmail);
      setResendSuccess(true);
    } catch (err: any) {
      setResendError(err.message || 'Fehler beim Versenden der Email');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
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
                  <AlertDescription className="flex flex-col gap-2">
                    <span>{error}</span>
                    {error.includes('Email-Adresse') && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowResendDialog(true)}
                        className="mt-2"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Bestätigungs-Email erneut senden
                      </Button>
                    )}
                  </AlertDescription>
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

              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Passwort eingeben"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                    Anmelden...
                  </span>
                ) : (
                  'Anmelden'
                )}
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

      {/* Resend Verification Dialog */}
      <Dialog open={showResendDialog} onOpenChange={setShowResendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bestätigungs-Email erneut senden</DialogTitle>
            <DialogDescription>
              Geben Sie Ihre Email-Adresse ein, um einen neuen Bestätigungslink zu erhalten
            </DialogDescription>
          </DialogHeader>

          {resendSuccess ? (
            <div className="space-y-4">
              <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
                <AlertDescription className="text-sm">
                  Bestätigungs-Email wurde erfolgreich an <strong>{resendEmail}</strong> gesendet.
                  Bitte prüfen Sie auch Ihren Spam-Ordner.
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => {
                  setShowResendDialog(false);
                  setResendSuccess(false);
                  setResendEmail('');
                }}
                className="w-full"
              >
                Schließen
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {resendError && (
                <Alert variant="destructive">
                  <AlertDescription>{resendError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="resendEmail">E-Mail</Label>
                <Input
                  id="resendEmail"
                  type="email"
                  placeholder="ihre@email.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  disabled={resendLoading}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowResendDialog(false);
                    setResendError('');
                  }}
                  className="flex-1"
                  disabled={resendLoading}
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleResendVerification}
                  className="flex-1"
                  disabled={resendLoading || !resendEmail}
                >
                  {resendLoading ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Senden...
                    </span>
                  ) : (
                    'Email senden'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}