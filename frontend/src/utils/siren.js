/**
 * Web Audio API siren generator.
 * Avoids shipping a binary .wav in the repo while still producing a
 * recognisable, attention-grabbing emergency tone on demand.
 */

let ctx = null;
let intervalId = null;
let oscillators = [];

function getCtx() {
  if (!ctx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

export function primeAudio() {
  // Call from a user gesture (button click) so the browser unlocks audio.
  const c = getCtx();
  if (c && c.state === 'suspended') c.resume();
}

export function startSiren() {
  primeAudio();
  const c = getCtx();
  if (!c) return;

  stopSiren(); // idempotent

  const playBurst = () => {
    const now = c.currentTime;
    const osc1 = c.createOscillator();
    const osc2 = c.createOscillator();
    const gain = c.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(560, now);
    osc1.frequency.linearRampToValueAtTime(880, now + 0.45);
    osc1.frequency.linearRampToValueAtTime(560, now + 0.9);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(280, now);
    osc2.frequency.linearRampToValueAtTime(440, now + 0.45);
    osc2.frequency.linearRampToValueAtTime(280, now + 0.9);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(c.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.0);
    osc2.stop(now + 1.0);

    oscillators.push(osc1, osc2);
  };

  playBurst();
  intervalId = setInterval(playBurst, 1100);
}

export function stopSiren() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  oscillators.forEach((o) => {
    try {
      o.stop();
    } catch {
      // already stopped
    }
  });
  oscillators = [];
}
