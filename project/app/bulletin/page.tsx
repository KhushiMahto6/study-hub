import { AppShell } from '@/components/app-shell';
import { BulletinFeed } from '@/components/bulletin-feed';
import { getBulletins } from '@/lib/queries';

export const metadata = { title: 'Bulletin — StudyHub' };

export default async function BulletinPage() {
  const bulletins = await getBulletins(30);
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <BulletinFeed initialBulletins={bulletins} />
      </div>
    </AppShell>
  );
}
