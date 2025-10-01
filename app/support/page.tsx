"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Support</CardTitle>
          <CardDescription>
            Wir helfen Ihnen gerne weiter
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Bei Fragen oder Problemen kontaktieren Sie uns:
            </p>
            <a
              href="mailto:support@goaiex.com"
              className="text-primary hover:underline font-medium flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              support@goaiex.com
            </a>
          </div>

          <Button
            asChild
            className="w-full"
            variant="outline"
          >
            <Link href="/login">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zum Login
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
