import { supabaseServer } from './supabase/client';
import type { Resource, Profile, Board, Bulletin, PlacementPost } from './types';

export async function getFeaturedResources(limit = 8): Promise<(Resource & { profiles?: Profile })[]> {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('resources')
    .select('*, profiles!resources_user_id_fkey(*)')
    .eq('status', 'published')
    .order('likes_count', { ascending: false })
    .limit(limit);
  return (data ?? []) as (Resource & { profiles?: Profile })[];
}

export async function getTrendingResources(limit = 8) {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('resources')
    .select('*, profiles!resources_user_id_fkey(*)')
    .eq('status', 'published')
    .order('views_count', { ascending: false })
    .limit(limit);
  return (data ?? []) as (Resource & { profiles?: Profile })[];
}

export async function getLatestResources(limit = 8) {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('resources')
    .select('*, profiles!resources_user_id_fkey(*)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as (Resource & { profiles?: Profile })[];
}

export async function getTopContributors(limit = 6) {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('likes_received', { ascending: false })
    .limit(limit);
  return (data ?? []) as Profile[];
}

export async function getResourceById(id: string) {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('resources')
    .select('*, profiles!resources_user_id_fkey(*)')
    .eq('id', id)
    .maybeSingle();
  return data as (Resource & { profiles?: Profile }) | null;
}

export async function getRelatedResources(resource: Resource, limit = 6) {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('resources')
    .select('*, profiles!resources_user_id_fkey(*)')
    .eq('status', 'published')
    .neq('id', resource.id)
    .or(`subject.eq.${resource.subject},department.eq.${resource.department}`)
    .order('likes_count', { ascending: false })
    .limit(limit);
  return (data ?? []) as (Resource & { profiles?: Profile })[];
}

export async function getCommentsForResource(resourceId: string) {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('comments')
    .select('*, profiles!comments_user_id_fkey(*)')
    .eq('resource_id', resourceId)
    .order('created_at', { ascending: true });
  return (data ?? []) as any[];
}

export async function getBoards(limit = 12) {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('boards')
    .select('*, profiles!boards_user_id_fkey(*)')
    .eq('is_private', false)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as (Board & { profiles?: Profile })[];
}

export async function getBulletins(limit = 20) {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('bulletins')
    .select('*, profiles!bulletins_user_id_fkey(*)')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as (Bulletin & { profiles?: Profile })[];
}

export async function getPlacementPosts(limit = 20) {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('placement_posts')
    .select('*, profiles!placement_posts_user_id_fkey(*)')
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as (PlacementPost & { profiles?: Profile })[];
}

export async function getProfileByUsername(username: string) {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle();
  return data as Profile | null;
}

export async function getProfileById(id: string) {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return data as Profile | null;
}

export async function getResourcesByUser(userId: string, limit = 50) {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('resources')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as Resource[];
}

export async function getBoardsByUser(userId: string) {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('boards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return (data ?? []) as Board[];
}
