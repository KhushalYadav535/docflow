'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Files,
  FolderLock,
  Search,
  Shield,
  Sparkles,
  Workflow,
  Zap,
} from 'lucide-react';

const featureCards = [
  {
    icon: Files,
    title: 'Effortless intake',
    description: 'Drag, drop, and bulk-import files into structured workspaces without slowing teams down.',
  },
  {
    icon: Search,
    title: 'AI-ready search',
    description: 'Find contracts, invoices, and records instantly with fast indexing and refined filters.',
  },
  {
    icon: FolderLock,
    title: 'Confident access',
    description: 'Protect sensitive files with role-aware permissions, auditability, and controlled sharing.',
  },
  {
    icon: Workflow,
    title: 'Smooth approvals',
    description: 'Move documents through reviews, approvals, and handoffs with less back-and-forth.',
  },
];

const premiumStats = [
  { value: '10k+', label: 'documents organized' },
  { value: '99.9%', label: 'availability mindset' },
  { value: '< 2s', label: 'search response feel' },
];

const trustPoints = [
  'Elegant workspace built for modern teams',
  'Fast onboarding with demo access available',
  'Security-first flows for enterprise operations',
];

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(245,191,90,0.16),_transparent_30%),linear-gradient(180deg,_rgba(10,10,14,1)_0%,_rgba(12,12,18,1)_45%,_rgba(8,8,12,1)_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:120px_120px] opacity-[0.06]" />

      <nav className="sticky top-0 z-20 border-b border-white/10 bg-black/25 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/30 bg-primary/12 text-primary shadow-[0_0_30px_rgba(245,191,90,0.18)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-[0.18em] text-white uppercase">DocFlow</p>
              <p className="text-xs text-white/55">Premium document command center</p>
            </div>
          </div>

          <div className="hidden items-center gap-8 text-sm text-white/70 md:flex">
            <a href="#features" className="transition-colors hover:text-white">Features</a>
            <a href="#experience" className="transition-colors hover:text-white">Experience</a>
            <a href="#access" className="transition-colors hover:text-white">Demo</a>
          </div>

          <Button asChild className="rounded-full border border-primary/40 bg-primary px-6 text-primary-foreground shadow-[0_12px_40px_rgba(245,191,90,0.24)] hover:bg-primary/95">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </nav>

      <section className="relative mx-auto grid max-w-7xl gap-14 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white/5 px-4 py-2 text-sm text-primary shadow-[0_8px_30px_rgba(245,191,90,0.12)]">
            <Sparkles className="h-4 w-4" />
            Crafted for teams that want elegance with control
          </div>

          <div className="space-y-6">
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
              Turn document chaos into a polished, premium workflow.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/68 md:text-xl">
              DocFlow gives your team a luxurious control layer for secure storage, rapid search,
              elegant approvals, and effortless organization across every business-critical file.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-14 rounded-full border border-primary/35 bg-primary px-8 text-base text-primary-foreground shadow-[0_16px_50px_rgba(245,191,90,0.28)]"
            >
              <Link href="/login">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 rounded-full border-white/14 bg-white/6 px-8 text-base text-white hover:border-primary/35 hover:bg-white/10 hover:text-white"
            >
              <a href="#features">Explore Experience</a>
            </Button>
          </div>

          <div className="grid gap-3 text-sm text-white/72 sm:grid-cols-3">
            {trustPoints.map((point) => (
              <div key={point} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-md">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 rounded-[2rem] bg-primary/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 p-4 shadow-[0_25px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="rounded-[1.7rem] border border-white/10 bg-[#0b0b11] p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-primary/90">Executive View</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Everything important, instantly visible</h2>
                </div>
                <div className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                  Secure sync active
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {premiumStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <p className="text-2xl font-semibold text-white">{stat.value}</p>
                    <p className="mt-1 text-sm text-white/55">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[1.5rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/45">Search intelligence</p>
                      <p className="text-lg font-medium text-white">Locate any file by context</p>
                    </div>
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/72">
                    Search: <span className="text-white">Q4 vendor agreement with signed annexures</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3">
                      <p className="text-sm font-medium text-white">Vendor Renewal Agreement.pdf</p>
                      <p className="mt-1 text-xs text-white/55">Matched title, OCR text, and approval history</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                      <p className="text-sm font-medium text-white">Annexure-SLA-Final.docx</p>
                      <p className="mt-1 text-xs text-white/55">Permission-ready for finance and legal teams</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <Shield className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-white">Permission layers</p>
                        <p className="text-xs text-white/50">Granular control without friction</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm text-white/72">
                      <div className="flex items-center justify-between rounded-xl bg-black/25 px-3 py-2">
                        <span>Admin</span>
                        <span className="text-primary">Full access</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-black/25 px-3 py-2">
                        <span>Legal</span>
                        <span className="text-primary">Review + annotate</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-black/25 px-3 py-2">
                        <span>Finance</span>
                        <span className="text-white/58">Read only</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/8 bg-[linear-gradient(135deg,rgba(245,191,90,0.18),rgba(255,255,255,0.05))] p-5">
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-primary-foreground" />
                      <div>
                        <p className="text-sm font-medium text-white">Premium flow</p>
                        <p className="text-xs text-white/70">Upload, classify, approve, retrieve</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-white/82">
                      Built to feel fast, controlled, and premium from the first click to the final approval.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.24em] text-primary/85">Luxury-grade workflow</p>
            <h3 className="max-w-2xl text-3xl font-semibold text-white md:text-4xl">
              Refined tools that look sharp and work even sharper.
            </h3>
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/62 md:text-base">
            Every section is tuned for clarity, speed, and trust so the product feels premium instead of crowded.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/28 hover:bg-white/7"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/12 text-primary shadow-[0_10px_30px_rgba(245,191,90,0.12)]">
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-medium text-white">{feature.title}</h4>
                <p className="mt-3 text-sm leading-7 text-white/60">{feature.description}</p>
                <div className="mt-6 flex items-center gap-2 text-sm text-primary opacity-80 transition-opacity group-hover:opacity-100">
                  Explore capability
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="experience" className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        <div className="rounded-[2.2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl md:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="space-y-5">
              <p className="text-sm uppercase tracking-[0.24em] text-primary/85">Elegant by design</p>
              <h3 className="text-3xl font-semibold text-white md:text-4xl">
                A landing experience that feels expensive, not overdesigned.
              </h3>
              <p className="text-base leading-8 text-white/64">
                Balanced spacing, richer glass surfaces, muted premium tones, and cleaner calls to action make the page feel more trustworthy from the first impression.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-white/48">Visual tone</p>
                <p className="mt-2 text-lg font-medium text-white">Deep luxury contrast</p>
                <p className="mt-3 text-sm leading-7 text-white/60">Near-black surfaces with warm metallic accents for a more premium SaaS identity.</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-white/48">Interaction</p>
                <p className="mt-2 text-lg font-medium text-white">Softer hover behavior</p>
                <p className="mt-3 text-sm leading-7 text-white/60">Buttons now lift subtly instead of scaling aggressively, reducing the flicker/hide feel.</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-white/48">Hierarchy</p>
                <p className="mt-2 text-lg font-medium text-white">Cleaner spacing rhythm</p>
                <p className="mt-3 text-sm leading-7 text-white/60">Stronger section breaks and typography make content easier to scan.</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-white/48">Trust</p>
                <p className="mt-2 text-lg font-medium text-white">Sharper product framing</p>
                <p className="mt-3 text-sm leading-7 text-white/60">The mock dashboard gives visitors a quick premium preview of the platform value.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black/25 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-sm text-white/50 md:flex-row md:items-center md:justify-between md:px-8">
          <p>&copy; 2026 DocFlow. All rights reserved.</p>
          <p>Enterprise document management, presented with a premium-first experience.</p>
        </div>
      </footer>
    </div>
  );
}
