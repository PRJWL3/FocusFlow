// Web Audio API & Media Ambient Sound Synthesizer (Extracted YouTube Rain, Procedural Droplets, Brown Noise, Stream, White Noise)

let ambientCtx = null;
let activeSource = null;
let masterGain = null;
let currentTrack = null;
let filterNodes = [];
let audioElement = null;

const getAmbientContext = () => {
  if (!ambientCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      ambientCtx = new AudioContextClass();
    }
  }
  if (ambientCtx && ambientCtx.state === 'suspended') {
    ambientCtx.resume();
  }
  return ambientCtx;
};

// Pink noise algorithm (Paul Kellet's filter) for organic rain background
const createPinkNoiseGenerator = () => {
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  return () => {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    b6 = white * 0.115926;
    return pink * 0.12;
  };
};

/**
 * Creates authentic procedural rain sound:
 * 1. High-passed constant drizzle bed (eliminates windy low-end rumble)
 * 2. Over 1,500 distinct procedural raindrop transients (pitter-patter droplet clicks & puddle plops)
 * 3. Spatialized stereo distribution
 */
const createRealisticRainBuffer = (ctx, durationSec = 6) => {
  const sampleRate = ctx.sampleRate;
  const bufferSize = sampleRate * durationSec;
  const buffer = ctx.createBuffer(2, bufferSize, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const getPinkL = createPinkNoiseGenerator();
  const getPinkR = createPinkNoiseGenerator();

  // 1. Generate gentle continuous rainfall bed (high-passed to remove windy whooshes)
  let lastL = 0, lastR = 0;
  for (let i = 0; i < bufferSize; i++) {
    const rawL = getPinkL();
    const rawR = getPinkR();
    
    const hpL = rawL - lastL * 0.88;
    const hpR = rawR - lastR * 0.88;
    lastL = rawL;
    lastR = rawR;

    left[i] = hpL * 0.35;
    right[i] = hpR * 0.35;
  }

  // 2. Synthesize individual raindrop impacts (the distinct pitter-patter sound of real rain)
  const totalDrops = Math.floor(durationSec * 260);

  for (let d = 0; d < totalDrops; d++) {
    const startSample = Math.floor(Math.random() * (bufferSize - 4000));
    const isPuddlePlop = Math.random() < 0.15;
    
    const freq = isPuddlePlop 
      ? 650 + Math.random() * 450 
      : 1400 + Math.random() * 2400;

    const decaySec = isPuddlePlop 
      ? 0.025 + Math.random() * 0.02 
      : 0.007 + Math.random() * 0.018;
    const dropLengthSamples = Math.floor(sampleRate * decaySec * 3.5);

    const amp = isPuddlePlop 
      ? 0.15 + Math.random() * 0.18 
      : 0.08 + Math.random() * 0.14;

    const pan = Math.random();
    const leftGain = Math.cos(pan * Math.PI * 0.5);
    const rightGain = Math.sin(pan * Math.PI * 0.5);

    for (let s = 0; s < dropLengthSamples; s++) {
      const idx = startSample + s;
      if (idx >= bufferSize) break;

      const t = s / sampleRate;
      const resonance = Math.sin(2 * Math.PI * freq * t);
      const noiseClick = (Math.random() * 2 - 1) * 0.4;
      const envelope = Math.exp(-t / decaySec);

      const dropSample = (resonance * 0.7 + noiseClick) * envelope * amp;

      left[idx] += dropSample * leftGain;
      right[idx] += dropSample * rightGain;
    }
  }

  for (let i = 0; i < bufferSize; i++) {
    left[i] = Math.tanh(left[i] * 1.2);
    right[i] = Math.tanh(right[i] * 1.2);
  }

  return buffer;
};

// Generate buffer of brown noise (deep focus rumble)
const createBrownNoiseBuffer = (ctx, durationSec = 5) => {
  const bufferSize = ctx.sampleRate * durationSec;
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const output = buffer.getChannelData(channel);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }
  }
  return buffer;
};

// Generate buffer of white noise
const createWhiteNoiseBuffer = (ctx, durationSec = 5) => {
  const bufferSize = ctx.sampleRate * durationSec;
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const output = buffer.getChannelData(channel);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.2;
    }
  }
  return buffer;
};

export const AMBIENT_SOUNDS = [
  { id: 'off', name: 'None', icon: 'VolumeX' },
  { id: 'rain', name: 'Rain & Distant Thunder (Live Stream Audio)', icon: 'CloudRain', desc: 'Real rain & gentle thunder from ASMR stream' },
  { id: 'stream', name: 'Forest Stream', icon: 'Droplets', desc: 'Flowing water and natural ambiance' },
  { id: 'brown', name: 'Brown Noise', icon: 'Waves', desc: 'Warm deep rumble for deep concentration' },
  { id: 'white', name: 'White Noise', icon: 'Wind', desc: 'Crisp static to mask background chatter' },
];

export const playAmbient = (type, volume = 0.5) => {
  stopAmbient();

  if (!type || type === 'off') {
    currentTrack = null;
    return;
  }

  // 1. YouTube-extracted authentic Rain & Thunder track
  if (type === 'rain') {
    try {
      if (!audioElement) {
        const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL)
          ? (import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`)
          : './';
        audioElement = new Audio(`${baseUrl}audio/rain_thunder.mp3`);
        audioElement.loop = true;
      }
      audioElement.volume = Math.max(0, Math.min(1, volume * 0.85));
      audioElement.play().catch(e => {
        console.warn('Audio play request prevented by browser or missing file', e);
      });
      currentTrack = type;
      return;
    } catch (e) {
      console.warn('Failed to play audio element', e);
    }
  }

  // 2. Web Audio API synthesized procedural sounds
  const ctx = getAmbientContext();
  if (!ctx) return;

  masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume * 0.45, ctx.currentTime);
  masterGain.connect(ctx.destination);

  let sourceNode = ctx.createBufferSource();
  sourceNode.loop = true;
  filterNodes = [];

  if (type === 'brown') {
    sourceNode.buffer = createBrownNoiseBuffer(ctx, 4);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);
    sourceNode.connect(filter);
    filter.connect(masterGain);
    filterNodes = [filter];
  } else if (type === 'stream') {
    sourceNode.buffer = createBrownNoiseBuffer(ctx, 4);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.3, ctx.currentTime);
    lfoGain.gain.setValueAtTime(300, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    sourceNode.connect(filter);
    filter.connect(masterGain);
    filterNodes = [filter, lfo];
  } else {
    // White noise
    sourceNode.buffer = createWhiteNoiseBuffer(ctx, 4);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3500, ctx.currentTime);
    sourceNode.connect(filter);
    filter.connect(masterGain);
    filterNodes = [filter];
  }

  sourceNode.start();
  activeSource = sourceNode;
  currentTrack = type;
};

export const setAmbientVolume = (vol) => {
  if (audioElement) {
    audioElement.volume = Math.max(0, Math.min(1, vol * 0.85));
  }
  if (masterGain && ambientCtx) {
    masterGain.gain.setTargetAtTime(vol * 0.45, ambientCtx.currentTime, 0.05);
  }
};

export const stopAmbient = () => {
  if (audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;
  }
  if (activeSource) {
    try {
      activeSource.stop();
      activeSource.disconnect();
    } catch (e) {}
    activeSource = null;
  }
  if (filterNodes.length > 0) {
    filterNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        node.disconnect();
      } catch (e) {}
    });
    filterNodes = [];
  }
  currentTrack = null;
};

export const getCurrentAmbient = () => currentTrack;
