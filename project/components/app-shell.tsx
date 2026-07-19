import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { FloatingActionButton } from '@/components/fab';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingActionButton />
    </div>
  );
}
