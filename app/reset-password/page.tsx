"use client";

import { redirect } from 'next/navigation';

export default function ResetPasswordPage() {
  // Passwort-Reset ist deaktiviert - nur Demo-Login verfügbar
  redirect('/login');
  return null;
}