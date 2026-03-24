const MUTE_KEY = 'eco_sound_muted';

let isMuted = localStorage.getItem(MUTE_KEY) === 'true';

export const playSound = (url: string, volume = 0.5) => {
  if (isMuted) return;
  try {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch(e => console.warn("Audio play blocked", e));
  } catch (e) {
    console.warn("Audio error", e);
  }
};

export const toggleMute = () => {
  isMuted = !isMuted;
  localStorage.setItem(MUTE_KEY, String(isMuted));
  return isMuted;
};

export const getMuteState = () => isMuted;
