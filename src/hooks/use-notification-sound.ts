import { useCallback, useState } from "react";
import {
  type NotificationSoundType,
  type SoundPreferences,
  loadSoundPreferences,
  saveSoundPreferences,
  playNotificationSound,
  previewNotificationSound,
  getSoundTypeForNotification,
} from "@/lib/notification-sounds";

/**
 * Determine si une notification est urgente en se basant sur son type et sa catégorie.
 */
export function isUrgentNotification(type: string, category?: string): boolean {
  return getSoundTypeForNotification(type, category) === "urgent";
}

/**
 * Hook pour jouer des sons de notification differencies.
 *
 * Gere 6 types de sons : default, urgent, message, achievement, reminder, call.
 * Respecte le mode DND, les preferences de volume et les activations par type.
 */
export function useNotificationSound() {
  const [prefs, setPrefs] = useState<SoundPreferences>(loadSoundPreferences);

  const refreshPrefs = useCallback(() => {
    setPrefs(loadSoundPreferences());
  }, []);

  const playSound = useCallback(
    (type: NotificationSoundType | "normal" = "default") => {
      // Backward compatibility: "normal" → "default"
      const resolved = type === "normal" ? "default" : type;
      playNotificationSound(resolved);
    },
    [],
  );

  const playSoundForNotification = useCallback(
    (notificationType: string, category?: string) => {
      const soundType = getSoundTypeForNotification(notificationType, category);
      playNotificationSound(soundType);
    },
    [],
  );

  const preview = useCallback(
    (type: NotificationSoundType) => {
      previewNotificationSound(type, prefs.volume);
    },
    [prefs.volume],
  );

  const setSoundEnabled = useCallback(
    (enabled: boolean) => {
      const updated = { ...prefs, enabled };
      saveSoundPreferences(updated);
      setPrefs(updated);
    },
    [prefs],
  );

  const setVolume = useCallback(
    (volume: number) => {
      const clamped = Math.max(0, Math.min(1, volume));
      const updated = { ...prefs, volume: clamped };
      saveSoundPreferences(updated);
      setPrefs(updated);
    },
    [prefs],
  );

  const setTypeEnabled = useCallback(
    (type: NotificationSoundType, enabled: boolean) => {
      const updated = {
        ...prefs,
        perType: { ...prefs.perType, [type]: enabled },
      };
      saveSoundPreferences(updated);
      setPrefs(updated);
    },
    [prefs],
  );

  return {
    /** Joue le son correspondant au type donne */
    playSound,
    /** Joue le son adapte a un type/catégorie de notification */
    playSoundForNotification,
    /** Joue un aperçu d'un type de son (ignore DND) */
    preview,
    /** Active/desactive le son globalement */
    setSoundEnabled,
    /** Ajuste le volume (0-1) */
    setVolume,
    /** Active/desactive un type de son specifique */
    setTypeEnabled,
    /** Recharge les preferences depuis localStorage */
    refreshPrefs,
    /** Indique si le son est active globalement */
    soundEnabled: prefs.enabled,
    /** Volume actuel (0-1) */
    volume: prefs.volume,
    /** Etat d'activation par type */
    perType: prefs.perType,
    /** Determine si un type de notif est urgent */
    isUrgent: isUrgentNotification,
  };
}
