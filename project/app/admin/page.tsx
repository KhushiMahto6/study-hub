import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { AdminPanel } from '@/components/admin-panel';
import { getProfileById } from '@/lib/queries';
import { supabaseServer } from '@/lib/supabase/client';

export const metadata = { title: 'Admin — StudyHub' };

export default async function AdminPage() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/sign-in');
  const profile = await getProfileById(user.id);
  if (!profile || profile.role !== 'admin') redirect('/dashboard');

  const [resources, bulletins, placements, reports, profiles] = await Promise.all([
    supabase.from('resources').select('*, profiles!resources_user_id_fkey(*)').order('created_at', { ascending: false }).limit(50),
    supabase.from('bulletins').select('*, profiles!bulletins_user_id_fkey(*)').order('created_at', { ascending: false }).limit(30),
    supabase.from('placement_posts').select('*, profiles!placement_posts_user_id_fkey(*)').order('created_at', { ascending: false }).limit(30),
    supabase.from('reports').select('*, reporter:profiles!reports_reporter_id_fkey(*)').order('created_at', { ascending: false }).limit(30),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50),
  ]);

  return (
    <AppShell>
      <AdminPanel
        resources={(resources.data ?? []) as any}
        bulletins={(bulletins.data ?? []) as any}
        placements={(placements.data ?? []) as any}
        reports={(reports.data ?? []) as any}
        profiles={(profiles.data ?? []) as any}
      />
    </AppShell>
  );
}
