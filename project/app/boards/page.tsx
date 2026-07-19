import { AppShell } from '@/components/app-shell';
import { BoardsExplorer } from '@/components/boards-explorer';
import { getBoards } from '@/lib/queries';

export const metadata = { title: 'Boards — StudyHub' };

export default async function BoardsPage() {
  const boards = await getBoards(24);
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <BoardsExplorer initialBoards={boards} />
      </div>
    </AppShell>
  );
}
