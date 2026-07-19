import { Suspense } from 'react';
import { AppShell } from '@/components/app-shell';
import { ResourcesExplorer } from '@/components/resources-explorer';

export const metadata = { title: 'Resources — StudyHub' };

export default function ResourcesPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <Suspense fallback={<div className="text-muted-foreground">Loading resources…</div>}>
          <ResourcesExplorer />
        </Suspense>
      </div>
    </AppShell>
  );
}
