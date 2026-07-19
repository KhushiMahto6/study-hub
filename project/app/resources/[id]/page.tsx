import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { ResourceDetail } from '@/components/resource-detail';
import { getResourceById, getRelatedResources, getCommentsForResource } from '@/lib/queries';
import { supabaseServer } from '@/lib/supabase/client';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const resource = await getResourceById(params.id);
  if (!resource) return { title: 'Resource not found — StudyHub' };
  return {
    title: `${resource.title} — StudyHub`,
    description: resource.description,
    openGraph: { title: resource.title, description: resource.description, type: 'article' },
  };
}

export default async function ResourcePage({ params }: { params: { id: string } }) {
  const resource = await getResourceById(params.id);
  if (!resource) notFound();

  // increment view count (best-effort, server-side)
  try {
    const supabase = supabaseServer();
    await supabase.from('resources').update({ views_count: resource.views_count + 1 }).eq('id', resource.id);
  } catch {}

  const [related, comments] = await Promise.all([
    getRelatedResources(resource, 4),
    getCommentsForResource(resource.id),
  ]);

  return (
    <AppShell>
      <ResourceDetail resource={resource} related={related} comments={comments} />
    </AppShell>
  );
}
