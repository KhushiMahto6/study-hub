import Link from 'next/link';
import { GraduationCap, Github, Twitter, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/60 mt-20 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="font-display text-lg font-bold">Study<span className="gradient-text">Hub</span></span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              The community where college students share notes, PYQs, lab files, and placement intel.
            </p>
            <div className="mt-4 flex gap-2">
              {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                <a key={i} href="#" className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-muted transition-colors" aria-label="social link">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: 'Explore', links: [['Resources', '/resources'], ['Boards', '/boards'], ['Bulletin', '/bulletin'], ['Placements', '/placements']] },
            { title: 'Account', links: [['Sign in', '/auth/sign-in'], ['Sign up', '/auth/sign-up'], ['Dashboard', '/dashboard'], ['Upload', '/upload']] },
            { title: 'Company', links: [['About', '#'], ['Privacy', '#'], ['Terms', '#'], ['Contact', '#']] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} StudyHub. Built for students, by students.</p>
          <p className="text-xs text-muted-foreground">Made with care across India.</p>
        </div>
      </div>
    </footer>
  );
}
