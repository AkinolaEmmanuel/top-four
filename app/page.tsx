import { HubView } from "@/components/hub/hub-view";
import { getCurrentUser } from "@/lib/mock-auth/server";

export default async function HomePage() {
  const user = await getCurrentUser();
  return <HubView user={user} />;
}
