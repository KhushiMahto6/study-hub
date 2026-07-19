import Link from 'next/link';
import { Suspense } from 'react';
import { MotionDiv } from '@/components/motion';
import {
  Search, Sparkles, TrendingUp, Clock, Award, ArrowRight, FileText,
  ClipboardList, Archive, FlaskConical, Code2, Presentation, BookOpen, GraduationCap,
  Upload, Users, Download, Heart, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ResourceCard, ResourceCardSkeleton } from '@/components/resource-card';
import { AppShell } from '@/components/app-shell';
import {
  getFeaturedResources, getTrendingResources, getLatestResources, getTopContributors,
} from '@/lib/queries';
import { formatNumber } from '@/lib/helpers';
import { HomeSearch } from '@/components/home-search';

const CATEGORIES = [
  { label: 'Notes', icon: FileText, color: 'from-blue-500 to-cyan-500', count: '2.4k' },
  { label: 'Assignments', icon: ClipboardList, color: 'from-violet-500 to-purple-500', count: '1.1k' },
  { label: 'PYQs', icon: Archive, color: 'from-amber-500 to-orange-500', count: '3.8k' },
  { label: 'Lab Files', icon: FlaskConical, color: 'from-green-500 to-emerald-500', count: '920' },
  { label: 'Projects', icon: Code2, color: 'from-rose-500 to-pink-500', count: '640' },
  { label: 'Presentations', icon: Presentation, color: 'from-indigo-500 to-blue-500', count: '780' },
  { label: 'Resources', icon: BookOpen, color: 'from-teal-500 to-cyan-500', count: '1.5k' },
  { label: 'Study Material', icon: GraduationCap, color: 'from-fuchsia-500 to-pink-500', count: '2.1k' },
];

export default async function HomePage() {
  const [featured, trending, latest, contributors] = await Promise.all([
    getFeaturedResources(8),
    getTrendingResources(8),
    getLatestResources(4),
    getTopContributors(6),
  ]);

  return (
    <AppShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-[40rem] rounded-full bg-primary/20 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-16 text-center">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-5 gap-1.5 rounded-full px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium">Over 12,000 students sharing this week</span>
            </Badge>
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              Share. Discover. <br className="hidden sm:block" />
              <span className="gradient-text">Ace your semester.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              The community where college students upload notes, assignments, previous year questions,
              lab files, and projects — and discover what actually matters for exams and placements.
            </p>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-8 max-w-2xl"
          >
            <HomeSearch />
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-3"
          >
            <Button asChild size="lg" className="rounded-full gap-2 shadow-lg shadow-primary/30">
              <Link href="/upload"><Upload className="h-4 w-4" /> Upload a resource</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full gap-2">
              <Link href="/resources">Browse resources <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {[
              { icon: FileText, label: 'Resources', value: '13.2k' },
              { icon: Users, label: 'Students', value: '48k+' },
              { icon: Download, label: 'Downloads', value: '1.2M' },
              { icon: Heart, label: 'Likes', value: '320k' },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-2xl p-4">
                <s.icon className="mx-auto h-5 w-5 text-primary mb-2" />
                <div className="text-2xl font-bold font-display">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </MotionDiv>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold">Browse by category</h2>
            <p className="text-sm text-muted-foreground mt-1">Find exactly what you need, faster.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map((c, i) => (
            <MotionDiv
              key={c.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
            >
              <Link href={`/resources?type=${c.label.toLowerCase().replace(/\s/g, '-')}`}>
                <Card className="group h-full p-4 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-2xl">
                  <div className={`mx-auto grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${c.color} text-white shadow-md`}>
                    <c.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-2.5 text-sm font-semibold">{c.label}</p>
                  <p className="text-xs text-muted-foreground">{c.count}</p>
                </Card>
              </Link>
            </MotionDiv>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="font-display text-2xl font-bold">Featured resources</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Hand-picked by the community this week.</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1">
            <Link href="/resources?sort=featured">View all <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <Suspense fallback={<ResourceGridSkeleton />}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((r, i) => (
              <ResourceCard key={r.id} resource={r} profile={r.profiles} index={i} />
            ))}
          </div>
        </Suspense>
      </section>

      {/* Trending */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="font-display text-2xl font-bold">Trending now</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Most viewed resources in the last 7 days.</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1">
            <Link href="/resources?sort=trending">View all <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {trending.map((r, i) => (
            <ResourceCard key={r.id} resource={r} profile={r.profiles} index={i} />
          ))}
        </div>
      </section>

      {/* Latest + Top contributors */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl font-bold">Latest uploads</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
            {latest.map((r, i) => (
              <ResourceCard key={r.id} resource={r} profile={r.profiles} index={i} />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-6">
            <Award className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl font-bold">Top contributors</h2>
          </div>
          <Card className="rounded-2xl p-2">
            {contributors.map((c, i) => (
              <Link
                key={c.id}
                href={`/profile/${c.username}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarImage src={c.avatar_url ?? undefined} alt={c.full_name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                    {c.full_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium truncate">{c.full_name}</p>
                    {c.verified && <Star className="h-3 w-3 fill-primary text-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{c.college}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold">{formatNumber(c.likes_received)}</p>
                  <p className="text-[10px] text-muted-foreground">likes</p>
                </div>
              </Link>
            ))}
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-accent to-primary p-8 sm:p-12 text-center text-white shadow-2xl shadow-primary/30">
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <div className="relative">
            <h2 className="font-display text-3xl sm:text-4xl font-bold">Got notes worth sharing?</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/90">
              Upload your materials and help thousands of juniors. Earn likes, followers, and a verified contributor badge.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-6 rounded-full gap-2">
              <Link href="/auth/sign-up"><Upload className="h-4 w-4" /> Start uploading</Link>
            </Button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function ResourceGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => <ResourceCardSkeleton key={i} />)}
    </div>
  );
}
