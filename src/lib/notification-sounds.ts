/**
 * Notification sound manager — sons differencies par type de notification.
 *
 * Utilise l'API Web Audio pour generer des tonalites programmatiques
 * (aucun fichier audio requis).
 */

// ─── Types ───────────────────────────────────────────
export type NotificationSoundType =
  | "default"
  | "urgent"
  | "message"
  | "achievement"
  | "reminder"
  | "call";

export const SOUND_TYPE_LABELS: Record<NotificationSoundType, string> = {
  default: "Par defaut",
  urgent: "Urgent",
  message: "Message",
  achievement: "Succes",
  reminder: "Rappel",
  call: "Appel",
};

export const SOUND_TYPE_DESCRIPTIONS: Record<NotificationSoundType, string> = {
  default: "Bip court standard",
  urgent: "Double bip rapide aigu",
  message: "Carillon doux (accord)",
  achievement: "Jingle ascendant 3 notes",
  reminder: "Ding leger avec decroissance",
  call: "Sonnerie d'appel alternee",
};

// ─── Preferences (localStorage) ──────────────────────
const STORAGE_KEY = "off-market-sound-prefs";

export interface SoundPreferences {
  enabled: boolean;
  volume: number; // 0–1
  perType: Record<NotificationSoundType, boolean>;
}

const DEFAULT_PREFS: SoundPreferences = {
  enabled: true,
  volume: 0.5,
  perType: {
    default: true,
    urgent: true,
    message: true,
    achievement: true,
    reminder: true,
    call: true,
  },
};

export function loadSoundPreferences(): SoundPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw);
    return {
      enabled: parsed.enabled ?? true,
      volume: typeof parsed.volume === "number" ? parsed.volume : 0.5,
      perType: { ...DEFAULT_PREFS.perType, ...(parsed.perType ?? {}) },
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function saveSoundPreferences(prefs: SoundPreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

// ─── DND check ───────────────────────────────────────
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

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } catch {
    return false;
  }
}

// Also check the simple DND toggle
function isDndToggleActive(): boolean {
  try {
    const raw = localStorage.getItem("off-market-dnd");
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!parsed.enabled) return false;
    // If it has an expiry, check it
    if (parsed.until && new Date(parsed.until).getTime() < Date.now()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// ─── Audio context singleton ─────────────────────────
let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!audioCtx || audioCtx.state === "closed") {
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

// ─── Sound generators ────────────────────────────────

function createOsc(
  ctx: AudioContext,
  freq: number,
  type: OscillatorType,
  startTime: number,
  duration: number,
  volume: number,
  envelope?: { attack?: number; decay?: number },
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  osc.connect(gain);
  gain.connect(ctx.destination);

  const attack = envelope?.attack ?? 0.01;
  const decay = envelope?.decay ?? duration - attack;

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + attack);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + attack + decay);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

/** default: simple short beep (440Hz, 200ms) */
function playDefault(ctx: AudioContext, volume: number) {
  const t = ctx.currentTime;
  createOsc(ctx, 440, "sine", t, 0.2, volume * 0.3);
}

/** urgent: rapid double beep (880Hz, 100ms x2, higher pitch) */
function playUrgent(ctx: AudioContext, volume: number) {
  const t = ctx.currentTime;
  createOsc(ctx, 880, "square", t, 0.1, volume * 0.2);
  createOsc(ctx, 880, "square", t + 0.15, 0.1, volume * 0.2);
}

/** message: soft chime (523Hz + 659Hz chord, 300ms) */
function playMessage(ctx: AudioContext, volume: number) {
  const t = ctx.currentTime;
  createOsc(ctx, 523.25, "sine", t, 0.3, volume * 0.2, { decay: 0.28 });
  createOsc(ctx, 659.25, "sine", t, 0.3, volume * 0.15, { decay: 0.28 });
}

/** achievement: ascending 3-note jingle (440 -> 554 -> 659, 150ms each) */
function playAchievement(ctx: AudioContext, volume: number) {
  const t = ctx.currentTime;
  createOsc(ctx, 440, "sine", t, 0.15, volume * 0.2);
  createOsc(ctx, 554.37, "sine", t + 0.16, 0.15, volume * 0.22);
  createOsc(ctx, 659.25, "sine", t + 0.32, 0.25, volume * 0.25, {
    decay: 0.22,
  });
}

/** reminder: gentle ding (330Hz, 400ms with decay) */
function playReminder(ctx: AudioContext, volume: number) {
  const t = ctx.currentTime;
  createOsc(ctx, 330, "sine", t, 0.4, volume * 0.25, {
    attack: 0.005,
    decay: 0.38,
  });
}

/** call: phone ring pattern (440Hz + 480Hz alternating, 500ms on/off x3) */
function playCall(ctx: AudioContext, volume: number) {
  const t = ctx.currentTime;
  for (let i = 0; i < 3; i++) {
    const offset = i * 0.7; // 500ms on + 200ms off
    createOsc(ctx, 440, "sine", t + offset, 0.35, volume * 0.15);
    createOsc(ctx, 480, "sine", t + offset, 0.35, volume * 0.15);
  }
}

const SOUND_PLAYERS: Record<
  NotificationSoundType,
  (ctx: AudioContext, volume: number) => void
> = {
  default: playDefault,
  urgent: playUrgent,
  message: playMessage,
  achievement: playAchievement,
  reminder: playReminder,
  call: playCall,
};

// ─── Public API ──────────────────────────────────────

/**
 * Joue un son de notification selon le type.
 * Respecte le volume, les preferences par type, et le mode DND.
 */
export function playNotificationSound(
  type: NotificationSoundType = "default",
): void {
  // Verifier DND
  if (isDndActive() || isDndToggleActive()) return;

  const prefs = loadSoundPreferences();
  if (!prefs.enabled) return;
  if (!prefs.perType[type]) return;

  const ctx = getCtx();
  if (!ctx) return;

  try {
    const player = SOUND_PLAYERS[type] ?? SOUND_PLAYERS.default;
    player(ctx, prefs.volume);
  } catch {
    console.debug("Notification sound playback failed");
  }
}

/**
 * Joue un son de preview (ignore DND et enable global, respecte seulement le volume).
 */
export function previewNotificationSound(
  type: NotificationSoundType,
  volume?: number,
): void {
  const ctx = getCtx();
  if (!ctx) return;

  try {
    const prefs = loadSoundPreferences();
    const vol = volume ?? prefs.volume;
    const player = SOUND_PLAYERS[type] ?? SOUND_PLAYERS.default;
    player(ctx, vol);
  } catch {
    console.debug("Sound preview failed");
  }
}

// ─── Notification type → Sound type mapping ──────────

const NOTIFICATION_SOUND_MAP: Record<string, NotificationSoundType> = {
  // Urgent
  flag_change: "urgent",
  alert: "urgent",
  urgent_message: "urgent",
  urgent: "urgent",
  billing: "urgent",
  payment_failed: "urgent",
  payment_overdue: "urgent",

  // Message
  message: "message",
  mention: "message",
  new_message: "message",
  dm: "message",

  // Achievement
  badge: "achievement",
  level_up: "achievement",
  challenge: "achievement",
  challenge_completed: "achievement",
  badge_earned: "achievement",
  xp_gained: "achievement",

  // Reminder
  call_reminder: "reminder",
  session_reminder: "reminder",
  reminder: "reminder",
  task_due: "reminder",

  // Call
  incoming_call: "call",
  call_incoming: "call",
};

/**
 * Determine le type de son a jouer pour une notification donnee.
 */
export function getSoundTypeForNotification(
  notificationType: string,
  category?: string,
): NotificationSoundType {
  // Check direct type match
  if (NOTIFICATION_SOUND_MAP[notificationType]) {
    return NOTIFICATION_SOUND_MAP[notificationType];
  }
  // Check category
  if (category && NOTIFICATION_SOUND_MAP[category]) {
    return NOTIFICATION_SOUND_MAP[category];
  }
  return "default";
}
