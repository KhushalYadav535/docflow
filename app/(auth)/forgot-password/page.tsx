'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, ChevronLeft, ShieldCheck, Sparkles } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!email || !email.includes('@')) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      const { apiClient } = await import('@/lib/api');
      await apiClient.requestPasswordReset(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,191,90,0.16),_transparent_30%),linear-gradient(180deg,_rgba(10,10,14,1)_0%,_rgba(12,12,18,1)_45%,_rgba(8,8,12,1)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:120px_120px] opacity-[0.05]" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        <Button
          asChild
          variant="ghost"
          className="inline-flex rounded-full px-0 text-primary hover:bg-transparent hover:text-primary/80"
        >
          <Link href="/login">
            <ChevronLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </Button>

        <Card className="rounded-[2rem] border border-white/10 bg-white/6 p-7 shadow-[0_25px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white/5 px-4 py-2 text-sm text-primary">
                <Sparkles className="h-4 w-4" />
                Secure recovery
              </div>
              <h1 className="text-3xl font-semibold text-white">Reset Password</h1>
              <p className="mt-2 text-sm leading-7 text-white/58">Recover access to your premium workspace.</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 backdrop-blur-sm">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-300" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <p className="text-sm leading-7 text-white/64">
                Enter your email address and we'll send you a secure link to reset your password.
              </p>

              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-sm font-medium text-white/82">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-white/30 focus:border-primary/40 focus:ring-primary/20"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-6 h-12 w-full rounded-xl border border-primary/35 bg-primary font-semibold text-primary-foreground shadow-[0_16px_50px_rgba(245,191,90,0.25)] hover:bg-primary/95 disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <div className="space-y-5 text-center">
              <div className="flex justify-center">
                <div className="rounded-full border border-emerald-400/25 bg-emerald-400/10 p-4">
                  <CheckCircle className="h-10 w-10 text-emerald-300" />
                </div>
              </div>
              <div>
                <h2 className="mb-2 text-2xl font-semibold text-white">Check your email</h2>
                <p className="text-sm text-white/68">
                  We've sent a password reset link to <span className="font-semibold text-white">{email}</span>
                </p>
              </div>
              <p className="text-xs leading-relaxed text-white/44">
                The reset link will expire in 24 hours. If you don't see the email, please check your spam or junk folder.
              </p>

              <div className="pt-4">
                <Button
                  asChild
                  className="h-12 w-full rounded-xl border border-primary/35 bg-primary font-semibold text-primary-foreground shadow-[0_16px_50px_rgba(245,191,90,0.25)] hover:bg-primary/95"
                >
                  <Link href="/login">
                    Back to Login
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
