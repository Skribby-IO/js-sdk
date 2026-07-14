# Skribby Typescript SDK

> Skribby is an API-first platform for capturing, transcribing, and processing online meetings. Deploy meeting bots into Zoom, Microsoft Teams, and Google Meet to receive real-time or post-call transcription, audio, and structured data.

## Install

```bash
npm install @skribby/sdk
```

## Quick Start

```ts
import { createClient } from '@skribby/sdk';

const client = createClient({
  api_key: 'SKRIBBY_API_KEY',
});

const jpClient = createClient({
  api_key: 'SKRIBBY_API_KEY',
  region: 'jp',
});

const customClient = createClient({
  api_key: 'SKRIBBY_API_KEY',
  base_url: 'https://platform-jp.skribby.io/api/v1',
});

(async () => {
  const bot = await client.createBot({
    bot_name: 'My Meeting Bot',
    meeting_url: 'https://meet.google.com/abc-defg-hij',
    service: 'gmeet',
    transcription_model: 'deepgram/nova-2-realtime',
  });

  // If the chosen transcription model is real-time
  const realtimeClient = bot.getRealtimeClient();

  // When you connect, you'll instantly receive a "connected" event that contains
  // all transcripts generated up to the point of connection.
  realtimeClient.on('connected', (data) => {
    console.log(`Initial transcripts received: ${data.transcripts.length}`);
  });

  realtimeClient.on('ts', (data) => {
    console.log(`${data.speaker_name} said: ${data.transcript}`);

    // You can fetch the full transcription at any time:
    // (Note: returns an array of transcript segments)
    const fullTranscriptSoFar = realtimeClient.transcript;

    if (data.transcript.toLowerCase().includes('hello')) {
      realtimeClient.send('chat-message', {
        content: 'Hello back! :)',
      });
    }
    if (data.transcript.toLowerCase().includes('stop the bot')) {
      realtimeClient.send('stop');
    }
  });

  realtimeClient.connect();
})();
```

## Bot Operations

### Create a Bot

```ts
const bot = await client.createBot({
  bot_name: 'My Meeting Bot',
  meeting_url: 'https://meet.google.com/abc-defg-hij',
  service: 'gmeet',
  transcription_model: 'groq/whisper-large-v3-turbo',
  webhook_url: 'https://your-server.com/webhook', // Optional: receive status updates
});
```

### Get a Bot by ID

```ts
const bot = await client.getBotById('bot_123');
```

### Get Bot Pricing

```ts
const pricing = await client.getBotPricing('bot_123');

console.log(pricing.currency); // USD
console.log(pricing.total.rate_per_hour); // e.g. 0.92
console.log(pricing.total.amount); // null while in progress, number when finished

// If you already have a MeetingBot instance:
const bot = await client.getBotById('bot_123');
if (bot) {
  const pricingFromBot = await bot.getPricing();
  console.log(pricingFromBot.total.amount);
}
```

### Get All Scheduled Bots

```ts
const scheduledBots = await client.getScheduledBots();
```

### Update a Scheduled Bot

```ts
// Update via client
await client.updateBot('bot_123', {
  bot_name: 'Updated Bot Name',
  meeting_url: 'https://meet.google.com/new-meeting-url',
});

// Or update via bot instance
await bot.update({
  bot_name: 'Updated Bot Name',
});
```

### Stop a Bot

```ts
await bot.stop();
```

### Delete a Bot

```ts
await bot.delete();
```

### Send a Chat Message

```ts
await bot.sendChatMessage('Hello from the bot!');
```

## Recording Operations

Upload and transcribe recordings independently of meeting bots.

### Create a Recording from URL

```ts
const recording = await client.createRecording({
  recording_url: 'https://example.com/meeting-recording.mp4',
  transcription_model: 'groq/whisper-large-v3-turbo',
  lang: 'en',
  webhook_url: 'https://your-server.com/webhook', // Optional
});
```

### Re-transcribe from a Meeting Bot

```ts
const recording = await client.createRecording({
  meeting_bot_id: 'bot_123',
  transcription_model: 'deepgram/nova-2', // Override the original model
});
```

### Get a Recording by ID

```ts
const recording = await client.getRecordingById('rec_123');
console.log(recording.data.transcript);
```

### Refresh Recording Data

```ts
await recording.refresh();
console.log(recording.data.status); // Check updated status
```

### Delete a Recording

```ts
await recording.delete();
```

## Real-time Transcription

For bots using real-time transcription models (e.g., `deepgram/nova-2-realtime`, `assemblyai/universal-streaming`):

```ts
const realtimeClient = bot.getRealtimeClient();

// Listen for transcription events
realtimeClient.on('ts', (data) => {
  console.log(`${data.speaker_name}: ${data.transcript}`);
});

// When you connect, you'll instantly receive a "connected" event that contains
// all transcripts generated up to the point of connection.
realtimeClient.on('connected', (data) => {
  console.log(`Initial transcripts received: ${data.transcripts.length}`);
});

// Listen for chat messages
realtimeClient.on('chat-message', (data) => {
  console.log(`Chat from ${data.username}: ${data.content}`);
});

// Listen for participant events
realtimeClient.on('participant-tracked', (data) => {
  console.log(
    `Participant detected: ${data.participantName} at ${new Date(data.timestamp).toISOString()}`,
  );
});

realtimeClient.on('started-speaking', (data) => {
  console.log(
    `${data.participantName} started speaking at ${new Date(data.timestamp).toISOString()}`,
  );
});

// Participant state payload timestamps are epoch milliseconds.
realtimeClient.on('participant-muted', (data) => {
  console.log(
    `${data.participantName} muted at ${new Date(data.timestamp).toISOString()}`,
  );
});

// Listen for status updates
realtimeClient.on('status-update', (data) => {
  console.log(`Bot status changed: ${data.old_status} -> ${data.new_status}`);
});

// Send actions
realtimeClient.send('chat-message', { content: 'Hello!' });
realtimeClient.send('stop'); // Stop the bot

// You can fetch the full transcription at any time:
// (Note: returns an array of transcript segments)
console.log('Full transcript so far:', realtimeClient.transcript);

await realtimeClient.connect();
```

### Participant state events

Realtime participant state listeners use these event names:

- `participant-left`
- `participant-rejoined`
- `participant-muted`
- `participant-unmuted`
- `participant-camera-on`
- `participant-camera-off`
- `participant-started-screenshare`
- `participant-stopped-screenshare`

Each listener receives the same typed payload:

```ts
import type { RealtimeParticipantStateEventName } from '@skribby/sdk';

const participantStateEvents: RealtimeParticipantStateEventName[] = [
  'participant-left',
  'participant-rejoined',
  'participant-muted',
  'participant-unmuted',
  'participant-camera-on',
  'participant-camera-off',
  'participant-started-screenshare',
  'participant-stopped-screenshare',
];

for (const eventName of participantStateEvents) {
  realtimeClient.on(
    eventName,
    ({ participantId, participantName, timestamp }) => {
      console.log({
        eventName,
        participantId,
        participantName,
        occurredAt: new Date(timestamp),
      });
    },
  );
}
```

The existing `participant-tracked`, `started-speaking`, and `stopped-speaking`
listeners use the same `participantId`, `participantName`, and epoch-millisecond
`timestamp` payload. Participant event payloads can also include the typed
observation metadata `observedVia`, `reliability`, `state`, and `lastSeenAt`.

When participant timelines are requested from the API, their `type` values are
`started-speaking`, `stopped-speaking`, `left`, `rejoined`, `muted`, `unmuted`,
`camera-on`, `camera-off`, `started-screenshare`, and `stopped-screenshare`.
First-seen time remains available separately as `Participant.first_seen_at`.
`Participant.events` models the raw API response with an epoch-millisecond
`timestamp`; `bot.data.participants` follows the SDK's parsed data convention and
exposes event timestamps as `Date` values.

Newly recorded participant records expose their current or final presence state through
`last_seen_at`, optional `left_at`, `state`, and `presence_intervals`. Raw API
`first_seen_at` is an ISO date string, while `last_seen_at`, `left_at`, and each
presence interval timestamp are epoch milliseconds. The corresponding fields on
`bot.data.participants` are parsed as `Date` values. These additive fields may be
absent from historical or rolling-version responses:

```ts
for (const participant of bot.data.participants) {
  console.log({
    lastSeenAt: participant.last_seen_at,
    leftAt: participant.left_at,
    active: participant.state?.active,
    microphone: participant.state?.microphone,
    camera: participant.state?.camera,
    screenshare: participant.state?.screenshare,
    presenceIntervals: participant.presence_intervals ?? [],
  });
}
```

### Google Cloud Chirp 3 and AWS Transcribe

Use the canonical model key for Google Cloud Speech-to-Text V2 Chirp 3 (`google/chirp-3` or `google/chirp-3-realtime`) or AWS Transcribe (`aws/transcribe` or `aws/transcribe-streaming`). The `-realtime` and `-streaming` keys are real-time models; the other keys are batch models.

```ts
const batchBot = await client.createBot({
  bot_name: 'Chirp 3 batch bot',
  meeting_url: 'https://meet.google.com/abc-defg-hij',
  service: 'gmeet',
  transcription_model: 'google/chirp-3',
});

const realtimeBot = await client.createBot({
  bot_name: 'AWS streaming bot',
  meeting_url: 'https://meet.google.com/abc-defg-hij',
  service: 'gmeet',
  transcription_model: 'aws/transcribe-streaming',
});
```

For realtime bring-your-own credentials (`google/chirp-3-realtime` and `aws/transcribe-streaming` only), pass the existing credential UUID as `transcription_credentials` when creating or updating a bot or recording; batch models use managed credentials. The SDK does not create or update transcription credentials.

## Webhooks

When you provide a `webhook_url`, Skribby will POST events to your server:

```json
{
  "type": "status_update",
  "data": {
    "old_status": "joining",
    "new_status": "recording"
  }
}
```

## Documentation

Refer to the [Skribby documentation page](https://docs.skribby.io/) for more details.
