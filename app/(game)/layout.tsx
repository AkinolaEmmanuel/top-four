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

  return <main className="mx-auto max-w-6xl p-6">{children}</main>;
}
