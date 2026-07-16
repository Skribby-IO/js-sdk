import type {
  Participant,
  ParticipantData,
  ParticipantEvent,
  ParticipantEventType,
  ParticipantPresenceInterval,
  ParticipantPresenceIntervalData,
  ParticipantState,
  ParticipantStateEventType,
  MeetingBotData,
  RealtimeEventMap,
  RealtimeParticipantEvent,
  RealtimeParticipantEventName,
  RealtimeParticipantStateEvent,
  RealtimeParticipantStateEventName,
} from '../src/index.js';

type Assert<T extends true> = T;
type IsEqual<Left, Right> =
  (<T>() => T extends Left ? 1 : 2) extends <T>() => T extends Right ? 1 : 2
    ? true
    : false;

type ExpectedParticipantStateEventType =
  | 'left'
  | 'rejoined'
  | 'muted'
  | 'unmuted'
  | 'camera-on'
  | 'camera-off'
  | 'started-screenshare'
  | 'stopped-screenshare';

type ExpectedParticipantEventType =
  | 'started-speaking'
  | 'stopped-speaking'
  | ExpectedParticipantStateEventType;

type ExpectedRealtimeParticipantStateEventName =
  | 'participant-left'
  | 'participant-rejoined'
  | 'participant-muted'
  | 'participant-unmuted'
  | 'participant-camera-on'
  | 'participant-camera-off'
  | 'participant-started-screenshare'
  | 'participant-stopped-screenshare';

type ExpectedRealtimeParticipantEventName =
  | 'participant-tracked'
  | 'started-speaking'
  | 'stopped-speaking'
  | ExpectedRealtimeParticipantStateEventName;

type _ParticipantStateNamesAreExact = Assert<
  IsEqual<ParticipantStateEventType, ExpectedParticipantStateEventType>
>;
type _ParticipantTimelineNamesAreExact = Assert<
  IsEqual<ParticipantEventType, ExpectedParticipantEventType>
>;
type _RealtimeNamesAreExact = Assert<
  IsEqual<
    RealtimeParticipantStateEventName,
    ExpectedRealtimeParticipantStateEventName
  >
>;
type _AllRealtimeParticipantNamesAreExact = Assert<
  IsEqual<RealtimeParticipantEventName, ExpectedRealtimeParticipantEventName>
>;
type _RealtimePayloadsMatch = Assert<
  IsEqual<
    RealtimeEventMap[RealtimeParticipantStateEventName],
    RealtimeParticipantStateEvent
  >
>;
type _ExistingRealtimePayloadsIncludeTimestamp = Assert<
  IsEqual<
    RealtimeEventMap[
      | 'participant-tracked'
      | 'started-speaking'
      | 'stopped-speaking'],
    RealtimeParticipantEvent
  >
>;
type _ParsedTimelineTimestampIsDate = Assert<
  IsEqual<
    NonNullable<
      MeetingBotData['participants'][number]['events']
    >[number]['timestamp'],
    Date | null
  >
>;
type _RawLastSeenTimestampIsEpochMilliseconds = Assert<
  IsEqual<Participant['last_seen_at'], number | undefined>
>;
type _RawParticipantOmitsState = Assert<
  IsEqual<'state' extends keyof Participant ? true : false, false>
>;
type _ParsedParticipantOmitsState = Assert<
  IsEqual<'state' extends keyof ParticipantData ? true : false, false>
>;
type _RawPresenceIntervalMatches = Assert<
  IsEqual<ParticipantPresenceInterval, { joined_at: number; left_at?: number }>
>;
type _ParsedPresenceIntervalMatches = Assert<
  IsEqual<ParticipantPresenceIntervalData, { joined_at: Date; left_at?: Date }>
>;
type _ParsedParticipantTimestampsAreDates = Assert<
  IsEqual<
    Pick<
      MeetingBotData['participants'][number],
      'first_seen_at' | 'last_seen_at' | 'left_at'
    >,
    {
      first_seen_at: Date | null;
      last_seen_at?: Date;
      left_at?: Date;
    }
  >
>;
type _RealtimeParticipantStateIsPreserved = Assert<
  IsEqual<RealtimeParticipantEvent['state'], ParticipantState | undefined>
>;

const apiTimelineEvent: ParticipantEvent = {
  type: 'camera-off',
  timestamp: 1_752_486_400_000,
};

const historicalParticipant: Participant = {
  name: 'Grace Hopper',
  avatar: null,
  first_seen_at: '2024-01-01T00:00:00.000Z',
  events: [{ type: 'started-speaking', timestamp: 1_704_067_201_000 }],
};

void historicalParticipant;

const realtimePayload: RealtimeEventMap['participant-started-screenshare'] = {
  participantId: 'participant-123',
  participantName: 'Ada Lovelace',
  timestamp: apiTimelineEvent.timestamp,
  state: {
    active: true,
    microphone: 'muted',
    camera: 'on',
    screenshare: 'sharing',
  },
  lastSeenAt: apiTimelineEvent.timestamp,
};

void realtimePayload;

const invalidApiTimelineEvent: ParticipantEvent = {
  type: 'muted',
  // @ts-expect-error Participant timeline timestamps are epoch milliseconds.
  timestamp: new Date(),
};

void invalidApiTimelineEvent;

// @ts-expect-error Realtime state event payloads require a timestamp.
const invalidRealtimePayload: RealtimeEventMap['participant-left'] = {
  participantId: 'participant-123',
  participantName: 'Ada Lovelace',
};

void invalidRealtimePayload;
