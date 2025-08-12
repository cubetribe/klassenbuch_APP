// Demo-Benutzer für Entwicklung und Demo-Zwecke
// WICHTIG: Nur für Demo! In Production durch echte DB ersetzen!

export interface DemoUser {
  id: string;
  email: string;
  password: string; // Im Klartext für Demo
  name: string;
  role: 'TEACHER' | 'ADMIN';
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: '1',
    email: 'teacher@school.com',
    password: 'demo123',
    name: 'Demo Lehrer',
    role: 'TEACHER'
  },
  {
    id: '2', 
    email: 'admin@school.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'ADMIN'
  }
];

export function validateDemoUser(email: string, password: string): DemoUser | null {
  const user = DEMO_USERS.find(
    u => u.email === email && u.password === password
  );
  return user || null;
}