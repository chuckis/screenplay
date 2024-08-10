import { finalizeEvent } from "nostr-tools/pure";
import { Relay } from "nostr-tools/relay";

type EventTemplate = {
  kind: number;
  created_at: number;
  tags: string[][];
  content: string;
};
export class NostrService {
  private relayUrl: string;
  private secretKey: Uint8Array;
  constructor(relayUrl: string, secretKey: Uint8Array) {
    this.relayUrl = relayUrl;
    this.secretKey = secretKey;
  }
  private async connectRelay(): Promise<Relay> {
    const relay = await Relay.connect(this.relayUrl);
    console.log(`connected to ${relay.url}`);
    return relay;
  }
  private createEventTemplate(content: string, tags: string[][] = []): EventTemplate {
    return {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: tags,
      content: content,
    };
  }
  private async publishEvent(eventTemplate: EventTemplate): Promise<void> {
    const relay = await this.connectRelay();
    const event = finalizeEvent(eventTemplate, this.secretKey);
    await relay.publish(event);
    relay.close();
  }
  public async publishBlock(block: string): Promise<void> {
    const eventTemplate = this.createEventTemplate(block);
    await this.publishEvent(eventTemplate);
  }
  public async publishPage(title: string, block: string): Promise<void> {
    const eventTemplate = this.createEventTemplate(block, [["title", title]]);
    await this.publishEvent(eventTemplate);
  }
}