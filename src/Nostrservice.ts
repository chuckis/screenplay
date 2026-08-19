import { finalizeEvent, type Event } from "nostr-tools/pure";
import { Relay } from "nostr-tools/relay";

const LONG_FORM = 30023;

type EventTemplate = {
  kind: number;
  created_at: number;
  tags: string[][];
  content: string;
};

export type Nip07Nostr = {
  getPublicKey: () => Promise<string>;
  signEvent: (event: EventTemplate & { pubkey: string }) => Promise<Event>;
};

export class NostrService {
  private relayUrl: string;
  private secretKey: Uint8Array | null;
  private nip07: Nip07Nostr | null;
  constructor(relayUrl: string, secretKey: Uint8Array | null, nip07: Nip07Nostr | null = null) {
    this.relayUrl = relayUrl;
    this.secretKey = secretKey;
    this.nip07 = nip07;
  }
  get hasKey(): boolean {
    return !!this.secretKey || !!this.nip07;
  }
  private async connectRelay(): Promise<Relay> {
    const relay = await Relay.connect(this.relayUrl);
    console.log(`connected to ${relay.url}`);
    return relay;
  }
  private createEventTemplate(content: string, tags: string[][] = [], kind?: number): EventTemplate {
    return {
      kind: kind || 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: tags,
      content: content,
    };
  }
  private async publishEvent(eventTemplate: EventTemplate): Promise<void> {
    const relay = await this.connectRelay();
    let event: Event;
    if (this.nip07) {
      const pubkey = await this.nip07.getPublicKey();
      event = await this.nip07.signEvent({ ...eventTemplate, pubkey });
    } else if (this.secretKey) {
      event = finalizeEvent(eventTemplate, this.secretKey);
    } else {
      relay.close();
      throw new Error("No signing method configured. Set an nsec in settings or enable a NIP-07 extension.");
    }
    await relay.publish(event);
    relay.close();
  }
  public async publishBlock(block: string): Promise<void> {
    const eventTemplate = this.createEventTemplate(block);
    await this.publishEvent(eventTemplate);
  }
  public async publishPage(title: string, block: string): Promise<void> {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "post";
    const eventTemplate = this.createEventTemplate(block, [["title", title], ["d", slug]], LONG_FORM);
    await this.publishEvent(eventTemplate);
  }
}