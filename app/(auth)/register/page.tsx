'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { AlertCircle, ArrowRight, CheckCircle, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validation
      if (!formData.fullName || !formData.email || !formData.password || !formData.organizationName) {
        setError('All fields are required');
        setIsLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        setIsLoading(false);
        return;
      }

      await register(formData.fullName, formData.email, formData.password, formData.organizationName);
      setSuccess(true);
      toast.success('Registration successful!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      toast.error(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,191,90,0.16),_transparent_30%),linear-gradient(180deg,_rgba(10,10,14,1)_0%,_rgba(12,12,18,1)_45%,_rgba(8,8,12,1)_100%)]" />
        <Card className="relative z-10 max-w-md space-y-6 rounded-[2rem] border border-white/10 bg-white/6 p-8 text-center shadow-[0_25px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <div className="flex justify-center">
            <div className="rounded-full border border-emerald-400/25 bg-emerald-400/10 p-4">
              <CheckCircle className="h-10 w-10 text-emerald-300" />
            </div>
          </div>
          <h2 className="text-3xl font-semibold text-white">Welcome to DocFlow</h2>
          <p className="text-white/68">Your account has been created successfully.</p>
          <p className="text-sm text-white/46">Redirecting to your dashboard...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,191,90,0.16),_transparent_30%),linear-gradient(180deg,_rgba(10,10,14,1)_0%,_rgba(12,12,18,1)_45%,_rgba(8,8,12,1)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:120px_120px] opacity-[0.05]" />

      <div className="relative z-10 grid w-full max-w-6xl gap-10 lg:grid-cols-[1fr_520px] lg:items-center">
        <div className="hidden space-y-8 lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white/5 px-4 py-2 text-sm text-primary shadow-[0_8px_30px_rgba(245,191,90,0.12)]">
            <Sparkles className="h-4 w-4" />
            Create your premium document workspace
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
              Build a secure workspace your team will actually enjoy using.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-white/64">
              Launch with clean organization, enterprise-grade permissions, and a more premium first impression for every team member.
            </p>
          </div>

          <div className="grid max-w-xl gap-4 sm:grid-cols-2">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <p className="text-sm text-white/45">For admins</p>
              <p className="mt-2 text-xl font-medium text-white">Set structure from day one</p>
              <p className="mt-3 text-sm leading-7 text-white/58">Create folders, manage roles, and define access without clutter.</p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <p className="text-sm text-white/45">For teams</p>
              <p className="mt-2 text-xl font-medium text-white">Faster daily workflows</p>
              <p className="mt-3 text-sm leading-7 text-white/58">Uploads, approvals, and retrieval stay smooth as your organization grows.</p>
            </div>
          </div>
        </div>

        <Card className="border border-white/10 bg-white/6 p-7 shadow-[0_25px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl rounded-[2rem]">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-primary/85">Create Account</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Start with a polished setup</h2>
              <p className="mt-2 text-sm leading-7 text-white/58">
                Set up your organization and begin managing documents with confidence.
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 backdrop-blur-sm">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-300" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-white/82">
                Full Name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                className="h-12 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-white/30 focus:border-primary/40 focus:ring-primary/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-white/82">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@company.com"
                value={formData.email}
                onChange={handleChange}
                className="h-12 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-white/30 focus:border-primary/40 focus:ring-primary/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationName" className="text-sm font-medium text-white/82">
                Organization Name
              </Label>
              <Input
                id="organizationName"
                name="organizationName"
                type="text"
                placeholder="My Company"
                value={formData.organizationName}
                onChange={handleChange}
                className="h-12 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-white/30 focus:border-primary/40 focus:ring-primary/20"
                required
              />
              <p className="text-xs text-white/42">
                You will be the administrator of this organization
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-white/82">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
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
              <p className="text-xs text-white/42">At least 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-white/82">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="h-12 rounded-xl border-white/10 bg-black/20 pr-12 text-white placeholder:text-white/30 focus:border-primary/40 focus:ring-primary/20"
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 transition-colors hover:text-white/80"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <input
                type="checkbox"
                id="terms"
                className="h-4 w-4 cursor-pointer rounded border-white/20 bg-black/20 accent-[rgb(245,191,90)]"
                required
              />
              <label htmlFor="terms" className="cursor-pointer text-xs text-white/50 transition-colors hover:text-white/72">
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-6 h-12 w-full rounded-xl border border-primary/35 bg-primary font-semibold text-primary-foreground shadow-[0_16px_50px_rgba(245,191,90,0.25)] hover:bg-primary/95 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">•</span> Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-transparent px-3 text-white/38">Already a member?</span>
              </div>
            </div>

            <Button
              asChild
              type="button"
              variant="outline"
              className="h-12 w-full rounded-xl border-white/12 bg-white/4 text-white hover:border-primary/30 hover:bg-white/8 hover:text-white"
            >
              <Link href="/login">
                Sign in to your account
              </Link>
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-white/42">
            By creating an account, you agree to our{' '}
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
