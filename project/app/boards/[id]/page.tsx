import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { BoardDetail } from '@/components/board-detail';
import { supabaseServer } from '@/lib/supabase/client';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data } = await supabase.from('boards').select('name, description').eq('id', params.id).maybeSingle();
  if (!data) return { title: 'Board — StudyHub' };
  return { title: `${data.name} — StudyHub`, description: data.description };
}

export default async function BoardPage({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data: board } = await supabase
    .from('boards')
    .select('*, profiles!boards_user_id_fkey(*)')
    .eq('id', params.id)
    .maybeSingle();
  if (!board) notFound();

  const { data: items } = await supabase
    .from('board_resources')
    .select('*, resources!board_resources_resource_id_fkey(*, profiles!resources_user_id_fkey(*))')
    .eq('board_id', params.id)
    .order('created_at', { ascending: false });

  return (
    <AppShell>
      <BoardDetail board={board as any} items={(items ?? []) as any} />
    </AppShell>
  );
}
