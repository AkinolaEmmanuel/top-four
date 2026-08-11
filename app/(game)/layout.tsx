import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/mock-auth/server";

export default async function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <main className="mx-auto max-w-8xl px-3 sm:px-6 py-4 sm:py-6 overflow-x-hidden min-w-0 w-full">{children}</main>;
}
