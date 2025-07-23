import { SkribbyClient, type SkribbyClientOptions } from './SkribbyClient.js';
import { RealtimeClient } from './RealtimeClient.js';

export function createClient(config: SkribbyClientOptions) {
  return new SkribbyClient(config);
}

export function createRealtimeClient(url: string) {
  return new RealtimeClient(url);
}
