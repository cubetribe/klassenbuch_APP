"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CheckCircle2, XCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

type VerificationState = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const [state, setState] = useState<VerificationState>('loading');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(3);
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setState('error');
        setMessage('Kein Bestätigungstoken gefunden');
        return;
      }

      try {
        const response = await apiClient.auth.verifyEmail(token);
        setState('success');
        setMessage(response.message || 'Email erfolgreich bestätigt!');

        // Start countdown to redirect
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              router.push('/login');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(interval);
      } catch (err: any) {
        setState('error');
        setMessage(
          err.message ||
          'Ungültiger oder abgelaufener Bestätigungslink. Bitte fordern Sie einen neuen Link an.'
        );
      }
    };

    verifyEmail();
  }, [token, router]);

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
            <CardTitle className="text-2xl">Email wird bestätigt...</CardTitle>
            <CardDescription>
              Bitte warten Sie einen Moment
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-600 dark:text-green-400">
              Email bestätigt!
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Ihr Konto wurde erfolgreich aktiviert
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
              <AlertDescription className="text-sm">
                {message}
              </AlertDescription>
            </Alert>

            <p className="text-sm text-center text-muted-foreground">
              Sie werden in {countdown} Sekunden zum Login weitergeleitet...
            </p>

            <Button
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Jetzt anmelden
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl text-red-600 dark:text-red-400">
            Bestätigung fehlgeschlagen
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Der Link ist ungültig oder abgelaufen
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {message}
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/resend-verification')}
              className="w-full"
              variant="default"
            >
              <Mail className="w-4 h-4 mr-2" />
              Neuen Bestätigungslink anfordern
            </Button>

            <Button
              onClick={() => router.push('/login')}
              className="w-full"
              variant="outline"
            >
              Zurück zum Login
            </Button>
          </div>

          <div className="text-sm text-muted-foreground text-center">
            <p>Benötigen Sie Hilfe?</p>
            <Link href="/support" className="text-primary hover:underline">
              Kontaktieren Sie den Support
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
