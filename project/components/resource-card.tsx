'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Download, Heart, Bookmark, Eye, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FILE_TYPE_META, formatNumber, timeAgo } from '@/lib/helpers';
import type { Resource, Profile } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = {
  resource: Resource;
  profile?: Profile | null;
  index?: number;
};

export function ResourceCard({ resource, profile, index = 0 }: Props) {
  const meta = FILE_TYPE_META[resource.file_type] ?? FILE_TYPE_META.other;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      whileHover={{ y: -4 }}
    >
      <Card className="group overflow-hidden rounded-2xl border-border/60 p-0 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300">
        <Link href={`/resources/${resource.id}`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            {resource.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resource.thumbnail_url}
                alt={resource.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="grid h-full place-items-center bg-gradient-to-br from-primary/10 to-accent/10">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            <div className="absolute top-2 left-2">
              <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', meta.color)}>
                {meta.label}
              </span>
            </div>
            <div className="absolute top-2 right-2">
              <span className="rounded-md bg-background/80 backdrop-blur px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                Sem {resource.semester ?? '—'}
              </span>
            </div>
          </div>
        </Link>

        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/resources/${resource.id}`} className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {resource.title}
              </h3>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 rounded-full" aria-label="More options">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild><Link href={`/resources/${resource.id}`}>View details</Link></DropdownMenuItem>
                <DropdownMenuItem>Save to board</DropdownMenuItem>
                <DropdownMenuItem>Share</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-[10px] font-medium">{resource.subject}</Badge>
            {resource.tags.slice(0, 1).map((t) => (
              <Badge key={t} variant="outline" className="text-[10px] font-medium">#{t}</Badge>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Link href={`/profile/${profile?.username ?? resource.user_id}`} className="flex items-center gap-1.5 min-w-0">
              <Avatar className="h-5 w-5 border border-border">
                <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? ''} />
                <AvatarFallback className="text-[9px] bg-gradient-to-br from-primary to-accent text-white">
                  {profile?.full_name?.[0] ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate">{profile?.full_name ?? 'Student'}</span>
            </Link>
            <span className="text-xs text-muted-foreground ml-auto">{timeAgo(resource.created_at)}</span>
          </div>

          <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {formatNumber(resource.views_count)}</span>
            <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {formatNumber(resource.downloads_count)}</span>
            <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {formatNumber(resource.likes_count)}</span>
            <span className="flex items-center gap-1 ml-auto"><Bookmark className="h-3 w-3" /> {formatNumber(resource.bookmarks_count)}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function ResourceCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl border-border/60 p-0">
      <div className="aspect-[4/3] bg-muted animate-pulse" />
      <div className="p-3.5 space-y-2">
        <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
        <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
        <div className="h-px bg-border/50 my-3" />
        <div className="flex gap-3">
          <div className="h-3 w-10 rounded bg-muted animate-pulse" />
          <div className="h-3 w-10 rounded bg-muted animate-pulse" />
          <div className="h-3 w-10 rounded bg-muted animate-pulse" />
        </div>
      </div>
    </Card>
  );
}
