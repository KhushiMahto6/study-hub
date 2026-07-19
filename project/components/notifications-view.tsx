'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Bell, Heart, Bookmark, MessageSquare, Reply, Download, UserPlus,
  CheckCheck, Trash2, Inbox,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { timeAgo } from '@/lib/helpers';
import type { Notification, Profile } from '@/lib/types';
import { cn } from '@/lib/utils';

const ICONS: Record<string, any> = {
  like: Heart, bookmark: Bookmark, comment: MessageSquare, reply: Reply,
  download: Download, follow: UserPlus, bulletin: Bell, placement: Bell, report: Bell, system: Bell,
};

const COLORS: Record<string, string> = {
  like: 'text-rose-500 bg-rose-500/10',
  bookmark: 'text-amber-500 bg-amber-500/10',
  comment: 'text-blue-500 bg-blue-500/10',
  reply: 'text-blue-500 bg-blue-500/10',
  download: 'text-green-500 bg-green-500/10',
  follow: 'text-violet-500 bg-violet-500/10',
};

type Props = { notifications: (Notification & { actor?: Profile })[] };

export function NotificationsView({ notifications }: Props) {
  const { user } = useAuth();
  const [items, setItems] = useState(notifications);

  const markAll = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    setItems((n) => n.map((x) => ({ ...x, read: true })));
    toast.success('All marked as read');
  };

  const remove = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setItems((n) => n.filter((x) => x.id !== id));
  };

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">{unread > 0 ? `${unread} unread` : 'You\'re all caught up'}</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAll} className="rounded-xl gap-2"><CheckCheck className="h-4 w-4" /> Mark all read</Button>
        )}
      </div>

      {items.length === 0 ? (
        <Card className="rounded-2xl p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-medium">No notifications yet</p>
          <p className="text-sm text-muted-foreground mt-1">When someone likes, bookmarks, or comments on your resources, you'll see it here.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const Icon = ICONS[n.type] ?? Bell;
            return (
              <Card key={n.id} className={cn('rounded-2xl p-4 flex items-start gap-3', !n.read && 'bg-primary/[0.03] ring-1 ring-primary/20')}>
                <div className={cn('grid h-9 w-9 place-items-center rounded-full shrink-0', COLORS[n.type] ?? 'bg-muted text-muted-foreground')}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {n.actor && (
                      <Link href={`/profile/${n.actor.username}`}>
                        <Avatar className="h-5 w-5 border border-border">
                          <AvatarImage src={n.actor.avatar_url ?? undefined} />
                          <AvatarFallback className="text-[9px] bg-gradient-to-br from-primary to-accent text-white">{n.actor.full_name[0]}</AvatarFallback>
                        </Avatar>
                      </Link>
                    )}
                    <p className="text-sm">{n.message}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(n.created_at)}</p>
                </div>
                <button onClick={() => remove(n.id)} className="text-muted-foreground hover:text-destructive" aria-label="Dismiss"><Trash2 className="h-3.5 w-3.5" /></button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
