export type BotService = 'gmeet' | 'teams' | 'zoom';

export type BotStatus =
  | 'scheduled'
  | 'booting'
  | 'joining'
  | 'recording'
  | 'processing'
  | 'transcribing'
  | 'leaving'
  | 'finished'
  | 'not_admitted'
  | 'auth_required'
  | 'invalid_credentials'
  | 'failed';

export type TranscriptionModel =
  | 'none'
  | 'whisper'
  | 'assembly-ai-realtime'
  | 'deepgram'
  | 'assembly-ai'
  | 'speechmatics'
  | 'rev-ai'
  | 'elevenlabs'
  | 'deepgram-realtime'
  | 'speechmatics-realtime'
  | 'gladia'
  | 'gladia-realtime';

export type CreateMeetingBotOptions = {
  transcription_model: TranscriptionModel;
  service: BotService;
  meeting_url: string;
  bot_name: string;
  bot_avatar_file?: File;
  bot_avatar_url?: string;
  time_limit?: number; // in seconds
  video?: boolean;
  lang?: string;
  webhook_url?: string;
  store_recording_for_1_year?: boolean;
  scheduled_start_time?: Date;
  profanity_filter?: boolean;
  initial_chat_message?: string;
  stop_options?: {
    time_limit?: number; // in minutes
    last_person_detection?: number; // in minutes
    silence_detection?: number; // in minutes
  }
  authentication?: {
    account_id?: string;
    zoom_zak_token?: string;
    always_authenticate?: boolean;
  };
};

export type MeetingBotApiData = {
  id: string;
  status: BotStatus;
  service: BotService;
  scheduled_for: null | string;
  time_limit: null | number;
  bot_name: string;
  bot_avatar: null | string;
  meeting_url: string;
  webhook_url: null | string;
  recording_url: null | string;
  recording_available_until: null | string;
  websocket_url: null | string;
  video: boolean;
  lang: null | string;
  detected_lang: null | string;
  transcription_model: TranscriptionModel;
  profanity_filter: boolean;
  created_at: null | string;
  finished_at: null | string;
  transcript: {
    start?: number;
    end?: number;
    speaker?: number;
    speaker_name?: null | string;
    confidence?: number;
    transcript: string;
    utterances?: {
      start: number;
      end: number;
      speaker: number;
      confidence: number;
      transcript: string;
      words: {
        start: number;
        end: number;
        speaker: number;
        confidence: number;
        word: string;
      }[];
    };
  }[];
  participants: {
    name: string;
    avatar: null | string;
    first_seen_at: null | string;
    events?: {
      type: 'started-speaking' | 'stopped-speaking';
      timestamp: number;
    }[];
  }[];
  events: ((StatusUpdateEvent | ChatMessageEvent) & {
    created_at: null | string;
  })[];
};

export type MeetingBotData = MeetingBotApiData & {
  created_at: Date | null;
  scheduled_for: Date | null;
  finished_at: Date | null;
  recording_available_until: Date | null;
  participants: (MeetingBotApiData['participants'][0] & {
    first_seen_at: Date | null;
    events?: (MeetingBotApiData['participants'][0]['events'][0] & {
      timestamp: Date | null;
    })[];
  })[];
  events: (MeetingBotApiData['events'][0] & {
    created_at: Date | null;
  })[];
};

export type StatusUpdateEvent = {
  event: 'status_update';
  data: {
    old_status: BotStatus;
    new_status: BotStatus;
  };
};

export type ChatMessageEvent = {
  event: 'chat_message';
  data: {
    content: string;
    username: string;
  };
};

export type RealtimeEventMap = {
  raw: any;
  ping: undefined;
  start: undefined;
  ts: {
    transcript: string;
    start: number;
    end: number;
    speaker: number;
    speaker_name: string | null;
  };
  stop: undefined;
  error: {
    message: string;
  };
};
