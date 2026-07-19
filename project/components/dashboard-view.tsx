'use client';

import Link from 'next/link';
import {
  Upload, Heart, Download, Bookmark, Users, TrendingUp, Clock, FileText,
  BookMarked, Activity, ArrowRight, Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ResourceCard } from '@/components/resource-card';
import { formatNumber, timeAgo } from '@/lib/helpers';
import type { Profile, Resource, Board } from '@/lib/types';

type Props = {
  profile: Profile;
  uploads: Resource[];
  boards: Board[];
  bookmarks: { resource_id: string; resources: Resource & { profiles?: Profile } }[];
};

const BOARD_COLORS: Record<string, string> = {
  blue: 'from-blue-500 to-cyan-500', green: 'from-green-500 to-emerald-500',
  orange: 'from-orange-500 to-amber-500', purple: 'from-violet-500 to-purple-500',
  rose: 'from-rose-500 to-pink-500', teal: 'from-teal-500 to-cyan-500',
};

export function DashboardView({ profile, uploads, boards, bookmarks }: Props) {
  const totalViews = uploads.reduce((s, r) => s + r.views_count, 0);
  const totalDownloads = uploads.reduce((s, r) => s + r.downloads_count, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold">Welcome back, {profile.full_name.split(' ')[0]}</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's what's happening across your StudyHub.</p>
        </div>
        <Button asChild className="rounded-xl gap-2"><Link href="/upload"><Upload className="h-4 w-4" /> Upload resource</Link></Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Upload, label: 'My uploads', value: profile.uploads_count, color: 'text-blue-500' },
          { icon: Heart, label: 'Likes received', value: profile.likes_received, color: 'text-rose-500' },
          { icon: Download, label: 'Downloads', value: totalDownloads || profile.downloads_count, color: 'text-green-500' },
          { icon: TrendingUp, label: 'Total views', value: totalViews, color: 'text-amber-500' },
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent uploads */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Recent uploads</h2>
            <Button asChild variant="ghost" size="sm" className="gap-1"><Link href={`/profile/${profile.username}`}>View all <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
          {uploads.length === 0 ? (
            <Card className="rounded-2xl p-8 text-center">
              <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 font-medium">No uploads yet</p>
              <p className="text-sm text-muted-foreground">Share your first resource with the community.</p>
              <Button asChild className="mt-4 rounded-xl gap-2"><Link href="/upload"><Upload className="h-4 w-4" /> Upload now</Link></Button>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {uploads.map((r, i) => <ResourceCard key={r.id} resource={r} profile={profile} index={i} />)}
            </div>
          )}

          {/* Bookmarks */}
          <div className="flex items-center justify-between pt-2">
            <h2 className="font-display text-xl font-bold flex items-center gap-2"><Bookmark className="h-5 w-5 text-primary" /> Recent bookmarks</h2>
          </div>
          {bookmarks.length === 0 ? (
            <Card className="rounded-2xl p-6 text-center">
              <Bookmark className="mx-auto h-7 w-7 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No bookmarks yet. Browse and save resources you find useful.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {bookmarks.map((b, i) => <ResourceCard key={b.resource_id} resource={b.resources} profile={b.resources?.profiles} index={i} />)}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="rounded-2xl p-5">
            <h2 className="font-semibold flex items-center gap-2 mb-3"><BookMarked className="h-4 w-4 text-primary" /> My boards</h2>
            {boards.length === 0 ? (
              <p className="text-sm text-muted-foreground">No boards yet. <Link href="/boards" className="text-primary hover:underline">Create one</Link>.</p>
            ) : (
              <div className="space-y-2">
                {boards.slice(0, 5).map((b) => (
                  <Link key={b.id} href={`/boards/${b.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                    <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${BOARD_COLORS[b.cover_color] ?? BOARD_COLORS.blue}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{b.resources_count} resources</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <Button asChild variant="outline" size="sm" className="w-full mt-3 rounded-xl"><Link href="/boards">All boards</Link></Button>
          </Card>

          <Card className="rounded-2xl p-5">
            <h2 className="font-semibold flex items-center gap-2 mb-3"><Activity className="h-4 w-4 text-primary" /> Activity</h2>
            <div className="space-y-3 text-sm">
              {[
                { icon: Sparkles, text: 'Welcome to StudyHub!', time: 'just now' },
                { icon: Upload, text: `${profile.uploads_count} resources uploaded`, time: 'this month' },
                { icon: Users, text: `${profile.followers_count} followers`, time: 'all time' },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-2">
                  <a.icon className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p>{a.text}</p>
                    <p className="text-xs text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-2xl p-5 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 border border-border">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">{profile.full_name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full mt-3 rounded-xl"><Link href={`/profile/${profile.username}`}>View profile</Link></Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
