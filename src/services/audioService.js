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
let _initialized = false;

export async function initAudio() {
  if (_initialized) return;
  _initialized = true;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
    // Preload all sounds once
    for (const [name, src] of Object.entries(SOUNDS)) {
      try {
        const { sound } = await Audio.Sound.createAsync(src, { volume: 0.7 });
        _soundCache[name] = sound;
      } catch (_) {}
    }
  } catch (_) {}
}

export async function playSound(name) {
  if (_muted) return;
  try {
    const sound = _soundCache[name];
    if (!sound) return;
    await sound.setPositionAsync(0);
    await sound.playAsync();
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
