"use client";

import { create } from "zustand";
import type { TranscriptEntry } from "@/types/calls";

export type CallPhase =
  | "idle"
  | "joining"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "ended";

interface CallState {
  // Phase
  phase: CallPhase;
  setPhase: (phase: CallPhase) => void;

  // Media toggles
  isMicOn: boolean;
  toggleMic: () => void;
  isCameraOn: boolean;
  toggleCamera: () => void;
  isScreenSharing: boolean;
  setScreenSharing: (v: boolean) => void;

  // Transcription
  isTranscribing: boolean;
  setTranscribing: (v: boolean) => void;
  transcriptEntries: TranscriptEntry[];
  addTranscriptEntry: (entry: TranscriptEntry) => void;

  // Remote peer
  remoteUserId: string | null;
  remoteUserName: string | null;
  isRemoteConnected: boolean;
  setRemotePeer: (id: string | null, name: string | null) => void;
  setRemoteConnected: (v: boolean) => void;

  // Call timing
  callStartTime: number | null;
  setCallStartTime: (t: number | null) => void;

  // Incoming call notification
  incomingCallId: string | null;
  incomingCallerName: string | null;
  setIncomingCall: (callId: string | null, callerName: string | null) => void;

  // Reset
  resetCall: () => void;
}

const initialState = {
  phase: "idle" as CallPhase,
  isMicOn: true,
  isCameraOn: true,
  isScreenSharing: false,
  isTranscribing: false,
  transcriptEntries: [] as TranscriptEntry[],
  remoteUserId: null as string | null,
  remoteUserName: null as string | null,
  isRemoteConnected: false,
  callStartTime: null as number | null,
  incomingCallId: null as string | null,
  incomingCallerName: null as string | null,
};

export const useCallStore = create<CallState>((set) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),

  toggleMic: () => set((s) => ({ isMicOn: !s.isMicOn })),
  toggleCamera: () => set((s) => ({ isCameraOn: !s.isCameraOn })),
  setScreenSharing: (v) => set({ isScreenSharing: v }),

  setTranscribing: (v) => set({ isTranscribing: v }),
  addTranscriptEntry: (entry) =>
    set((s) => ({ transcriptEntries: [...s.transcriptEntries, entry] })),

  setRemotePeer: (id, name) => set({ remoteUserId: id, remoteUserName: name }),
  setRemoteConnected: (v) => set({ isRemoteConnected: v }),

  setCallStartTime: (t) => set({ callStartTime: t }),

  setIncomingCall: (callId, callerName) =>
    set({ incomingCallId: callId, incomingCallerName: callerName }),

  resetCall: () => set(initialState),
}));
