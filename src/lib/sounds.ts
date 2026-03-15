/**
 * Urgent message sound utility
 * Uses Web Audio API to generate 3 short high-frequency beeps
 */

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    )();
  }
  return audioContext;
}

/**
 * Play an urgent notification sound — 3 short beeps at high frequency.
 * Distinct from the normal notification chime to signal urgency.
 */
export function playUrgentSound(): void {
  try {
    const ctx = getAudioContext();

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const beepCount = 3;
    const beepDuration = 0.12;
    const beepGap = 0.08;
    const frequency = 1760; // A6 — higher than normal notification (880 Hz)

    for (let i = 0; i < beepCount; i++) {
      const startTime = ctx.currentTime + i * (beepDuration + beepGap);

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(frequency, startTime);

      // Sharp attack, quick decay
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.35, startTime + 0.01);
      gainNode.gain.setValueAtTime(0.35, startTime + beepDuration - 0.02);
      gainNode.gain.linearRampToValueAtTime(0, startTime + beepDuration);

      oscillator.start(startTime);
      oscillator.stop(startTime + beepDuration);
    }
  } catch {
    console.debug("Urgent sound not available");
  }
}
