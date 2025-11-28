---
"@skribby/sdk": minor
---

Sync SDK with latest Skribby API documentation

**New Features:**
- Added Recording API support (`createRecording`, `getRecordingById`, `Recording` class)
- Added `updateBot()` method to update scheduled bots (PATCH /bot/{id})
- Added `update()` method to `MeetingBot` class

**New Transcription Models:**
- `deepgram-v3`
- `deepgram-realtime-v3`
- `soniox`
- `soniox-realtime`

**New Fields:**
- `transcription_credentials` - for bringing your own API key (BYOK)
- `waiting_room_timeout` in `stop_options`
- `potential_speaker_names` in transcript segments
- `stop_options` and `custom_vocabulary` in bot response
- `webhook_url`, `events`, `custom_vocabulary` in recording response
- `store_recording_for_1_year` in recording creation

**New Type Exports:**
- `StopOptions`, `TranscriptSegment`, `Participant`
- `StatusUpdateEvent`, `ChatMessageEvent`
- `RecordingStatus`, `CreateRecordingOptions`, `RecordingApiData`, `RecordingData`


