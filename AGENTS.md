# AGENTS.md

Logseq plugin ("Logseq meets Nostr") that publishes Logseq blocks/pages to Nostr. React-free: just TypeScript + Vite 4. Entry point is `src/main.tsx` (`logseq.ready(main)`).

## Commands

- **pnpm only.** `preinstall` runs `npx only-allow pnpm` — npm/yarn will fail the install. Use pnpm, never npm.
- `pnpm dev` — vite dev server.
- `pnpm build` — `tsc && vite build`; this is the only verification step (there is **no** lint or test script).
- Testing the plugin requires loading it into Logseq manually (block context menu → "Publish block to Nostr", page menu → "Publish Page to Nostr"). The relay and signing method come from the plugin settings (default relay `wss://relay.primal.net`).

## Architecture

- `src/main.tsx` — plugin bootstrap: settings schema (nsec + relay), toolbar button, registers the two publish menu items, safe nsec parsing and page-tree flattening.
- `src/Nostrservice.ts` — Nostr publishing. Blocks → kind 1; pages → kind 30023 long-form with `title` + `d` tags. Signs via nsec (local) or NIP-07 (`window.nostr`).
- No React/UI shell — all interaction happens via Logseq context menus; the React template stub was removed.
- Tailwind via `tailwind.config.cjs`/`postcss.config.cjs`, but no UI components use it anymore.

## Gotchas

- **Import extensions:** relative imports in `src/` use explicit `.js` (e.g. `./Nostrservice.js`) because `tsconfig.json` sets `module`/`moduleResolution` to `NodeNext`. Do not rewrite these to `.ts` — the build breaks.
- **Never log or commit secrets.** The nsec comes from Logseq plugin settings (`settings` schema in `src/main.tsx`; parsed by `getSecretKey`). Do not add console logs of it.
- **Don't rename the plugin id** `nostrplugin` in the `logseq` field of `package.json` — it is the plugin's identity.
- `dist/` is gitignored; the `dist/` in the working tree is a stale artifact — always rebuild before testing.
- CI runs `pnpm build`; make sure it passes locally before pushing (it previously broke on TS errors and the Tailwind config being loaded as ESM — `tailwind.config.cjs` must stay CommonJS).

## Release

- `semantic-release` on `master` only, triggered manually via GitHub Actions (`workflow_dispatch` in `.github/workflows/main.yml`, Node 20 + pnpm 9). Commits must follow conventional commits or no version is produced. The release zips `dist` + assets as `logseq-screenplay-<version>.zip`, and there is a real `LICENSE` file at the repo root (do not delete it).