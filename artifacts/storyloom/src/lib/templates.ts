import { useEffect, useState } from 'react';

export type Mood = 'Cinematic' | 'Romantic' | 'Happy & Energetic' | 'Travel Adventure' | 'Nostalgic' | 'Family & Memories' | 'Epic' | 'Minimal & Elegant' | 'Dreamy' | 'Professional Cut';
export type EffectId = 'colorGrade' | 'cameraMove' | 'vignette' | 'filmGrain' | 'glow' | 'lightLeak' | 'dust' | 'letterbox';
export type TransitionStyle = 'crossfade' | 'wipe' | 'light-leak' | 'film-burn' | 'flash-cut' | 'zoom-impact' | 'soft-fade' | 'bloom' | 'slide' | 'spin' | 'glitch' | 'radial-wipe' | 'dip-black' | 'random';
export type TransitionPreference = 'mood' | 'none' | TransitionStyle;
export type Settings = {
  duration: number;
  customDuration: number;
  quality: '720p' | '1080p';
  mood: Mood;
  fit: 'fit' | 'fill';
  enabledEffects: Record<EffectId, boolean>;
  effectStrength: number;
  overlayText: string;
  overlayStart: number;
  overlayDuration: number;
  overlayOpacity: number;
  transitionStyle: TransitionPreference;
  transitionDuration: number;
  useMoodTransitionDuration: boolean;
};
export type Template = { id: string; name: string; settings: Settings; isDefault?: boolean };
const key = 'storyloom.templates.v1';
const defaultEffects: Record<EffectId, boolean> = {
  colorGrade: true,
  cameraMove: true,
  vignette: true,
  filmGrain: true,
  glow: true,
  lightLeak: true,
  dust: true,
  letterbox: true,
};
const professionalEffects: Record<EffectId, boolean> = { colorGrade: false, cameraMove: true, vignette: false, filmGrain: false, glow: false, lightLeak: false, dust: false, letterbox: false };
export const defaultSettings: Settings = {
  duration: 60,
  customDuration: 75,
  quality: '1080p',
  mood: 'Cinematic',
  fit: 'fill',
  enabledEffects: defaultEffects,
  effectStrength: 100,
  overlayText: '',
  overlayStart: 0,
  overlayDuration: 8,
  overlayOpacity: 82,
  transitionStyle: 'mood',
  transitionDuration: .6,
  useMoodTransitionDuration: true,
};
const moods: Mood[] = ['Cinematic', 'Romantic', 'Happy & Energetic', 'Travel Adventure', 'Nostalgic', 'Family & Memories', 'Epic', 'Minimal & Elegant', 'Dreamy', 'Professional Cut'];
const transitionStyles: TransitionPreference[] = ['mood', 'none', 'crossfade', 'wipe', 'light-leak', 'film-burn', 'flash-cut', 'zoom-impact', 'soft-fade', 'bloom', 'slide', 'spin', 'glitch', 'radial-wipe', 'dip-black', 'random'];
const effectIds: EffectId[] = ['colorGrade', 'cameraMove', 'vignette', 'filmGrain', 'glow', 'lightLeak', 'dust', 'letterbox'];
const initial: Template[] = [{ id: 'tpl-cinematic', name: 'After the Rain', settings: defaultSettings, isDefault: true }];

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const clamp = (value: unknown, fallback: number, min: number, max: number) => typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

export function normalizeSettings(value: unknown): Settings {
  const raw = isRecord(value) ? value : {};
  const rawEffects = isRecord(raw.enabledEffects) ? raw.enabledEffects : {};
  const enabledEffects = Object.fromEntries(effectIds.map((id) => [id, typeof rawEffects[id] === 'boolean' ? rawEffects[id] : defaultEffects[id]])) as Record<EffectId, boolean>;
  const transitionStyle = transitionStyles.includes(raw.transitionStyle as TransitionPreference) ? raw.transitionStyle as TransitionPreference : defaultSettings.transitionStyle;
  return {
    duration: [0, 30, 60, 120, 180, 300].includes(raw.duration as number) ? raw.duration as number : defaultSettings.duration,
    customDuration: clamp(raw.customDuration, defaultSettings.customDuration, 10, 600),
    quality: raw.quality === '720p' || raw.quality === '1080p' ? raw.quality : defaultSettings.quality,
    mood: moods.includes(raw.mood as Mood) ? raw.mood as Mood : defaultSettings.mood,
    fit: raw.fit === 'fit' || raw.fit === 'fill' ? raw.fit : defaultSettings.fit,
    enabledEffects: raw.mood === 'Professional Cut' && !raw.enabledEffects ? professionalEffects : enabledEffects,
    effectStrength: clamp(raw.effectStrength, defaultSettings.effectStrength, 0, 100),
    overlayText: typeof raw.overlayText === 'string' ? raw.overlayText.slice(0, 120) : '',
    overlayStart: clamp(raw.overlayStart, 0, 0, 600),
    overlayDuration: clamp(raw.overlayDuration, 8, .5, 600),
    overlayOpacity: clamp(raw.overlayOpacity, 82, 0, 100),
    transitionStyle,
    transitionDuration: clamp(raw.transitionDuration, defaultSettings.transitionDuration, .15, 2),
    useMoodTransitionDuration: typeof raw.useMoodTransitionDuration === 'boolean' ? raw.useMoodTransitionDuration : defaultSettings.useMoodTransitionDuration,
  };
}

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return initial;
      const parsed: unknown = JSON.parse(saved);
      if (!Array.isArray(parsed)) return initial;
      return parsed.flatMap((entry, index) => {
        if (!isRecord(entry) || typeof entry.name !== 'string') return [];
        return [{
          id: typeof entry.id === 'string' && entry.id ? entry.id : `template-${index}`,
          name: entry.name.slice(0, 80) || 'Untitled look',
          settings: normalizeSettings(entry.settings),
          isDefault: entry.isDefault === true,
        }];
      });
    }
    catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(templates)); }
    catch { /* Storage can be unavailable in private or restricted browser contexts. */ }
  }, [templates]);
  const save = (name: string, settings: Settings) => {
    const template = { id: crypto.randomUUID(), name: name.trim() || 'Untitled look', settings };
    setTemplates((all) => [...all, template]);
    return template;
  };
  const update = (id: string, patch: Partial<Template>) => setTemplates((all) => all.map((item) => item.id === id ? { ...item, ...patch } : patch.isDefault ? { ...item, isDefault: false } : item));
  const remove = (id: string) => setTemplates((all) => all.filter((item) => item.id !== id));
  const duplicate = (item: Template) => save(`${item.name} copy`, item.settings);
  const importFile = async (file: File) => {
    const parsed: unknown = JSON.parse(await file.text());
    const incoming = Array.isArray(parsed) ? parsed : [parsed];
    const clean = incoming.flatMap((entry) => {
      if (!isRecord(entry) || typeof entry.name !== 'string' || !isRecord(entry.settings)) return [];
      return [{ id: crypto.randomUUID(), name: entry.name.trim().slice(0, 80) || 'Untitled look', settings: normalizeSettings(entry.settings), isDefault: false }];
    });
    if (!clean.length) throw new Error('No valid Storyloom templates found.');
    setTemplates((all) => [...all, ...clean]);
  };
  return { templates, save, update, remove, duplicate, importFile };
}
