import type {
  BotStatus,
  ApiStopReason,
  CreateMeetingBotOptions,
  LegacyStopReason,
  MeetingBotApiData,
  RealtimeActionMap,
  RealtimeChatMessage,
  RealtimeEventMap,
  RealtimeParticipant,
  RecordingStartMode,
  StopOptions,
  StopReason,
  UpdateMeetingBotOptions,
} from '../src/index.js';

type Assert<T extends true> = T;
type IsEqual<Left, Right> =
  (<T>() => T extends Left ? 1 : 2) extends <T>() => T extends Right ? 1 : 2
    ? true
    : false;

type _RecordingStartModesAreExact = Assert<
  IsEqual<RecordingStartMode, 'automatic' | 'manual'>
>;
type _WaitingToRecordIsAStatus = Assert<
  'waiting_to_record' extends BotStatus ? true : false
>;
type _BreakoutWaitingRoomIsAStatus = Assert<
  'breakout_waiting_room' extends BotStatus ? true : false
>;
type _ApiStopReasonsAreCanonical = Assert<
  IsEqual<
    ApiStopReason,
    | 'invalid_meeting_url'
    | 'waiting_room_timeout'
    | 'manually_stopped'
    | 'call_already_finished'
    | 'request_denied'
    | 'host_in_another_meeting'
    | 'recording_start_timeout'
    | 'breakout_room_timeout'
    | 'breakout_room_denied'
    | 'meeting_ended'
    | 'last_person_detected'
    | 'silence_detection_triggered'
    | 'kicked'
  >
>;
type _LegacyStopReasonsRemainAvailable = Assert<
  IsEqual<
    LegacyStopReason,
    | 'INVALID_MEETING_URL'
    | 'WAITING_ROOM_TIMEOUT'
    | 'MANUALLY_STOPPED'
    | 'CALL_ALREADY_FINISHED'
    | 'REQUEST_DENIED'
    | 'HOST_IN_ANOTHER_MEETING'
    | 'RECORDING_START_TIMEOUT'
    | 'BREAKOUT_ROOM_TIMEOUT'
    | 'BREAKOUT_ROOM_DENIED'
    | 'MEETING_ENDED'
    | 'LAST_PERSON_DETECTED'
    | 'SILENCE_DETECTION_TRIGGERED'
    | 'KICKED'
  >
>;
type _RecordingStartTimeoutIsAStopReason = Assert<
  'RECORDING_START_TIMEOUT' extends StopReason ? true : false
>;
type _BreakoutRoomStopReasonsUseApiLiterals = Assert<
  IsEqual<
    Extract<StopReason, 'breakout_room_timeout' | 'breakout_room_denied'>,
    'breakout_room_timeout' | 'breakout_room_denied'
  >
>;
type _ConnectedParticipantsUseRealtimeShape = Assert<
  IsEqual<
    RealtimeEventMap['connected']['participants'][number],
    RealtimeParticipant
  >
>;
type _ConnectedParticipantStateIsRequired = Assert<
  IsEqual<
    RealtimeEventMap['connected']['participants'][number]['state']['active'],
    boolean
  >
>;
type _ConnectedChatUsesRealtimeShape = Assert<
  IsEqual<
    RealtimeEventMap['connected']['chat_messages'][number],
    RealtimeChatMessage
  >
>;
type _RealtimeChatAvatarIsOptionalAndNullable = Assert<
  IsEqual<RealtimeChatMessage['user_avatar'], string | null | undefined>
>;
type _RealtimeChatMayOmitAvatar = Assert<
  IsEqual<
    {} extends Pick<RealtimeChatMessage, 'user_avatar'> ? true : false,
    true
  >
>;
type _ConnectedStatusIsNullable = Assert<
  IsEqual<RealtimeEventMap['connected']['status'], BotStatus | null>
>;
type _ConnectedHasNoComputedParticipantCount = Assert<
  IsEqual<
    'active_participant_count' extends keyof RealtimeEventMap['connected']
      ? true
      : false,
    false
  >
>;
type _StartRecordingActionHasNoData = Assert<
  IsEqual<RealtimeActionMap['start-recording'], undefined>
>;
type _RecordingStartedUsesEpochMilliseconds = Assert<
  IsEqual<RealtimeEventMap['recording-started'], { started_at: number }>
>;
type _ApiDataExposesRecordingStartMode = Assert<
  IsEqual<MeetingBotApiData['recording_start_mode'], RecordingStartMode>
>;

const existingAutomaticOptions: CreateMeetingBotOptions = {
  transcription_model: 'none',
  service: 'zoom',
  meeting_url: 'https://example.test/meeting',
  bot_name: 'Skribby',
};

const explicitAutomaticOptions: CreateMeetingBotOptions = {
  ...existingAutomaticOptions,
  recording_start_mode: 'automatic',
};

const manualOptions: CreateMeetingBotOptions = {
  ...existingAutomaticOptions,
  recording_start_mode: 'manual',
  realtime_audio: true,
  stop_options: {
    recording_start_timeout: 15,
  },
};

const manualUpdate: UpdateMeetingBotOptions = {
  recording_start_mode: 'manual',
  realtime_audio: true,
  stop_options: {
    recording_start_timeout: 20,
  },
};

const stopOptions: StopOptions = {
  recording_start_timeout: 10,
  breakout_room_timeout: 10,
};

const chatWithoutAvatar: RealtimeChatMessage = {
  username: 'Ada Lovelace',
  content: 'I consent to recording.',
};

const chatWithNullAvatar: RealtimeChatMessage = {
  ...chatWithoutAvatar,
  user_avatar: null,
};

void existingAutomaticOptions;
void explicitAutomaticOptions;
void manualOptions;
void manualUpdate;
void stopOptions;
void chatWithoutAvatar;
void chatWithNullAvatar;

const invalidMode: CreateMeetingBotOptions = {
  ...existingAutomaticOptions,
  // @ts-expect-error Only automatic and manual recording start modes are valid.
  recording_start_mode: 'customer-policy',
};

void invalidMode;

const invalidConnectedParticipant: RealtimeEventMap['connected'] = {
  transcripts: [],
  participants: [
    // @ts-expect-error Connected participants always include their full state.
    {
      participantId: 'participant-123',
      participantName: 'Ada Lovelace',
      timestamp: 1_784_550_725_000,
    },
  ],
  chat_messages: [],
  status: null,
};

void invalidConnectedParticipant;
