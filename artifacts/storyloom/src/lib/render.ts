import type { MediaItem } from './media';
import type { Mood, Settings } from './templates';

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

export const moods: Mood[] = ['Cinematic', 'Romantic', 'Happy & Energetic', 'Travel Adventure', 'Nostalgic', 'Family & Memories', 'Epic', 'Minimal & Elegant', 'Dreamy'];
export const moodNotes: Record<Mood, { grade: string; motion: string; transition: string; filter: string }> = {
  Cinematic: { grade: 'Warm shadows · restrained contrast', motion: 'Slow push-in', transition: 'Soft crossfade', filter: 'sepia(.11) saturate(.86) contrast(1.08)' },
  Romantic: { grade: 'Rose warmth · lifted highlights', motion: 'Gentle drift', transition: 'Long dissolve', filter: 'sepia(.13) saturate(1.12) hue-rotate(335deg)' },
  'Happy & Energetic': { grade: 'Bright color · lively contrast', motion: 'Quick, measured push', transition: 'Clean cut', filter: 'saturate(1.25) contrast(1.06)' },
  'Travel Adventure': { grade: 'Sunlit amber · vivid skies', motion: 'Wide exploratory pan', transition: 'Directional wipe', filter: 'saturate(1.12) sepia(.08)' },
  Nostalgic: { grade: 'Faded film · amber grain', motion: 'Still frame with breathing zoom', transition: 'Film dissolve', filter: 'sepia(.28) saturate(.7) contrast(.94)' },
  'Family & Memories': { grade: 'Soft skin tones · natural warmth', motion: 'Tender slow zoom', transition: 'Gentle dissolve', filter: 'sepia(.07) saturate(.92)' },
  Epic: { grade: 'Deep blacks · bold highlights', motion: 'Broad cinematic sweep', transition: 'Impact cut', filter: 'contrast(1.24) saturate(.9)' },
  'Minimal & Elegant': { grade: 'Quiet color · clean detail', motion: 'Almost-still, precise', transition: 'Measured fade', filter: 'saturate(.72) contrast(1.04)' },
  Dreamy: { grade: 'Hazy light · softened color', motion: 'Floating drift', transition: 'Luminous dissolve', filter: 'saturate(.86) brightness(1.06) blur(.15px)' },
};

export function makePlan(media: MediaItem[], settings: Settings): Scene[] {
  const photosAndVideos = media.filter((item) => item.readable && item.kind !== 'audio');
  const sorted = [...photosAndVideos].sort((a, b) => a.file.lastModified - b.file.lastModified || a.file.name.localeCompare(b.file.name));
  if (!sorted.length) return [];
  const duration = settings.duration === 0 ? settings.customDuration : settings.duration;
  const count = Math.min(sorted.length, Math.max(1, Math.ceil(duration / (settings.duration <= 30 ? 4 : 6))));
  const selected = Array.from({ length: count }, (_, index) => sorted[Math.floor(index * sorted.length / count)]);
  const per = duration / selected.length;
  let start = 0;
  return selected.map((item, index) => {
    const scene = { item, start, duration: index === selected.length - 1 ? duration - start : per };
    start += per;
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
  updateMix(hasVideo: boolean, elapsed: number, total: number): void;
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
      updateMix(hasVideoScene, elapsed, total) {
        const endFade = Math.min(1, Math.max(0, (total - elapsed) / 1.6));
        musicGain.gain.value = (hasVideoScene ? .31 : .62) * endFade;
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
  const outgoingCanvas = document.createElement('canvas');
  outgoingCanvas.width = width;
  outgoingCanvas.height = height;
  const outgoingContext = outgoingCanvas.getContext('2d');
  const audioRig = createAudioRig(stream, media);
  const hasAudio = stream.getAudioTracks().length > 0;
  const mime = recording.mime;
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
      const m = moodNotes[settings.mood];
      const sceneStart = performance.now();
      const durationMs = scene.duration * 1000;
      const transitionSeconds = settings.mood === 'Happy & Energetic' ? .16 : settings.mood === 'Epic' ? .12 : settings.mood === 'Travel Adventure' ? .7 : settings.mood === 'Romantic' || settings.mood === 'Dreamy' ? .62 : settings.mood === 'Minimal & Elegant' ? .36 : .48;
      while (performance.now() - sceneStart < durationMs) {
        if (cancelled()) throw new Error('Render cancelled.');
        const elapsed = performance.now() - sceneStart;
        if (video && video.paused) await video.play().catch(() => undefined);
        if (video && video.duration && video.currentTime > video.duration - .08) video.currentTime = 0;
        audioRig?.updateMix(item.kind === 'video', elapsed / 1000, total);
        const iw = item.width || (video?.videoWidth ?? width), ih = item.height || (video?.videoHeight ?? height);
        ctx.filter = m.filter;
        const progress = elapsed / durationMs;
        const moodProgress = progress * Math.PI * 2;
        const zoomPower = settings.mood === 'Happy & Energetic' ? .052 : settings.mood === 'Epic' ? .08 : settings.mood === 'Minimal & Elegant' ? .012 : settings.mood === 'Dreamy' ? .025 : settings.mood === 'Nostalgic' ? .023 : settings.mood === 'Travel Adventure' ? .042 : .032;
        const breathing = settings.mood === 'Dreamy' || settings.mood === 'Romantic' ? Math.sin(moodProgress) * .012 : 0;
        const zoom = 1 + zoomPower * progress + breathing;
        const drift = settings.mood === 'Travel Adventure' || settings.mood === 'Epic' ? (progress - .5) * width * .04 : settings.mood === 'Family & Memories' ? Math.sin(moodProgress / 2) * width * .009 : settings.mood === 'Dreamy' || settings.mood === 'Romantic' ? Math.sin(moodProgress / 2) * width * .012 : settings.mood === 'Happy & Energetic' ? (progress - .5) * width * .015 : 0;
        ctx.save();
        ctx.translate(width / 2 + drift, height / 2);
        ctx.scale(zoom, zoom);
        ctx.translate(-width / 2, -height / 2);
        drawCover(ctx, image, iw, ih, width, height, settings.fit);
        ctx.restore();
        ctx.filter = 'none';
        const fade = transitionSeconds * 1000;
        if (index > 0 && outgoingContext && elapsed < fade) {
          const progress = Math.min(1, elapsed / fade);
          ctx.save();
          if (settings.mood === 'Travel Adventure') {
            ctx.beginPath();
            ctx.rect(progress * width, 0, width * (1 - progress), height);
            ctx.clip();
            ctx.drawImage(outgoingCanvas, 0, 0);
          } else if (settings.mood !== 'Happy & Energetic') {
            ctx.globalAlpha = 1 - progress;
            ctx.drawImage(outgoingCanvas, 0, 0);
          }
          ctx.restore();
        }
        if (index === scenes.length - 1 && durationMs - elapsed < fade) {
          const progress = Math.max(0, 1 - (durationMs - elapsed) / fade);
          ctx.fillStyle = `rgba(14,16,22,${progress * (settings.mood === 'Epic' ? .75 : .45)})`;
          ctx.fillRect(0, 0, width, height);
        }
        onStatus({ stage: `Applying effects and encoding scene ${index + 1} of ${scenes.length}`, elapsed: (performance.now() - startedAt) / 1000 });
        await new Promise((resolve) => window.setTimeout(resolve, 33));
      }
      outgoingContext?.drawImage(canvas, 0, 0);
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
