'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { BookMarked, Plus, Pencil, Trash2, Lock, Globe, Loader2, FolderPlus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { formatNumber, timeAgo } from '@/lib/helpers';
import type { Board, Profile } from '@/lib/types';
import { cn } from '@/lib/utils';

const COLORS = [
  { name: 'blue', class: 'from-blue-500 to-cyan-500' },
  { name: 'green', class: 'from-green-500 to-emerald-500' },
  { name: 'orange', class: 'from-orange-500 to-amber-500' },
  { name: 'purple', class: 'from-violet-500 to-purple-500' },
  { name: 'rose', class: 'from-rose-500 to-pink-500' },
  { name: 'teal', class: 'from-teal-500 to-cyan-500' },
];

const colorFor = (name: string) => COLORS.find((c) => c.name === name)?.class ?? COLORS[0].class;

type Props = { initialBoards: (Board & { profiles?: Profile })[] };

export function BoardsExplorer({ initialBoards }: Props) {
  const { user, profile } = useAuth();
  const [boards, setBoards] = useState<(Board & { profiles?: Profile })[]>(initialBoards);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const create = async () => {
    if (!user) { toast.error('Sign in to create boards.'); return; }
    if (!name.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('boards')
      .insert({ user_id: user.id, name: name.trim(), description: description.trim(), cover_color: color, is_private: isPrivate })
      .select('*, profiles!boards_user_id_fkey(*)')
      .single();
    if (error) { toast.error(error.message); setLoading(false); return; }
    setBoards((b) => [data as Board & { profiles?: Profile }, ...b]);
    setName(''); setDescription(''); setColor('blue'); setIsPrivate(false); setOpen(false);
    toast.success('Board created!');
    setLoading(false);
  };

  const rename = async (id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    await supabase.from('boards').update({ name: trimmed }).eq('id', id);
    setBoards((b) => b.map((bd) => bd.id === id ? { ...bd, name: trimmed } : bd));
    toast.success('Renamed');
  };

  const remove = async (id: string) => {
    await supabase.from('boards').delete().eq('id', id);
    setBoards((b) => b.filter((bd) => bd.id !== id));
    toast.success('Board deleted');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Boards</h1>
          <p className="text-sm text-muted-foreground mt-1">Collections of resources curated by students.</p>
        </div>
        {user && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2"><Plus className="h-4 w-4" /> New board</Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Create a board</DialogTitle>
                <DialogDescription>Group resources by subject, semester, or goal.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bname">Name</Label>
                  <Input id="bname" value={name} onChange={(e) => setName(e.target.value)} placeholder="DBMS Revision" className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bdesc">Description</Label>
                  <Textarea id="bdesc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Everything I need for the DBMS end-sem." className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Cover color</Label>
                  <div className="flex gap-2">
                    {COLORS.map((c) => (
                      <button key={c.name} type="button" onClick={() => setColor(c.name)} className={cn('h-8 w-8 rounded-lg bg-gradient-to-br', c.class, color === c.name && 'ring-2 ring-ring ring-offset-2')} aria-label={c.name} />
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="rounded" />
                  Make private
                </label>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" className="rounded-xl">Cancel</Button></DialogClose>
                <Button onClick={create} disabled={loading} className="rounded-xl gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />} Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {boards.length === 0 ? (
        <div className="text-center py-20">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-muted">
            <BookMarked className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="mt-4 font-semibold">No boards yet</h3>
          <p className="text-sm text-muted-foreground mt-1">{user ? 'Create your first board to organize resources.' : 'Sign in to create boards.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((b) => (
            <Card key={b.id} className="group rounded-2xl overflow-hidden p-0 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <Link href={`/boards/${b.id}`}>
                <div className={cn('relative h-24 bg-gradient-to-br', colorFor(b.cover_color))}>
                  <div className="absolute inset-0 grid-pattern opacity-20" />
                  <div className="absolute top-3 right-3">
                    {b.is_private ? <Lock className="h-4 w-4 text-white/90" /> : <Globe className="h-4 w-4 text-white/90" />}
                  </div>
                </div>
              </Link>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/boards/${b.id}`} className="flex-1 min-w-0">
                    <h3 className="font-semibold group-hover:text-primary transition-colors truncate">{b.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{b.description || 'No description'}</p>
                  </Link>
                  {user?.id === b.user_id && (
                    <div className="flex gap-1">
                      <RenameDialog onRename={(n) => rename(b.id, n)} name={b.name} />
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => remove(b.id)} aria-label="Delete board">
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Link href={`/profile/${b.profiles?.username ?? b.user_id}`} className="flex items-center gap-1.5">
                    <Avatar className="h-5 w-5 border border-border">
                      <AvatarImage src={b.profiles?.avatar_url ?? undefined} />
                      <AvatarFallback className="text-[9px] bg-gradient-to-br from-primary to-accent text-white">{b.profiles?.full_name?.[0] ?? 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{b.profiles?.full_name ?? 'Student'}</span>
                  </Link>
                  <Badge variant="secondary" className="ml-auto text-xs">{formatNumber(b.resources_count)} items</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function RenameDialog({ onRename, name }: { onRename: (n: string) => void; name: string }) {
  const [value, setValue] = useState(name);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" aria-label="Rename board"><Pencil className="h-3.5 w-3.5" /></Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl">
        <DialogHeader><DialogTitle>Rename board</DialogTitle></DialogHeader>
        <Input value={value} onChange={(e) => setValue(e.target.value)} className="rounded-xl" />
        <DialogFooter>
          <DialogClose asChild><Button variant="outline" className="rounded-xl">Cancel</Button></DialogClose>
          <DialogClose asChild><Button onClick={() => onRename(value)} className="rounded-xl">Save</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
