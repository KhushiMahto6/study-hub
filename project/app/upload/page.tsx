import { AppShell } from '@/components/app-shell';
import { UploadForm } from '@/components/upload-form';

export const metadata = { title: 'Upload a resource — StudyHub' };

export default function UploadPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold">Upload a resource</h1>
          <p className="text-sm text-muted-foreground mt-1">Share your notes, assignments, PYQs, or projects with the community.</p>
        </div>
        <UploadForm />
      </div>
    </AppShell>
  );
}
