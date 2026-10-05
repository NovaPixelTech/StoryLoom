# Storyloom

Storyloom creates cinematic memory films from a user's local photos, video clips, and soundtrack files without uploading personal media.

## Run & Operate

- Run the managed `artifacts/storyloom: web` workflow for the app preview.
- `pnpm --filter @workspace/storyloom run typecheck` — check the app's TypeScript.
- `PORT=5000 BASE_PATH=/ NODE_ENV=production pnpm --filter @workspace/storyloom run build` — build the Vite app outside its workflow.
- See `artifacts/storyloom/README.md` for local rendering and browser limitations.

## Stack

- pnpm workspace, React, Vite, TypeScript
- Browser-native file APIs, Canvas capture, `MediaRecorder`, and Web Audio
- No API, database, authentication, or remote media storage is required by Storyloom.

## Where things live

- `artifacts/storyloom/src/App.tsx` — creation workflow and user interface.
- `artifacts/storyloom/src/lib/media.ts` — local media intake and metadata.
- `artifacts/storyloom/src/lib/render.ts` — scene planning, rendering, audio mix, and output validation.
- `artifacts/storyloom/src/lib/templates.ts` — browser-local creative templates.

## Architecture decisions

- Keep personal source media inside the browser session; do not add remote processing or analytics of media.
- Record canvas output in real time using the browser's reported media format support.
- Offer 720p and 1080p only; 4K is not available in the current local renderer.
- Persist creative settings only; selected media must be reselected after refresh.

## Product

Users select local media, choose film length, output size, and one of nine creative moods, preview an automatically arranged story, render a video, and save or reuse creative templates.

## User preferences

- Do not commit or deploy automatically; let the user review the app before deciding.

## Gotchas

- The Vite config requires `PORT` and `BASE_PATH`; the managed workflow provides them. The manual build command above sets them explicitly.
- Rendering is real time. Codec, folder-picker, audio-mixing, and duration-metadata support varies by browser; the app must report unavailable capabilities rather than claim success.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
