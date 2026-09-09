const SOUND_VERSION = 3; // bump this any time you swap an existing sound file's content

const soundFiles = {
  tick: '/sounds/tick.mp3',
  drumroll: '/sounds/drumroll.mp3',
  revealHit: '/sounds/reveal-hit.mp3',
  eliminatedYou: '/sounds/eliminated-you.wav',
  tie: '/sounds/tie.mp3',
  winner: '/sounds/winner.mp3',
};

// Your recorded spoken-number files, one per countdown second
const countdownNumberFiles = {
  10: '/sounds/Ten.mp3',
  9: '/sounds/Nine.mp3',
  8: '/sounds/Eight.mp3',
  7: '/sounds/Seven.mp3',
  6: '/sounds/Six.mp3',
  5: '/sounds/Five.mp3',
  4: '/sounds/Four.mp3',
  3: '/sounds/Three.mp3',
  2: '/sounds/Two.mp3',
  1: '/sounds/One.mp3',
};

export function playSound(name, { volume = 1, loop = false } = {}) {
  const src = soundFiles[name];
  if (!src) return null;
  const audio = new Audio(`${src}?v=${SOUND_VERSION}`);
  audio.volume = volume;
  audio.loop = loop;
  audio.play().catch(() => {});
  return audio;
}

export function playCountdownNumber(n, { volume = 1 } = {}) {
  const src = countdownNumberFiles[n];
  if (!src) return null;
  const audio = new Audio(`${src}?v=${SOUND_VERSION}`);
  audio.volume = volume;
  audio.play().catch(() => {});
  return audio;
}

export function stopSound(audio) {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}