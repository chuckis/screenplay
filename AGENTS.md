# AGENTS.md

Logseq plugin ("Logseq meets Nostr") that publishes Logseq blocks/pages to Nostr. React 18 + Vite 4 + TypeScript + Tailwind. Entry point is `src/main.tsx` (`logseq.ready(main)`).

## Commands

- **pnpm only.** `preinstall` runs `npx only-allow pnpm` — npm/yarn will fail the install. Use pnpm, never npm (both `pnpm-lock.yaml` and a stale `package-lock.json` exist; CI uses pnpm).
- `pnpm dev` — vite dev server.
- `pnpm build` — `tsc && vite build`; this is the only verification step (there is **no** lint or test script).
- Testing the plugin requires loading it into Logseq manually (block context menu → "Publish block to Nostr", page menu → "Publish Page to Nostr"). Relay is hardcoded to `wss://relay.primal.net` in `src/main.tsx:43`.

## Architecture

- `src/main.tsx` — plugin bootstrap: settings schema (nsec), UI toolbar button, registers the two publish menu items.
- `src/Nostrservice.ts` — Nostr publishing. Blocks → kind 1; pages → kind 30023 long-form with `title` tag.
- `src/App.tsx` + `src/utils.ts` — the React UI shell.
- `src/index.css` + Tailwind via `tailwind.config.js`/`postcss.config.cjs`.

## Gotchas

- **Import extensions:** relative imports in `src/` use explicit `.js` (e.g. `./App.js`, `./Nostrservice.js`) because `tsconfig.json` sets `module`/`moduleResolution` to `NodeNext`. Do not rewrite these to `.ts`/`.tsx` — the build breaks.
- **Never touch or commit `src/keys.ts`.** It is gitignored and contains a real nsec but is dead legacy code — the app reads the nsec from the Logseq plugin settings, not this file. Don't log secrets.
- **Don't rename the plugin id** `nostrplugin` in the `logseq` field of `package.json` — it is the plugin's identity.
- `dist/` is gitignored; the `dist/` in the working tree is a stale artifact — always rebuild before testing.
- `vite-plugin-logseq` is a devDependency but is NOT wired into `vite.config.js` (empty `plugins` array); don't assume it's active.

## Release

- `semantic-release` on `master` only, triggered manually via GitHub Actions (`workflow_dispatch` in `.github/workflows/main.yml`). Commits must follow conventional commits or no version is produced. The release zips `dist` + assets as `logseq-plugin-template-react-<version>.zip`.
