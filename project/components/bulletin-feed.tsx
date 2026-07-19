'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Megaphone, Plus, Pin, Heart, MessageSquare, ExternalLink, Flag, Loader2,
  Calendar, Trophy, Users, Briefcase, BookOpen, Search, Bell,
} from 'lucide-react';
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { formatNumber, timeAgo, formatDate } from '@/lib/helpers';
import type { Bulletin, Profile } from '@/lib/types';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { value: 'event', label: 'Event', icon: Calendar, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { value: 'hackathon', label: 'Hackathon', icon: Trophy, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { value: 'club', label: 'Club Notice', icon: Users, color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  { value: 'internship', label: 'Internship', icon: Briefcase, color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  { value: 'exam', label: 'Exam', icon: BookOpen, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  { value: 'lostfound', label: 'Lost & Found', icon: Search, color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400' },
  { value: 'announcement', label: 'Announcement', icon: Bell, color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
];

const catMeta = (v: string) => CATEGORIES.find((c) => c.value === v) ?? CATEGORIES[CATEGORIES.length - 1];

type Props = { initialBulletins: (Bulletin & { profiles?: Profile })[] };

export function BulletinFeed({ initialBulletins }: Props) {
  const { user, profile } = useAuth();
  const [bulletins, setBulletins] = useState<(Bulletin & { profiles?: Profile })[]>(initialBulletins);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('announcement');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [link, setLink] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const create = async () => {
    if (!user) { toast.error('Sign in to post.'); return; }
    if (!title.trim() || !body.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('bulletins')
      .insert({
        user_id: user.id, category, title: title.trim(), body: body.trim(),
        link: link || null, event_date: eventDate || null,
      })
      .select('*, profiles!bulletins_user_id_fkey(*)')
      .single();
    if (error) { toast.error(error.message); setLoading(false); return; }
    setBulletins((b) => [data as Bulletin & { profiles?: Profile }, ...b]);
    setTitle(''); setBody(''); setLink(''); setEventDate(''); setCategory('announcement'); setOpen(false);
    toast.success('Posted to bulletin!');
    setLoading(false);
  };

  const like = async (id: string) => {
    if (!user) { toast.error('Sign in to like.'); return; }
    setLiked((l) => ({ ...l, [id]: !l[id] }));
    const isLiked = liked[id];
    const { data } = await supabase.from('bulletins').select('likes_count').eq('id', id).maybeSingle();
    const newCount = (data?.likes_count ?? 0) + (isLiked ? -1 : 1);
    await supabase.from('bulletins').update({ likes_count: newCount }).eq('id', id);
    setBulletins((b) => b.map((bl) => bl.id === id ? { ...bl, likes_count: newCount } : bl));
  };

  const report = async (id: string) => {
    if (!user) { toast.error('Sign in to report.'); return; }
    await supabase.from('reports').insert({ reporter_id: user.id, target_type: 'bulletin', target_id: id, reason: 'Reported by user' });
    toast.success('Reported');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Bulletin</h1>
          <p className="text-sm text-muted-foreground mt-1">Community notice board — events, hackathons, internships, and more.</p>
        </div>
        {user && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2"><Plus className="h-4 w-4" /> Post</Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Post to bulletin</DialogTitle>
                <DialogDescription>Share an event, hackathon, internship, or notice.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="btitle">Title</Label>
                  <Input id="btitle" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" placeholder="Smart India Hackathon 2025" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bbody">Details</Label>
                  <Textarea id="bbody" value={body} onChange={(e) => setBody(e.target.value)} className="rounded-xl" placeholder="What should students know?" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="blink">Link (optional)</Label>
                    <Input id="blink" value={link} onChange={(e) => setLink(e.target.value)} className="rounded-xl" placeholder="https://…" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bdate">Event date (optional)</Label>
                    <Input id="bdate" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="rounded-xl" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" className="rounded-xl">Cancel</Button></DialogClose>
                <Button onClick={create} disabled={loading} className="rounded-xl gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />} Post
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {bulletins.map((b) => {
          const meta = catMeta(b.category);
          return (
            <Card key={b.id} className={cn('rounded-2xl p-5', b.pinned && 'ring-1 ring-primary/40 bg-primary/[0.02]')}>
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 border border-border shrink-0">
                  <AvatarImage src={b.profiles?.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">{b.profiles?.full_name?.[0] ?? 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{b.profiles?.full_name ?? 'Student'}</span>
                    <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase', meta.color)}>{meta.label}</span>
                    {b.pinned && <Pin className="h-3 w-3 text-primary fill-primary" />}
                    <span className="text-xs text-muted-foreground">{timeAgo(b.created_at)}</span>
                  </div>
                  <h3 className="mt-1.5 font-semibold">{b.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{b.body}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <button onClick={() => like(b.id)} className="flex items-center gap-1 hover:text-foreground">
                      <Heart className={cn('h-3.5 w-3.5', liked[b.id] && 'fill-red-500 text-red-500')} /> {formatNumber(b.likes_count)}
                    </button>
                    <button className="flex items-center gap-1 hover:text-foreground"><MessageSquare className="h-3.5 w-3.5" /> {formatNumber(b.comments_count)}</button>
                    {b.event_date && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDate(b.event_date)}</span>}
                    {b.link && <a href={b.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline"><ExternalLink className="h-3.5 w-3.5" /> Link</a>}
                    <button onClick={() => report(b.id)} className="ml-auto flex items-center gap-1 hover:text-destructive"><Flag className="h-3.5 w-3.5" /> Report</button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
