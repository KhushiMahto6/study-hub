'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight } from 'lucide-react';

export function HomeSearch() {
  const [q, setQ] = useState('');
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/resources?q=${encodeURIComponent(query)}` : '/resources');
  };

  return (
    <form onSubmit={submit} className="relative">
      <div className="glass-card flex items-center gap-2 rounded-full p-1.5 pl-5 shadow-xl shadow-primary/5 focus-within:ring-2 focus-within:ring-ring">
        <Search className="h-5 w-5 text-muted-foreground shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search notes, subjects, tags, colleges…"
          className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground"
          aria-label="Search resources"
        />
        <button
          type="submit"
          className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          aria-label="Search"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
