import { redirect } from "next/navigation";
import { getSession } from "@/lib/mock-auth/server";
import { findUserById } from "@/lib/mock-db/store";
import { AppHeader } from "@/components/layout/app-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const user = session ? findUserById(session.userId) : undefined;

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <AppHeader userEmail={user.email} />
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
