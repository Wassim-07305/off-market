"use client";

import { cn } from "@/lib/utils";
import { useCallStore } from "@/stores/call-store";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  ScrollText,
  StickyNote,
  PhoneOff,
  ClipboardList,
} from "lucide-react";

interface CallControlsProps {
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onToggleTranscript: () => void;
  onToggleNotes?: () => void;
  onTogglePreCallResponses?: () => void;
  onHangUp: () => void;
  showTranscript: boolean;
  showNotes?: boolean;
  showPreCallResponses?: boolean;
  isTranscriptionSupported: boolean;
}

export function CallControls({
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onToggleTranscript,
  onToggleNotes,
  onTogglePreCallResponses,
  onHangUp,
  showTranscript,
  showNotes,
  showPreCallResponses,
  isTranscriptionSupported,
}: CallControlsProps) {
  const { isMicOn, isCameraOn, isScreenSharing, isTranscribing } =
    useCallStore();

  return (
    <div className="flex items-center justify-center gap-2 py-4 px-4 bg-zinc-950/50 backdrop-blur-md">
      {/* Mic */}
      <ControlButton
        onClick={onToggleMic}
        active={isMicOn}
        activeIcon={Mic}
        inactiveIcon={MicOff}
        label={isMicOn ? "Couper le micro" : "Activer le micro"}
        dangerWhenInactive
      />

      {/* Camera */}
      <ControlButton
        onClick={onToggleCamera}
        active={isCameraOn}
        activeIcon={Video}
        inactiveIcon={VideoOff}
        label={isCameraOn ? "Couper la camera" : "Activer la camera"}
        dangerWhenInactive
      />

      {/* Screen share */}
      <ControlButton
        onClick={onToggleScreenShare}
        active={isScreenSharing}
        activeIcon={MonitorOff}
        inactiveIcon={Monitor}
        label={isScreenSharing ? "Arreter le partage" : "Partager l'ecran"}
        highlightWhenActive
      />

      {/* Transcription */}
      {isTranscriptionSupported && (
        <ControlButton
          onClick={onToggleTranscript}
          active={isTranscribing || showTranscript}
          activeIcon={ScrollText}
          inactiveIcon={ScrollText}
          label="Transcription"
          highlightWhenActive
        />
      )}

      {/* Notes */}
      {onToggleNotes && (
        <ControlButton
          onClick={onToggleNotes}
          active={!!showNotes}
          activeIcon={StickyNote}
          inactiveIcon={StickyNote}
          label="Notes de seance"
          highlightWhenActive
        />
      )}

      {/* Pre-call responses (staff only) */}
      {onTogglePreCallResponses && (
        <ControlButton
          onClick={onTogglePreCallResponses}
          active={!!showPreCallResponses}
          activeIcon={ClipboardList}
          inactiveIcon={ClipboardList}
          label="Reponses pre-appel"
          highlightWhenActive
        />
      )}

      {/* Hang up */}
      <button
        onClick={onHangUp}
        className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-all active:scale-90 ml-4"
        title="Raccrocher"
      >
        <PhoneOff className="w-5 h-5" />
      </button>
    </div>
  );
}

function ControlButton({
  onClick,
  active,
  activeIcon: ActiveIcon,
  inactiveIcon: InactiveIcon,
  label,
  dangerWhenInactive,
  highlightWhenActive,
}: {
  onClick: () => void;
  active: boolean;
  activeIcon: React.ComponentType<{ className?: string }>;
  inactiveIcon: React.ComponentType<{ className?: string }>;
  label: string;
  dangerWhenInactive?: boolean;
  highlightWhenActive?: boolean;
}) {
  const Icon = active ? ActiveIcon : InactiveIcon;

  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90",
        !active && dangerWhenInactive
          ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
          : active && highlightWhenActive
            ? "bg-primary/20 text-primary hover:bg-primary/30"
            : "bg-white/10 text-white hover:bg-white/20",
      )}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
