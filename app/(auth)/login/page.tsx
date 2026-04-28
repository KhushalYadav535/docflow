'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Login successful!');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,191,90,0.16),_transparent_30%),linear-gradient(180deg,_rgba(10,10,14,1)_0%,_rgba(12,12,18,1)_45%,_rgba(8,8,12,1)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:120px_120px] opacity-[0.05]" />

      <div className="relative z-10 grid w-full max-w-6xl gap-10 lg:grid-cols-[1fr_480px] lg:items-center">
        <div className="hidden space-y-8 lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white/5 px-4 py-2 text-sm text-primary shadow-[0_8px_30px_rgba(245,191,90,0.12)]">
            <Sparkles className="h-4 w-4" />
            Welcome back to your premium workspace
          </div>

          <div className="space-y-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/12 text-primary shadow-[0_0_30px_rgba(245,191,90,0.18)]">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-semibold uppercase tracking-[0.18em] text-white">DocFlow</p>
                <p className="text-sm text-white/55">Elegant control for enterprise documents</p>
              </div>
            </Link>

            <h1 className="max-w-xl text-5xl font-semibold leading-tight tracking-tight text-white">
              Sign in to continue your polished document workflow.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-white/64">
              Secure access, rapid retrieval, and premium organization for contracts, records, and critical files.
            </p>
          </div>

          <div className="grid max-w-xl gap-4 sm:grid-cols-2">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <p className="text-sm text-white/45">Fast access</p>
              <p className="mt-2 text-xl font-medium text-white">Search-ready in seconds</p>
              <p className="mt-3 text-sm leading-7 text-white/58">Return to approvals, folders, and documents without losing momentum.</p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <p className="text-sm text-white/45">Protected by design</p>
              <p className="mt-2 text-xl font-medium text-white">Role-aware security</p>
              <p className="mt-3 text-sm leading-7 text-white/58">Permissions and visibility stay clean, controlled, and enterprise-ready.</p>
            </div>
          </div>
        </div>

        <Card className="border border-white/10 bg-white/6 p-7 shadow-[0_25px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl rounded-[2rem]">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-primary/85">Sign In</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Access your workspace</h2>
              <p className="mt-2 text-sm leading-7 text-white/58">
                Continue with your secure DocFlow account.
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 backdrop-blur-sm">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-300" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

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

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-white/82">
                  Password
                </Label>
                <Link href="/forgot-password" className="text-xs text-primary transition-colors hover:text-primary/80">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-white/10 bg-black/20 pr-12 text-white placeholder:text-white/30 focus:border-primary/40 focus:ring-primary/20"
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 transition-colors hover:text-white/80"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 cursor-pointer rounded border-white/20 bg-black/20 accent-[rgb(245,191,90)]"
              />
              <label htmlFor="remember" className="cursor-pointer text-sm text-white/58 transition-colors hover:text-white/75">
                Remember me
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-xl border border-primary/35 bg-primary font-semibold text-primary-foreground shadow-[0_16px_50px_rgba(245,191,90,0.25)] hover:bg-primary/95 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">•</span> Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-transparent px-3 text-white/38">New to DocFlow?</span>
              </div>
            </div>

            <Button
              asChild
              type="button"
              variant="outline"
              className="h-12 w-full rounded-xl border-white/12 bg-white/4 text-white hover:border-primary/30 hover:bg-white/8 hover:text-white"
            >
              <Link href="/register">
                Create an account
              </Link>
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-white/42">
            By signing in, you agree to our{' '}
            <Link href="#" className="text-primary transition-colors hover:text-primary/80">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="#" className="text-primary transition-colors hover:text-primary/80">
              Privacy Policy
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
