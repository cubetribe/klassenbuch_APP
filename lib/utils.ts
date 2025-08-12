import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getColorClasses(color: 'blue' | 'green' | 'yellow' | 'red') {
  switch (color) {
    case 'blue':
      return {
        bg: 'bg-blue-500',
        text: 'text-white',
        border: 'border-blue-500',
        hover: 'hover:bg-blue-600'
      };
    case 'green':
      return {
        bg: 'bg-green-500',
        text: 'text-white',
        border: 'border-green-500',
        hover: 'hover:bg-green-600'
      };
    case 'yellow':
      return {
        bg: 'bg-yellow-500',
        text: 'text-black',
        border: 'border-yellow-500',
        hover: 'hover:bg-yellow-600'
      };
    case 'red':
      return {
        bg: 'bg-red-500',
        text: 'text-white',
        border: 'border-red-500',
        hover: 'hover:bg-red-600'
      };
    default:
      return {
        bg: 'bg-gray-500',
        text: 'text-white',
        border: 'border-gray-500',
        hover: 'hover:bg-gray-600'
      };
  }
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function calculateColorFromXP(xp: number): 'blue' | 'green' | 'yellow' | 'red' {
  if (xp >= 80) return 'blue';
  if (xp >= 60) return 'green';
  if (xp >= 30) return 'yellow';
  return 'red';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}