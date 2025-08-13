"use client";

import { useAppStore } from '@/lib/stores/app-store';
import { cn } from '@/lib/utils';
import { 
  Home, 
  BookOpen, 
  Users, 
  Trophy, 
  AlertTriangle,
  BarChart3,
  Settings,
  Monitor,
  X,
  Menu
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Kurse', href: '/courses', icon: BookOpen },
  { name: 'Schüler', href: '/students', icon: Users },
  { name: 'Belohnungen', href: '/rewards', icon: Trophy },
  { name: 'Konsequenzen', href: '/consequences', icon: AlertTriangle },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Einstellungen', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, currentCourse, boardMode } = useAppStore();
  const pathname = usePathname();

  if (boardMode) return null;

  return (
    <>
      {/* Mobile backdrop */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 h-full bg-background border-r border-border z-50 transition-transform duration-300 ease-in-out',
        'md:relative md:translate-x-0',
        sidebarCollapsed ? '-translate-x-full md:w-16' : 'translate-x-0 w-64'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            {!sidebarCollapsed && (
              <h1 className="font-bold text-xl text-foreground">Klassenbuch</h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="md:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Current Course */}
          {currentCourse && !sidebarCollapsed && (
            <div className="p-4 bg-primary/5 border-b border-border">
              <p className="text-sm font-medium text-primary">{currentCourse.name}</p>
              <p className="text-xs text-muted-foreground">{currentCourse.subject}</p>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                // Better path matching - check if current path starts with nav item href
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/90 text-primary-foreground dark:bg-gray-700 dark:text-white'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                        sidebarCollapsed && 'justify-center px-2'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {!sidebarCollapsed && <span>{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Board Mode Toggle */}
          {currentCourse && !sidebarCollapsed && (
            <div className="p-4 border-t border-border">
              <Link
                href={`/courses/${currentCourse.id}/board`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                <Monitor className="w-5 h-5" />
                <span>Tafelmodus</span>
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}