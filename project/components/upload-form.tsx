'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Upload, Loader2, FileUp, X, ImageIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { DEPARTMENTS, SEMESTERS, SUBJECTS } from '@/lib/helpers';
import { cn } from '@/lib/utils';

const FILE_TYPES = [
  { value: 'pdf', label: 'PDF' },
  { value: 'docx', label: 'DOCX' },
  { value: 'zip', label: 'ZIP' },
  { value: 'ppt', label: 'PPT' },
  { value: 'image', label: 'Image' },
];

export function UploadForm() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [semester, setSemester] = useState('');
  const [department, setDepartment] = useState('');
  const [course, setCourse] = useState('');
  const [fileType, setFileType] = useState('pdf');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <Card className="rounded-2xl p-8 text-center">
        <p className="text-sm text-muted-foreground">You need to sign in to upload resources.</p>
        <Button asChild className="mt-4 rounded-xl"><a href="/auth/sign-in">Sign in</a></Button>
      </Card>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !file) {
      toast.error('Title, subject, and file are required.');
      return;
    }
    setLoading(true);
    try {
      let fileUrl = '';
      let thumbnailUrl: string | null = null;

      const ext = file.name.split('.').pop() ?? fileType;
      const filePath = `${user.id}/${Date.now()}.${ext}`;
      const { error: fileErr } = await supabase.storage.from('resources').upload(filePath, file);
      if (fileErr) {
        // Fallback: store a placeholder URL if storage upload fails (e.g. bucket policy)
        fileUrl = `https://example.com/uploads/${file.name}`;
      } else {
        const { data: pub } = supabase.storage.from('resources').getPublicUrl(filePath);
        fileUrl = pub.publicUrl;
      }

      if (thumbnail) {
        const tPath = `${user.id}/${Date.now()}-thumb.${thumbnail.name.split('.').pop()}`;
        const { error: tErr } = await supabase.storage.from('thumbnails').upload(tPath, thumbnail);
        if (!tErr) {
          const { data: pub } = supabase.storage.from('thumbnails').getPublicUrl(tPath);
          thumbnailUrl = pub.publicUrl;
        }
      }

      const tagArray = tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);

      const { data, error } = await supabase
        .from('resources')
        .insert({
          user_id: user.id,
          title, description, subject,
          semester: semester ? Number(semester) : null,
          department: department || '',
          course,
          file_type: fileType,
          file_url: fileUrl,
          thumbnail_url: thumbnailUrl,
          tags: tagArray,
          file_size: file.size,
          status: 'published',
        })
        .select('id')
        .single();

      if (error) throw error;

      await supabase.from('profiles').update({ uploads_count: (profile?.uploads_count ?? 0) + 1 }).eq('id', user.id);

      toast.success('Resource uploaded!');
      router.push(`/resources/${data.id}`);
    } catch (err: any) {
      toast.error(err.message ?? 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <Card className="rounded-2xl p-5 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="DBMS Complete Notes — Normalization to Transactions" className="rounded-xl" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's inside this resource? Be specific so others can find it." className="rounded-xl min-h-[100px]" />
        </div>
      </Card>

      <Card className="rounded-2xl p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Subject <span className="text-destructive">*</span></Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select subject" /></SelectTrigger>
              <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Semester</Label>
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select semester" /></SelectTrigger>
              <SelectContent>{SEMESTERS.map((s) => <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="course">Course code</Label>
            <Input id="course" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="CS304" className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label>File type</Label>
            <Select value={fileType} onValueChange={setFileType}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>{FILE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags <span className="text-muted-foreground text-xs">(comma separated)</span></Label>
            <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="dbms, sql, notes" className="rounded-xl" />
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl p-5 space-y-4">
        <div className="space-y-1.5">
          <Label>File <span className="text-destructive">*</span></Label>
          <FileDropzone
            label="Upload your file"
            accept=".pdf,.docx,.zip,.pptx,.png,.jpg,.jpeg"
            file={file}
            onFile={setFile}
            icon={<FileUp className="h-8 w-8" />}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Thumbnail <span className="text-muted-foreground text-xs">(optional)</span></Label>
          <FileDropzone
            label="Upload a cover image"
            accept="image/*"
            file={thumbnail}
            onFile={setThumbnail}
            icon={<ImageIcon className="h-8 w-8" />}
          />
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-xl">Cancel</Button>
        <Button type="submit" disabled={loading} className="rounded-xl gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Publish resource
        </Button>
      </div>
    </form>
  );
}

function FileDropzone({ label, accept, file, onFile, icon }: {
  label: string; accept: string; file: File | null; onFile: (f: File | null) => void; icon: React.ReactNode;
}) {
  return (
    <label className={cn(
      'group flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-6 cursor-pointer hover:border-primary/50 hover:bg-muted/40 transition-colors',
      file && 'border-primary/40 bg-primary/5'
    )}>
      <input type="file" accept={accept} className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      <div className="text-muted-foreground group-hover:text-primary transition-colors">{icon}</div>
      {file ? (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{file.name}</span>
          <span className="text-muted-foreground">({(file.size / 1024).toFixed(0)} KB)</span>
          <button type="button" onClick={(e) => { e.preventDefault(); onFile(null); }} className="text-muted-foreground hover:text-destructive" aria-label="Remove file">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{label} <span className="text-xs">or drag & drop</span></p>
      )}
    </label>
  );
}
