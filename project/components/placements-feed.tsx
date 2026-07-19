'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Briefcase, Plus, Heart, MessageSquare, ExternalLink, Flag, Loader2,
  MapPin, IndianRupee, Building2, User, Link2,
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
import { formatNumber, timeAgo } from '@/lib/helpers';
import type { PlacementPost, Profile } from '@/lib/types';
import { cn } from '@/lib/utils';

const TYPES = [
  { value: 'internship', label: 'Internship', color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  { value: 'job', label: 'Full-time Job', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { value: 'referral', label: 'Referral', color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  { value: 'interview', label: 'Interview Experience', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { value: 'company', label: 'Company Overview', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
];

const STATUSES = [
  { value: 'open', label: 'Open', color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  { value: 'closed', label: 'Closed', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
  { value: 'applied', label: 'Applied', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { value: 'interviewing', label: 'Interviewing', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { value: 'offered', label: 'Offered', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
];

const typeMeta = (v: string) => TYPES.find((t) => t.value === v) ?? TYPES[0];
const statusMeta = (v: string) => STATUSES.find((s) => s.value === v) ?? STATUSES[0];

type Props = { initialPosts: (PlacementPost & { profiles?: Profile })[] };

export function PlacementsFeed({ initialPosts }: Props) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<(PlacementPost & { profiles?: Profile })[]>(initialPosts);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('job');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [ctc, setCtc] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [link, setLink] = useState('');
  const [status, setStatus] = useState('open');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const create = async () => {
    if (!user) { toast.error('Sign in to post.'); return; }
    if (!company.trim() || !role.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('placement_posts')
      .insert({
        user_id: user.id, type, company: company.trim(), role: role.trim(),
        ctc: ctc.trim(), location: location.trim(), experience: experience.trim(),
        link: link || null, status, tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      })
      .select('*, profiles!placement_posts_user_id_fkey(*)')
      .single();
    if (error) { toast.error(error.message); setLoading(false); return; }
    setPosts((p) => [data as PlacementPost & { profiles?: Profile }, ...p]);
    setCompany(''); setRole(''); setCtc(''); setLocation(''); setExperience(''); setLink(''); setTags(''); setType('job'); setStatus('open'); setOpen(false);
    toast.success('Posted!');
    setLoading(false);
  };

  const like = async (id: string) => {
    if (!user) { toast.error('Sign in to like.'); return; }
    setLiked((l) => ({ ...l, [id]: !l[id] }));
    const isLiked = liked[id];
    const { data } = await supabase.from('placement_posts').select('likes_count').eq('id', id).maybeSingle();
    const newCount = (data?.likes_count ?? 0) + (isLiked ? -1 : 1);
    await supabase.from('placement_posts').update({ likes_count: newCount }).eq('id', id);
    setPosts((p) => p.map((pp) => pp.id === id ? { ...pp, likes_count: newCount } : pp));
  };

  const report = async (id: string) => {
    if (!user) { toast.error('Sign in to report.'); return; }
    await supabase.from('reports').insert({ reporter_id: user.id, target_type: 'placement', target_id: id, reason: 'Reported by user' });
    toast.success('Reported');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Placements</h1>
          <p className="text-sm text-muted-foreground mt-1">Community-driven board for internships, jobs, referrals, and interview experiences.</p>
        </div>
        {user && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2"><Plus className="h-4 w-4" /> Share</Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Share a placement update</DialogTitle>
                <DialogDescription>Internships, jobs, referrals, or interview experiences.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Type</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>{TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="company">Company <span className="text-destructive">*</span></Label>
                    <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} className="rounded-xl" placeholder="Google" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="role">Role <span className="text-destructive">*</span></Label>
                    <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} className="rounded-xl" placeholder="SWE Intern" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="ctc">CTC / Stipend</Label>
                    <Input id="ctc" value={ctc} onChange={(e) => setCtc(e.target.value)} className="rounded-xl" placeholder="₹26 LPA" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="loc">Location</Label>
                    <Input id="loc" value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-xl" placeholder="Bangalore" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="exp">Experience / Details</Label>
                  <Textarea id="exp" value={experience} onChange={(e) => setExperience(e.target.value)} className="rounded-xl" placeholder="Rounds, topics, tips…" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="plink">Application link</Label>
                    <Input id="plink" value={link} onChange={(e) => setLink(e.target.value)} className="rounded-xl" placeholder="https://…" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ptags">Tags</Label>
                    <Input id="ptags" value={tags} onChange={(e) => setTags(e.target.value)} className="rounded-xl" placeholder="frontend, react" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" className="rounded-xl">Cancel</Button></DialogClose>
                <Button onClick={create} disabled={loading} className="rounded-xl gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Briefcase className="h-4 w-4" />} Post
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {posts.map((p) => {
          const tm = typeMeta(p.type);
          const sm = statusMeta(p.status);
          return (
            <Card key={p.id} className="rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 border border-border shrink-0">
                  <AvatarImage src={p.profiles?.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">{p.profiles?.full_name?.[0] ?? 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{p.profiles?.full_name ?? 'Student'}</span>
                    <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase', tm.color)}>{tm.label}</span>
                    <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase', sm.color)}>{sm.label}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(p.created_at)}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">{p.company}</h3>
                    <span className="text-muted-foreground">—</span>
                    <span className="text-sm">{p.role}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {p.ctc && <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" /> {p.ctc}</span>}
                    {p.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.location}</span>}
                  </div>
                  {p.experience && <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.experience}</p>}
                  {p.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.tags.map((t) => <Badge key={t} variant="secondary" className="text-xs">#{t}</Badge>)}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <button onClick={() => like(p.id)} className="flex items-center gap-1 hover:text-foreground">
                      <Heart className={cn('h-3.5 w-3.5', liked[p.id] && 'fill-red-500 text-red-500')} /> {formatNumber(p.likes_count)}
                    </button>
                    <button className="flex items-center gap-1 hover:text-foreground"><MessageSquare className="h-3.5 w-3.5" /> {formatNumber(p.comments_count)}</button>
                    {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline"><ExternalLink className="h-3.5 w-3.5" /> Apply</a>}
                    <button onClick={() => report(p.id)} className="ml-auto flex items-center gap-1 hover:text-destructive"><Flag className="h-3.5 w-3.5" /> Report</button>
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
