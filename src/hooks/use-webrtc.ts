"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useCallStore } from "@/stores/call-store";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ICE servers: Google STUN (free) + Cloudflare TURN (1000 GB/month free) + Open Relay fallback
function getIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ];

  const turnId = process.env.NEXT_PUBLIC_CLOUDFLARE_TURN_TOKEN_ID;
  const turnToken = process.env.NEXT_PUBLIC_CLOUDFLARE_TURN_API_TOKEN;
  if (turnId && turnToken) {
    servers.push({
      urls: "turn:turn.cloudflare.com:3478?transport=udp",
      username: turnId,
      credential: turnToken,
    });
    servers.push({
      urls: "turn:turn.cloudflare.com:3478?transport=tcp",
      username: turnId,
      credential: turnToken,
    });
  }

  // Open Relay Metered free fallback
  servers.push({
    urls: "turn:a.relay.metered.ca:80",
    username: "e8dd65b92f6aee9be7825b65",
    credential: "3ZJqM+mCQ/Iw/7Xc",
  });

  return servers;
}

interface UseWebRTCOptions {
  callId: string;
}

export function useWebRTC({ callId }: UseWebRTCOptions) {
  const supabase = useSupabase();
  const { user, profile } = useAuth();
  const store = useCallStore();

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const makingOfferRef = useRef(false);
  const ignoringOfferRef = useRef(false);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const myId = user?.id ?? "";
  const myName = profile?.full_name ?? "Utilisateur";

  // "Polite peer" pattern: lower ID = polite (yields on collision)
  const isPolite = useCallback(
    (remoteId: string) => myId < remoteId,
    [myId]
  );

  const cleanup = useCallback(() => {
    try {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    } catch { /* tracks already stopped */ }
    localStreamRef.current = null;
    screenStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);

    try {
      pcRef.current?.close();
    } catch { /* already closed */ }
    pcRef.current = null;

    try {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    } catch { /* channel already removed */ }
    channelRef.current = null;

    store.setRemoteConnected(false);
    store.setScreenSharing(false);
  }, [supabase, store]);

  // Create peer connection and wire up signaling
  const setupConnection = useCallback(async () => {
    if (!myId) return;

    store.setPhase("joining");

    // 1. Get local media
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
    } catch {
      // Fallback: audio only
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
        localStreamRef.current = stream;
        setLocalStream(stream);
        store.toggleCamera(); // camera off since no video
      } catch (err) {
        console.error("Cannot access media devices:", err);
        store.setPhase("ended");
        return;
      }
    }

    store.setPhase("connecting");

    // 2. Create RTCPeerConnection
    const pc = new RTCPeerConnection({ iceServers: getIceServers() });
    pcRef.current = pc;

    // Add local tracks
    localStreamRef.current!.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current!);
    });

    // Remote stream
    const remote = new MediaStream();
    setRemoteStream(remote);
    pc.ontrack = (e) => {
      e.streams[0]?.getTracks().forEach((track) => {
        remote.addTrack(track);
      });
    };

    // Connection state
    pc.onconnectionstatechange = () => {
      switch (pc.connectionState) {
        case "connected":
          store.setPhase("connected");
          store.setRemoteConnected(true);
          if (!store.callStartTime) store.setCallStartTime(Date.now());
          break;
        case "disconnected":
        case "failed":
          store.setPhase("reconnecting");
          store.setRemoteConnected(false);
          break;
        case "closed":
          store.setRemoteConnected(false);
          break;
      }
    };

    // 3. Supabase broadcast channel for signaling
    const sigChannel = supabase.channel(`call-signal-${callId}`, {
      config: { broadcast: { self: false } },
    });
    channelRef.current = sigChannel;

    // ICE candidates
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sigChannel.send({
          type: "broadcast",
          event: "ice-candidate",
          payload: { candidate: e.candidate.toJSON(), senderId: myId },
        });
      }
    };

    // Handle negotiation needed (polite peer pattern)
    pc.onnegotiationneeded = async () => {
      try {
        makingOfferRef.current = true;
        await pc.setLocalDescription();
        sigChannel.send({
          type: "broadcast",
          event: "offer",
          payload: { sdp: pc.localDescription, senderId: myId, senderName: myName },
        });
      } catch (err) {
        console.error("Negotiation error:", err);
      } finally {
        makingOfferRef.current = false;
      }
    };

    // Subscribe to signaling events
    sigChannel
      .on("broadcast", { event: "offer" }, async ({ payload }) => {
        if (!pcRef.current || payload.senderId === myId) return;
        const pc = pcRef.current;
        const polite = isPolite(payload.senderId);

        const offerCollision =
          makingOfferRef.current || pc.signalingState !== "stable";

        ignoringOfferRef.current = !polite && offerCollision;
        if (ignoringOfferRef.current) return;

        store.setRemotePeer(payload.senderId, payload.senderName);

        await pc.setRemoteDescription(payload.sdp);
        await pc.setLocalDescription();
        sigChannel.send({
          type: "broadcast",
          event: "answer",
          payload: { sdp: pc.localDescription, senderId: myId },
        });
      })
      .on("broadcast", { event: "answer" }, async ({ payload }) => {
        if (!pcRef.current || payload.senderId === myId) return;
        await pcRef.current.setRemoteDescription(payload.sdp);
      })
      .on("broadcast", { event: "ice-candidate" }, async ({ payload }) => {
        if (!pcRef.current || payload.senderId === myId) return;
        try {
          await pcRef.current.addIceCandidate(payload.candidate);
        } catch (err) {
          if (!ignoringOfferRef.current) console.error("ICE error:", err);
        }
      })
      .on("broadcast", { event: "join" }, async ({ payload }) => {
        if (payload.senderId === myId) return;
        store.setRemotePeer(payload.senderId, payload.senderName);
        // If we're the impolite peer (higher ID), create offer
        if (!isPolite(payload.senderId)) {
          try {
            makingOfferRef.current = true;
            await pc.setLocalDescription();
            sigChannel.send({
              type: "broadcast",
              event: "offer",
              payload: { sdp: pc.localDescription, senderId: myId, senderName: myName },
            });
          } catch (err) {
            console.error("Join offer error:", err);
          } finally {
            makingOfferRef.current = false;
          }
        }
      })
      .on("broadcast", { event: "leave" }, ({ payload }) => {
        if (payload.senderId === myId) return;
        store.setRemoteConnected(false);
        store.setPhase("ended");
      })
      .on("broadcast", { event: "transcript" }, ({ payload }) => {
        if (payload.senderId === myId) return;
        store.addTranscriptEntry(payload.entry);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Announce our presence
          sigChannel.send({
            type: "broadcast",
            event: "join",
            payload: { senderId: myId, senderName: myName },
          });
        }
      });
  }, [myId, myName, callId, supabase, store, isPolite]);

  // Join call
  const joinCall = useCallback(async () => {
    await setupConnection();
  }, [setupConnection]);

  // Leave call
  const leaveCall = useCallback(() => {
    try {
      channelRef.current?.send({
        type: "broadcast",
        event: "leave",
        payload: { senderId: myId },
      });
    } catch { /* channel may already be closed */ }
    cleanup();
    store.setPhase("ended");
  }, [myId, cleanup, store]);

  // Toggle mic
  const toggleMic = useCallback(() => {
    const audioTrack = localStreamRef.current
      ?.getTracks()
      .find((t) => t.kind === "audio");
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      store.toggleMic();
    }
  }, [store]);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    const videoTrack = localStreamRef.current
      ?.getTracks()
      .find((t) => t.kind === "video");
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      store.toggleCamera();
    }
  }, [store]);

  // Screen share
  const startScreenShare = useCallback(async () => {
    if (!pcRef.current) return;
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      screenStreamRef.current = screenStream;
      const screenTrack = screenStream.getVideoTracks()[0];

      // Replace video track in peer connection
      const sender = pcRef.current
        .getSenders()
        .find((s) => s.track?.kind === "video");
      if (sender) {
        await sender.replaceTrack(screenTrack);
      }
      store.setScreenSharing(true);

      // When user stops sharing via browser UI
      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch {
      // User cancelled
    }
  }, [store]);

  const stopScreenShare = useCallback(async () => {
    if (!pcRef.current || !localStreamRef.current) return;
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;

    // Restore camera track
    const cameraTrack = localStreamRef.current
      .getTracks()
      .find((t) => t.kind === "video");
    if (cameraTrack) {
      const sender = pcRef.current
        .getSenders()
        .find((s) => s.track?.kind === "video");
      if (sender) {
        await sender.replaceTrack(cameraTrack);
      }
    }
    store.setScreenSharing(false);
  }, [store]);

  // Broadcast transcript entry to peer
  const broadcastTranscript = useCallback(
    (entry: { speaker_id: string; speaker_name: string; text: string; timestamp_ms: number }) => {
      channelRef.current?.send({
        type: "broadcast",
        event: "transcript",
        payload: { senderId: myId, entry },
      });
    },
    [myId]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    localStream,
    remoteStream,
    joinCall,
    leaveCall,
    toggleMic,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
    broadcastTranscript,
  };
}
