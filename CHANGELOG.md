# sdk

## 0.7.2

### Patch Changes

- d0bdb9e: Add `assemblyai/universal-3-5-pro` as the canonical AssemblyAI Universal-3.5 Pro model key while retaining `assemblyai/universal-3-pro` as a deprecated compatibility alias.

## 0.7.1

### Patch Changes

- 0c7f0c0: Remove the just-released internal participant observation metadata fields from the public realtime event contract.

## 0.7.0

### Minor Changes

- 6db09ec: Add typed realtime listeners, participant timeline events, state snapshots, and presence intervals for participant leave, rejoin, mute, camera, and screenshare state changes.

## 0.6.0

### Minor Changes

- 4e8f213: Add Google Cloud Chirp 3 and AWS Transcribe batch and real-time model keys to the public TypeScript SDK contract.

## 0.5.6

### Patch Changes

- Expand the exported transcription model typings with Soniox v5, AssemblyAI Universal-3 Pro, Mistral Voxtral, and OpenAI diarized transcription model keys, including the new realtime variants.
- Allow string speaker labels in transcript segments.
- Include the public type declaration module and its Node.js type dependency in the published package.

## 0.5.5

### Patch Changes

- Add typed Reserved Capacity SDK support via `client.getReservedCapacity()` and `client.setReservedCapacity(count)`.
- Remove Salad transcription model aliases from the exported transcription model typings.

## 0.5.4

### Patch Changes

- Add `stop_options.empty_meeting_timeout` typing for configuring empty-meeting waits separately from `last_person_detection`.

## 0.5.1

### Patch Changes

- 264040c: Expand transcription model typings with canonical model keys and update the README examples to use the current model identifiers.

## 0.5.0

### Minor Changes

- Add support for bot pricing retrieval via the new `/bot/{id}/pricing` endpoint.
  This release introduces `client.getBotPricing(botId)`, `bot.getPricing()`, and exported pricing response types.
- Add configurable API base URL support when creating a client.
  This release introduces typed `region` selection (`eu` or `jp`) and a `base_url` override that takes precedence when provided.

## 0.4.1

### Patch Changes

- Add `elevenlabs-realtime-v2` transcription model.

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
