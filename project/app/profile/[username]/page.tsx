import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { ProfileView } from '@/components/profile-view';
import { getProfileByUsername, getResourcesByUser, getBoardsByUser } from '@/lib/queries';

export async function generateMetadata({ params }: { params: { username: string } }) {
  const profile = await getProfileByUsername(params.username);
  if (!profile) return { title: 'Profile — StudyHub' };
  return { title: `${profile.full_name} (@${profile.username}) — StudyHub`, description: profile.bio };
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const profile = await getProfileByUsername(params.username);
  if (!profile) notFound();
  const [uploads, boards] = await Promise.all([
    getResourcesByUser(profile.id, 50),
    getBoardsByUser(profile.id),
  ]);
  return (
    <AppShell>
      <ProfileView profile={profile} uploads={uploads} boards={boards} />
    </AppShell>
  );
}
