export type Profile = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string;
  college: string;
  department: string;
  semester: number | null;
  github_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  role: 'user' | 'admin';
  verified: boolean;
  uploads_count: number;
  likes_received: number;
  downloads_count: number;
  followers_count: number;
  following_count: number;
  created_at: string;
  updated_at: string;
};

export type ResourceType = 'pdf' | 'docx' | 'zip' | 'ppt' | 'image' | 'other';

export type Resource = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  subject: string;
  semester: number | null;
  department: string;
  course: string;
  file_type: string;
  file_url: string;
  thumbnail_url: string | null;
  tags: string[];
  views_count: number;
  downloads_count: number;
  likes_count: number;
  bookmarks_count: number;
  comments_count: number;
  rating_sum: number;
  rating_count: number;
  status: 'pending' | 'published' | 'removed' | 'rejected';
  created_at: string;
  updated_at: string;
  profiles?: Profile;
};

export type Comment = {
  id: string;
  user_id: string;
  resource_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  replies?: Comment[];
};

export type Board = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  cover_color: string;
  is_private: boolean;
  resources_count: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
};

export type BoardResource = {
  id: string;
  board_id: string;
  resource_id: string;
  user_id: string;
  created_at: string;
  resources?: Resource;
};

export type Bulletin = {
  id: string;
  user_id: string;
  category: 'event' | 'hackathon' | 'club' | 'internship' | 'exam' | 'lostfound' | 'announcement';
  title: string;
  body: string;
  link: string | null;
  event_date: string | null;
  pinned: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
};

export type PlacementPost = {
  id: string;
  user_id: string;
  type: 'internship' | 'job' | 'referral' | 'interview' | 'company';
  company: string;
  role: string;
  ctc: string;
  location: string;
  experience: string;
  link: string | null;
  status: 'open' | 'closed' | 'applied' | 'interviewing' | 'offered' | 'rejected';
  tags: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
};

export type Notification = {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: 'like' | 'bookmark' | 'comment' | 'reply' | 'download' | 'follow' | 'bulletin' | 'placement' | 'report' | 'system';
  resource_id: string | null;
  read: boolean;
  message: string;
  created_at: string;
  actor?: Profile;
};

export type Report = {
  id: string;
  reporter_id: string;
  target_type: 'resource' | 'bulletin' | 'placement' | 'comment' | 'user';
  target_id: string;
  reason: string;
  status: 'open' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  reporter?: Profile;
};
