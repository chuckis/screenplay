import { finalizeEvent } from "nostr-tools/pure";
import { Relay } from "nostr-tools/relay";
import { decode } from "nostr-tools/nip19";

export async function publishBlock(block:string): Promise<void> {

    const sk = decode(logseq.settings.nsec).data as Uint8Array;
    const relay = await Relay.connect('wss://relay.primal.net')
    console.log(`connected to ${relay.url}`)

		let eventTemplate = {
				kind: 1,
				created_at: Math.floor(Date.now() / 1000),
				tags: [],
				content: block,
			};
    let event = finalizeEvent(eventTemplate, sk)
      await relay.publish(event)
      relay.close();
}

export async function publishPage(title:string, block:string): Promise<void> {
  const sk = decode(logseq.settings.nsec).data as Uint8Array;
  const relay = await Relay.connect('wss://relay.primal.net')
  console.log(`connected to ${relay.url}`)

  let eventTemplate = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["title", title],
      ],
      content: block,
    };
  let event = finalizeEvent(eventTemplate, sk)
    await relay.publish(event)
    relay.close();
}