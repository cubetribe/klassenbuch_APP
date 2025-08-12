"use client";

import { redirect } from 'next/navigation';

export default function RegisterPage() {
  // Registration ist deaktiviert - nur Demo-Login verfügbar
  redirect('/login');
  return null;
}