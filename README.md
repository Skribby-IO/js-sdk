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

(async () => {
  const bot = await client.createBot({
    bot_name: 'My Meeting Bot',
    meeting_url: 'https://meet.google.com/abc-defg-hij',
    service: 'gmeet',
    transcription_model: 'deepgram-realtime',
  });

  // If the chosen transcription model is real-time
  const realtimeClient = bot.getRealtimeClient();

  realtimeClient.on('ts', (data) => {
    console.log(`${data.speaker_name} said: ${data.transcript}`);

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
  transcription_model: 'whisper',
  webhook_url: 'https://your-server.com/webhook', // Optional: receive status updates
});
```

### Get a Bot by ID

```ts
const bot = await client.getBotById('bot_123');
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
  transcription_model: 'whisper',
  lang: 'en',
  webhook_url: 'https://your-server.com/webhook', // Optional
});
```

### Re-transcribe from a Meeting Bot

```ts
const recording = await client.createRecording({
  meeting_bot_id: 'bot_123',
  transcription_model: 'deepgram', // Override the original model
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

For bots using real-time transcription models (e.g., `deepgram-realtime`, `assembly-ai-realtime`):

```ts
const realtimeClient = bot.getRealtimeClient();

// Listen for transcription events
realtimeClient.on('ts', (data) => {
  console.log(`${data.speaker_name}: ${data.transcript}`);
});

// Listen for chat messages
realtimeClient.on('chat-message', (data) => {
  console.log(`Chat from ${data.username}: ${data.content}`);
});

// Listen for participant events
realtimeClient.on('participant-tracked', (data) => {
  console.log(`Participant joined: ${data.participantName}`);
});

// Listen for status updates
realtimeClient.on('status-update', (data) => {
  console.log(`Bot status changed: ${data.old_status} -> ${data.new_status}`);
});

// Send actions
realtimeClient.send('chat-message', { content: 'Hello!' });
realtimeClient.send('stop'); // Stop the bot

await realtimeClient.connect();
```

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
