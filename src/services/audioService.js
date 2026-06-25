import { Audio } from 'expo-av';
import { Platform } from 'react-native';

const SOUNDS = {
  click:   require('../../assets/Sounds/click.mp3'),
  correct: require('../../assets/Sounds/correct.wav'),
  wrong:   require('../../assets/Sounds/wrong.wav'),
};

const MUSIC = {
  map:     require('../../assets/Audio/map-music.mp3'),
  ambient: require('../../assets/Audio/ambient.mp3'),
};

let _music = null;
let _muted = false;
const _soundCache = {};

export async function initAudio() {
  if (Platform.OS === 'web') return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
  } catch (_) {}
}

// On web/iOS Safari: use HTMLAudioElement directly — synchronous, works inside tap gesture.
// On native: use expo-av with lazy load on first call.
export async function playSound(name) {
  if (_muted) return;

  if (Platform.OS === 'web') {
    try {
      const src = SOUNDS[name];
      if (!src) return;
      const audio = new window.Audio(src);
      audio.volume = 0.7;
      audio.play().catch(() => {});
    } catch (_) {}
    return;
  }

  try {
    if (!_soundCache[name]) {
      const src = SOUNDS[name];
      if (!src) return;
      const { sound } = await Audio.Sound.createAsync(src, { volume: 0.7 });
      _soundCache[name] = sound;
      await sound.playAsync();
    } else {
      await _soundCache[name].replayAsync();
    }
  } catch (_) {}
}

export async function startMusic(name) {
  if (_muted) return;
  try {
    await stopMusic();
    const src = MUSIC[name];
    if (!src) return;
    const { sound } = await Audio.Sound.createAsync(src, {
      isLooping: true,
      volume: Platform.OS === 'web' ? 0.25 : 0.3,
    });
    _music = sound;
    await sound.playAsync();
  } catch (_) {}
}

export async function stopMusic() {
  try {
    if (_music) {
      await _music.stopAsync();
      await _music.unloadAsync();
      _music = null;
    }
  } catch (_) {}
}

export function setMuted(val) {
  _muted = val;
  if (val) stopMusic();
}

export function isMuted() { return _muted; }
