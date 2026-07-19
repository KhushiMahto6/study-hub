'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Shield, Users, FileText, Megaphone, Briefcase, Flag, BarChart3,
  Trash2, CheckCircle2, XCircle, Loader2, TrendingUp, Download, Heart,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase/client';
import { formatNumber, timeAgo } from '@/lib/helpers';
import type { Resource, Profile, Bulletin, PlacementPost, Report } from '@/lib/types';

type Props = {
  resources: (Resource & { profiles?: Profile })[];
  bulletins: (Bulletin & { profiles?: Profile })[];
  placements: (PlacementPost & { profiles?: Profile })[];
  reports: (Report & { reporter?: Profile })[];
  profiles: Profile[];
};

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-green-500/10 text-green-600 dark:text-green-400',
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  removed: 'bg-red-500/10 text-red-600 dark:text-red-400',
  rejected: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
};

export function AdminPanel({ resources, bulletins, placements, reports, profiles }: Props) {
  const [resList, setResList] = useState(resources);
  const [acting, setActing] = useState<string | null>(null);

  const totalViews = resList.reduce((s, r) => s + r.views_count, 0);
  const totalDownloads = resList.reduce((s, r) => s + r.downloads_count, 0);
  const totalLikes = resList.reduce((s, r) => s + r.likes_count, 0);

  const setStatus = async (id: string, status: 'published' | 'rejected' | 'removed') => {
    setActing(id);
    await supabase.from('resources').update({ status }).eq('id', id);
    setResList((r) => r.map((x) => x.id === id ? { ...x, status } : x));
    setActing(null);
    toast.success(`Resource ${status}`);
  };

  const deleteResource = async (id: string) => {
    await supabase.from('resources').delete().eq('id', id);
    setResList((r) => r.filter((x) => x.id !== id));
    toast.success('Resource deleted');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="font-display text-3xl font-bold">Admin panel</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Manage users, content, and reports.</p>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: FileText, label: 'Resources', value: resList.length, color: 'text-blue-500' },
          { icon: Users, label: 'Users', value: profiles.length, color: 'text-violet-500' },
          { icon: Download, label: 'Downloads', value: totalDownloads, color: 'text-green-500' },
          { icon: Heart, label: 'Likes', value: totalLikes, color: 'text-rose-500' },
        ].map((s) => (
          <Card key={s.label} className="rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <span className="text-2xl font-bold font-display">{formatNumber(s.value)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{s.label}</p>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="resources">
        <TabsList className="rounded-xl">
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="bulletins">Bulletins</TabsTrigger>
          <TabsTrigger value="placements">Placements</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="mt-4 space-y-2">
          {resList.map((r) => (
            <Card key={r.id} className="rounded-2xl p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted grid place-items-center shrink-0">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.profiles?.full_name ?? 'Unknown'} · {timeAgo(r.created_at)}</p>
              </div>
              <Badge className={STATUS_COLORS[r.status]}>{r.status}</Badge>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => setStatus(r.id, 'published')} disabled={acting === r.id} className="rounded-lg" aria-label="Approve"><CheckCircle2 className="h-4 w-4 text-green-500" /></Button>
                <Button size="sm" variant="ghost" onClick={() => setStatus(r.id, 'rejected')} disabled={acting === r.id} className="rounded-lg" aria-label="Reject"><XCircle className="h-4 w-4 text-amber-500" /></Button>
                <Button size="sm" variant="ghost" onClick={() => deleteResource(r.id)} disabled={acting === r.id} className="rounded-lg" aria-label="Delete">{acting === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}</Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="users" className="mt-4 space-y-2">
          {profiles.map((p) => (
            <Card key={p.id} className="rounded-2xl p-4 flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={p.avatar_url ?? undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">{p.full_name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{p.full_name} {p.verified && <span className="text-primary">✓</span>}</p>
                <p className="text-xs text-muted-foreground">@{p.username} · {p.college}</p>
              </div>
              <Badge variant={p.role === 'admin' ? 'default' : 'secondary'}>{p.role}</Badge>
              <span className="text-xs text-muted-foreground hidden sm:block">{formatNumber(p.uploads_count)} uploads</span>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="bulletins" className="mt-4 space-y-2">
          {bulletins.map((b) => (
            <Card key={b.id} className="rounded-2xl p-4 flex items-center gap-3">
              <Megaphone className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.profiles?.full_name ?? 'Unknown'} · {timeAgo(b.created_at)}</p>
              </div>
              <Button size="sm" variant="ghost" className="rounded-lg" aria-label="Delete" onClick={() => { supabase.from('bulletins').delete().eq('id', b.id); toast.success('Removed'); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="placements" className="mt-4 space-y-2">
          {placements.map((p) => (
            <Card key={p.id} className="rounded-2xl p-4 flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{p.company} — {p.role}</p>
                <p className="text-xs text-muted-foreground">{p.profiles?.full_name ?? 'Unknown'} · {timeAgo(p.created_at)}</p>
              </div>
              <Button size="sm" variant="ghost" className="rounded-lg" aria-label="Delete" onClick={() => { supabase.from('placement_posts').delete().eq('id', p.id); toast.success('Removed'); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reports" className="mt-4 space-y-2">
          {reports.length === 0 ? (
            <Card className="rounded-2xl p-8 text-center"><Flag className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mt-2 text-sm text-muted-foreground">No reports. Everything looks clean.</p></Card>
          ) : reports.map((r) => (
            <Card key={r.id} className="rounded-2xl p-4 flex items-center gap-3">
              <Flag className="h-5 w-5 text-amber-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{r.target_type} · {r.reason}</p>
                <p className="text-xs text-muted-foreground">Reported by {r.reporter?.full_name ?? 'Unknown'} · {timeAgo(r.created_at)}</p>
              </div>
              <Badge variant="secondary">{r.status}</Badge>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
