import { useEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties } from 'react';
import { AlertCircle, Aperture, AudioLines, Check, CircleHelp, Clapperboard, Clock3, Download, FileAudio2, FileImage, FileVideo2, FolderOpen, HardDrive, ImagePlus, LoaderCircle, Music2, Pause, Play, Plus, RotateCcw, Save, Settings2, ShieldCheck, Sparkles, Trash2, Upload, X } from 'lucide-react';
import { formatBytes, formatDuration, inspectFiles, sortByCapture, type MediaItem } from './lib/media';
import { effectOptions, makePlan, moodNotes, moods, recordFilm, resolveMoodLook, supportedRecording, transitionOptions, type RenderStatus } from './lib/render';
import { defaultSettings, useTemplates, type EffectId, type Settings, type Template, type TransitionPreference } from './lib/templates';

const timeChoices = [{ value: 30, label: '30 sec' }, { value: 60, label: '1 min' }, { value: 120, label: '2 min' }, { value: 180, label: '3 min' }, { value: 300, label: '5 min' }, { value: 0, label: 'Custom' }];
const iconFor = (kind: MediaItem['kind']) => kind === 'image' ? FileImage : kind === 'video' ? FileVideo2 : FileAudio2;
const moodShort: Record<string, string> = { 'Happy & Energetic': 'Bright, quick cuts', 'Travel Adventure': 'Open-road color', 'Family & Memories': 'Soft, familiar warmth', 'Minimal & Elegant': 'Quiet and precise' };
const fmtTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

function App() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [sceneTimings, setSceneTimings] = useState<Record<string, number>>({});
  const [scanBusy, setScanBusy] = useState(false);
  const [report, setReport] = useState<{ accepted: number; rejected: string[]; duplicateCount: number } | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [rendering, setRendering] = useState(false);
  const [cancelRequested, setCancelRequested] = useState(false);
  const [renderStatus, setRenderStatus] = useState<RenderStatus | null>(null);
  const [renderError, setRenderError] = useState('');
  const [templateDialog, setTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [templateMessage, setTemplateMessage] = useState('');
  const [dragging, setDragging] = useState(false);
  const photoPicker = useRef<HTMLInputElement>(null);
  const folderPicker = useRef<HTMLInputElement>(null);
  const templatePicker = useRef<HTMLInputElement>(null);
  const cancelRef = useRef(false);
  const outputUrl = useRef<string | null>(null);
  const mediaRef = useRef(media);
  mediaRef.current = media;
  const { templates, save, update, remove, duplicate, importFile } = useTemplates();
  const plan = useMemo(() => makePlan(media, settings, sceneTimings), [media, settings, sceneTimings]);
  const photos = media.filter((item) => item.kind === 'image');
  const videos = media.filter((item) => item.kind === 'video');
  const audio = media.filter((item) => item.kind === 'audio');
  const readableVisuals = media.filter((item) => item.readable && item.kind !== 'audio');
  const recorderCapability = supportedRecording(settings);
  const { profile: activeLook, filter: activeFilter } = resolveMoodLook(settings);
  const folderSupported = typeof HTMLInputElement !== 'undefined' && 'webkitdirectory' in HTMLInputElement.prototype;
  const audioMixSupported = typeof window.AudioContext !== 'undefined';
  const filmDuration = settings.duration === 0 ? settings.customDuration : settings.duration;
  const plannedDuration = plan.length ? plan.reduce((sum, scene) => sum + scene.duration, 0) : filmDuration;
  const selectedScene = plan[Math.min(previewIndex, Math.max(plan.length - 1, 0))];
  const canRender = !!plan.length && !!recorderCapability && !rendering;
  const inputAccept = 'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4,audio/aac,audio/webm,.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov,.mp3,.wav,.ogg,.m4a,.aac';

  useEffect(() => {
    if (!previewing || plan.length < 2) return;
    const currentIndex = previewIndex % plan.length;
    const duration = plan[currentIndex]?.duration ?? 3.2;
    const timeout = window.setTimeout(() => setPreviewIndex((index) => (index + 1) % plan.length), Math.max(.5, duration) * 1000);
    return () => window.clearTimeout(timeout);
  }, [previewing, previewIndex, plan]);
  useEffect(() => {
    const defaultTemplate = templates.find((template) => template.isDefault);
    if (defaultTemplate) {
      setSettings(defaultTemplate.settings);
      setActiveTemplate(defaultTemplate.id);
    }
  }, []);
  useEffect(() => () => {
    mediaRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    if (outputUrl.current) URL.revokeObjectURL(outputUrl.current);
  }, []);

  const addFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;
    setScanBusy(true);
    setReport(null);
    try {
      const result = await inspectFiles(list, media);
      setMedia(result.items);
      setReport(result.report);
    } finally { setScanBusy(false); }
  };
  const removeMedia = (id: string) => {
    setSceneTimings((timings) => {
      const next = { ...timings };
      delete next[id];
      return next;
    });
    setMedia((all) => {
      const removed = all.find((item) => item.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return all.filter((item) => item.id !== id);
    });
  };
  const clearCollection = () => {
    media.forEach((item) => URL.revokeObjectURL(item.url));
    setMedia([]);
    setSceneTimings({});
    setReport(null);
    setPreviewing(false);
  };
  const applyTemplate = (template: Template) => {
    setSettings(template.settings);
    setActiveTemplate(template.id);
    setTemplateMessage(`“${template.name}” loaded. Source media stays in this session only.`);
    window.setTimeout(() => setTemplateMessage(''), 4000);
  };
  const saveTemplate = () => {
    const template = save(templateName, settings);
    setActiveTemplate(template.id);
    setTemplateName('');
    setTemplateDialog(false);
    setTemplateMessage('Creative template saved on this device.');
    window.setTimeout(() => setTemplateMessage(''), 3500);
  };
  const exportTemplates = () => {
    const blob = new Blob([JSON.stringify(templates, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'storyloom-templates.json'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const importTemplate = async (file?: File) => {
    if (!file) return;
    try {
      await importFile(file);
      setTemplateMessage('Template import complete.');
    } catch (error) {
      setTemplateMessage(error instanceof Error ? error.message : 'Template file could not be imported.');
    }
    window.setTimeout(() => setTemplateMessage(''), 4000);
  };
  const startRender = async () => {
    setRenderError('');
    setRenderStatus(null);
    setRendering(true);
    setCancelRequested(false);
    cancelRef.current = false;
    if (outputUrl.current) { URL.revokeObjectURL(outputUrl.current); outputUrl.current = null; }
    let lastStatusKey = '';
    try {
      const result = await recordFilm(plan, media, settings, (status) => {
        const key = `${status.stage}:${Math.floor(status.elapsed)}:${status.result ? 'ready' : ''}`;
        if (key !== lastStatusKey) {
          lastStatusKey = key;
          setRenderStatus(status);
        }
      }, () => cancelRef.current);
      outputUrl.current = result.url;
      setRenderStatus((current) => current ? { ...current, result } : current);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The film could not be rendered.';
      if (!message.includes('cancelled')) setRenderError(message);
      setRenderStatus((current) => current ? { ...current, stage: message.includes('cancelled') ? 'Render cancelled' : 'Render stopped safely' } : null);
    } finally {
      setRendering(false);
      setCancelRequested(false);
    }
  };
  const cancelRender = () => { cancelRef.current = true; setCancelRequested(true); };
  const downloadFilm = () => {
    if (!renderStatus?.result) return;
    const link = document.createElement('a');
    link.href = renderStatus.result.url;
    link.download = `storyloom-memory-film.${renderStatus.result.extension}`;
    link.click();
  };
  const setSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setActiveTemplate(null);
  };
  const setEffectEnabled = (id: EffectId, enabled: boolean) => {
    setSettings((current) => ({ ...current, enabledEffects: { ...current.enabledEffects, [id]: enabled } }));
    setActiveTemplate(null);
  };
  const setSceneDuration = (id: string, duration: number) => {
    if (!Number.isFinite(duration) || duration < 1) return;
    setSceneTimings((current) => ({ ...current, [id]: Math.min(600, Math.round(duration * 10) / 10) }));
    setPreviewing(false);
  };
  const resetSceneDuration = (id: string) => setSceneTimings((current) => {
    const next = { ...current };
    delete next[id];
    return next;
  });
  const transitionLabel = settings.transitionStyle === 'mood'
    ? moodNotes[settings.mood].transition
    : transitionOptions.find((option) => option.value === settings.transitionStyle)?.label ?? 'Cross-dissolve';
  const onPicker = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) void addFiles(event.target.files);
    event.target.value = '';
  };

  return <main className="storyloom grain">
    <header className="topbar">
      <a className="brand" href="/" aria-label="Storyloom home"><span className="brand-mark"><Aperture size={21} strokeWidth={1.7} /></span><span>storyloom<span className="brand-period">.</span></span></a>
      <div className="topbar-right">
        <div className="privacy-chip"><ShieldCheck size={14} /><span>Private by design</span></div>
        <span className="version-tag">LOCAL STUDIO <i /></span>
      </div>
    </header>

    <div className="studio-shell">
      <aside className="left-rail" aria-label="Creation steps">
        <div className="rail-caption eyebrow">YOUR FILM</div>
        <a href="#moments" className="step-link active"><span className="step-num">01</span><span>Gather moments</span></a>
        <a href="#direction" className="step-link"><span className="step-num">02</span><span>Set the feeling</span></a>
        <a href="#storyboard" className="step-link"><span className="step-num">03</span><span>Shape the story</span></a>
        <div className="rail-divider" />
        <div className="rail-caption eyebrow">A SMALL PROMISE</div>
        <p className="rail-copy">Your originals never leave this device. Storyloom makes the film right here, in your browser.</p>
        <div className="rail-lock"><HardDrive size={15} /><span>ON-DEVICE WORKSPACE</span></div>
        <div className="rail-bottom">
          <span className="rail-orb" />
          <span>Made for the moments<br />you want to keep.</span>
        </div>
      </aside>

      <div className="studio-main">
        <section className="welcome-row">
          <div><div className="eyebrow welcome-kicker">A PERSONAL FILM STUDIO</div><h1>Make a little <em>cinema</em><br className="title-break" /> from your life.</h1>
          <p className="welcome-sub">Bring your moments. Choose the feeling. We’ll shape the story — privately, right here.</p></div>
          <div className="edition-note"><span className="edition-rule" /><span>YOUR STORY, FRAME BY FRAME</span><span className="edition-number">01 / 01</span></div>
        </section>

        <section id="moments" className="section-block">
          <div className="section-head">
            <div className="section-heading"><span className="section-index">01</span><div><h2>Gather your moments</h2><p>Choose photos, clips and an optional soundtrack.</p></div></div>
            <div className="count-stack"><strong>{readableVisuals.length}</strong><span>visual moments</span></div>
          </div>
          <div className={`import-zone ${dragging ? 'drag-active' : ''} ${media.length ? 'has-media' : ''}`}
            onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => { event.preventDefault(); setDragging(false); void addFiles(event.dataTransfer.files); }}>
            <div className="import-symbol"><ImagePlus size={23} strokeWidth={1.5} /></div>
            <div className="import-text"><strong>{media.length ? 'Add more to this collection' : 'Start with a folder of moments'}</strong><span>JPG, PNG, WebP · MP4, WebM, MOV · MP3 and browser-readable audio</span></div>
            <div className="import-actions">
              <button className="btn btn-primary" onClick={() => folderPicker.current?.click()} disabled={!folderSupported} title={folderSupported ? 'Select a folder of media' : 'Folder selection is not available in this browser'} data-testid="button-choose-folder"><FolderOpen size={16} />{folderSupported ? 'Choose folder' : 'Folder unavailable'}</button>
              <button className="btn btn-quiet" onClick={() => photoPicker.current?.click()} data-testid="button-choose-files"><Plus size={16} />Choose files</button>
            </div>
            <input ref={folderPicker} type="file" multiple accept={inputAccept} onChange={onPicker} className="hidden" {...({ webkitdirectory: '', directory: '' } as Record<string, string>)} aria-label="Choose a folder of photos, video and audio" />
            <input ref={photoPicker} type="file" multiple accept={inputAccept} onChange={onPicker} className="hidden" aria-label="Choose photos, video and audio files" />
            <div className="drop-note"><ShieldCheck size={13} /> Files stay on this device. Nothing is uploaded.</div>
            {dragging && <div className="drop-overlay">Drop your moments here</div>}
          </div>
          {scanBusy && <div className="scan-status"><LoaderCircle size={15} className="spin" />Reading media locally and checking browser support…</div>}
          {report && <div className="report-banner" role="status"><span><Check size={15} /> {report.accepted} file{report.accepted === 1 ? '' : 's'} added</span>{report.duplicateCount > 0 && <span>{report.duplicateCount} duplicate{report.duplicateCount === 1 ? '' : 's'} skipped</span>}{report.rejected.length > 0 && <details><summary><AlertCircle size={14} />{report.rejected.length} unsupported or unreadable</summary><ul>{report.rejected.map((entry, index) => <li key={`${entry}-${index}`}>{entry}</li>)}</ul></details>}</div>}
          <div className="media-summary">
            <span><FileImage size={14} />{photos.length} photos</span><span><FileVideo2 size={14} />{videos.length} clips</span><span><Music2 size={14} />{audio.length} soundtrack{audio.length === 1 ? '' : 's'}</span>
            {media.length > 0 && <button onClick={clearCollection} className="text-button danger-text" data-testid="button-clear-media"><Trash2 size={13} />Clear collection</button>}
          </div>
          {media.length > 0 ? <div className="media-grid">
            {sortByCapture(media).map((item) => {
              const Icon = iconFor(item.kind);
              const orientation = item.width && item.height ? (item.width > item.height ? 'Landscape' : item.width < item.height ? 'Portrait' : 'Square') : '';
              return <article className={`media-card ${!item.readable ? 'unreadable' : ''}`} key={item.id} data-testid={`card-media-${item.id}`}>
                <div className="media-thumb">
                  {item.readable && item.kind === 'image' && <img src={item.url} alt={item.file.name} />}
                  {item.readable && item.kind === 'video' && <video src={item.url} muted playsInline preload="metadata" />}
                  {item.kind === 'audio' && <div className="audio-art"><AudioLines size={27} /><span>{formatDuration(item.duration)}</span></div>}
                  {!item.readable && <div className="unreadable-mark"><AlertCircle size={19} /><span>Unreadable</span></div>}
                  <span className={`kind-chip ${item.kind}`}><Icon size={12} />{item.kind}</span>
                  <button className="remove-media" onClick={() => removeMedia(item.id)} aria-label={`Remove ${item.file.name}`} title="Remove from collection"><X size={14} /></button>
                </div>
                <div className="media-meta"><strong title={item.file.name}>{item.file.name}</strong><span>{item.kind === 'audio' ? formatDuration(item.duration) : `${item.width ?? '—'} × ${item.height ?? '—'}${orientation ? ` · ${orientation}` : ''}`}</span><small>{formatBytes(item.file.size)}{item.file.lastModified ? ` · ${new Date(item.file.lastModified).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}</small>{item.error && <small className="error-copy">{item.error}</small>}</div>
              </article>;
            })}
          </div> : <div className="empty-collection"><div className="empty-film"><span /><span /><span /><span /><span /></div><div><strong>Your collection is waiting.</strong><span>Images, moving pictures, a song in the background — start anywhere.</span></div></div>}
          <p className="picker-note"><CircleHelp size={13} /> {folderSupported ? 'Folder selection is available; multi-file selection is the fallback.' : 'This browser does not expose folder selection.'} On iPhone, iPad, or unsupported browsers, use <button onClick={() => photoPicker.current?.click()}>Choose files</button> to select multiple items. MOV and other formats only work if this browser can decode them.</p>
        </section>

        <section id="direction" className="section-block direction-block">
          <div className="section-head">
            <div className="section-heading"><span className="section-index">02</span><div><h2>Set the feeling</h2><p>A few choices guide the edit — nothing to learn, nothing to fuss over.</p></div></div>
            <button className="btn btn-quiet template-open" onClick={() => setTemplateDialog(true)}><Save size={15} />Save as template</button>
          </div>
          <div className="settings-grid">
            <div className="setting-panel duration-panel">
              <div className="setting-label"><Clock3 size={15} /><span>FILM LENGTH</span></div>
              <div className="duration-options">{timeChoices.map((choice) => <button key={choice.value} className={`duration-option ${settings.duration === choice.value ? 'selected' : ''}`} onClick={() => setSetting('duration', choice.value)} aria-pressed={settings.duration === choice.value}>{choice.label}</button>)}</div>
              {settings.duration === 0 && <label className="custom-duration">Custom length <span className="custom-control"><input aria-label="Custom film duration in seconds" type="number" min={10} max={600} value={settings.customDuration} onChange={(event) => setSetting('customDuration', Math.min(600, Math.max(10, Number(event.target.value))))} /><span>seconds · 10 sec–10 min</span></span></label>}
              <p className="setting-help">A short film leaves room for each moment to breathe.</p>
            </div>
            <div className="setting-panel quality-panel">
              <div className="setting-label"><Settings2 size={15} /><span>PICTURE SIZE</span></div>
              <div className="quality-options">{(['720p', '1080p'] as const).map((quality) => <button key={quality} className={`quality-option ${settings.quality === quality ? 'selected' : ''}`} onClick={() => setSetting('quality', quality)} aria-pressed={settings.quality === quality}><span className="quality-mark">{quality === '1080p' ? 'HD' : 'HD'}</span><span><strong>{quality}</strong><small>{quality === '1080p' ? 'Full HD · 16:9' : 'HD · lighter render'}</small></span>{settings.quality === quality && <Check size={15} />}</button>)}</div>
              <p className="setting-help">Resolution sets output dimensions, not extra detail in your originals. 4K is unavailable in this local render path.</p>
            </div>
          </div>
          <div className="mood-heading"><div><span className="eyebrow">THE COLOR OF THIS MEMORY</span><h3>Choose a mood</h3></div><span className="mood-selected">{settings.mood}</span></div>
          <div className="mood-list" role="group" aria-label="Film mood">
            {moods.map((mood, index) => <button key={mood} className={`mood-choice mood-${index} ${settings.mood === mood ? 'selected' : ''}`} onClick={() => setSetting('mood', mood)} aria-pressed={settings.mood === mood}>
              <span className="mood-swatch"><i /><i /><i /></span><span className="mood-copy"><strong>{mood}</strong><small>{moodShort[mood] ?? moodNotes[mood].grade}</small></span>{settings.mood === mood && <span className="mood-check"><Check size={13} /></span>}
            </button>)}
          </div>
          <div className="look-editor">
            <div className="look-editor-head">
              <div><span className="eyebrow">YOUR CUSTOM CUT</span><h3>Effects &amp; transitions</h3><p>Start with the mood, then tune the treatment before you render.</p></div>
              <button className="text-button" onClick={() => { setSettings((current) => ({ ...current, enabledEffects: { ...defaultSettings.enabledEffects }, effectStrength: defaultSettings.effectStrength, transitionStyle: defaultSettings.transitionStyle, transitionDuration: defaultSettings.transitionDuration, useMoodTransitionDuration: true })); setActiveTemplate(null); }}><RotateCcw size={13} />Reset controls</button>
            </div>
            <div className="look-control-grid">
              <div className="effect-control-panel">
                <div className="setting-label"><Sparkles size={14} /><span>VISUAL EFFECTS</span></div>
                <div className="effect-control-list">
                  {effectOptions.map((effect) => <label className="effect-toggle" key={effect.id}>
                    <input type="checkbox" checked={settings.enabledEffects[effect.id]} onChange={(event) => setEffectEnabled(effect.id, event.target.checked)} />
                    <span className="effect-toggle-copy"><strong>{effect.label}</strong><small>{effect.detail}</small></span>
                  </label>)}
                </div>
                <label className="custom-range">
                  <span className="custom-range-heading"><span><strong>Effect strength</strong><small>Adjusts motion, tint and atmosphere</small></span><b>{settings.effectStrength}%</b></span>
                  <input aria-label="Effect strength" type="range" min={0} max={100} step={1} value={settings.effectStrength} onChange={(event) => setSetting('effectStrength', Number(event.target.value))} />
                </label>
              </div>
              <div className="transition-control-panel">
                <div className="setting-label"><Clapperboard size={14} /><span>SCENE TRANSITION</span></div>
                <label className="transition-select-label"><span>Transition style</span>
                  <select className="field" value={settings.transitionStyle} onChange={(event) => setSetting('transitionStyle', event.target.value as TransitionPreference)}>
                    {transitionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <label className="custom-range transition-range">
                  <span className="custom-range-heading"><span><strong>Transition duration</strong><small>{settings.useMoodTransitionDuration ? 'Following the mood preset' : 'Custom timing · short scenes adapt automatically'}</small></span><b>{settings.transitionStyle === 'none' ? 'Off' : `${activeLook.transitionSeconds.toFixed(2)} s`}</b></span>
                  <input aria-label="Transition duration in seconds" type="range" min={0.15} max={2} step={0.05} value={activeLook.transitionSeconds} disabled={settings.transitionStyle === 'none'} onChange={(event) => { setSettings((current) => ({ ...current, transitionDuration: Number(event.target.value), useMoodTransitionDuration: false })); setActiveTemplate(null); }} />
                  {!settings.useMoodTransitionDuration && <button type="button" className="use-mood-timing" onClick={() => { setSettings((current) => ({ ...current, useMoodTransitionDuration: true })); setActiveTemplate(null); }}>Use mood timing</button>}
                </label>
                <div className="transition-current"><span>Applied transition</span><strong>{transitionLabel}</strong></div>
                <p className="transition-note">Transition time is contained within each scene. Total film time is the sum of your scene timings.</p>
              </div>
            </div>
            <p className="look-editor-footnote">Saved looks keep these effect and transition choices. Scene timings are specific to the current media and are not included in templates.</p>
          </div>
          <div className="fit-row"><div><strong>Frame your photos</strong><span>Choose whether to preserve the whole image or fill the widescreen frame.</span></div><div className="segmented"><button onClick={() => setSetting('fit', 'fill')} className={settings.fit === 'fill' ? 'active' : ''} aria-pressed={settings.fit === 'fill'}>Fill frame</button><button onClick={() => setSetting('fit', 'fit')} className={settings.fit === 'fit' ? 'active' : ''} aria-pressed={settings.fit === 'fit'}>Show whole photo</button></div></div>

          <div className="templates-panel">
            <div className="template-title"><Sparkles size={15} /><div><strong>Your saved looks</strong><span>Kept on this device. Media is never part of a template.</span></div></div>
            <div className="template-controls">
              <select aria-label="Choose saved template" className="field template-select" value={activeTemplate ?? ''} onChange={(event) => { const selected = templates.find((item) => item.id === event.target.value); if (selected) applyTemplate(selected); }}>
                <option value="" disabled>{templates.length ? 'Load a saved look…' : 'No saved looks'}</option>{templates.map((template) => <option key={template.id} value={template.id}>{template.name}{template.isDefault ? ' · default' : ''}</option>)}
              </select>
              <button className="btn btn-quiet small-btn" onClick={() => { const current = templates.find((item) => item.id === activeTemplate); if (current) { const name = window.prompt('Rename this template', current.name); if (name?.trim()) update(current.id, { name: name.trim() }); } else setTemplateMessage('Load a template to rename it.'); }} title="Rename selected template"><span className="rename-glyph">Aa</span><span className="sr-only">Rename template</span></button>
              <button className="btn btn-quiet small-btn" onClick={() => { const current = templates.find((item) => item.id === activeTemplate); if (current) { const copy = duplicate(current); setActiveTemplate(copy.id); setTemplateMessage(`Duplicated “${current.name}”.`); } else setTemplateMessage('Load a template to duplicate it.'); }} title="Duplicate selected template"><Plus size={15} /><span className="sr-only">Duplicate template</span></button>
              <button className="btn btn-quiet small-btn" onClick={() => { const current = templates.find((item) => item.id === activeTemplate); if (current && window.confirm(`Delete “${current.name}” from this device?`)) { remove(current.id); setActiveTemplate(null); } else if (!current) setTemplateMessage('Load a template to delete it.'); }} title="Delete selected template"><Trash2 size={15} /><span className="sr-only">Delete template</span></button>
              <button className="btn btn-quiet small-btn" onClick={() => { const current = templates.find((item) => item.id === activeTemplate); if (current) { update(current.id, { isDefault: true }); setTemplateMessage(`“${current.name}” is now your default look.`); } else setTemplateMessage('Load a template to set it as default.'); }} title="Set selected template as default"><Sparkles size={14} /><span className="sr-only">Set default template</span></button>
            </div>
            <div className="template-foot"><button onClick={exportTemplates}><Download size={13} />Export JSON</button><button onClick={() => templatePicker.current?.click()}><Upload size={13} />Import JSON</button><input ref={templatePicker} type="file" accept="application/json,.json" className="hidden" aria-label="Import template JSON" onChange={(event) => { void importTemplate(event.target.files?.[0]); event.target.value = ''; }} />{templateMessage && <span role="status">{templateMessage}</span>}</div>
          </div>
        </section>

        <section id="storyboard" className="section-block storyboard-block">
          <div className="section-head">
            <div className="section-heading"><span className="section-index">03</span><div><h2>Shape the story</h2><p>A local-first edit, arranged in capture order and made from your actual media.</p></div></div>
            <div className="story-total"><span>ESTIMATED RUN TIME</span><strong>{fmtTime(plannedDuration)}</strong></div>
          </div>
          <div className="story-layout">
            <div className="preview-monitor">
              <div className="monitor-top"><span><span className="live-dot" />STORY PREVIEW</span><span>16:9 · {settings.quality}</span></div>
              <div className="monitor-image" data-motion={activeLook.motion} data-transition={activeLook.transition} style={{ '--mood-filter': activeFilter, '--look-tint': `rgb(${activeLook.tint})`, '--look-vignette': activeLook.vignette, '--look-glow': activeLook.glow, '--look-leak': activeLook.lightLeak, '--look-grain': activeLook.grain, '--look-bars': `${activeLook.letterbox * 100}%`, '--look-transition-duration': `${activeLook.transitionSeconds}s`, '--look-zoom': String(1 + activeLook.zoom), '--look-motion-name': `preview-${activeLook.motion}` } as CSSProperties}>
                {selectedScene?.item.kind === 'image' && <img key={`${selectedScene.item.id}-${previewIndex}`} src={selectedScene.item.url} alt={`Preview scene: ${selectedScene.item.file.name}`} />}
                {selectedScene?.item.kind === 'video' && <video key={`${selectedScene.item.id}-${previewIndex}`} src={selectedScene.item.url} muted playsInline autoPlay loop />}
                {selectedScene && <><div className="preview-vignette" /><div className="preview-bloom" /><div className="preview-light-leak" /><div className="preview-grain" /><div className="preview-matte" /><div key={`${selectedScene.item.id}-${previewIndex}-${activeLook.transition}`} className="preview-transition" /></>}
                {!selectedScene && <div className="preview-empty"><Aperture size={28} /><span>Your film begins here</span><small>Add a readable photo or clip to preview the story.</small></div>}
                <div className="monitor-caption"><span>{settings.mood.toUpperCase()} CUT</span><span>{String(previewIndex + 1).padStart(2, '0')} / {String(plan.length).padStart(2, '0')}</span></div>
              </div>
              <div className="monitor-controls"><button className="preview-play" onClick={() => { if (plan.length < 2) return; setPreviewing((value) => !value); }} aria-label={previewing ? 'Pause story preview' : 'Play story preview'} disabled={plan.length < 2}>{previewing ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}</button><div className="preview-track"><span style={{ width: `${plan.length ? (previewIndex + 1) / plan.length * 100 : 0}%` }} /></div><span className="mono preview-time">{plan.length ? `${String(previewIndex + 1).padStart(2, '0')} / ${String(plan.length).padStart(2, '0')}` : '— / —'}</span></div>
            </div>
            <div className="plan-panel">
              <div className="plan-topline"><div><span className="eyebrow">EDITABLE STORY PLAN</span><h3>{plan.length ? `${plan.length} scenes, one thread` : 'Waiting for moments'}</h3></div><button className="text-button" onClick={() => { setPreviewing(false); setPreviewIndex(0); }} disabled={!plan.length}><RotateCcw size={13} />Reset preview</button></div>
              {plan.length ? <div className="timeline">
                {plan.map((scene, index) => <button className={`timeline-scene ${previewIndex === index ? 'current' : ''}`} key={`${scene.item.id}-${index}`} onClick={() => { setPreviewIndex(index); setPreviewing(false); }} aria-label={`Preview scene ${index + 1}: ${scene.item.file.name}`} data-testid={`scene-${index + 1}`}>
                  <div className="timeline-thumb">{scene.item.kind === 'image' ? <img src={scene.item.url} alt="" /> : <video src={scene.item.url} muted playsInline preload="metadata" />}</div><span className="timeline-number">{String(index + 1).padStart(2, '0')}</span><span className="timeline-info"><strong>{scene.item.file.name}</strong><small>{scene.item.kind} · {scene.duration.toFixed(1)} s</small></span><span className="timeline-line" />
                </button>)}
              </div> : <div className="plan-empty"><Clapperboard size={22} /><span>Nothing to arrange just yet.</span><small>Readable photos and video clips will form a deterministic scene plan. Audio is optional.</small></div>}
              <div className="plan-recipe"><div className="recipe-item"><span className="recipe-dot" /><span><small>MOOD</small><strong>{settings.mood}</strong></span></div><div className="recipe-item"><span className="recipe-dot gold" /><span><small>LOOK</small><strong>{settings.enabledEffects.colorGrade ? moodNotes[settings.mood].grade : 'Original color'}</strong></span></div><div className="recipe-item"><span className="recipe-dot sage" /><span><small>MOTION</small><strong>{settings.enabledEffects.cameraMove && settings.effectStrength > 0 ? moodNotes[settings.mood].motion : 'Static frame'}</strong></span></div><div className="recipe-item"><span className="recipe-dot lavender" /><span><small>TRANSITION</small><strong>{transitionLabel}{settings.transitionStyle !== 'none' ? ` · ${activeLook.transitionSeconds.toFixed(2)}s` : ''}</strong></span></div><div className="effect-stack"><small>APPLIED EFFECTS</small><div>{effectOptions.filter((effect) => settings.enabledEffects[effect.id]).map((effect) => <span key={effect.id}>{effect.label}</span>)}{!effectOptions.some((effect) => settings.enabledEffects[effect.id]) && <span>Clean image</span>}</div></div></div>
            </div>
          </div>
          {selectedScene && <div className="scene-timing-panel">
            <div className="scene-timing-copy"><span className="eyebrow">SHOT TIMING</span><strong>Scene {previewIndex + 1} · {selectedScene.item.file.name}</strong><small>Set how long this moment holds. Changing timings changes the total film length.</small></div>
            <label className="scene-duration-input"><span>Duration</span><span className="scene-duration-field"><input aria-label={`Scene ${previewIndex + 1} duration in seconds`} type="number" min={1} max={600} step={0.1} value={selectedScene.duration.toFixed(1)} onChange={(event) => setSceneDuration(selectedScene.item.id, event.target.valueAsNumber)} /><span>sec</span></span></label>
            <button className="btn btn-quiet small-btn" onClick={() => resetSceneDuration(selectedScene.item.id)} title="Use the automatic duration for this scene">Auto</button>
            <button className="text-button reset-all-timings" onClick={() => setSceneTimings({})} disabled={!Object.keys(sceneTimings).length}><RotateCcw size={13} />Reset all</button>
          </div>}
          <div className="limitations">
            <div className="limit-icon"><AlertCircle size={16} /></div><div><strong>Keep an eye on the available moments</strong><p>{!readableVisuals.length ? 'No readable photos or video yet. The renderer needs at least one visual scene.' : plan.length < 4 ? `Only ${plan.length} scene${plan.length === 1 ? '' : 's'} available. The film can run longer than your footage; each moment will be held for the scene duration.` : `Your ${settings.mood.toLowerCase()} look is customized with the selected effects and transitions. This browser records in real time, so a ${fmtTime(plannedDuration)} film takes at least that long to make.`} Readable soundtracks are sequenced, crossfaded and faded out; original clip audio is mixed more quietly under music when browser audio mixing is available.</p></div>
          </div>
          {audio.length > 0 && <div className="audio-note"><Music2 size={15} /><span><strong>{audio.filter((item) => item.readable).length} readable soundtrack{audio.filter((item) => item.readable).length === 1 ? '' : 's'} found.</strong> {audioMixSupported ? 'Readable tracks are ordered by file date and name, then crossfaded locally. Original clip audio is included at a lower level where available.' : 'This browser does not expose local audio mixing; video export will be silent.'}</span></div>}
          {audio.length === 0 && videos.some((item) => item.readable) && <div className="audio-note"><FileVideo2 size={15} /><span>{audioMixSupported ? 'Original audio from readable video clips is included when present; you can add music if you want a soundtrack.' : 'This browser does not expose local audio mixing; video export will be silent.'}</span></div>}
          {!recorderCapability && <div className="warning-note"><AlertCircle size={15} />This browser does not expose canvas recording / MediaRecorder. Local video export is unavailable here.</div>}
          {recorderCapability && <div className="format-note"><Check size={14} />{recorderCapability.note} No server, no upload, no 4K. {settings.quality} output uses {settings.quality === '1080p' ? '1920 × 1080' : '1280 × 720'} canvas frames.</div>}
          {renderStatus && <div className={`render-status ${renderStatus.result ? 'ready' : ''}`} role="status"><div className="render-symbol">{renderStatus.result ? <Check size={17} /> : rendering ? <LoaderCircle className="spin" size={17} /> : <Clapperboard size={17} />}</div><div className="render-status-copy"><strong>{renderStatus.stage}</strong><span>{renderStatus.result ? `${renderStatus.result.extension.toUpperCase()} · ${renderStatus.result.width} × ${renderStatus.result.height} · ${renderStatus.result.duration === null ? `${fmtTime(filmDuration)} target; exact duration metadata unavailable` : `${fmtTime(renderStatus.result.duration)} validated duration`} · ${renderStatus.result.hasAudio ? 'audio track included' : 'no audio track'} · rendered in ${fmtTime(renderStatus.elapsed)}` : rendering ? `Local render in progress · ${fmtTime(renderStatus.elapsed)} elapsed. Encoding progress is not exposed precisely by this browser.` : renderStatus.stage === 'Render cancelled' ? 'No upload was made. You can safely try again.' : ''}</span></div>{renderStatus.result && <button className="btn btn-primary download-btn" onClick={downloadFilm}><Download size={15} />Download {renderStatus.result.extension.toUpperCase()}</button>}</div>}
          {renderError && <div className="render-error" role="alert"><AlertCircle size={15} /><span>{renderError}</span><button className="text-button" onClick={startRender}>Retry render</button></div>}
          <div className="render-bar"><div className="render-reassurance"><ShieldCheck size={15} /><span>All processing stays on this device.</span></div><div className="render-actions">{rendering && <button className="btn btn-quiet" onClick={cancelRender} disabled={cancelRequested}>{cancelRequested ? 'Stopping safely…' : 'Cancel render'}</button>}<button className="btn btn-primary render-button" onClick={startRender} disabled={!canRender} data-testid="button-render"><Clapperboard size={16} />{rendering ? 'Rendering locally…' : renderStatus?.result ? 'Render again' : 'Create my film'}</button></div></div>
          <p className="render-disclaimer">The film is captured from a live canvas in real time. Your original files remain untouched; re-select them after refreshing this page.</p>
        </section>

        <footer className="studio-footer"><span><Aperture size={14} />STORYLOOM <i>—</i> PRIVATE CREATIVE STUDIO</span><span>MADE OF MOMENTS, KEPT CLOSE</span></footer>
      </div>
    </div>
    {templateDialog && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setTemplateDialog(false); }}><div className="template-modal" role="dialog" aria-modal="true" aria-labelledby="template-modal-title"><div className="modal-top"><span className="eyebrow">SAVE YOUR CREATIVE DIRECTION</span><button onClick={() => setTemplateDialog(false)} aria-label="Close template dialog"><X size={17} /></button></div><h2 id="template-modal-title" className="serif">Keep this look close.</h2><p>Your settings will be saved in this browser only. Source photos, clips, and music are never included.</p><label className="eyebrow modal-label" htmlFor="template-name">TEMPLATE NAME</label><input id="template-name" autoFocus maxLength={48} className="field" placeholder="e.g. Summer in the old town" value={templateName} onChange={(event) => setTemplateName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && templateName.trim()) saveTemplate(); if (event.key === 'Escape') setTemplateDialog(false); }} /><div className="modal-actions"><button className="btn btn-quiet" onClick={() => setTemplateDialog(false)}>Not now</button><button className="btn btn-primary" onClick={saveTemplate} disabled={!templateName.trim()}><Save size={15} />Save on this device</button></div></div></div>}
  </main>;
}

export default App;
