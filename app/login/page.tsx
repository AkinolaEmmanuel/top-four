"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Zap } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, demoSignIn } from "@/lib/mock-auth/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/predict";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signIn({ email, password });
      router.push(redirectTarget);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDemoSignIn() {
    setError(null);
    setIsDemoLoading(true);

    try {
      await demoSignIn();
      router.push(redirectTarget);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsDemoLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your room"
      subtitle="Enter your details to get back to the leaderboard."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-destructive/10 border border-destructive/20 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full h-11 sm:h-12 text-sm font-bold tracking-wide" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full h-11 sm:h-12 text-xs sm:text-sm font-bold"
        onClick={handleDemoSignIn}
        disabled={isDemoLoading}
      >
        {isDemoLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Zap className="h-4 w-4 text-sky-400" />
        )}
        Try the demo — no account needed
      </Button>

      <p className="mt-5 text-center text-xs sm:text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-bold text-foreground hover:text-sky-500 hover:underline">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4 text-xs font-bold font-heading">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
