export type MediaKind = 'image' | 'video' | 'audio';
export type MediaItem = {
  id: string;
  file: File;
  kind: MediaKind;
  url: string;
  width?: number;
  height?: number;
  duration?: number;
  readable: boolean;
  error?: string;
};
export type ImportReport = { accepted: number; rejected: string[]; duplicateCount: number };

const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
const audioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac', 'audio/webm'];
const extension = (name: string) => name.split('.').pop()?.toLowerCase() ?? '';

function mediaType(file: File): MediaKind | null {
  const ext = extension(file.name);
  if (imageTypes.includes(file.type) || ['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return 'image';
  if (videoTypes.includes(file.type) || ['mp4', 'webm', 'mov'].includes(ext)) return 'video';
  if (audioTypes.includes(file.type) || ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'webm'].includes(ext)) return 'audio';
  return null;
}

function readMetadata(url: string, kind: MediaKind): Promise<Pick<MediaItem, 'width' | 'height' | 'duration'>> {
  return new Promise((resolve, reject) => {
    if (kind === 'image') {
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error('Image could not be decoded by this browser.'));
      image.src = url;
      return;
    }
    const element = document.createElement(kind === 'video' ? 'video' : 'audio');
    element.preload = 'metadata';
    element.onloadedmetadata = () => {
      const duration = Number.isFinite(element.duration) ? element.duration : undefined;
      const dimensions = kind === 'video' ? { width: (element as HTMLVideoElement).videoWidth, height: (element as HTMLVideoElement).videoHeight } : {};
      resolve({ duration, ...dimensions });
      element.removeAttribute('src');
      element.load();
    };
    element.onerror = () => reject(new Error('Media format is not readable in this browser.'));
    element.src = url;
  });
}

export async function inspectFiles(files: File[], current: MediaItem[]): Promise<{ items: MediaItem[]; report: ImportReport }> {
  const known = new Set(current.map((item) => `${item.file.name}:${item.file.size}:${item.file.lastModified}`));
  const accepted: MediaItem[] = [];
  const rejected: string[] = [];
  let duplicateCount = 0;
  for (const file of files) {
    const key = `${file.name}:${file.size}:${file.lastModified}`;
    if (known.has(key)) { duplicateCount += 1; continue; }
    known.add(key);
    const kind = mediaType(file);
    if (!kind) { rejected.push(`${file.name} — unsupported file type`); continue; }
    const url = URL.createObjectURL(file);
    try {
      const info = await readMetadata(url, kind);
      accepted.push({ id: `${key}:${Math.random().toString(36).slice(2, 7)}`, file, kind, url, readable: true, ...info });
    } catch (error) {
      accepted.push({ id: `${key}:${Math.random().toString(36).slice(2, 7)}`, file, kind, url, readable: false, error: error instanceof Error ? error.message : 'Unreadable media' });
      rejected.push(`${file.name} — ${error instanceof Error ? error.message : 'unreadable'}`);
    }
  }
  return { items: [...current, ...accepted], report: { accepted: accepted.length, rejected, duplicateCount } };
}

export function formatDuration(seconds?: number) {
  if (!seconds || !Number.isFinite(seconds)) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1_000_000) return `${Math.max(1, Math.round(bytes / 1000))} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

export function sortByCapture(items: MediaItem[]) {
  return [...items].sort((a, b) => {
    const aTime = a.file.lastModified || 0;
    const bTime = b.file.lastModified || 0;
    return aTime - bTime || a.file.name.localeCompare(b.file.name);
  });
}
