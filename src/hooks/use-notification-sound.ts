import { useCallback, useRef } from "react";

type NotificationSoundType = "normal" | "urgent";

const STORAGE_KEY = "off-market-notif-sound";

// Categories de notification considerees comme urgentes
const URGENT_NOTIFICATION_TYPES = [
  "alert",
  "urgent_message",
  "urgent",
  "billing",
  "payment_failed",
  "payment_overdue",
];

/**
 * Genere un son de notification normal : carillon doux (haute frequence, court)
 */
function playNormalChime(ctx: AudioContext) {
  const now = ctx.currentTime;

  // Note 1 — mi5
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(659.25, now); // E5
  gain1.gain.setValueAtTime(0.15, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  osc1.connect(gain1).connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.3);

  // Note 2 — sol5 (legere montee pour un effet agreable)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(783.99, now + 0.1); // G5
  gain2.gain.setValueAtTime(0, now);
  gain2.gain.setValueAtTime(0.12, now + 0.1);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
  osc2.connect(gain2).connect(ctx.destination);
  osc2.start(now + 0.1);
  osc2.stop(now + 0.45);
}

/**
 * Genere un son de notification urgente : double bip plus grave et prononce
 */
function playUrgentAlert(ctx: AudioContext) {
  const now = ctx.currentTime;

  for (let i = 0; i < 3; i++) {
    const offset = i * 0.18;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(440, now + offset); // A4
    gain.gain.setValueAtTime(0.1, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + offset);
    osc.stop(now + offset + 0.12);
  }
}

/**
 * Verifie si le mode "Ne pas deranger" est actif
 * selon les preferences stockees dans localStorage.
 */
function isDndActive(): boolean {
  try {
    const stored = localStorage.getItem("off-market-notif-matrix");
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    if (!parsed.dndEnabled) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = (parsed.dndStart as string).split(":").map(Number);
    const [endH, endM] = (parsed.dndEnd as string).split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    // Gestion du cas ou la plage traverse minuit (ex: 22:00 -> 08:00)
    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } catch {
    return false;
  }
}

/**
 * Verifie si le son des notifications est active dans les preferences utilisateur.
 */
function isSoundEnabled(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return true; // Active par defaut
    return JSON.parse(stored) === true;
  } catch {
    return true;
  }
}

/**
 * Determine si une notification est urgente en se basant sur son type et sa categorie.
 */
export function isUrgentNotification(type: string, category?: string): boolean {
  return (
    URGENT_NOTIFICATION_TYPES.includes(type) ||
    URGENT_NOTIFICATION_TYPES.includes(category ?? "")
  );
}

/**
 * Hook pour jouer un son de notification differencie (normal vs urgent).
 *
 * Respecte :
 * - Le mode Ne pas deranger (DND) stocke dans localStorage
 * - Les preferences de son (mute/unmute)
 * - Les permissions audio du navigateur (AudioContext)
 */
export function useNotificationSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback((): AudioContext | null => {
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new AudioContext();
      }
      // Resume si le contexte est suspendu (politique autoplay du navigateur)
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }, []);

  const playSound = useCallback(
    (type: NotificationSoundType = "normal") => {
      // Ne pas jouer si le son est desactive
      if (!isSoundEnabled()) return;

      // Ne pas jouer en mode Ne pas deranger
      if (isDndActive()) return;

      const ctx = getAudioContext();
      if (!ctx) return;

      if (type === "urgent") {
        playUrgentAlert(ctx);
      } else {
        playNormalChime(ctx);
      }
    },
    [getAudioContext],
  );

  const setSoundEnabled = useCallback((enabled: boolean) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enabled));
  }, []);

  const soundEnabled = isSoundEnabled();

  return {
    /** Joue le son de notification (normal ou urgent) */
    playSound,
    /** Active/desactive le son des notifications */
    setSoundEnabled,
    /** Indique si le son est actuellement active */
    soundEnabled,
    /** Determine si un type de notif est urgent */
    isUrgent: isUrgentNotification,
  };
}
