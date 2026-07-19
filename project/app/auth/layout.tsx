import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary via-accent to-primary text-white overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <Link href="/" className="relative flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="font-display text-xl font-bold">StudyHub</span>
        </Link>
        <div className="relative space-y-6">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Join 48,000+ students sharing resources that actually matter.
          </h2>
          <p className="text-white/90 text-lg max-w-md">
            Notes, PYQs, lab files, projects, placement intel — all in one place, organized by semester and subject.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-md">
            {[['13.2k', 'Resources'], ['48k+', 'Students'], ['1.2M', 'Downloads']].map(([v, l]) => (
              <div key={l} className="rounded-xl bg-white/10 backdrop-blur p-3 text-center">
                <div className="text-2xl font-bold">{v}</div>
                <div className="text-xs text-white/80">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-sm text-white/70">© {new Date().getFullYear()} StudyHub</p>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
