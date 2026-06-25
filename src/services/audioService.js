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

export async function initAudio() {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
  } catch (_) {}
}

export async function playSound(name) {
  if (_muted) return;
  try {
    const src = SOUNDS[name];
    if (!src) return;
    const { sound } = await Audio.Sound.createAsync(src, { volume: 0.7 });
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate(status => {
      if (status.didJustFinish) sound.unloadAsync();
    });
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
