import type { MediaItem } from './media';
import type { EffectId, Mood, Settings, TransitionPreference, TransitionStyle } from './templates';

export type Scene = { item: MediaItem; start: number; duration: number };
export type RenderStatus = {
  stage: string;
  elapsed: number;
  result?: {
    url: string;
    extension: string;
    mime: string;
    duration: number | null;
    width: number;
    height: number;
    hasAudio: boolean;
  };
  error?: string;
};

export const moods: Mood[] = ['Cinematic', 'Romantic', 'Happy & Energetic', 'Travel Adventure', 'Nostalgic', 'Family & Memories', 'Epic', 'Minimal & Elegant', 'Dreamy', 'Professional Cut'];
type MotionStyle = 'push' | 'pan' | 'float' | 'sweep' | 'still';
export type MoodEffectProfile = {
  tint: string;
  tintAmount: number;
  vignette: number;
  grain: number;
  glow: number;
  lightLeak: number;
  dust: number;
  letterbox: number;
  transition: TransitionStyle | 'none';
  transitionSeconds: number;
  zoom: number;
  driftX: number;
  driftY: number;
  motion: MotionStyle;
  professional?: boolean;
};

export const moodNotes: Record<Mood, { grade: string; motion: string; transition: string; filter: string; effects: string[] }> = {
  Cinematic: { grade: 'Warm shadows · restrained contrast', motion: 'Slow push-in', transition: 'Soft crossfade', filter: 'sepia(.11) saturate(.86) contrast(1.08)', effects: ['Split-tone grade', 'Fine film grain', 'Anamorphic matte', 'Soft vignette'] },
  Romantic: { grade: 'Rose warmth · lifted highlights', motion: 'Gentle drift', transition: 'Rose light-leak dissolve', filter: 'sepia(.13) saturate(1.12) hue-rotate(335deg)', effects: ['Rose highlight bloom', 'Floating camera drift', 'Moving light leak', 'Soft vignette'] },
  'Happy & Energetic': { grade: 'Bright color · lively contrast', motion: 'Quick, measured push', transition: 'Rhythmic flash cut', filter: 'saturate(1.25) contrast(1.06)', effects: ['Vivid color grade', 'Rhythmic push-in', 'Soft highlight flash', 'Bright edge glow'] },
  'Travel Adventure': { grade: 'Sunlit amber · vivid skies', motion: 'Wide exploratory pan', transition: 'Directional wipe', filter: 'saturate(1.12) sepia(.08)', effects: ['Sun-kissed split tone', 'Wide exploratory pan', 'Moving lens flare', 'Dust motes', 'Directional wipe'] },
  Nostalgic: { grade: 'Faded film · amber grain', motion: 'Still frame with breathing zoom', transition: 'Super-8 film burn', filter: 'sepia(.28) saturate(.7) contrast(.94)', effects: ['Faded print grade', 'Super-8 grain', 'Gate weave', 'Amber film burn', 'Soft vignette'] },
  'Family & Memories': { grade: 'Soft skin tones · natural warmth', motion: 'Tender slow zoom', transition: 'Gentle cross-dissolve', filter: 'sepia(.07) saturate(.92)', effects: ['Natural warm grade', 'Skin-friendly highlights', 'Slow Ken Burns move', 'Gentle cross-dissolve'] },
  Epic: { grade: 'Deep blacks · bold highlights', motion: 'Broad cinematic sweep', transition: 'Zoom-impact transition', filter: 'contrast(1.24) saturate(.9)', effects: ['Deep contrast grade', 'Monumental sweep', 'Anamorphic matte', 'Zoom-impact transition', 'Edge vignette'] },
  'Minimal & Elegant': { grade: 'Quiet color · clean detail', motion: 'Almost-still, precise', transition: 'Measured fade', filter: 'saturate(.72) contrast(1.04)', effects: ['Muted color palette', 'Precision push-in', 'Quiet vignette', 'Measured soft fade'] },
  Dreamy: { grade: 'Hazy light · softened color', motion: 'Floating drift', transition: 'Luminous bloom dissolve', filter: 'saturate(.86) brightness(1.06) blur(.15px)', effects: ['Pastel diffusion', 'Luminous highlight bloom', 'Floating camera drift', 'Flowing light leak'] },
  'Professional Cut': { grade: 'Natural color · crisp detail', motion: 'Dynamic horizontal, vertical & diagonal pans', transition: 'Beat-synced random transitions', filter: 'none', effects: ['Dynamic camera movement', 'Beat-synced combined transitions'] },
};

export const moodEffects: Record<Mood, MoodEffectProfile> = {
  Cinematic: { tint: '224,163,105', tintAmount: .055, vignette: .38, grain: .035, glow: .075, lightLeak: .025, dust: 0, letterbox: .035, transition: 'crossfade', transitionSeconds: .58, zoom: .034, driftX: .005, driftY: .002, motion: 'push' },
  Romantic: { tint: '239,153,184', tintAmount: .075, vignette: .24, grain: .012, glow: .2, lightLeak: .15, dust: 0, letterbox: .024, transition: 'light-leak', transitionSeconds: .76, zoom: .026, driftX: .012, driftY: .009, motion: 'float' },
  'Happy & Energetic': { tint: '255,234,190', tintAmount: .012, vignette: .12, grain: 0, glow: .13, lightLeak: .025, dust: 0, letterbox: 0, transition: 'flash-cut', transitionSeconds: .24, zoom: .058, driftX: .018, driftY: .004, motion: 'pan' },
  'Travel Adventure': { tint: '255,182,91', tintAmount: .055, vignette: .23, grain: .014, glow: .105, lightLeak: .085, dust: .42, letterbox: 0, transition: 'wipe', transitionSeconds: .72, zoom: .046, driftX: .045, driftY: .008, motion: 'pan' },
  Nostalgic: { tint: '199,132,75', tintAmount: .075, vignette: .37, grain: .075, glow: .045, lightLeak: .09, dust: .72, letterbox: .018, transition: 'film-burn', transitionSeconds: .7, zoom: .022, driftX: .004, driftY: .003, motion: 'float' },
  'Family & Memories': { tint: '255,210,157', tintAmount: .045, vignette: .2, grain: .008, glow: .075, lightLeak: .02, dust: 0, letterbox: .016, transition: 'crossfade', transitionSeconds: .62, zoom: .028, driftX: .006, driftY: .003, motion: 'push' },
  Epic: { tint: '218,181,129', tintAmount: .026, vignette: .43, grain: .024, glow: .11, lightLeak: .035, dust: 0, letterbox: .052, transition: 'zoom-impact', transitionSeconds: .38, zoom: .078, driftX: .052, driftY: .008, motion: 'sweep' },
  'Minimal & Elegant': { tint: '221,229,240', tintAmount: .01, vignette: .14, grain: 0, glow: .025, lightLeak: 0, dust: 0, letterbox: 0, transition: 'soft-fade', transitionSeconds: .42, zoom: .012, driftX: .002, driftY: .001, motion: 'push' },
  Dreamy: { tint: '195,185,246', tintAmount: .06, vignette: .25, grain: .018, glow: .23, lightLeak: .115, dust: .1, letterbox: .018, transition: 'bloom', transitionSeconds: .78, zoom: .026, driftX: .015, driftY: .01, motion: 'float' },
  'Professional Cut': { tint: '255,255,255', tintAmount: 0, vignette: 0, grain: 0, glow: 0, lightLeak: 0, dust: 0, letterbox: 0, transition: 'random', transitionSeconds: .55, zoom: 0, driftX: .055, driftY: .045, motion: 'pan', professional: true },
};

export const effectOptions: { id: EffectId; label: string; detail: string }[] = [
  { id: 'colorGrade', label: 'Mood color grade', detail: 'Preset color and tone' },
  { id: 'cameraMove', label: 'Camera movement', detail: 'Slow pan, push, or drift' },
  { id: 'vignette', label: 'Vignette', detail: 'Soft edge shading' },
  { id: 'filmGrain', label: 'Film grain', detail: 'Fine moving texture' },
  { id: 'glow', label: 'Highlight bloom', detail: 'Soft light around highlights' },
  { id: 'lightLeak', label: 'Light leaks', detail: 'Subtle drifting flare' },
  { id: 'dust', label: 'Dust & scratches', detail: 'Film texture where the mood uses it' },
  { id: 'letterbox', label: 'Cinema matte', detail: 'Widescreen top and bottom bars' },
];

export const transitionOptions: { value: TransitionPreference; label: string }[] = [
  { value: 'mood', label: 'Mood default' },
  { value: 'none', label: 'No transition' },
  { value: 'crossfade', label: 'Cross-dissolve' },
  { value: 'wipe', label: 'Directional wipe' },
  { value: 'luma-wipe', label: 'Soft luma wipe' },
  { value: 'light-leak', label: 'Light-leak dissolve' },
  { value: 'film-burn', label: 'Film burn' },
  { value: 'flash-cut', label: 'Soft flash cut' },
  { value: 'zoom-impact', label: 'Zoom impact' },
  { value: 'zoom-blur', label: 'Zoom blur' },
  { value: 'soft-fade', label: 'Soft fade' },
  { value: 'fade-into', label: 'Fade into next' },
  { value: 'bloom', label: 'Luminous bloom' },
  { value: 'slide', label: 'Motion slide' },
  { value: 'whip-pan', label: 'Whip pan' },
  { value: 'spin', label: 'Whip spin' },
  { value: 'flip', label: 'Card flip' },
  { value: 'glitch', label: 'Digital glitch' },
  { value: 'radial-wipe', label: 'Radial reveal' },
  { value: 'light-sweep', label: 'Light sweep' },
  { value: 'blur-dissolve', label: 'Blur dissolve' },
  { value: 'dip-black', label: 'Dip to black' },
  { value: 'random', label: 'Random · beat-synced' },
];

export function resolveMoodLook(settings: Settings): { profile: MoodEffectProfile; filter: string } {
  const base = moodEffects[settings.mood];
  const enabled = settings.enabledEffects;
  const strength = Math.min(1, Math.max(0, settings.effectStrength / 100));
  const transition = settings.transitionStyle === 'mood' ? base.transition : settings.transitionStyle;
  const professional = settings.mood === 'Professional Cut';
  return {
    filter: enabled.colorGrade ? moodNotes[settings.mood].filter : 'none',
    profile: {
      ...base,
      tintAmount: !professional && enabled.colorGrade ? base.tintAmount * strength : 0,
      vignette: !professional && enabled.vignette ? base.vignette * strength : 0,
      grain: !professional && enabled.filmGrain ? base.grain * strength : 0,
      glow: !professional && enabled.glow ? base.glow * strength : 0,
      lightLeak: !professional && enabled.lightLeak ? base.lightLeak * strength : 0,
      dust: !professional && enabled.dust ? base.dust * strength : 0,
      letterbox: !professional && enabled.letterbox ? base.letterbox * strength : 0,
      zoom: enabled.cameraMove ? base.zoom * strength : 0,
      driftX: enabled.cameraMove ? base.driftX * strength : 0,
      driftY: enabled.cameraMove ? base.driftY * strength : 0,
      motion: enabled.cameraMove && (professional || strength > 0) ? base.motion : 'still',
      transition,
      transitionSeconds: settings.useMoodTransitionDuration ? base.transitionSeconds : settings.transitionDuration,
    },
  };
}

export function makePlan(media: MediaItem[], settings: Settings, sceneTimings: Record<string, number> = {}): Scene[] {
  const photosAndVideos = media.filter((item) => item.readable && item.kind !== 'audio');
  const sorted = [...photosAndVideos].sort((a, b) => a.file.lastModified - b.file.lastModified || a.file.name.localeCompare(b.file.name));
  if (!sorted.length) return [];
  const duration = settings.duration === 0 ? settings.customDuration : settings.duration;
  const count = Math.min(sorted.length, Math.max(1, Math.ceil(duration / (settings.duration <= 30 ? 4 : 6))));
  const selected = Array.from({ length: count }, (_, index) => sorted[Math.floor(index * sorted.length / count)]);
  const per = duration / selected.length;
  let start = 0;
  return selected.map((item, index) => {
    const remainingScenes = selected.length - index - 1;
    const available = Math.max(1, 600 - start - remainingScenes);
    const requested = sceneTimings[item.id];
    const sceneDuration = Number.isFinite(requested) ? Math.max(1, Math.min(available, requested)) : Math.min(available, per);
    const scene = { item, start, duration: sceneDuration };
    start += sceneDuration;
    return scene;
  });
}

export function supportedRecording(settings: Settings): { mime: string; extension: string; note: string } | null {
  if (!('MediaRecorder' in window) || !HTMLCanvasElement.prototype.captureStream) return null;
  const choices = [
    { mime: 'video/mp4;codecs=avc1.42E01E,mp4a.40.2', extension: 'mp4' },
    { mime: 'video/mp4', extension: 'mp4' },
    { mime: 'video/webm;codecs=vp9,opus', extension: 'webm' },
    { mime: 'video/webm;codecs=vp8,opus', extension: 'webm' },
    { mime: 'video/webm', extension: 'webm' },
  ];
  const supported = choices.find((choice) => MediaRecorder.isTypeSupported(choice.mime));
  if (!supported) return null;
  return { ...supported, note: supported.extension === 'mp4' ? 'This browser can record MP4.' : 'This browser cannot record H.264/AAC MP4 here; export will use WebM.' };
}

type MusicTrack = { item: MediaItem; element: HTMLAudioElement; gain: GainNode };
type AudioRig = {
  context: AudioContext;
  destination: MediaStreamAudioDestinationNode;
  musicGain: GainNode;
  tracks: MusicTrack[];
  timers: number[];
  attachVideo(video: HTMLVideoElement): boolean;
  startMusic(): Promise<void>;
  updateMix(hasVideo: boolean, elapsed: number, total: number, fadeInSeconds: number, fadeOutSeconds: number): void;
  cleanup(): void;
};

function createAudioRig(stream: MediaStream, media: MediaItem[]): AudioRig | null {
  const soundtracks = media
    .filter((item) => item.kind === 'audio' && item.readable)
    .sort((a, b) => a.file.lastModified - b.file.lastModified || a.file.name.localeCompare(b.file.name));
  const hasVideo = media.some((item) => item.kind === 'video' && item.readable);
  if (typeof window.AudioContext === 'undefined' || (!soundtracks.length && !hasVideo)) return null;

  let context: AudioContext;
  try {
    context = new AudioContext();
    const destination = context.createMediaStreamDestination();
    const musicGain = context.createGain();
    musicGain.gain.value = .62;
    musicGain.connect(destination);
    const timers: number[] = [];
    const tracks: MusicTrack[] = [];

    for (const item of soundtracks) {
      try {
        const element = new Audio(item.url);
        element.preload = 'auto';
        const source = context.createMediaElementSource(element);
        const gain = context.createGain();
        gain.gain.value = 0;
        source.connect(gain);
        gain.connect(musicGain);
        tracks.push({ item, element, gain });
      } catch {
        // A single undecodable music track should not prevent other local media from rendering.
      }
    }

    destination.stream.getAudioTracks().forEach((track) => stream.addTrack(track));

    return {
      context,
      destination,
      musicGain,
      tracks,
      timers,
      attachVideo(video) {
        try {
          const source = context.createMediaElementSource(video);
          const gain = context.createGain();
          gain.gain.value = .58;
          source.connect(gain);
          gain.connect(destination);
          video.muted = false;
          return true;
        } catch {
          video.muted = true;
          return false;
        }
      },
      async startMusic() {
        if (!tracks.length) return;
        await context.resume();
        const start = async (index: number) => {
          const track = tracks[index];
          track.element.currentTime = 0;
          await track.element.play();
          const now = context.currentTime;
          track.gain.gain.cancelScheduledValues(now);
          track.gain.gain.setValueAtTime(0, now);
          track.gain.gain.linearRampToValueAtTime(1, now + .55);
        };

        try {
          await start(0);
        } catch {
          return;
        }
        if (tracks.length === 1) {
          tracks[0].element.loop = true;
          return;
        }

        const scheduleNext = (currentIndex: number) => {
          const current = tracks[currentIndex];
          const trackDuration = current.item.duration ?? current.element.duration;
          if (!Number.isFinite(trackDuration) || trackDuration <= 0) return;
          const fadeSeconds = Math.min(1.6, trackDuration * .2);
          const delay = Math.max(.35, trackDuration - fadeSeconds);
          const timer = window.setTimeout(() => {
            const nextIndex = (currentIndex + 1) % tracks.length;
            const next = tracks[nextIndex];
            const now = context.currentTime;
            next.element.currentTime = 0;
            void next.element.play().then(() => {
              next.gain.gain.cancelScheduledValues(now);
              next.gain.gain.setValueAtTime(0, now);
              next.gain.gain.linearRampToValueAtTime(1, now + fadeSeconds);
              current.gain.gain.cancelScheduledValues(now);
              current.gain.gain.setValueAtTime(current.gain.gain.value, now);
              current.gain.gain.linearRampToValueAtTime(0, now + fadeSeconds);
              const pauseTimer = window.setTimeout(() => current.element.pause(), fadeSeconds * 1000 + 80);
              timers.push(pauseTimer);
              scheduleNext(nextIndex);
            }).catch(() => scheduleNext(currentIndex));
          }, delay * 1000);
          timers.push(timer);
        };
        scheduleNext(0);
      },
      updateMix(hasVideoScene, elapsed, total, fadeInSeconds, fadeOutSeconds) {
        const fadeIn = fadeInSeconds > 0 ? Math.min(1, Math.max(0, elapsed / fadeInSeconds)) : 1;
        const endFade = fadeOutSeconds > 0 ? Math.min(1, Math.max(0, (total - elapsed) / fadeOutSeconds)) : 1;
        musicGain.gain.value = (hasVideoScene ? .31 : .62) * fadeIn * endFade;
      },
      cleanup() {
        timers.forEach((timer) => window.clearTimeout(timer));
        tracks.forEach(({ element, gain }) => {
          element.pause();
          element.removeAttribute('src');
          element.load();
          gain.disconnect();
        });
        musicGain.disconnect();
        destination.stream.getTracks().forEach((track) => track.stop());
        void context.close().catch(() => undefined);
      },
    };
  } catch {
    return null;
  }
}

async function validateRecording(blob: Blob, targetDuration: number, width: number, height: number) {
  const url = URL.createObjectURL(blob);
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.muted = true;
  video.src = url;
  try {
    const metadata = await new Promise<{ duration: number | null; width: number; height: number }>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('The finished video could not be validated in time. Try a shorter film or lower resolution.')), 15000);
      video.onloadedmetadata = () => {
        window.clearTimeout(timeout);
        if (!video.videoWidth || !video.videoHeight) {
          reject(new Error('The browser could not read the finished video dimensions.'));
          return;
        }
        const duration = Number.isFinite(video.duration) ? video.duration : null;
        if (duration !== null && Math.abs(duration - targetDuration) > Math.max(2, targetDuration * .03)) {
          reject(new Error(`The finished video is ${duration.toFixed(1)} seconds long, outside the expected ${targetDuration} second duration.`));
          return;
        }
        resolve({ duration, width: video.videoWidth, height: video.videoHeight });
      };
      video.onerror = () => {
        window.clearTimeout(timeout);
        reject(new Error('The browser could not decode the finished recording, so it was not marked as ready.'));
      };
    });
    if (metadata.width !== width || metadata.height !== height) {
      throw new Error(`The finished video is ${metadata.width} × ${metadata.height}, not the requested ${width} × ${height}.`);
    }
    return metadata;
  } finally {
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(url);
  }
}

function drawCover(ctx: CanvasRenderingContext2D, source: CanvasImageSource, sw: number, sh: number, width: number, height: number, fit: Settings['fit']) {
  if (fit === 'fit') {
    const scale = Math.min(width / sw, height / sh);
    const w = sw * scale, h = sh * scale;
    ctx.fillStyle = '#14151b'; ctx.fillRect(0, 0, width, height);
    ctx.drawImage(source, (width - w) / 2, (height - h) / 2, w, h);
  } else {
    const scale = Math.max(width / sw, height / sh);
    const w = width / scale, h = height / scale;
    ctx.drawImage(source, (sw - w) / 2, (sh - h) / 2, w, h, 0, 0, width, height);
  }
}

function seededNoise(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

const PAN_DIRECTIONS: [number, number][] = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [.7071, .7071], [-.7071, .7071], [.7071, -.7071], [-.7071, -.7071],
];

const moodTempoBpm: Record<Mood, number> = {
  Cinematic: 96,
  Romantic: 84,
  'Happy & Energetic': 124,
  'Travel Adventure': 116,
  Nostalgic: 76,
  'Family & Memories': 90,
  Epic: 100,
  'Minimal & Elegant': 88,
  Dreamy: 72,
  'Professional Cut': 110,
};

const transitionChoices: TransitionStyle[] = [
  'crossfade', 'wipe', 'luma-wipe', 'light-leak', 'film-burn', 'flash-cut', 'zoom-impact', 'zoom-blur',
  'soft-fade', 'fade-into', 'bloom', 'slide', 'whip-pan', 'spin', 'flip', 'glitch', 'radial-wipe',
  'light-sweep', 'blur-dissolve',
];

const combinedChoices: TransitionStyle[] = ['light-leak', 'film-burn', 'bloom', 'light-sweep', 'glitch', 'zoom-blur'];

async function estimateMusicTempo(context: AudioContext, url: string): Promise<{ beat: number; offset: number } | null> {
  try {
    const decode = async () => {
      const response = await fetch(url);
      const data = await response.arrayBuffer();
      return context.decodeAudioData(data);
    };
    const timeout = new Promise<AudioBuffer | null>((resolve) => window.setTimeout(() => resolve(null), 9000));
    const buffer = await Promise.race([decode().catch(() => null), timeout]);
    if (!buffer) return null;
    const samples = buffer.getChannelData(0);
    const hop = 512;
    const windows = Math.floor(samples.length / hop);
    if (windows < 96) return null;
    const energy = new Float32Array(windows);
    for (let i = 0; i < windows; i += 1) {
      let sum = 0;
      const start = i * hop;
      for (let j = 0; j < hop; j += 4) {
        const value = samples[start + j];
        sum += value * value;
      }
      energy[i] = Math.sqrt(sum / (hop / 4));
    }
    const onset = new Float32Array(windows);
    for (let i = 1; i < windows; i += 1) {
      const diff = energy[i] - energy[i - 1];
      onset[i] = diff > 0 ? diff : 0;
    }
    const windowsPerSecond = buffer.sampleRate / hop;
    let bestBpm = 0;
    let bestScore = -1;
    for (let bpm = 64; bpm <= 176; bpm += .5) {
      const lag = Math.round(windowsPerSecond * 60 / bpm);
      if (lag < 4 || lag * 2 >= windows) continue;
      let score = 0;
      for (let i = 0; i + lag < windows; i += 1) score += onset[i] * onset[i + lag];
      score /= (windows - lag);
      score *= Math.exp(-.5 * ((bpm - 112) / 58) ** 2);
      if (score > bestScore) { bestScore = score; bestBpm = bpm; }
    }
    if (!bestBpm) return null;
    const lag = Math.round(windowsPerSecond * 60 / bestBpm);
    let bestPhase = 0;
    let bestPhaseScore = -1;
    for (let phase = 0; phase < lag; phase += 1) {
      let score = 0;
      for (let i = phase; i < windows; i += lag) score += onset[i];
      if (score > bestPhaseScore) { bestPhaseScore = score; bestPhase = phase; }
    }
    return { beat: 60 / bestBpm, offset: bestPhase / windowsPerSecond };
  } catch {
    return null;
  }
}

type TransitionLayer = { alpha: number; scale: number; scaleX: number; rotate: number; tx: number; blur: number; clip: 'wipe' | 'radial' | 'luma' | null; ghosts: number };

function transitionLayer(style: TransitionStyle, p: number, width: number, height: number): TransitionLayer {
  const layer: TransitionLayer = { alpha: 1, scale: 1, scaleX: 1, rotate: 0, tx: 0, blur: 0, clip: null, ghosts: 0 };
  const soft = Math.min(width, height);
  switch (style) {
    case 'crossfade': layer.alpha = 1 - p; break;
    case 'soft-fade': layer.alpha = 1 - p; layer.blur = (1 - p) * soft * .018; break;
    case 'bloom': layer.alpha = 1 - p; layer.blur = (1 - p) * soft * .018; break;
    case 'blur-dissolve': layer.alpha = 1 - p; layer.blur = p * soft * .05; layer.scale = 1 + p * .05; break;
    case 'fade-into': { const eased = p * p * (3 - 2 * p); layer.alpha = 1 - eased; layer.scale = 1 + p * .05; break; }
    case 'light-leak': case 'film-burn': case 'light-sweep': case 'glitch': case 'dip-black': layer.alpha = 1 - p; break;
    case 'flash-cut': layer.alpha = 0; break;
    case 'zoom-impact': layer.alpha = 1 - p; layer.scale = 1 + p * .14; break;
    case 'zoom-blur': layer.alpha = 1 - p; layer.scale = 1 + p * .3; layer.blur = p * soft * .02; layer.ghosts = 3; break;
    case 'spin': layer.alpha = 1 - p; layer.scale = 1 + p * .12; layer.rotate = (1 - p) * Math.PI / 12; break;
    case 'slide': layer.tx = p * width; layer.alpha = 1 - Math.max(0, (p - .7) / .3) * .3; break;
    case 'whip-pan': layer.tx = p * p * width; layer.alpha = 1 - Math.max(0, (p - .55) / .45); layer.blur = p * soft * .03; break;
    case 'flip': layer.scaleX = Math.max(.002, Math.cos(p * Math.PI / 2)); break;
    case 'wipe': layer.clip = 'wipe'; break;
    case 'luma-wipe': layer.clip = 'luma'; break;
    case 'radial-wipe': layer.clip = 'radial'; break;
    default: layer.alpha = 1 - p;
  }
  return layer;
}

function drawTransitionFx(ctx: CanvasRenderingContext2D, style: TransitionStyle, p: number, look: MoodEffectProfile, width: number, height: number) {
  const wave = Math.sin(p * Math.PI);
  ctx.save();
  if (style === 'light-leak') {
    ctx.globalCompositeOperation = 'screen';
    const centerX = width * (.12 + .76 * p);
    const flare = ctx.createLinearGradient(centerX - width * .24, 0, centerX + width * .24, height);
    flare.addColorStop(0, 'rgba(255,170,120,0)');
    flare.addColorStop(.38, `rgba(${look.tint},${wave * .17})`);
    flare.addColorStop(.52, `rgba(255,239,222,${wave * .32})`);
    flare.addColorStop(.68, `rgba(${look.tint},${wave * .12})`);
    flare.addColorStop(1, 'rgba(255,170,120,0)');
    ctx.fillStyle = flare;
    ctx.fillRect(0, 0, width, height);
  } else if (style === 'film-burn') {
    ctx.globalCompositeOperation = 'screen';
    const centerX = width * (p * 1.18 - .08);
    const burn = ctx.createLinearGradient(centerX - width * .21, 0, centerX + width * .21, height);
    burn.addColorStop(0, 'rgba(95,25,11,0)');
    burn.addColorStop(.32, `rgba(227,75,23,${wave * .22})`);
    burn.addColorStop(.49, `rgba(255,223,155,${wave * .38})`);
    burn.addColorStop(.63, `rgba(255,116,34,${wave * .2})`);
    burn.addColorStop(1, 'rgba(95,25,11,0)');
    ctx.fillStyle = burn;
    ctx.fillRect(0, 0, width, height);
  } else if (style === 'bloom') {
    ctx.globalCompositeOperation = 'screen';
    const bloom = ctx.createRadialGradient(width * .52, height * .45, 0, width * .52, height * .45, width * .7);
    bloom.addColorStop(0, `rgba(239,224,255,${wave * .24})`);
    bloom.addColorStop(.6, `rgba(${look.tint},${wave * .1})`);
    bloom.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, width, height);
  } else if (style === 'flash-cut') {
    const alpha = Math.pow(1 - p, 2) * .32 + wave * .08;
    ctx.fillStyle = `rgba(255,248,231,${alpha})`;
    ctx.fillRect(0, 0, width, height);
  } else if (style === 'zoom-impact' || style === 'spin') {
    const flash = wave ** 2 * .13;
    if (flash > .005) {
      ctx.fillStyle = `rgba(255,242,218,${flash})`;
      ctx.fillRect(0, 0, width, height);
    }
  } else if (style === 'zoom-blur') {
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `rgba(255,250,240,${wave * .12})`;
    ctx.fillRect(0, 0, width, height);
  } else if (style === 'dip-black') {
    ctx.fillStyle = `rgba(0,0,0,${wave})`;
    ctx.fillRect(0, 0, width, height);
  } else if (style === 'glitch') {
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `rgba(255,40,100,${Math.sin(p * 20) ** 2 * .15})`;
    ctx.fillRect((p * 137 % 1) * width, 0, width * .18, height);
    ctx.fillStyle = `rgba(40,240,255,${Math.cos(p * 17) ** 2 * .12})`;
    ctx.fillRect((p * 71 % 1) * width, height * ((p * 3.3) % 1), width * .26, height * .07);
  } else if (style === 'light-sweep') {
    ctx.globalCompositeOperation = 'screen';
    const centerX = width * (-.2 + 1.4 * p);
    const sweep = ctx.createLinearGradient(centerX - width * .3, 0, centerX + width * .3, 0);
    sweep.addColorStop(0, 'rgba(255,255,255,0)');
    sweep.addColorStop(.46, `rgba(255,244,224,${wave * .18})`);
    sweep.addColorStop(.5, `rgba(255,255,255,${wave * .42})`);
    sweep.addColorStop(.54, `rgba(255,244,224,${wave * .18})`);
    sweep.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sweep;
    ctx.fillRect(0, 0, width, height);
  } else if (style === 'fade-into') {
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `rgba(255,250,242,${wave * .07})`;
    ctx.fillRect(0, 0, width, height);
  } else if (style === 'blur-dissolve') {
    ctx.globalCompositeOperation = 'screen';
    const haze = ctx.createRadialGradient(width * .5, height * .5, 0, width * .5, height * .5, width * .72);
    haze.addColorStop(0, `rgba(236,240,255,${wave * .16})`);
    haze.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, width, height);
  } else if (style === 'whip-pan') {
    ctx.globalCompositeOperation = 'screen';
    const streak = ctx.createLinearGradient(0, 0, width, 0);
    streak.addColorStop(0, 'rgba(255,255,255,0)');
    streak.addColorStop(p, `rgba(255,250,238,${wave * .22})`);
    streak.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = streak;
    ctx.fillRect(0, height * .2, width, height * .6);
  } else if (style === 'flip') {
    ctx.globalCompositeOperation = 'screen';
    const edgeX = width / 2;
    const edge = ctx.createLinearGradient(edgeX - width * .06, 0, edgeX + width * .06, 0);
    edge.addColorStop(0, 'rgba(255,255,255,0)');
    edge.addColorStop(.5, `rgba(255,246,226,${wave * .3})`);
    edge.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = edge;
    ctx.fillRect(edgeX - width * .06, 0, width * .12, height);
  } else if (style === 'luma-wipe') {
    ctx.globalCompositeOperation = 'screen';
    const feather = Math.max(28, width * .07);
    const edgeX = p * (width + feather) - feather / 2;
    const edge = ctx.createLinearGradient(edgeX - feather, 0, edgeX + feather, 0);
    edge.addColorStop(0, 'rgba(255,255,255,0)');
    edge.addColorStop(.5, `rgba(255,248,234,${wave * .2})`);
    edge.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = edge;
    ctx.fillRect(edgeX - feather, 0, feather * 2, height);
  }
  ctx.restore();
}

function drawTransition(ctx: CanvasRenderingContext2D, outgoing: HTMLCanvasElement, look: MoodEffectProfile, progress: number, width: number, height: number, scratch: HTMLCanvasElement | null, secondary?: TransitionStyle | null) {
  const p = Math.max(0, Math.min(1, progress));
  const primary = look.transition;
  if (primary === 'none' || primary === 'random') return;
  const styles: TransitionStyle[] = [primary];
  if (secondary && secondary !== 'random' && secondary !== primary) styles.push(secondary);
  const clips: ('wipe' | 'radial' | 'luma')[] = [];
  const merged: TransitionLayer = { alpha: 1, scale: 1, scaleX: 1, rotate: 0, tx: 0, blur: 0, clip: null, ghosts: 0 };
  for (const style of styles) {
    const layer = transitionLayer(style, p, width, height);
    merged.alpha *= layer.alpha;
    merged.scale *= layer.scale;
    merged.scaleX *= layer.scaleX;
    merged.rotate += layer.rotate;
    merged.tx += layer.tx;
    merged.blur = Math.max(merged.blur, layer.blur);
    merged.ghosts = Math.max(merged.ghosts, layer.ghosts);
    if (layer.clip && !clips.includes(layer.clip)) clips.push(layer.clip);
  }
  ctx.save();
  let source: CanvasImageSource = outgoing;
  const scratchContext = clips.includes('luma') ? scratch?.getContext('2d') : null;
  if (scratch && scratchContext) {
    scratchContext.clearRect(0, 0, width, height);
    scratchContext.globalCompositeOperation = 'source-over';
    scratchContext.drawImage(outgoing, 0, 0);
    scratchContext.globalCompositeOperation = 'destination-out';
    const feather = Math.max(28, width * .07);
    const edge = p * (width + feather);
    const gradient = scratchContext.createLinearGradient(edge - feather, 0, edge, 0);
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    scratchContext.fillStyle = gradient;
    scratchContext.fillRect(0, 0, width, height);
    scratchContext.globalCompositeOperation = 'source-over';
    source = scratch;
  }
  for (const clip of clips) {
    if (clip === 'wipe') {
      ctx.beginPath(); ctx.rect(p * width, 0, width * (1 - p), height); ctx.clip();
    } else if (clip === 'radial') {
      ctx.beginPath(); ctx.arc(width / 2, height / 2, (1 - p) * Math.hypot(width, height) * .72, 0, Math.PI * 2); ctx.clip();
    }
  }
  if (merged.alpha > .003) {
    const drawLayer = (extraScale: number, alphaScale: number) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, merged.alpha * alphaScale));
      if (merged.blur > .4) ctx.filter = `blur(${merged.blur}px)`;
      ctx.translate(width / 2 + merged.tx, height / 2);
      ctx.scale(merged.scale * merged.scaleX * extraScale, merged.scale * extraScale);
      ctx.rotate(merged.rotate);
      ctx.translate(-width / 2, -height / 2);
      ctx.drawImage(source, 0, 0, width, height);
      ctx.restore();
    };
    drawLayer(1, 1);
    for (let ghost = 1; ghost <= merged.ghosts; ghost += 1) drawLayer(1 + ghost * .07, .3 / ghost);
  }
  ctx.restore();
  for (const style of styles) drawTransitionFx(ctx, style, p, look, width, height);
}

function drawMoodLook(ctx: CanvasRenderingContext2D, width: number, height: number, look: MoodEffectProfile, elapsed: number, sceneIndex: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = `rgba(${look.tint},${look.tintAmount})`;
  ctx.fillRect(0, 0, width, height);

  if (look.glow > 0) {
    ctx.globalCompositeOperation = 'screen';
    const pulse = .78 + .22 * Math.sin(elapsed * .62 + sceneIndex * .8);
    const glow = ctx.createRadialGradient(width * .69, height * .12, 0, width * .69, height * .12, width * .68);
    glow.addColorStop(0, `rgba(255,241,218,${look.glow * pulse})`);
    glow.addColorStop(.42, `rgba(${look.tint},${look.glow * pulse * .38})`);
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }

  if (look.lightLeak > 0) {
    ctx.globalCompositeOperation = 'screen';
    const drift = .5 + .34 * Math.sin(elapsed * .43 + sceneIndex * 1.7);
    const centerX = width * drift;
    const leak = ctx.createLinearGradient(centerX - width * .3, 0, centerX + width * .3, height);
    leak.addColorStop(0, 'rgba(255,188,116,0)');
    leak.addColorStop(.42, `rgba(${look.tint},${look.lightLeak * .44})`);
    leak.addColorStop(.53, `rgba(255,234,199,${look.lightLeak * .72})`);
    leak.addColorStop(.64, `rgba(${look.tint},${look.lightLeak * .3})`);
    leak.addColorStop(1, 'rgba(255,188,116,0)');
    ctx.fillStyle = leak;
    ctx.fillRect(0, 0, width, height);
  }

  if (look.vignette > 0) {
    ctx.globalCompositeOperation = 'multiply';
    const vignette = ctx.createRadialGradient(width * .5, height * .46, Math.min(width, height) * .22, width * .5, height * .46, Math.max(width, height) * .72);
    vignette.addColorStop(0, 'rgba(255,255,255,1)');
    vignette.addColorStop(.65, 'rgba(255,255,255,.98)');
    vignette.addColorStop(1, `rgba(8,10,16,${look.vignette})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  }

  const textureFrame = Math.floor(elapsed * 4);
  const grainCount = Math.round(look.grain * 360);
  if (grainCount > 0) {
    ctx.globalCompositeOperation = 'soft-light';
    for (let i = 0; i < grainCount; i += 1) {
      const seed = sceneIndex * 997 + textureFrame * 31 + i * 17;
      const x = seededNoise(seed) * width;
      const y = seededNoise(seed + 19.3) * height;
      const alpha = look.grain * (.35 + seededNoise(seed + 7) * .55);
      ctx.fillStyle = `rgba(${i % 2 ? '245,229,199' : '16,13,10'},${alpha})`;
      const size = Math.max(1, width / 1920);
      ctx.fillRect(x, y, size, size);
    }
  }

  if (look.dust > 0) {
    const dustPhase = Math.floor(elapsed * 1.8);
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = `rgba(255,232,196,${look.dust * .13})`;
    ctx.lineWidth = Math.max(1, width / 1600);
    for (let i = 0; i < 3; i += 1) {
      const seed = sceneIndex * 73 + dustPhase * 11 + i * 31;
      const x = seededNoise(seed) * width;
      const y = seededNoise(seed + 8) * height * .72;
      const length = height * (.12 + seededNoise(seed + 22) * .3);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (seededNoise(seed + 5) - .5) * 3, y + length);
      ctx.stroke();
    }
  }

  if (look.letterbox > 0) {
    const barHeight = Math.round(height * look.letterbox);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#08090d';
    ctx.fillRect(0, 0, width, barHeight);
    ctx.fillRect(0, height - barHeight, width, barHeight);
  }
  ctx.restore();
}

export async function recordFilm(scenes: Scene[], media: MediaItem[], settings: Settings, onStatus: (status: RenderStatus) => void, cancelled: () => boolean): Promise<{ url: string; extension: string; mime: string; duration: number | null; width: number; height: number; hasAudio: boolean }> {
  const recording = supportedRecording(settings);
  if (!recording) throw new Error('MediaRecorder or canvas capture is unavailable in this browser.');
  if (!scenes.length) throw new Error('Add at least one readable photo or video before rendering.');
  const width = settings.quality === '1080p' ? 1920 : 1280;
  const height = Math.round(width * 9 / 16);
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas rendering is unavailable.');
  const stream = canvas.captureStream(30);
  let outgoingCanvas = document.createElement('canvas');
  outgoingCanvas.width = width;
  outgoingCanvas.height = height;
  let outgoingContext = outgoingCanvas.getContext('2d');
  let snapshotCanvas = document.createElement('canvas');
  snapshotCanvas.width = width;
  snapshotCanvas.height = height;
  let snapshotContext = snapshotCanvas.getContext('2d');
  const audioRig = createAudioRig(stream, media);
  const hasAudio = stream.getAudioTracks().length > 0;
  const mime = recording.mime;
  const resolvedLook = resolveMoodLook(settings);
  const randomTransitions = resolvedLook.profile.transition === 'random';
  let musicTempo: { beat: number; offset: number } | null = null;
  if (randomTransitions && audioRig) {
    const soundtrack = media
      .filter((item) => item.kind === 'audio' && item.readable)
      .sort((a, b) => a.file.lastModified - b.file.lastModified || a.file.name.localeCompare(b.file.name))[0];
    if (soundtrack) {
      onStatus({ stage: 'Listening for the beat to place transitions', elapsed: 0 });
      musicTempo = await estimateMusicTempo(audioRig.context, soundtrack.url);
    }
  }
  const tempo = musicTempo ?? { beat: 60 / moodTempoBpm[settings.mood], offset: 0 };
  if (settings.overlayText && typeof document !== 'undefined' && document.fonts?.load) {
    try {
      await Promise.all([
        document.fonts.load(`600 ${Math.round(height * .046)}px "Playfair Display"`),
        document.fonts.load(`italic 600 ${Math.round(height * .046)}px "Playfair Display"`),
      ]);
    } catch {
      /* Fall back to a styled serif when the web font cannot load. */
    }
  }
  const openingFadeSec = Math.min(.95, Math.max(.35, scenes[0].duration * .16));
  const endingFadeSec = Math.min(1.1, Math.max(.45, scenes[scenes.length - 1].duration * .18));
  const transitionScratch = document.createElement('canvas');
  transitionScratch.width = width;
  transitionScratch.height = height;
  const chunks: BlobPart[] = [];
  const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: settings.quality === '1080p' ? 8_000_000 : 4_000_000 });
  const startedAt = performance.now();
  let resolveStop: (() => void) | undefined;
  const stopWait = new Promise<void>((resolve) => { resolveStop = resolve; });
  recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
  recorder.onstop = () => resolveStop?.();
  recorder.onerror = () => resolveStop?.();
  recorder.start(1000);
  const total = scenes.reduce((sum, scene) => sum + scene.duration, 0);
  try {
    onStatus({ stage: 'Preparing scenes and soundtrack', elapsed: 0 });
    await audioRig?.startMusic();
    const musicStartSec = (performance.now() - startedAt) / 1000;
    for (let index = 0; index < scenes.length; index += 1) {
      const scene = scenes[index];
      if (cancelled()) throw new Error('Render cancelled.');
      onStatus({ stage: `Rendering scene ${index + 1} of ${scenes.length}`, elapsed: (performance.now() - startedAt) / 1000 });
      const item = scene.item;
      let image: HTMLImageElement | HTMLVideoElement;
      let video: HTMLVideoElement | null = null;
      if (item.kind === 'image') {
        const img = new Image(); img.src = item.url;
        await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error(`${item.file.name} could not be decoded during render.`)); });
        image = img;
      } else {
        video = document.createElement('video'); video.src = item.url; video.muted = true; video.playsInline = true; video.preload = 'auto';
        await new Promise<void>((resolve, reject) => { video!.onloadeddata = () => resolve(); video!.onerror = () => reject(new Error(`${item.file.name} could not be decoded during render.`)); });
        if (audioRig?.attachVideo(video)) video.muted = false;
        image = video;
      }
      const { profile: baseLook, filter } = resolveMoodLook(settings);
      const randomTransition = baseLook.transition === 'random';
      const durationMs = scene.duration * 1000;
      const sceneStart = performance.now();
      let look = baseLook;
      let secondary: TransitionStyle | null = null;
      let transitionDelayMs = 0;
      let fade = 0;
      if (randomTransition) {
        const primaryStyle = transitionChoices[Math.floor(seededNoise(index + 17) * transitionChoices.length) % transitionChoices.length];
        const beat = Math.max(.25, tempo.beat);
        const baseFade = Math.min(baseLook.transitionSeconds, scene.duration * .4);
        const subdivisions = [beat / 4, beat / 2, beat, beat * 1.5];
        const fadeSec = Math.min(scene.duration * .4, Math.max(.2, subdivisions.reduce((best, candidate) => Math.abs(candidate - baseFade) < Math.abs(best - baseFade) ? candidate : best, subdivisions[0])));
        fade = fadeSec * 1000;
        const beatOrigin = musicTempo ? musicStartSec + musicTempo.offset : 0;
        const desiredCenter = scene.start + fadeSec / 2;
        const snappedCenter = beatOrigin + Math.round((desiredCenter - beatOrigin) / beat) * beat;
        const delay = snappedCenter - fadeSec / 2 - scene.start;
        transitionDelayMs = Math.max(0, Math.min(delay, Math.min(fadeSec, scene.duration * .35))) * 1000;
        look = { ...baseLook, transition: primaryStyle, transitionSeconds: fadeSec };
        if (seededNoise(index + 29) > .48) {
          const secondaryIndex = Math.floor(seededNoise(index + 53) * combinedChoices.length) % combinedChoices.length;
          const candidate = combinedChoices[secondaryIndex];
          secondary = candidate === primaryStyle ? combinedChoices[(secondaryIndex + 1) % combinedChoices.length] : candidate;
        }
      } else {
        fade = baseLook.transition === 'none' ? 0 : Math.min(baseLook.transitionSeconds, scene.duration * .4) * 1000;
      }
      const transitionEndMs = transitionDelayMs + fade;
      let snapshotCaptured = false;
      while (performance.now() - sceneStart < durationMs) {
        if (cancelled()) throw new Error('Render cancelled.');
        const elapsed = performance.now() - sceneStart;
        if (video && video.paused) await video.play().catch(() => undefined);
        if (video && video.duration && video.currentTime > video.duration - .08) video.currentTime = 0;
        audioRig?.updateMix(item.kind === 'video', scene.start + elapsed / 1000, total, openingFadeSec, endingFadeSec);
        const iw = item.width || (video?.videoWidth ?? width), ih = item.height || (video?.videoHeight ?? height);
        ctx.filter = filter;
        const progress = elapsed / durationMs;
        const moodProgress = progress * Math.PI * 2;
        const breathing = look.motion === 'float' ? Math.sin(moodProgress) * .009 : 0;
        let zoom = 1 + look.zoom * progress + breathing;
        const directional = look.motion === 'pan' || look.motion === 'sweep';
        const driftProgress = directional ? progress - .5 : Math.sin(moodProgress / 2);
        const speed = .65 + seededNoise(index + 67) * .65;
        const panDirection = PAN_DIRECTIONS[Math.floor(seededNoise(index + 41) * PAN_DIRECTIONS.length) % PAN_DIRECTIONS.length];
        const driftX = directional ? panDirection[0] * driftProgress * width * look.driftX * speed * 2 : driftProgress * width * look.driftX;
        const driftY = directional ? panDirection[1] * driftProgress * height * look.driftY * speed * 2 : driftProgress * height * look.driftY;
        zoom = Math.max(zoom, 1 + 2 * Math.max(Math.abs(driftX) / width, Math.abs(driftY) / height));
        ctx.save();
        ctx.translate(width / 2 + driftX, height / 2 + driftY);
        ctx.scale(zoom, zoom);
        ctx.translate(-width / 2, -height / 2);
        drawCover(ctx, image, iw, ih, width, height, settings.fit);
        ctx.restore();
        ctx.filter = 'none';
        if (durationMs - elapsed < transitionEndMs + 140 && snapshotContext) {
          snapshotContext.drawImage(canvas, 0, 0);
          snapshotCaptured = true;
        }
        if (index > 0 && outgoingContext && fade > 0 && elapsed >= transitionDelayMs && elapsed < transitionDelayMs + fade) {
          drawTransition(ctx, outgoingCanvas, look, (elapsed - transitionDelayMs) / fade, width, height, transitionScratch, secondary);
        }
        drawMoodLook(ctx, width, height, look, elapsed / 1000, index);
        if (settings.overlayText) {
          const globalTime = scene.start + elapsed / 1000;
          if (globalTime >= settings.overlayStart && globalTime <= settings.overlayStart + settings.overlayDuration) {
            const localTime = globalTime - settings.overlayStart;
            const fadeEdge = Math.min(.55, settings.overlayDuration / 3);
            const fadeInText = Math.min(1, localTime / fadeEdge);
            const fadeOutText = Math.min(1, (settings.overlayDuration - localTime) / fadeEdge);
            const alpha = Math.max(0, Math.min(fadeInText, fadeOutText)) * settings.overlayOpacity / 100;
            const panelHeight = height * .118;
            const panelX = width * .07;
            const panelW = width * .86;
            const panelY = height * .79;
            ctx.save();
            ctx.globalAlpha = alpha;
            const panelGradient = ctx.createLinearGradient(panelX, 0, panelX + panelW, 0);
            panelGradient.addColorStop(0, 'rgba(8,10,16,0)');
            panelGradient.addColorStop(.16, `rgba(8,10,16,${.72 * settings.overlayOpacity / 100})`);
            panelGradient.addColorStop(.84, `rgba(8,10,16,${.72 * settings.overlayOpacity / 100})`);
            panelGradient.addColorStop(1, 'rgba(8,10,16,0)');
            ctx.fillStyle = panelGradient;
            ctx.beginPath(); ctx.roundRect(panelX, panelY, panelW, panelHeight, height * .02); ctx.fill();
            ctx.strokeStyle = `rgba(255,228,193,${.5 * settings.overlayOpacity / 100})`;
            ctx.lineWidth = Math.max(1, width / 1920);
            ctx.beginPath(); ctx.roundRect(panelX, panelY, panelW, panelHeight, height * .02); ctx.stroke();
            ctx.fillStyle = '#fffaf1'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.font = `italic 600 ${Math.round(height * .046)}px "Playfair Display", Georgia, serif`;
            ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = height * .009;
            ctx.fillText(settings.overlayText, width / 2, panelY + panelHeight / 2, width * .72);
            ctx.restore();
          }
        }
        const openingFade = index === 0 ? openingFadeSec * 1000 : 0;
        const endingFade = index === scenes.length - 1 ? endingFadeSec * 1000 : 0;
        if (openingFade > elapsed) {
          ctx.fillStyle = `rgba(0,0,0,${1 - elapsed / openingFade})`;
          ctx.fillRect(0, 0, width, height);
        }
        if (endingFade > 0 && durationMs - elapsed < endingFade) {
          const fadeProgress = Math.max(0, 1 - (durationMs - elapsed) / endingFade);
          ctx.fillStyle = `rgba(0,0,0,${fadeProgress})`;
          ctx.fillRect(0, 0, width, height);
        }
        onStatus({ stage: `Applying effects and encoding scene ${index + 1} of ${scenes.length}`, elapsed: (performance.now() - startedAt) / 1000 });
        await new Promise((resolve) => window.setTimeout(resolve, 33));
      }
      if (snapshotCaptured && snapshotContext) {
        [outgoingCanvas, snapshotCanvas] = [snapshotCanvas, outgoingCanvas];
        [outgoingContext, snapshotContext] = [snapshotContext, outgoingContext];
      } else {
        outgoingContext?.drawImage(canvas, 0, 0);
      }
      video?.pause();
      if (video) { video.removeAttribute('src'); video.load(); }
      const progress = Math.min(99, Math.round((scene.start + scene.duration) / total * 100));
      onStatus({ stage: progress >= 99 ? 'Finalizing video file' : `Rendered ${index + 1} of ${scenes.length} scenes`, elapsed: (performance.now() - startedAt) / 1000 });
    }
  } catch (error) {
    recorder.stop();
    await stopWait;
    audioRig?.cleanup();
    stream.getTracks().forEach((track) => track.stop());
    throw error;
  }
  recorder.stop();
  await stopWait;
  audioRig?.cleanup();
  stream.getTracks().forEach((track) => track.stop());
  const blob = new Blob(chunks, { type: recorder.mimeType || mime });
  if (!blob.size) throw new Error('The browser returned an empty recording. Try a shorter film or a different quality.');
  const actualMime = blob.type || recorder.mimeType || mime;
  const extension = actualMime.includes('mp4') ? 'mp4' : 'webm';
  const metadata = await validateRecording(blob, total, width, height);
  const url = URL.createObjectURL(blob);
  const result = { url, extension, mime: actualMime, ...metadata, hasAudio };
  onStatus({ stage: 'Video validated and ready', elapsed: (performance.now() - startedAt) / 1000, result });
  return result;
}
