'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, LayoutGrid, BookMarked, Megaphone, Briefcase, Upload, Bell, Menu, X, GraduationCap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { CommandMenu } from '@/components/command-menu';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/resources', label: 'Resources', icon: LayoutGrid },
  { href: '/boards', label: 'Boards', icon: BookMarked },
  { href: '/bulletin', label: 'Bulletin', icon: Megaphone },
  { href: '/placements', label: 'Placements', icon: Briefcase },
];

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [notifCount] = useState(3);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled ? 'glass shadow-sm' : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/30">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight hidden sm:block">
            Study<span className="gradient-text">Hub</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/60"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1 max-w-md mx-2 hidden lg:block">
          <button
            onClick={() => {
              const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
              window.dispatchEvent(event);
            }}
            className="group flex w-full items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>Search resources, subjects…</span>
            <kbd className="ml-auto rounded border border-border bg-background px-1.5 text-[10px] font-medium">⌘K</kbd>
          </button>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <Button asChild size="sm" className="hidden sm:flex rounded-full gap-1.5">
            <Link href="/upload">
              <Upload className="h-4 w-4" /> Upload
            </Link>
          </Button>

          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9" aria-label="Notifications">
                    <Bell className="h-4 w-4" />
                    {notifCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-white">
                        {notifCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/notifications" className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" /> View all notifications
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring" aria-label="Profile menu">
                    <Avatar className="h-9 w-9 border-2 border-border">
                      <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? 'avatar'} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs font-semibold">
                        {profile?.full_name?.[0] ?? user.email?.[0]?.toUpperCase() ?? 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium leading-none">{profile?.full_name || 'Student'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    {profile?.role === 'admin' && <Badge className="mt-1" variant="secondary">Admin</Badge>}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/dashboard">Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href={`/profile/${profile?.username ?? user.id}`}>Profile</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/boards">My Boards</Link></DropdownMenuItem>
                  {profile?.role === 'admin' && <DropdownMenuItem asChild><Link href="/admin">Admin Panel</Link></DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
              <Link href="/auth/sign-in">Sign in</Link>
            </Button>
          )}

          <ThemeToggle />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden rounded-full" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex flex-col gap-1 mt-6">
                <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted">
                  <GraduationCap className="h-4 w-4" /> Home
                </Link>
                {NAV_LINKS.map((l) => (
                  <Link key={l.href} href={l.href} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted">
                    <l.icon className="h-4 w-4" /> {l.label}
                  </Link>
                ))}
                <Link href="/upload" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted">
                  <Upload className="h-4 w-4" /> Upload
                </Link>
                {user ? (
                  <>
                    <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted">
                      <LayoutGrid className="h-4 w-4" /> Dashboard
                    </Link>
                    <Link href="/notifications" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted">
                      <Bell className="h-4 w-4" /> Notifications
                    </Link>
                    <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-left text-destructive">
                      <X className="h-4 w-4" /> Sign out
                    </button>
                  </>
                ) : (
                  <Link href="/auth/sign-in" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted">
                    <Sparkles className="h-4 w-4" /> Sign in
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <CommandMenu />
    </header>
  );
}
