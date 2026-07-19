export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(1)} ${units[i]}`;
}

export const FILE_TYPE_META: Record<string, { label: string; color: string }> = {
  pdf: { label: 'PDF', color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
  docx: { label: 'DOCX', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  zip: { label: 'ZIP', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  ppt: { label: 'PPT', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  image: { label: 'IMG', color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  other: { label: 'FILE', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
};

export const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical',
  'Civil',
  'Biotechnology',
  'Electrical',
  'Chemical',
  'Aerospace',
];

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export const SUBJECTS = [
  'Database Management Systems',
  'Operating Systems',
  'Data Structures & Algorithms',
  'Computer Networks',
  'Machine Learning',
  'Deep Learning',
  'Compiler Design',
  'Theory of Computation',
  'Software Engineering',
  'Cloud Computing',
  'Thermodynamics',
  'Fluid Mechanics',
  'Strength of Materials',
  'Heat Transfer',
  'Surveying',
  'Digital Signal Processing',
  'VLSI Design',
  'Microprocessors',
  'Analog Circuits',
  'Bioinformatics',
  'Genetic Engineering',
  'Web Technologies',
];

export const CATEGORIES = [
  { id: 'notes', label: 'Notes', icon: 'FileText', count: 0 },
  { id: 'assignments', label: 'Assignments', icon: 'ClipboardList', count: 0 },
  { id: 'pyqs', label: 'PYQs', icon: 'Archive', count: 0 },
  { id: 'labs', label: 'Lab Files', icon: 'FlaskConical', count: 0 },
  { id: 'projects', label: 'Projects', icon: 'Code2', count: 0 },
  { id: 'presentations', label: 'Presentations', icon: 'Presentation', count: 0 },
  { id: 'resources', label: 'Resources', icon: 'BookOpen', count: 0 },
  { id: 'study', label: 'Study Material', icon: 'GraduationCap', count: 0 },
];
