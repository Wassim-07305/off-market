/**
 * Notification sound utility
 * Uses Web Audio API for reliable cross-browser playback
 */

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return audioContext
}

/**
 * Play a notification sound
 * Uses a synthesized tone for a clean, professional sound
 */
export function playNotificationSound(): void {
  try {
    const ctx = getAudioContext()

    // Resume context if suspended (required for some browsers)
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Pleasant notification tone (two-note chime)
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, ctx.currentTime) // A5
    oscillator.frequency.setValueAtTime(1320, ctx.currentTime + 0.1) // E6

    // Fade in and out for smooth sound
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02)
    gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1)
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.12)
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.3)
  } catch {
    // Silently fail if audio is not available
    console.debug('Notification sound not available')
  }
}
