import Link from 'next/link';
import { Home, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white">
          <Compass className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">This page wandered off the syllabus. Let's get you back.</p>
        <Button asChild className="mt-6 rounded-xl gap-2"><Link href="/"><Home className="h-4 w-4" /> Back home</Link></Button>
      </div>
    </div>
  );
}
