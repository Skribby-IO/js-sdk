# sdk

## 0.4.0

### Minor Changes

- 9e86f54: feat: add custom_metadata support for MeetingBot

### Patch Changes

- da5f911: feat: add change-avatar realtime action support

## 0.3.4

### Patch Changes

- fix: update scheduled_start_time handling to use Unix timestamp format in MeetingBot and SkribbyClient

## 0.3.3

### Patch Changes

- e121b31: Allow `stop_reason` to be provided on the realtime `status-update` event payload (optional field).

## 0.3.2

### Patch Changes

- Add `RealtimeClient.transcript`, an internal transcript buffer that is seeded on connect and appended to on each `ts` event so users can read the full transcription at any time.
- Improve realtime typings by adding a shared `RealtimeTranscriptSegment` type and typing the initial transcript snapshot event payload.

## 0.3.1

### Patch Changes

- Add types for status-update event and update documentation.

## 0.3.0

### Minor Changes

- 6941591: Sync SDK with latest Skribby API documentation

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

## 0.2.0

### Minor Changes

- Sync SDK with latest Skribby API documentation

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

## 0.1.6

### Patch Changes

- edbdadf: Small fix + README update

## 0.1.5

### Patch Changes

- c2e8cfb: Add support for several new features

## 0.1.4

### Patch Changes

- 9ded495: Fix typo in README

## 0.1.3

### Patch Changes

- 68fb821: Renamed internal variables + made all classes and errors available though the package

## 0.1.2

### Patch Changes

- 05ca3d0: Fix incorrect repository URLs in package.json

## 0.1.1

### Patch Changes

- 4b9465f: Updated README

## 0.1.0

### Minor Changes

- e00d5b0: Implement base functionality, covering API calls and websocket (realtime) connections

## 0.0.1

### Patch Changes

- 1be89cc: Initial release
