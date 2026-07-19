import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { NotificationsView } from '@/components/notifications-view';
import { getProfileById } from '@/lib/queries';
import { supabaseServer } from '@/lib/supabase/client';

export const metadata = { title: 'Notifications — StudyHub' };

export default async function NotificationsPage() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/sign-in');
  const profile = await getProfileById(user.id);
  if (!profile) redirect('/auth/sign-up');

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*, actor:profiles!notifications_actor_id_fkey(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <AppShell>
      <NotificationsView notifications={(notifications ?? []) as any} />
    </AppShell>
  );
}
