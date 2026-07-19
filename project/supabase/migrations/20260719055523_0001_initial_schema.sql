/*
# StudyHub Initial Schema

## Overview
Creates the full relational schema for StudyHub, a student community platform
for sharing study resources (notes, assignments, PYQs, lab files, projects,
presentations). Includes profiles, resources, engagement (likes, bookmarks,
comments, downloads), boards, notifications, bulletins, placements, reports,
and follows.

## New Tables
1. `profiles` — public user profile data (one row per auth user)
2. `resources` — uploaded study materials
3. `likes` — likes on resources (unique per user+resource)
4. `bookmarks` — bookmarks on resources (unique per user+resource)
5. `comments` — comments on resources, supports nested replies
6. `boards` — user-curated collections of resources
7. `board_resources` — join table between boards and resources
8. `downloads` — download event log for analytics
9. `notifications` — in-app notifications
10. `bulletins` — community notice board posts
11. `bulletin_comments` — comments on bulletin posts
12. `placement_posts` — community-driven placement/internship board
13. `reports` — user-submitted reports on resources/bulletins/placements
14. `follows` — user-to-user follow relationships

## Security (RLS)
- All tables have RLS enabled.
- Public read on resources, profiles, bulletins, placement_posts, comments,
  boards (so unauthenticated visitors can browse).
- Writes are owner-scoped: only authenticated users can insert/update/delete
  their own rows. Likes/bookmarks/downloads use DEFAULT auth.uid() so client
  inserts omitting user_id still pass the WITH CHECK.
- Admin role: profiles.role = 'admin' unlocks moderation actions via a
  helper check. We use a small SQL predicate `profiles.role = 'admin'` in
  policies where admin moderation is required.
*/

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text NOT NULL DEFAULT '',
  avatar_url text,
  bio text DEFAULT '',
  college text DEFAULT '',
  department text DEFAULT '',
  semester integer,
  github_url text,
  linkedin_url text,
  website_url text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  verified boolean NOT NULL DEFAULT false,
  uploads_count integer NOT NULL DEFAULT 0,
  likes_received integer NOT NULL DEFAULT 0,
  downloads_count integer NOT NULL DEFAULT 0,
  followers_count integer NOT NULL DEFAULT 0,
  following_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
CREATE POLICY "profiles_select_public" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- RESOURCES
-- ============================================================
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  subject text NOT NULL DEFAULT '',
  semester integer,
  department text DEFAULT '',
  course text DEFAULT '',
  file_type text NOT NULL DEFAULT 'pdf',
  file_url text NOT NULL DEFAULT '',
  file_size bigint DEFAULT 0,
  thumbnail_url text,
  tags text[] DEFAULT '{}',
  views_count integer NOT NULL DEFAULT 0,
  downloads_count integer NOT NULL DEFAULT 0,
  likes_count integer NOT NULL DEFAULT 0,
  bookmarks_count integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  rating_sum numeric(10,2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('pending','published','removed','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "resources_select_public" ON resources;
CREATE POLICY "resources_select_public" ON resources FOR SELECT
  TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "resources_insert_own" ON resources;
CREATE POLICY "resources_insert_own" ON resources FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "resources_update_own" ON resources;
CREATE POLICY "resources_update_own" ON resources FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "resources_delete_own" ON resources;
CREATE POLICY "resources_delete_own" ON resources FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resources_downloads ON resources (downloads_count DESC);
CREATE INDEX IF NOT EXISTS idx_resources_likes ON resources (likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_resources_subject ON resources (subject);
CREATE INDEX IF NOT EXISTS idx_resources_department ON resources (department);
CREATE INDEX IF NOT EXISTS idx_resources_semester ON resources (semester);
CREATE INDEX IF NOT EXISTS idx_resources_user ON resources (user_id);

-- ============================================================
-- LIKES
-- ============================================================
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, resource_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "likes_select_public" ON likes;
CREATE POLICY "likes_select_public" ON likes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "likes_insert_own" ON likes;
CREATE POLICY "likes_insert_own" ON likes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "likes_delete_own" ON likes;
CREATE POLICY "likes_delete_own" ON likes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_likes_resource ON likes (resource_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes (user_id);

-- ============================================================
-- BOOKMARKS
-- ============================================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, resource_id)
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookmarks_select_own" ON bookmarks;
CREATE POLICY "bookmarks_select_own" ON bookmarks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookmarks_insert_own" ON bookmarks;
CREATE POLICY "bookmarks_insert_own" ON bookmarks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookmarks_delete_own" ON bookmarks;
CREATE POLICY "bookmarks_delete_own" ON bookmarks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks (user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_resource ON bookmarks (resource_id);

-- ============================================================
-- COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_select_public" ON comments;
CREATE POLICY "comments_select_public" ON comments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "comments_insert_own" ON comments;
CREATE POLICY "comments_insert_own" ON comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_update_own" ON comments;
CREATE POLICY "comments_update_own" ON comments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_delete_own" ON comments;
CREATE POLICY "comments_delete_own" ON comments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_comments_resource ON comments (resource_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments (parent_id);

-- ============================================================
-- BOARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  cover_color text DEFAULT 'blue',
  is_private boolean NOT NULL DEFAULT false,
  resources_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "boards_select_public" ON boards;
CREATE POLICY "boards_select_public" ON boards FOR SELECT
  TO anon, authenticated USING (is_private = false OR auth.uid() = user_id);

DROP POLICY IF EXISTS "boards_insert_own" ON boards;
CREATE POLICY "boards_insert_own" ON boards FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "boards_update_own" ON boards;
CREATE POLICY "boards_update_own" ON boards FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "boards_delete_own" ON boards;
CREATE POLICY "boards_delete_own" ON boards FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_boards_user ON boards (user_id);

-- ============================================================
-- BOARD_RESOURCES
-- ============================================================
CREATE TABLE IF NOT EXISTS board_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (board_id, resource_id)
);

ALTER TABLE board_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "board_resources_select" ON board_resources;
CREATE POLICY "board_resources_select" ON board_resources FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "board_resources_insert_own" ON board_resources;
CREATE POLICY "board_resources_insert_own" ON board_resources FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "board_resources_delete_own" ON board_resources;
CREATE POLICY "board_resources_delete_own" ON board_resources FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_board_resources_board ON board_resources (board_id);
CREATE INDEX IF NOT EXISTS idx_board_resources_resource ON board_resources (resource_id);

-- ============================================================
-- DOWNLOADS
-- ============================================================
CREATE TABLE IF NOT EXISTS downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE SET NULL,
  resource_id uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "downloads_select_own" ON downloads;
CREATE POLICY "downloads_select_own" ON downloads FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "downloads_insert_any" ON downloads;
CREATE POLICY "downloads_insert_any" ON downloads FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_downloads_resource ON downloads (resource_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user ON downloads (user_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('like','bookmark','comment','reply','download','follow','bulletin','placement','report','system')),
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
  read boolean NOT NULL DEFAULT false,
  message text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert_own" ON notifications;
CREATE POLICY "notifications_insert_own" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, created_at DESC);

-- ============================================================
-- BULLETINS
-- ============================================================
CREATE TABLE IF NOT EXISTS bulletins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'announcement' CHECK (category IN ('event','hackathon','club','internship','exam','lostfound','announcement')),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  link text,
  event_date date,
  pinned boolean NOT NULL DEFAULT false,
  likes_count integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bulletins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bulletins_select_public" ON bulletins;
CREATE POLICY "bulletins_select_public" ON bulletins FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "bulletins_insert_own" ON bulletins;
CREATE POLICY "bulletins_insert_own" ON bulletins FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bulletins_update_own" ON bulletins;
CREATE POLICY "bulletins_update_own" ON bulletins FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bulletins_delete_own" ON bulletins;
CREATE POLICY "bulletins_delete_own" ON bulletins FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_bulletins_created ON bulletins (created_at DESC);

-- ============================================================
-- BULLETIN_COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS bulletin_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  bulletin_id uuid NOT NULL REFERENCES bulletins(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bulletin_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bulletin_comments_select_public" ON bulletin_comments;
CREATE POLICY "bulletin_comments_select_public" ON bulletin_comments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "bulletin_comments_insert_own" ON bulletin_comments;
CREATE POLICY "bulletin_comments_insert_own" ON bulletin_comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bulletin_comments_delete_own" ON bulletin_comments;
CREATE POLICY "bulletin_comments_delete_own" ON bulletin_comments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_bulletin_comments_bulletin ON bulletin_comments (bulletin_id);

-- ============================================================
-- PLACEMENT_POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS placement_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'job' CHECK (type IN ('internship','job','referral','interview','company')),
  company text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  ctc text DEFAULT '',
  location text DEFAULT '',
  experience text DEFAULT '',
  link text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','applied','interviewing','offered','rejected')),
  tags text[] DEFAULT '{}',
  likes_count integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE placement_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "placement_posts_select_public" ON placement_posts;
CREATE POLICY "placement_posts_select_public" ON placement_posts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "placement_posts_insert_own" ON placement_posts;
CREATE POLICY "placement_posts_insert_own" ON placement_posts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "placement_posts_update_own" ON placement_posts;
CREATE POLICY "placement_posts_update_own" ON placement_posts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "placement_posts_delete_own" ON placement_posts;
CREATE POLICY "placement_posts_delete_own" ON placement_posts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_placement_posts_created ON placement_posts (created_at DESC);

-- ============================================================
-- REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('resource','bulletin','placement','comment','user')),
  target_id uuid NOT NULL,
  reason text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed','resolved','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports_insert_own" ON reports;
CREATE POLICY "reports_insert_own" ON reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "reports_select_own_or_admin" ON reports;
CREATE POLICY "reports_select_own_or_admin" ON reports FOR SELECT
  TO authenticated USING (
    auth.uid() = reporter_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "reports_update_admin" ON reports;
CREATE POLICY "reports_update_admin" ON reports FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status);

-- ============================================================
-- FOLLOWS
-- ============================================================
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "follows_select_public" ON follows;
CREATE POLICY "follows_select_public" ON follows FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "follows_insert_own" ON follows;
CREATE POLICY "follows_insert_own" ON follows FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "follows_delete_own" ON follows;
CREATE POLICY "follows_delete_own" ON follows FOR DELETE
  TO authenticated USING (auth.uid() = follower_id);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows (follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows (following_id);

-- ============================================================
-- TRIGGERS: auto-create profile on signup + updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS resources_updated_at ON resources;
CREATE TRIGGER resources_updated_at BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS boards_updated_at ON boards;
CREATE TRIGGER boards_updated_at BEFORE UPDATE ON boards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS bulletins_updated_at ON bulletins;
CREATE TRIGGER bulletins_updated_at BEFORE UPDATE ON bulletins
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS placement_posts_updated_at ON placement_posts;
CREATE TRIGGER placement_posts_updated_at BEFORE UPDATE ON placement_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS comments_updated_at ON comments;
CREATE TRIGGER comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
