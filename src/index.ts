import { SkribbyClient, type SkribbyClientOptions } from './SkribbyClient.js';
import { RealtimeClient } from './RealtimeClient.js';

export function createClient(config: SkribbyClientOptions) {
  return new SkribbyClient(config);
}

export function createRealtimeClient(url: string, audio_url?: string) {
  return new RealtimeClient(url, audio_url);
}

export { SkribbyClient, type SkribbyClientOptions } from './SkribbyClient.js';
export { RealtimeClient } from './RealtimeClient.js';
export { MeetingBot } from './MeetingBot.js';
export { Recording } from './Recording.js';
export { ApiRequestError } from './errors/ApiRequestError.js';
export { UnauthorizedError } from './errors/UnauthorizedError.js';
export { NotFoundError } from './errors/NotFoundError.js';
export { UnprocessableEntityError } from './errors/UnprocessableEntityError.js';

// Type exports
export type {
  BotService,
  BotStatus,
  TranscriptionModel,
  StopOptions,
  TranscriptSegment,
  Participant,
  CreateMeetingBotOptions,
  UpdateMeetingBotOptions,
  MeetingBotApiData,
  MeetingBotData,
  StatusUpdateEvent,
  ChatMessageEvent,
  RecordingStatus,
  CreateRecordingOptions,
  RecordingApiData,
  RecordingData,
  RealtimeEventMap,
  RealtimeActionMap,
} from './types.js';
