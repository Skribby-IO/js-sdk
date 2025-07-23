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

const bot = client.createBot({
  bot_name: 'My Meeting Bot',
  meeting_url: 'https://meet.google.com/abc-defg-hij',
  service: 'gmeet',
  transcription_model: 'deepgram',
});

// If the chosen transcription model is real-time
const realtimeClient = bot.getRealtimeClient();

realtimeClient.on('ts', (data) => {
  console.log(`${data.speaker_name} said: ${data.transcript}`);

  if (data.transcript.toLowerCase().includes('hello')) {
    bot.sendChatMessage('Hello back!');
  }
  if (data.transcript.toLowerCase().includes('stop the bot')) {
    bot.stop();
  }
});

realtimeClient.connect();
```

## Documentation

Refer to the [Skribby documentation page](https://docs.skribby.com/) for more details.
