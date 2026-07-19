'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutGrid, BookMarked, Megaphone, Briefcase, Upload, Home, Bell,
  GraduationCap, FileText, Search, Sparkles,
} from 'lucide-react';
import { SUBJECTS } from '@/lib/helpers';

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const run = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, subjects, or jump to…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => run('/')}><Home className="mr-2 h-4 w-4" /> Home</CommandItem>
          <CommandItem onSelect={() => run('/resources')}><LayoutGrid className="mr-2 h-4 w-4" /> Resources</CommandItem>
          <CommandItem onSelect={() => run('/boards')}><BookMarked className="mr-2 h-4 w-4" /> Boards</CommandItem>
          <CommandItem onSelect={() => run('/bulletin')}><Megaphone className="mr-2 h-4 w-4" /> Bulletin</CommandItem>
          <CommandItem onSelect={() => run('/placements')}><Briefcase className="mr-2 h-4 w-4" /> Placements</CommandItem>
          <CommandItem onSelect={() => run('/upload')}><Upload className="mr-2 h-4 w-4" /> Upload a resource</CommandItem>
          <CommandItem onSelect={() => run('/dashboard')}><LayoutGrid className="mr-2 h-4 w-4" /> Dashboard</CommandItem>
          <CommandItem onSelect={() => run('/notifications')}><Bell className="mr-2 h-4 w-4" /> Notifications</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Popular subjects">
          {SUBJECTS.slice(0, 6).map((s) => (
            <CommandItem
              key={s}
              onSelect={() => run(`/resources?subject=${encodeURIComponent(s)}`)}
            >
              <FileText className="mr-2 h-4 w-4" /> {s}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => run('/resources?sort=trending')}>
            <Sparkles className="mr-2 h-4 w-4" /> Trending resources
          </CommandItem>
          <CommandItem onSelect={() => run('/resources?sort=latest')}>
            <Search className="mr-2 h-4 w-4" /> Latest uploads
          </CommandItem>
          <CommandItem onSelect={() => run('/placements')}>
            <Briefcase className="mr-2 h-4 w-4" /> Browse placements
          </CommandItem>
          <CommandItem onSelect={() => run('/bulletin')}>
            <Megaphone className="mr-2 h-4 w-4" /> Community bulletin
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
