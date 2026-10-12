import type {
  RealtimeEventMap,
  RealtimeTranscriptSegment,
  RealtimeTranscriptSpeakingParticipant,
} from '../src/index.js';

type Assert<T extends true> = T;

type _TsEventCarriesSpeakingParticipants = Assert<
  RealtimeEventMap['ts']['speaking_participants'] extends
    | RealtimeTranscriptSpeakingParticipant[]
    | undefined
    ? true
    : false
>;

const segment: RealtimeTranscriptSegment = {
  transcript: 'Hello there',
  start: 1.2,
  end: 2.4,
  speaker: 0,
  speaker_name: 'Ada Lovelace',
  words: [{ word: 'Hello', start: 1.2, end: 1.6 }],
  speaking_participants: [
    { participant_id: 'p-1', participant_name: 'Ada Lovelace', overlap: 0.8 },
  ],
};

const legacySegment: RealtimeTranscriptSegment = {
  transcript: 'Hi',
  start: 0,
  end: 1,
  speaker: 1,
  speaker_name: null,
};

void segment;
void legacySegment;
