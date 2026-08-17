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

  /* Desktop chrome contract: centred column capped at 1080px, 24px gutters.
     Mobile contract: centred container capped at 430px with generous 24px-32px side padding so cards don't take full width. */
  return (
    <div className="mx-auto w-full max-w-mobile md:max-w-content px-6 sm:px-8 md:px-10 py-5 sm:py-8 min-w-0">
      {children}
    </div>
  );
}
