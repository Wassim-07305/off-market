"use client";

import { use } from "react";
import { VideoRoom } from "@/components/calls/video-room/video-room";

export default function CoachCallRoomPage({
  params,
}: {
  params: Promise<{ callId: string }>;
}) {
  const { callId } = use(params);

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col">
      <VideoRoom callId={callId} />
    </div>
  );
}
