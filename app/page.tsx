'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Files, Shield, Zap, Search } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">DocFlow</h1>
          <Link href="/login">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-20 md:py-32 text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-5xl md:text-6xl font-bold text-foreground text-balance">
            Enterprise Document Management Made Simple
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Upload, organize, search, and manage all your documents in one secure, powerful platform.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button className="px-8 h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base">
              Get Started Free
            </Button>
          </Link>
          <Button variant="outline" className="px-8 h-12 border-border text-foreground hover:bg-accent/10 text-base">
            Learn More
          </Button>
        </div>

        {/* Demo Credentials */}
        <div className="mt-12 p-4 rounded-lg bg-secondary/30 border border-border max-w-md mx-auto">
          <p className="text-sm text-muted-foreground mb-2">Try it now with demo credentials:</p>
          <p className="text-sm font-mono text-foreground">
            Email: <span className="text-primary">demo@example.com</span><br />
            Password: <span className="text-primary">password</span>
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-20 space-y-12">
        <h3 className="text-3xl font-bold text-foreground text-center">Powerful Features</h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <div className="p-3 w-fit rounded-lg bg-primary/10 mb-4">
              <Files className="h-6 w-6 text-primary" />
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">Easy Upload</h4>
            <p className="text-sm text-muted-foreground">
              Drag and drop files or bulk upload multiple documents at once
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <div className="p-3 w-fit rounded-lg bg-primary/10 mb-4">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">Smart Search</h4>
            <p className="text-sm text-muted-foreground">
              Full-text search across all documents with advanced filtering
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <div className="p-3 w-fit rounded-lg bg-primary/10 mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">Secure Access</h4>
            <p className="text-sm text-muted-foreground">
              Role-based access control and document-level permissions
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <div className="p-3 w-fit rounded-lg bg-primary/10 mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">Lightning Fast</h4>
            <p className="text-sm text-muted-foreground">
              Optimized performance with instant document preview and search
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-20 text-center space-y-8 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8 md:p-16">
        <h3 className="text-3xl font-bold text-foreground">Ready to get started?</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Join thousands of organizations managing their documents with DocFlow.
        </p>
        <Link href="/login">
          <Button className="px-8 h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base">
            Sign Up Now
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 DocFlow. All rights reserved. | Enterprise Document Management Platform</p>
        </div>
      </footer>
    </div>
  );
}
