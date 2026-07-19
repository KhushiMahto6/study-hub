'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    setSent(true);
    toast.success('Reset link sent!');
  };

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-500/10 text-green-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Check your inbox</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            We sent a password reset link to <span className="font-medium text-foreground">{email}</span>. The link expires in 1 hour.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-xl gap-2">
          <Link href="/auth/sign-in"><ArrowLeft className="h-4 w-4" /> Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Forgot password?</h1>
        <p className="text-sm text-muted-foreground mt-1">Enter your email and we'll send you a reset link.</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" className="pl-9 rounded-xl" />
          </div>
        </div>
        <Button type="submit" className="w-full rounded-xl gap-2" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Send reset link
        </Button>
      </form>
      <Link href="/auth/sign-in" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>
    </div>
  );
}
