import { RoomView } from "@/components/rooms/room-view";

export const dynamic = "force-dynamic";

export const metadata = { title: "Room" };


export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RoomView roomId={id} />;
}
