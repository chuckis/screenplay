import "@logseq/libs";

import { NostrService, type Nip07Nostr } from "./Nostrservice.js";
import { decode } from "nostr-tools/nip19";
import { SettingSchemaDesc, BlockEntity } from "@logseq/libs/dist/LSPlugin.js";

declare global {
  interface Window {
    nostr?: Nip07Nostr;
  }
}

export const settings: SettingSchemaDesc[] = [
    {
      key: "nsec",
      type: "string",
      title: "Enter your nsec",
      description: "Enter your nsec",
      default: ""
    },
    {
      key: "relay",
      type: "string",
      title: "Nostr relay URL",
      description: "WebSocket URL of the relay to publish to",
      default: "wss://relay.primal.net"
    },
  ]

function getSecretKey(nsec?: string): Uint8Array | null {
  if (!nsec) return null;
  try {
    const decoded = decode(nsec.trim());
    return decoded.type === "nsec" ? decoded.data : null;
  } catch {
    return null;
  }
}

function flattenPageBlocks(blocks: BlockEntity[], depth = 0): string {
  return blocks
    .map((block) => {
      const prefix = depth > 0 ? "- ".repeat(depth) : "";
      const children =
        block.children && block.children.length > 0
          ? "\n" + flattenPageBlocks(block.children as BlockEntity[], depth + 1)
          : "";
      return `${prefix}${block.content}${children}`;
    })
    .join("\n");
}

const main = async () => {

  console.log('Plugin loaded!')

  logseq.useSettingsSchema(settings)

  let service = new NostrService("wss://relay.primal.net", null);

  function rebuildService() {
    const relayUrl = (logseq.settings.relay as string) || "wss://relay.primal.net";
    const secretKey = getSecretKey(logseq.settings.nsec as string);
    const nip07 = window.nostr ?? null;
    if (!secretKey && !nip07) {
      console.warn("No signing method configured. Set an nsec in settings or enable a NIP-07 extension.");
    }
    service = new NostrService(relayUrl, secretKey, nip07);
  }

  rebuildService();

  logseq.onSettingsChanged(rebuildService);

  logseq.Editor.registerBlockContextMenuItem('Publish block to Nostr',
    async (e) => {
      try {
        const blockUUID = e.uuid
        const currentBlock = await logseq.Editor.getBlock(blockUUID)
        const currentBlockText: string = currentBlock.content
        await service.publishBlock(currentBlockText);
        logseq.UI.showMsg("Block just published!");
      } catch (err) {
        console.error("Failed to publish block to Nostr:", err);
        logseq.UI.showMsg(`Failed to publish block: ${err instanceof Error ? err.message : err}`, "error");
      }
    })

  logseq.App.registerPageMenuItem('Publish Page to Nostr',
    async (e) => {
      try {
        const currentPage = await logseq.Editor.getCurrentPage()
        const pageId = currentPage.uuid
        const pageTitle: string = currentPage.name
        const currentTree = await logseq.Editor.getPageBlocksTree(pageId)
        const pageContent = flattenPageBlocks(currentTree);
        await service.publishPage(pageTitle, pageContent);
        logseq.UI.showMsg("Page just published!");
      } catch (err) {
        console.error("Failed to publish page to Nostr:", err);
        logseq.UI.showMsg(`Failed to publish page: ${err instanceof Error ? err.message : err}`, "error");
      }
    }
  )

  const settingsButton = "NostrPlugin"  // Creating a unique key for the button

  // Create a button
  logseq.App.registerUIItem('toolbar', {
    key: settingsButton,
    template: `
<div>
  <a class="button icon" data-on-click="${settingsButton}" id="${settingsButton}" style="font-size: 16px" title="Plugin settings">⚡</a>
</div>
    `,
  })

  // Event
  logseq.provideModel({
    [settingsButton]: () => eventA(),
  })

  const eventA = () => {
    //Process when button is pressed here
    logseq.showSettingsUI();
  }
}

logseq.ready(main).catch(console.error);
