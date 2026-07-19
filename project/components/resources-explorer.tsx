'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X, FileX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ResourceCard, ResourceCardSkeleton } from '@/components/resource-card';
import { supabase } from '@/lib/supabase/client';
import { DEPARTMENTS, SEMESTERS, SUBJECTS } from '@/lib/helpers';
import type { Resource, Profile } from '@/lib/types';

const SORTS = [
  { value: 'latest', label: 'Newest' },
  { value: 'downloads', label: 'Most Downloaded' },
  { value: 'likes', label: 'Most Liked' },
  { value: 'views', label: 'Most Viewed' },
];

const PAGE_SIZE = 12;

export function ResourcesExplorer() {
  const params = useSearchParams();
  const router = useRouter();
  const [resources, setResources] = useState<(Resource & { profiles?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const q = params.get('q') ?? '';
  const sort = params.get('sort') ?? 'latest';
  const subject = params.get('subject') ?? 'all';
  const department = params.get('department') ?? 'all';
  const semester = params.get('semester') ?? 'all';
  const fileType = params.get('type') ?? 'all';

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === 'all' || !value) next.delete(key);
    else next.set(key, value);
    router.push(`/resources?${next.toString()}`);
  };

  const fetchPage = useCallback(async (pageNum: number, replace = false) => {
    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);

    let query = supabase
      .from('resources')
      .select('*, profiles!resources_user_id_fkey(*)')
      .eq('status', 'published');

    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,subject.ilike.%${q}%,tags.cs.{${q}}`);
    }
    if (subject !== 'all') query = query.eq('subject', subject);
    if (department !== 'all') query = query.eq('department', department);
    if (semester !== 'all') query = query.eq('semester', Number(semester));
    if (fileType !== 'all') query = query.eq('file_type', fileType);

    if (sort === 'downloads') query = query.order('downloads_count', { ascending: false });
    else if (sort === 'likes') query = query.order('likes_count', { ascending: false });
    else if (sort === 'views') query = query.order('views_count', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    query = query.range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    const { data } = await query;
    const rows = (data ?? []) as (Resource & { profiles?: Profile })[];

    setHasMore(rows.length === PAGE_SIZE);
    if (replace || pageNum === 0) setResources(rows);
    else setResources((prev) => [...prev, ...rows]);
    setLoading(false);
    setLoadingMore(false);
  }, [q, sort, subject, department, semester, fileType]);

  useEffect(() => {
    setPage(0);
    fetchPage(0, true);
  }, [fetchPage]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPage(next);
  };

  const hasFilters = q || subject !== 'all' || department !== 'all' || semester !== 'all' || fileType !== 'all';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Explore resources</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse notes, PYQs, lab files, and projects from students across India.</p>
      </div>

      {/* Search + sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => updateParam('q', e.target.value)}
            placeholder="Search by title, subject, tag…"
            className="pl-9 rounded-xl"
          />
        </div>
        <Select value={sort} onValueChange={(v) => updateParam('sort', v)}>
          <SelectTrigger className="sm:w-48 rounded-xl"><SlidersHorizontal className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={subject} onValueChange={(v) => updateParam('subject', v)}>
          <SelectTrigger className="w-44 rounded-xl h-9 text-xs"><SelectValue placeholder="Subject" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={department} onValueChange={(v) => updateParam('department', v)}>
          <SelectTrigger className="w-40 rounded-xl h-9 text-xs"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={semester} onValueChange={(v) => updateParam('semester', v)}>
          <SelectTrigger className="w-32 rounded-xl h-9 text-xs"><SelectValue placeholder="Semester" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sems</SelectItem>
            {SEMESTERS.map((s) => <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={fileType} onValueChange={(v) => updateParam('type', v)}>
          <SelectTrigger className="w-32 rounded-xl h-9 text-xs"><SelectValue placeholder="File type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {['pdf', 'docx', 'zip', 'ppt', 'image'].map((t) => <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>)}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-9 rounded-xl gap-1" onClick={() => router.push('/resources')}>
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {q && <Badge variant="secondary" className="gap-1">Search: "{q}"</Badge>}
          {subject !== 'all' && <Badge variant="secondary">{subject}</Badge>}
          {department !== 'all' && <Badge variant="secondary">{department}</Badge>}
          {semester !== 'all' && <Badge variant="secondary">Sem {semester}</Badge>}
          {fileType !== 'all' && <Badge variant="secondary">{fileType.toUpperCase()}</Badge>}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ResourceCardSkeleton key={i} />)}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-20">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-muted">
            <FileX className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="mt-4 font-semibold">No resources found</h3>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {resources.map((r, i) => (
              <ResourceCard key={r.id} resource={r} profile={r.profiles} index={i} />
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="rounded-xl gap-2">
                {loadingMore ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
