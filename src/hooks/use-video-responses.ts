"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type { VideoResponse, VideoResponseRelatedType } from "@/types/database";

// ---------------------------------------------------------------------------
// List video responses
// ---------------------------------------------------------------------------

export function useVideoResponses(
  relatedType?: VideoResponseRelatedType,
  relatedId?: string,
) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["video-responses", relatedType, relatedId],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase.from("video_responses") as any)
        .select(
          "*, sender:profiles!video_responses_sender_id_fkey(*), recipient:profiles!video_responses_recipient_id_fkey(*)",
        )
        .order("created_at", { ascending: false });

      if (relatedType) {
        query = query.eq("related_type", relatedType);
      }
      if (relatedId) {
        query = query.eq("related_id", relatedId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as VideoResponse[];
    },
    enabled: !!relatedType || !!relatedId,
  });
}

// ---------------------------------------------------------------------------
// Send video response (upload + create record)
// ---------------------------------------------------------------------------

export function useSendVideoResponse() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      videoBlob,
      recipientId,
      relatedType,
      relatedId,
      message,
    }: {
      videoBlob: Blob;
      recipientId: string;
      relatedType: VideoResponseRelatedType;
      relatedId?: string;
      message?: string;
    }) => {
      if (!user) throw new Error("Non authentifie");

      // Upload video to Supabase Storage
      const fileName = `${user.id}/${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from("video-responses")
        .upload(fileName, videoBlob, {
          contentType: "video/webm",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("video-responses")
        .getPublicUrl(fileName);

      // Create DB record
      const { data, error } = await (
        supabase.from("video_responses") as unknown as ReturnType<
          typeof supabase.from
        >
      )
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          related_type: relatedType,
          related_id: relatedId ?? null,
          video_url: urlData.publicUrl,
          message: message ?? null,
        } as never)
        .select()
        .single();

      if (error) throw error;
      return data as VideoResponse;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "video-responses",
          variables.relatedType,
          variables.relatedId,
        ],
      });
      queryClient.invalidateQueries({ queryKey: ["video-responses-unviewed"] });
      toast.success("Reponse video envoyee");
    },
    onError: () => {
      toast.error("Erreur lors de l'envoi de la video");
    },
  });
}

// ---------------------------------------------------------------------------
// Mark a video as viewed
// ---------------------------------------------------------------------------

export function useMarkVideoViewed() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      const { error } = await (
        supabase.from("video_responses") as unknown as ReturnType<
          typeof supabase.from
        >
      )
        .update({ viewed_at: new Date().toISOString() } as never)
        .eq("id", videoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-responses"] });
      queryClient.invalidateQueries({ queryKey: ["video-responses-unviewed"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Unviewed video count (for badges)
// ---------------------------------------------------------------------------

export function useUnviewedVideoCount() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["video-responses-unviewed", user?.id],
    queryFn: async () => {
      if (!user) return 0;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count, error } = await (supabase.from("video_responses") as any)
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .is("viewed_at", null);

      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
  });
}

// ---------------------------------------------------------------------------
// MediaRecorder hook for recording
// ---------------------------------------------------------------------------

export function useRecordVideoResponse() {
  return {
    startRecording,
    stopRecording,
  };
}

async function startRecording(): Promise<{
  stream: MediaStream;
  recorder: MediaRecorder;
  chunks: Blob[];
}> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "user",
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: true,
  });

  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(stream, {
    mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : "video/webm",
  });

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  recorder.start(1000); // Collect data every second

  return { stream, recorder, chunks };
}

function stopRecording(
  stream: MediaStream,
  recorder: MediaRecorder,
): Promise<void> {
  return new Promise((resolve) => {
    recorder.onstop = () => resolve();
    recorder.stop();
    stream.getTracks().forEach((track) => track.stop());
  });
}
