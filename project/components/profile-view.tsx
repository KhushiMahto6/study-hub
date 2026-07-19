'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Star, MapPin, GraduationCap, Github, Linkedin, Globe, Calendar,
  Upload, Heart, Download, Bookmark, Users, Pencil, Loader2, UserPlus, UserCheck,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ResourceCard } from '@/components/resource-card';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { DEPARTMENTS, SEMESTERS, formatNumber, formatDate } from '@/lib/helpers';
import type { Profile, Resource, Board } from '@/lib/types';

const BOARD_COLORS: Record<string, string> = {
  blue: 'from-blue-500 to-cyan-500', green: 'from-green-500 to-emerald-500',
  orange: 'from-orange-500 to-amber-500', purple: 'from-violet-500 to-purple-500',
  rose: 'from-rose-500 to-pink-500', teal: 'from-teal-500 to-cyan-500',
};

type Props = { profile: Profile; uploads: Resource[]; boards: Board[] };

export function ProfileView({ profile, uploads, boards }: Props) {
  const { user, profile: me, refreshProfile } = useAuth();
  const isMe = user?.id === profile.id;
  const [following, setFollowing] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile.full_name, username: profile.username, bio: profile.bio,
    college: profile.college, department: profile.department, semester: profile.semester?.toString() ?? '',
    github_url: profile.github_url ?? '', linkedin_url: profile.linkedin_url ?? '', website_url: profile.website_url ?? '',
    avatar_url: profile.avatar_url ?? '',
  });

  const follow = async () => {
    if (!user) { toast.error('Sign in to follow.'); return; }
    setFollowing(!following);
    if (!following) {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: profile.id });
      await supabase.from('notifications').insert({ user_id: profile.id, actor_id: user.id, type: 'follow', message: `${me?.full_name ?? 'Someone'} started following you` });
      toast.success(`Following ${profile.full_name}`);
    } else {
      await supabase.from('follows').delete().match({ follower_id: user.id, following_id: profile.id });
      toast.success('Unfollowed');
    }
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name, username: form.username, bio: form.bio,
      college: form.college, department: form.department,
      semester: form.semester ? Number(form.semester) : null,
      github_url: form.github_url || null, linkedin_url: form.linkedin_url || null, website_url: form.website_url || null,
    }).eq('id', profile.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Profile updated');
    setEditOpen(false);
    await refreshProfile();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <Card className="relative overflow-hidden rounded-2xl p-0">
        <div className="h-32 bg-gradient-to-br from-primary via-accent to-primary">
          <div className="absolute inset-0 grid-pattern opacity-20" />
        </div>
        <div className="px-5 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <Avatar className="h-24 w-24 border-4 border-background rounded-2xl">
              <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-2xl font-bold rounded-2xl">
                {profile.full_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 sm:pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl font-bold">{profile.full_name}</h1>
                {profile.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    <Star className="h-3 w-3 fill-primary" /> Verified
                  </span>
                )}
                {profile.role === 'admin' && <Badge variant="secondary">Admin</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
            </div>
            <div className="flex gap-2 sm:pb-1">
              {isMe ? (
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="rounded-xl gap-2"><Pencil className="h-4 w-4" /> Edit profile</Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Edit profile</DialogTitle><DialogDescription>Update your public profile.</DialogDescription></DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5"><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="rounded-xl" /></div>
                        <div className="space-y-1.5"><Label>Username</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="rounded-xl" /></div>
                      </div>
                      <div className="space-y-1.5"><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="rounded-xl" /></div>
                      <div className="space-y-1.5"><Label>College</Label><Input value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} className="rounded-xl" /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label>Department</Label>
                          <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                            <SelectTrigger className="rounded-xl"><SelectValue placeholder="Department" /></SelectTrigger>
                            <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>Semester</Label>
                          <Select value={form.semester} onValueChange={(v) => setForm({ ...form, semester: v })}>
                            <SelectTrigger className="rounded-xl"><SelectValue placeholder="Semester" /></SelectTrigger>
                            <SelectContent>{SEMESTERS.map((s) => <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-1.5"><Label>GitHub URL</Label><Input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} className="rounded-xl" placeholder="https://github.com/…" /></div>
                        <div className="space-y-1.5"><Label>LinkedIn URL</Label><Input value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} className="rounded-xl" placeholder="https://linkedin.com/in/…" /></div>
                        <div className="space-y-1.5"><Label>Website</Label><Input value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} className="rounded-xl" placeholder="https://…" /></div>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild><Button variant="outline" className="rounded-xl">Cancel</Button></DialogClose>
                      <Button onClick={save} disabled={saving} className="rounded-xl gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button onClick={follow} variant={following ? 'outline' : 'default'} className="rounded-xl gap-2">
                  {following ? <><UserCheck className="h-4 w-4" /> Following</> : <><UserPlus className="h-4 w-4" /> Follow</>}
                </Button>
              )}
            </div>
          </div>

          {profile.bio && <p className="mt-4 text-sm text-muted-foreground max-w-2xl">{profile.bio}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {profile.college && <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4" /> {profile.college}</span>}
            {profile.department && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {profile.department}</span>}
            {profile.semester && <Badge variant="outline">Sem {profile.semester}</Badge>}
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Joined {formatDate(profile.created_at)}</span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {profile.github_url && <a href={profile.github_url} target="_blank" rel="noreferrer" className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-muted"><Github className="h-4 w-4" /></a>}
            {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-muted"><Linkedin className="h-4 w-4" /></a>}
            {profile.website_url && <a href={profile.website_url} target="_blank" rel="noreferrer" className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-muted"><Globe className="h-4 w-4" /></a>}
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Upload, label: 'Uploads', value: profile.uploads_count },
          { icon: Heart, label: 'Likes received', value: profile.likes_received },
          { icon: Download, label: 'Downloads', value: profile.downloads_count },
          { icon: Users, label: 'Followers', value: profile.followers_count },
        ].map((s) => (
          <Card key={s.label} className="rounded-2xl p-4 text-center">
            <s.icon className="mx-auto h-5 w-5 text-primary mb-2" />
            <div className="text-2xl font-bold font-display">{formatNumber(s.value)}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="uploads">
        <TabsList className="rounded-xl">
          <TabsTrigger value="uploads">Uploads ({uploads.length})</TabsTrigger>
          <TabsTrigger value="boards">Boards ({boards.length})</TabsTrigger>
          <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
        </TabsList>
        <TabsContent value="uploads" className="mt-4">
          {uploads.length === 0 ? (
            <EmptyState label="No uploads yet" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploads.map((r, i) => <ResourceCard key={r.id} resource={r} profile={profile} index={i} />)}
            </div>
          )}
        </TabsContent>
        <TabsContent value="boards" className="mt-4">
          {boards.length === 0 ? <EmptyState label="No boards yet" /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {boards.map((b) => (
                <Card key={b.id} className="rounded-2xl overflow-hidden p-0 hover:shadow-lg transition-all">
                  <a href={`/boards/${b.id}`}>
                    <div className={`h-20 bg-gradient-to-br ${BOARD_COLORS[b.cover_color] ?? BOARD_COLORS.blue}`} />
                  </a>
                  <div className="p-4">
                    <h3 className="font-semibold">{b.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{b.description || 'No description'}</p>
                    <Badge variant="secondary" className="mt-2">{b.resources_count} resources</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="bookmarks" className="mt-4">
          <EmptyState label="Sign in to view your bookmarks" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-muted">
        <Bookmark className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
