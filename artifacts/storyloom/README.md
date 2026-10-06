# Storyloom

Storyloom turns selected photos, video clips, and local soundtrack files into a short cinematic film. Media is read, rendered, and encoded in the browser; source files are not uploaded or stored in templates.

## Run and check

Install dependencies with pnpm, then start the local development server or build the static site:

```sh
pnpm install
pnpm --filter @workspace/storyloom run dev
pnpm --filter @workspace/storyloom run typecheck
pnpm build:pages
```

The app does not require the shared API server, a database, or external API credentials.

## How local rendering works

- The browser draws each planned scene to a canvas at 30 frames per second and records the canvas with `MediaRecorder`.
- Storyloom selects MP4 only when the browser reports that MIME type as supported; otherwise it records WebM when available. The download extension follows the browser's actual output MIME type.
- Output is 1280 × 720 or 1920 × 1080. The current renderer does not offer 4K.
- A render runs in real time and can take at least as long as the requested film duration. Browser codec availability, available memory, and mobile power limits vary.
- Every mood applies a distinct stack of color treatment, camera motion, vignette/bloom, grain or dust, and optional letterbox matte. Scene changes use mood-specific crossfades, directional wipes, light leaks, film burns, flash cuts, zoom impacts, or bloom dissolves. The selected stack is listed in the story plan.
- Local music tracks are sequenced and crossfaded through Web Audio when available. Original clip audio is included at a lower level during video scenes where the browser exposes a usable audio graph. Browsers without local audio mixing produce a video without an audio track.
- Before download is offered, Storyloom checks that the browser can read the recorded video metadata and that its frame dimensions match the chosen output size. Some browsers do not expose finite duration metadata for recordings; in that case the target duration is shown as approximate.

## Media and saved templates

Choose a folder on browsers that support directory selection, or select multiple files through the regular picker. iPhone, iPad, and other browsers without directory selection must use the file picker. Files must be formats the current browser can decode.

Selected media and generated video URLs exist only in the current browser session. Re-select media after refreshing. Saved creative settings are stored in local browser storage; templates do not include media.
