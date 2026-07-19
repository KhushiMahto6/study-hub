'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft, Download, Heart, Bookmark, Share2, Flag, Eye, Calendar,
  FileText, MessageSquare, Send, Loader2, Pencil, Trash2, Reply,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ResourceCard } from '@/components/resource-card';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { FILE_TYPE_META, formatNumber, formatDate, timeAgo } from '@/lib/helpers';
import type { Resource, Profile, Comment } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = {
  resource: Resource & { profiles?: Profile };
  related: (Resource & { profiles?: Profile })[];
  comments: (Comment & { profiles?: Profile })[];
};

export function ResourceDetail({ resource, related, comments: initialComments }: Props) {
  const { user, profile } = useAuth();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(resource.likes_count);
  const [bookmarkCount, setBookmarkCount] = useState(resource.bookmarks_count);
  const [comments, setComments] = useState(initialComments);
  const [commentBody, setCommentBody] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const meta = FILE_TYPE_META[resource.file_type] ?? FILE_TYPE_META.other;

  const requireAuth = () => {
    if (!user) {
      toast.error('Please sign in to do that.');
      return false;
    }
    return true;
  };

  const toggleLike = async () => {
    if (!requireAuth()) return;
    const uid = user!.id;
    if (liked) {
      setLiked(false);
      setLikeCount((c) => c - 1);
      await supabase.from('likes').delete().match({ user_id: uid, resource_id: resource.id });
      await supabase.from('resources').update({ likes_count: likeCount - 1 }).eq('id', resource.id);
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
      await supabase.from('likes').insert({ user_id: uid, resource_id: resource.id });
      await supabase.from('resources').update({ likes_count: likeCount + 1 }).eq('id', resource.id);
      await supabase.from('notifications').insert({
        user_id: resource.user_id, actor_id: uid, type: 'like', resource_id: resource.id,
        message: `${profile?.full_name ?? 'Someone'} liked your resource`,
      });
    }
  };

  const toggleBookmark = async () => {
    if (!requireAuth()) return;
    const uid = user!.id;
    if (bookmarked) {
      setBookmarked(false);
      setBookmarkCount((c) => c - 1);
      await supabase.from('bookmarks').delete().match({ user_id: uid, resource_id: resource.id });
      await supabase.from('resources').update({ bookmarks_count: bookmarkCount - 1 }).eq('id', resource.id);
    } else {
      setBookmarked(true);
      setBookmarkCount((c) => c + 1);
      await supabase.from('bookmarks').insert({ user_id: uid, resource_id: resource.id });
      await supabase.from('resources').update({ bookmarks_count: bookmarkCount + 1 }).eq('id', resource.id);
      toast.success('Bookmarked!');
    }
  };

  const download = async () => {
    if (!requireAuth()) return;
    const uid = user!.id;
    try {
      await supabase.from('downloads').insert({ user_id: uid, resource_id: resource.id });
      await supabase.from('resources').update({ downloads_count: resource.downloads_count + 1 }).eq('id', resource.id);
    } catch {}
    window.open(resource.file_url, '_blank');
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: resource.title, url });
      else { await navigator.clipboard.writeText(url); toast.success('Link copied!'); }
    } catch {}
  };

  const report = async () => {
    if (!requireAuth()) return;
    await supabase.from('reports').insert({ reporter_id: user!.id, target_type: 'resource', target_id: resource.id, reason: 'Reported by user' });
    toast.success('Report submitted. Our team will review it.');
  };

  const addComment = async () => {
    if (!requireAuth()) return;
    if (!commentBody.trim()) return;
    const uid = user!.id;
    setSubmitting(true);
    const { data } = await supabase
      .from('comments')
      .insert({ user_id: uid, resource_id: resource.id, body: commentBody.trim() })
      .select('*, profiles!comments_user_id_fkey(*)')
      .single();
    if (data) {
      setComments((c) => [...c, data as Comment & { profiles?: Profile }]);
      setCommentBody('');
      await supabase.from('resources').update({ comments_count: resource.comments_count + 1 }).eq('id', resource.id);
      await supabase.from('notifications').insert({
        user_id: resource.user_id, actor_id: uid, type: 'comment', resource_id: resource.id,
        message: `${profile?.full_name ?? 'Someone'} commented on your resource`,
      });
    }
    setSubmitting(false);
  };

  const addReply = async (parentId: string) => {
    if (!requireAuth()) return;
    if (!replyBody.trim()) return;
    const uid = user!.id;
    const { data } = await supabase
      .from('comments')
      .insert({ user_id: uid, resource_id: resource.id, parent_id: parentId, body: replyBody.trim() })
      .select('*, profiles!comments_user_id_fkey(*)')
      .single();
    if (data) {
      setComments((c) => [...c, data as Comment & { profiles?: Profile }]);
      setReplyBody('');
      setReplyingTo(null);
    }
  };

  const editComment = async (id: string) => {
    if (!editBody.trim()) return;
    await supabase.from('comments').update({ body: editBody.trim() }).eq('id', id);
    setComments((c) => c.map((cm) => cm.id === id ? { ...cm, body: editBody.trim() } : cm));
    setEditingId(null);
    setEditBody('');
  };

  const deleteComment = async (id: string) => {
    await supabase.from('comments').delete().eq('id', id);
    setComments((c) => c.filter((cm) => cm.id !== id));
    toast.success('Comment deleted');
  };

  const topLevel = comments.filter((c) => !c.parent_id);
  const repliesFor = (id: string) => comments.filter((c) => c.parent_id === id);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-4 gap-1">
        <Link href="/resources"><ArrowLeft className="h-4 w-4" /> Back to resources</Link>
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden rounded-2xl p-0">
            <div className="relative aspect-[16/9] bg-muted">
              {resource.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resource.thumbnail_url} alt={resource.title} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center bg-gradient-to-br from-primary/10 to-accent/10">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className={cn('rounded-md px-2.5 py-1 text-xs font-bold uppercase', meta.color)}>{meta.label}</span>
              </div>
            </div>

            <div className="p-5">
              <div className="flex flex-wrap gap-1.5 mb-3">
                <Badge variant="secondary">{resource.subject}</Badge>
                {resource.semester && <Badge variant="outline">Sem {resource.semester}</Badge>}
                <Badge variant="outline">{resource.department}</Badge>
                {resource.course && <Badge variant="outline">{resource.course}</Badge>}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight">{resource.title}</h1>
              <p className="mt-3 text-muted-foreground leading-relaxed">{resource.description}</p>

              {resource.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {resource.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">#{t}</Badge>
                  ))}
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> {formatNumber(resource.views_count)} views</span>
                <span className="flex items-center gap-1.5"><Download className="h-4 w-4" /> {formatNumber(resource.downloads_count)}</span>
                <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" /> {formatNumber(likeCount)}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {formatDate(resource.created_at)}</span>
              </div>
            </div>
          </Card>

          {/* Comments */}
          <Card className="rounded-2xl p-5">
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-primary" /> Comments ({comments.length})
            </h2>

            <div className="flex gap-3 mb-6">
              <Avatar className="h-9 w-9 border border-border shrink-0">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                  {profile?.full_name?.[0] ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder={user ? 'Add a comment…' : 'Sign in to comment'}
                  disabled={!user}
                  className="rounded-xl min-h-[80px]"
                />
                {user && (
                  <div className="flex justify-end">
                    <Button size="sm" onClick={addComment} disabled={submitting || !commentBody.trim()} className="rounded-xl gap-1.5">
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Comment
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Separator />
            <div className="mt-4 space-y-5">
              {topLevel.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No comments yet. Be the first to start the discussion.</p>
              )}
              {topLevel.map((c) => (
                <div key={c.id} className="space-y-3">
                  <CommentItem
                    c={c}
                    currentUserId={user?.id}
                    editingId={editingId}
                    editBody={editBody}
                    setEditBody={setEditBody}
                    setEditingId={setEditingId}
                    editComment={editComment}
                    deleteComment={deleteComment}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                    replyBody={replyBody}
                    setReplyBody={setReplyBody}
                    addReply={addReply}
                  />
                  {repliesFor(c.id).map((r) => (
                    <div key={r.id} className="ml-10">
                      <CommentItem
                        c={r}
                        currentUserId={user?.id}
                        editingId={editingId}
                        editBody={editBody}
                        setEditBody={setEditBody}
                        setEditingId={setEditingId}
                        editComment={editComment}
                        deleteComment={deleteComment}
                        replyingTo={replyingTo}
                        setReplyingTo={setReplyingTo}
                        replyBody={replyBody}
                        setReplyBody={setReplyBody}
                        addReply={addReply}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="rounded-2xl p-5 sticky top-20">
            <div className="flex flex-col gap-2">
              <Button onClick={download} className="rounded-xl gap-2 w-full" size="lg">
                <Download className="h-4 w-4" /> Download
              </Button>
              <div className="grid grid-cols-3 gap-2">
                <Button onClick={toggleLike} variant={liked ? 'default' : 'outline'} className="rounded-xl gap-1.5">
                  <Heart className={cn('h-4 w-4', liked && 'fill-current')} /> {formatNumber(likeCount)}
                </Button>
                <Button onClick={toggleBookmark} variant={bookmarked ? 'default' : 'outline'} className="rounded-xl gap-1.5">
                  <Bookmark className={cn('h-4 w-4', bookmarked && 'fill-current')} /> {formatNumber(bookmarkCount)}
                </Button>
                <Button onClick={share} variant="outline" className="rounded-xl gap-1.5">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={report} variant="ghost" className="rounded-xl gap-1.5 text-destructive justify-start">
                <Flag className="h-4 w-4" /> Report resource
              </Button>
            </div>

            <Separator className="my-4" />

            <Link href={`/profile/${resource.profiles?.username ?? resource.user_id}`} className="flex items-center gap-3 group">
              <Avatar className="h-11 w-11 border border-border">
                <AvatarImage src={resource.profiles?.avatar_url ?? undefined} alt={resource.profiles?.full_name ?? ''} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                  {resource.profiles?.full_name?.[0] ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium group-hover:text-primary transition-colors flex items-center gap-1">
                  {resource.profiles?.full_name ?? 'Student'}
                  {resource.profiles?.verified && <span className="text-primary">✓</span>}
                </p>
                <p className="text-xs text-muted-foreground truncate">{resource.profiles?.college}</p>
              </div>
            </Link>
          </Card>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-xl font-bold mb-4">Related resources</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((r, i) => (
              <ResourceCard key={r.id} resource={r} profile={r.profiles} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CommentItem({
  c, currentUserId, editingId, editBody, setEditBody, setEditingId, editComment, deleteComment,
  replyingTo, setReplyingTo, replyBody, setReplyBody, addReply,
}: any) {
  const isEditing = editingId === c.id;
  const isReplying = replyingTo === c.id;
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 border border-border shrink-0">
        <AvatarImage src={c.profiles?.avatar_url ?? undefined} />
        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-[10px]">
          {c.profiles?.full_name?.[0] ?? 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link href={`/profile/${c.profiles?.username ?? c.user_id}`} className="text-sm font-medium hover:underline">
            {c.profiles?.full_name ?? 'Student'}
          </Link>
          <span className="text-xs text-muted-foreground">{timeAgo(c.created_at)}</span>
        </div>
        {isEditing ? (
          <div className="mt-1 space-y-2">
            <Textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} className="rounded-xl min-h-[60px]" />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => editComment(c.id)} className="rounded-xl">Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="rounded-xl">Cancel</Button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm leading-relaxed">{c.body}</p>
        )}

        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
          <button onClick={() => setReplyingTo(isReplying ? null : c.id)} className="hover:text-foreground flex items-center gap-1">
            <Reply className="h-3 w-3" /> Reply
          </button>
          {currentUserId === c.user_id && (
            <>
              <button onClick={() => { setEditingId(c.id); setEditBody(c.body); }} className="hover:text-foreground flex items-center gap-1">
                <Pencil className="h-3 w-3" /> Edit
              </button>
              <button onClick={() => deleteComment(c.id)} className="hover:text-destructive flex items-center gap-1">
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </>
          )}
        </div>

        {isReplying && (
          <div className="mt-2 space-y-2">
            <Textarea value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder="Write a reply…" className="rounded-xl min-h-[60px]" />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => addReply(c.id)} className="rounded-xl gap-1.5"><Send className="h-3 w-3" /> Reply</Button>
              <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)} className="rounded-xl">Cancel</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
