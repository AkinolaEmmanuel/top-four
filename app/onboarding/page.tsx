import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, LogIn, Globe2 } from "lucide-react";
import { getSession } from "@/lib/mock-auth/server";
import { findUserById } from "@/lib/mock-db/store";
import { Logo } from "@/components/brand/logo";

export const metadata = { title: "Get started" };

export default async function OnboardingPage() {
  const session = await getSession();
  const user = session ? findUserById(session.userId) : undefined;

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="flex items-center gap-2.5">
          <Logo size={32} />
          <span className="text-base font-bold tracking-tight">topfour.app</span>
        </div>

        <h1 className="mt-10 text-3xl font-bold tracking-tight sm:text-4xl">
          You&apos;re in. Now pick your game.
        </h1>
        <p className="mt-2 text-muted-foreground">
          Create a room for your group chat, join one with an invite code, or
          jump straight into Global.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <ChoiceCard
            href="/dashboard/rooms/new"
            icon={Users}
            title="Create a Group"
            description="Start a room and invite your group chat."
          />
          <ChoiceCard
            href="/dashboard/rooms/join"
            icon={LogIn}
            title="Join a Group"
            description="Got an invite code? Drop into their room."
          />
          <ChoiceCard
            href="/dashboard/global"
            icon={Globe2}
            title="Go Global"
            description="No room required — predict against everyone."
          />
        </div>

        <Link
          href="/dashboard"
          className="mt-8 inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Skip for now →
        </Link>
      </div>
    </div>
  );
}

function ChoiceCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="mt-4 font-bold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
