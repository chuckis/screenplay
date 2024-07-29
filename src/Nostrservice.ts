import { finalizeEvent } from "nostr-tools/pure";
import { Relay } from "nostr-tools/relay";
import { decode } from "nostr-tools/nip19";
import { keys } from "./keys.js" // import a nsec string from outta git control file. 

export async function Nostrit(note:string) {
  
    const sk = decode(keys.pk).data
    const relay = await Relay.connect('wss://relay.primal.net')
    console.log(`connected to ${relay.url}`)
    let event = finalizeEvent({
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: note,
      }, sk)
      await relay.publish(event)
      relay.close();
}
