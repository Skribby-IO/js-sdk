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
  | 'deepgram-v3'
  | 'assembly-ai'
  | 'speechmatics'
  | 'rev-ai'
  | 'elevenlabs'
  | 'deepgram-realtime'
  | 'deepgram-realtime-v3'
  | 'speechmatics-realtime'
  | 'soniox'
  | 'soniox-realtime'
  | 'gladia'
  | 'gladia-realtime';

export type CreateMeetingBotOptions = {
  transcription_model: TranscriptionModel;
  transcription_credentials?: string; // UUID for BYOK (bring your own key)
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
  custom_vocabulary?: string[];
  stop_options?: {
    time_limit?: number; // in minutes (max 240)
    waiting_room_timeout?: number; // in minutes (1-60, default 10)
    last_person_detection?: number; // in minutes (0-60, 0 disables)
    silence_detection?: number; // in minutes (0-60, 0 disables)
  };
  authentication?: {
    account_id?: string;
    zoom_zak_token?: string;
    always_authenticate?: boolean;
  };
};

export type UpdateMeetingBotOptions = {
  meeting_url?: string;
  bot_name?: string;
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
  transcription_model?: TranscriptionModel;
  transcription_credentials?: string; // UUID for BYOK (bring your own key)
  custom_vocabulary?: string[];
  stop_options?: {
    time_limit?: number; // in minutes (max 240)
    waiting_room_timeout?: number; // in minutes (1-60, default 10)
    last_person_detection?: number; // in minutes (0-60, 0 disables)
    silence_detection?: number; // in minutes (0-60, 0 disables)
  };
  authentication?: {
    account_id?: string;
    zoom_zak_token?: string;
    always_authenticate?: boolean;
  };
};

export type StopOptions = {
  time_limit?: number;
  waiting_room_timeout?: number;
  last_person_detection?: number;
  silence_detection?: number;
};

export type TranscriptSegment = {
  start?: number;
  end?: number;
  speaker?: number;
  speaker_name?: null | string;
  potential_speaker_names?:
    | null
    | {
        name: string;
        confidence: number;
      }[];
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
};

export type Participant = {
  name: string;
  avatar: null | string;
  first_seen_at: null | string;
  events?: {
    type: 'started-speaking' | 'stopped-speaking';
    timestamp: number;
  }[];
};

export type MeetingBotApiData = {
  id: string;
  status: BotStatus;
  service: BotService;
  scheduled_for: null | string;
  time_limit: null | number; // deprecated
  stop_options?: StopOptions;
  bot_name: string;
  bot_avatar: null | string;
  meeting_url: string;
  webhook_url: null | string;
  recording_url: null | string;
  recording_available_until: null | string;
  websocket_url: null | string;
  websocket_read_only_url: null | string;
  video: boolean;
  lang: null | string;
  detected_lang: null | string;
  transcription_model: TranscriptionModel;
  profanity_filter: boolean;
  custom_vocabulary?: string[];
  created_at: null | string;
  finished_at: null | string;
  transcript: TranscriptSegment[];
  participants: Participant[];
  events: ((StatusUpdateEvent | ChatMessageEvent) & {
    created_at: null | string;
  })[];
};

export type MeetingBotData = MeetingBotApiData & {
  created_at: Date | null;
  scheduled_for: Date | null;
  finished_at: Date | null;
  recording_available_until: Date | null;
  participants: (Participant & {
    first_seen_at: Date | null;
    events?: {
      type: 'started-speaking' | 'stopped-speaking';
      timestamp: Date | null;
    }[];
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
  'chat-message': {
    username: string;
    content: string;
    user_avatar: string | null;
  };
  'participant-tracked': {
    participantId: string;
    participantName: string;
  };
  'started-speaking': {
    participantId: string;
    participantName: string;
  };
  'stopped-speaking': {
    participantId: string;
    participantName: string;
  };
  stop: undefined;
  error: {
    message: string;
  };
};

export type RealtimeActionMap = {
  'chat-message': {
    content: string;
  };
  stop: undefined;
};

// Recording Types

export type RecordingStatus = 'transcribing' | 'finished' | 'failed';

export type CreateRecordingOptions =
  | {
      // Option 1: Upload via URL
      recording_url: string;
      transcription_model: TranscriptionModel;
      transcription_credentials?: string; // UUID for BYOK
      lang?: string;
      profanity_filter?: boolean;
      custom_vocabulary?: string[];
      webhook_url?: string;
      store_recording_for_1_year?: boolean;
    }
  | {
      // Option 2: Re-transcribe from meeting bot
      meeting_bot_id: string;
      transcription_model?: TranscriptionModel;
      transcription_credentials?: string; // UUID for BYOK
      lang?: string;
      profanity_filter?: boolean;
      custom_vocabulary?: string[];
      webhook_url?: string;
      store_recording_for_1_year?: boolean;
    };

export type RecordingApiData = {
  id: string;
  status: RecordingStatus;
  webhook_url: null | string;
  recording_url: null | string;
  recording_available_until: null | string;
  transcription_model: TranscriptionModel;
  lang: null | string;
  detected_lang: null | string;
  profanity_filter: boolean;
  custom_vocabulary?: string[];
  created_at: null | string;
  transcript: TranscriptSegment[];
  events: {
    event: string;
    data: Record<string, unknown>;
    created_at: null | string;
  }[];
};

export type RecordingData = RecordingApiData & {
  created_at: Date | null;
  recording_available_until: Date | null;
  events: {
    event: string;
    data: Record<string, unknown>;
    created_at: Date | null;
  }[];
};
