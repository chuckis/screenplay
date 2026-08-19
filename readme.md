# Logseq meets Nostr plugin

Now you can send block of page to Nostr.

- **Publish block to Nostr** — block context menu → "Publish block to Nostr" (kind 1 note).
- **Publish Page to Nostr** — page menu → "Publish Page to Nostr" (kind 30023 long-form article, includes nested block tree).


1. Load the plugin in Logseq (Plugins → Load unpacked plugin → this directory after `pnpm build`).
2. Open the plugin settings (⚡ icon in the toolbar) and set your **nsec**.
   - Alternatively, install a NIP-07 browser extension (e.g. Alby) and it will be used automatically for signing.
3. Optionally change the target **relay URL** (default `wss://relay.primal.net`).