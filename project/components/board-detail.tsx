'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, Plus, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ResourceCard } from '@/components/resource-card';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { Board, Profile, Resource, BoardResource } from '@/lib/types';

type Props = {
  board: Board & { profiles?: Profile };
  items: (BoardResource & { resources?: Resource & { profiles?: Profile } })[];
};

const COLORS: Record<string, string> = {
  blue: 'from-blue-500 to-cyan-500',
  green: 'from-green-500 to-emerald-500',
  orange: 'from-orange-500 to-amber-500',
  purple: 'from-violet-500 to-purple-500',
  rose: 'from-rose-500 to-pink-500',
  teal: 'from-teal-500 to-cyan-500',
};

export function BoardDetail({ board, items }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const isOwner = user?.id === board.user_id;

  const removeItem = async (itemId: string, resourceId: string) => {
    await supabase.from('board_resources').delete().eq('id', itemId);
    await supabase.from('boards').update({ resources_count: Math.max(0, board.resources_count - 1) }).eq('id', board.id);
    toast.success('Removed from board');
    router.refresh();
  };

  const deleteBoard = async () => {
    await supabase.from('boards').delete().eq('id', board.id);
    toast.success('Board deleted');
    router.push('/boards');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1">
        <Link href="/boards"><ArrowLeft className="h-4 w-4" /> Back to boards</Link>
      </Button>

      <Card className="overflow-hidden rounded-2xl p-0">
        <div className={cn('relative h-32 bg-gradient-to-br', COLORS[board.cover_color] ?? COLORS.blue)}>
          <div className="absolute inset-0 grid-pattern opacity-20" />
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold">{board.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">{board.description || 'No description'}</p>
            </div>
            {isOwner && (
              <Button variant="outline" size="sm" onClick={deleteBoard} className="rounded-xl gap-1.5 text-destructive">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            )}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Link href={`/profile/${board.profiles?.username ?? board.user_id}`} className="flex items-center gap-2">
              <Avatar className="h-7 w-7 border border-border">
                <AvatarImage src={board.profiles?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-[10px]">{board.profiles?.full_name?.[0] ?? 'U'}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{board.profiles?.full_name ?? 'Student'}</span>
            </Link>
            <Badge variant="secondary" className="ml-auto">{items.length} resources</Badge>
          </div>
        </div>
      </Card>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-muted">
            <BookMarked className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="mt-4 font-semibold">This board is empty</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isOwner ? 'Browse resources and save them to this board.' : 'The owner hasn\'t added anything yet.'}
          </p>
          {isOwner && (
            <Button asChild className="mt-4 rounded-xl gap-2"><Link href="/resources"><Plus className="h-4 w-4" /> Browse resources</Link></Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((it, i) => (
            <div key={it.id} className="relative group">
              <ResourceCard resource={it.resources!} profile={it.resources?.profiles} index={i} />
              {isOwner && (
                <button
                  onClick={() => removeItem(it.id, it.resource_id)}
                  className="absolute top-2 right-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-background/90 backdrop-blur shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white"
                  aria-label="Remove from board"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
