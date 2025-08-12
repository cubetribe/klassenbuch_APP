"use client";

import { useAppStore } from '@/lib/stores/app-store';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Menu, Moon, Sun, Bell, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import Link from 'next/link';

export function Header() {
  const { 
    toggleSidebar, 
    realtimeConnection, 
    pendingEvents,
    boardMode 
  } = useAppStore();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  if (boardMode) return null;

  return (
    <header className="bg-background border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              realtimeConnection === 'connected' 
                ? 'bg-green-500' 
                : realtimeConnection === 'connecting' 
                ? 'bg-yellow-500' 
                : 'bg-red-500'
            }`} />
            <span className="text-sm text-gray-600 capitalize">
            <span className="text-sm text-muted-foreground capitalize">
              {realtimeConnection === 'connected' ? 'Online' : 
               realtimeConnection === 'connecting' ? 'Verbinde...' : 'Offline'}
            </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Pending Events */}
          {pendingEvents.length > 0 && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {pendingEvents.length} ausstehend
            </Badge>
          )}

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm">
            <Bell className="w-5 h-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="hidden md:inline">{session?.user?.name || 'User'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <Link href="/profile">
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profil
                </DropdownMenuItem>
              </Link>
              <Link href="/settings">
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Einstellungen
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <Link href="/help">
                <DropdownMenuItem>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Hilfe
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
                <LogOut className="w-4 h-4 mr-2" />
                Abmelden
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}