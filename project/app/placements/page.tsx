import { AppShell } from '@/components/app-shell';
import { PlacementsFeed } from '@/components/placements-feed';
import { getPlacementPosts } from '@/lib/queries';

export const metadata = { title: 'Placements — StudyHub' };

export default async function PlacementsPage() {
  const posts = await getPlacementPosts(30);
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <PlacementsFeed initialPosts={posts} />
      </div>
    </AppShell>
  );
}
