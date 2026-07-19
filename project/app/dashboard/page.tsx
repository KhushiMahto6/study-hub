import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { DashboardView } from '@/components/dashboard-view';
import { getProfileById, getResourcesByUser, getBoardsByUser } from '@/lib/queries';
import { supabaseServer } from '@/lib/supabase/client';

export const metadata = { title: 'Dashboard — StudyHub' };

export default async function DashboardPage() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/sign-in');

  const profile = await getProfileById(user.id);
  if (!profile) redirect('/auth/sign-up');

  const [uploads, boards] = await Promise.all([
    getResourcesByUser(user.id, 6),
    getBoardsByUser(user.id),
  ]);

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('resource_id, resources!bookmarks_resource_id_fkey(*, profiles!resources_user_id_fkey(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(6);

  return (
    <AppShell>
      <DashboardView profile={profile} uploads={uploads} boards={boards} bookmarks={(bookmarks ?? []) as any} />
    </AppShell>
  );
}
