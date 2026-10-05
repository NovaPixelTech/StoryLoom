import { useEffect, useState } from 'react';

export type Mood = 'Cinematic' | 'Romantic' | 'Happy & Energetic' | 'Travel Adventure' | 'Nostalgic' | 'Family & Memories' | 'Epic' | 'Minimal & Elegant' | 'Dreamy';
export type Settings = { duration: number; customDuration: number; quality: '720p' | '1080p'; mood: Mood; fit: 'fit' | 'fill' };
export type Template = { id: string; name: string; settings: Settings; isDefault?: boolean };
const key = 'storyloom.templates.v1';
const initial: Template[] = [{ id: 'tpl-cinematic', name: 'After the Rain', settings: { duration: 60, customDuration: 75, quality: '1080p', mood: 'Cinematic', fit: 'fill' }, isDefault: true }];

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>(() => {
    try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) as Template[] : initial; }
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
    const parsed = JSON.parse(await file.text()) as Template[] | Template;
    const incoming = Array.isArray(parsed) ? parsed : [parsed];
    const clean = incoming.filter((item) => typeof item.name === 'string' && item.settings?.mood && item.settings?.quality).map((item) => ({ ...item, id: crypto.randomUUID(), isDefault: false }));
    if (!clean.length) throw new Error('No valid Storyloom templates found.');
    setTemplates((all) => [...all, ...clean]);
  };
  return { templates, save, update, remove, duplicate, importFile };
}
