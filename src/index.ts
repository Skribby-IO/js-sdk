import { SkribbyClient, type SkribbyClientOptions } from './SkribbyClient.js';
import { RealtimeClient } from './RealtimeClient.js';

export function createClient(config: SkribbyClientOptions) {
  return new SkribbyClient(config);
}

export function createRealtimeClient(url: string) {
  return new RealtimeClient(url);
}

export { SkribbyClient, type SkribbyClientOptions } from './SkribbyClient.js';
export { RealtimeClient } from './RealtimeClient.js';
export { MeetingBot } from './MeetingBot.js';
export { ApiRequestError } from './errors/ApiRequestError.js';
export { UnauthorizedError } from './errors/UnauthorizedError.js';
export { NotFoundError } from './errors/NotFoundError.js';
export { UnprocessableEntityError } from './errors/UnprocessableEntityError.js';
