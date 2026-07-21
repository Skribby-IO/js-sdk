import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import { WebSocketServer } from 'ws';

import { RealtimeClient, SkribbyClient } from '../dist/index.js';

const transcript = {
  transcript: 'Recording may begin.',
  start: 0,
  end: 1.25,
  speaker: 0,
  speaker_name: 'Ada Lovelace',
};

const participant = {
  participantId: 'participant-123',
  participantName: 'Ada Lovelace',
  timestamp: 1_784_550_725_000,
  lastSeenAt: 1_784_550_725_000,
  state: {
    active: true,
    microphone: 'muted',
    camera: 'off',
    screenshare: 'not-sharing',
  },
};

const chatMessage = {
  id: 'message-123',
  parent_id: null,
  username: 'Ada Lovelace',
  content: 'I consent to recording.',
  user_avatar: null,
};

const reconnectedTranscript = {
  ...transcript,
  transcript: 'This context came from the reconnect snapshot.',
  start: 10,
  end: 11.5,
};

const reconnectedParticipant = {
  ...participant,
  participantId: 'participant-456',
  participantName: 'Grace Hopper',
  timestamp: participant.timestamp + 10_000,
  lastSeenAt: participant.lastSeenAt + 10_000,
  state: {
    active: true,
    microphone: 'unmuted',
    camera: 'on',
    screenshare: 'sharing',
  },
};

const reconnectedChatMessage = {
  id: 'message-789',
  username: 'Grace Hopper',
  content: 'Reconnect context is current.',
};

const legacyTranscript = {
  ...transcript,
  transcript: 'Legacy transcript-only context.',
  start: 20,
  end: 21,
};

test('RealtimeClient hydrates, updates, and replaces context across reconnects', async (t) => {
  const server = new WebSocketServer({ port: 0 });
  t.after(() => server.close());
  await once(server, 'listening');

  const address = server.address();
  assert(address && typeof address === 'object');

  let connectionNumber = 0;
  let activeSocket;
  server.on('connection', (socket) => {
    activeSocket = socket;
    connectionNumber += 1;

    const context = [
      {
        transcripts: [transcript],
        participants: [participant],
        chat_messages: [chatMessage],
        status: 'waiting_to_record',
      },
      {
        transcripts: [reconnectedTranscript],
        participants: [reconnectedParticipant],
        chat_messages: [reconnectedChatMessage],
        status: 'recording',
      },
      // Older relays sent transcript-only connected snapshots.
      { transcripts: [legacyTranscript] },
    ][connectionNumber - 1];

    setImmediate(() => {
      socket.send(JSON.stringify({ type: 'connected', data: context }));
    });
  });

  const realtimeClient = new RealtimeClient(`ws://127.0.0.1:${address.port}`);
  t.after(() => realtimeClient.disconnect());

  const firstConnected = new Promise((resolve) => {
    realtimeClient.on('connected', resolve);
  });
  await realtimeClient.connect();
  await firstConnected;

  assert.deepEqual(realtimeClient.transcript, [transcript]);
  assert.deepEqual(realtimeClient.participants, [participant]);
  assert.deepEqual(realtimeClient.chatMessages, [chatMessage]);
  assert.equal(realtimeClient.status, 'waiting_to_record');
  assert.equal(
    'active_participant_count' in realtimeClient.participants[0],
    false,
  );

  const nextTranscript = { ...transcript, transcript: 'Thank you.', start: 2 };
  const inactiveParticipant = {
    ...participant,
    timestamp: participant.timestamp + 1_000,
    lastSeenAt: participant.lastSeenAt + 1_000,
    state: { ...participant.state, active: false },
  };
  const nextChatMessage = {
    ...chatMessage,
    id: 'message-456',
    content: 'Ready.',
  };

  const incrementalEvents = Promise.all([
    new Promise((resolve) => realtimeClient.on('ts', resolve)),
    new Promise((resolve) => realtimeClient.on('participant-left', resolve)),
    new Promise((resolve) => realtimeClient.on('chat-message', resolve)),
    new Promise((resolve) => realtimeClient.on('status-update', resolve)),
    new Promise((resolve) => realtimeClient.on('recording-started', resolve)),
  ]);

  activeSocket.send(JSON.stringify({ type: 'ts', data: nextTranscript }));
  activeSocket.send(
    JSON.stringify({ type: 'participant-left', data: inactiveParticipant }),
  );
  activeSocket.send(
    JSON.stringify({ type: 'chat-message', data: nextChatMessage }),
  );
  activeSocket.send(
    JSON.stringify({
      type: 'status-update',
      data: {
        old_status: 'waiting_to_record',
        new_status: 'recording',
      },
    }),
  );
  activeSocket.send(
    JSON.stringify({
      type: 'recording-started',
      data: { started_at: 1_784_550_726_123 },
    }),
  );

  const receivedEvents = await incrementalEvents;
  assert.deepEqual(receivedEvents[4], { started_at: 1_784_550_726_123 });
  assert.deepEqual(realtimeClient.transcript, [transcript, nextTranscript]);
  assert.deepEqual(realtimeClient.participants, [inactiveParticipant]);
  assert.deepEqual(realtimeClient.chatMessages, [chatMessage, nextChatMessage]);
  assert.equal(realtimeClient.status, 'recording');

  await realtimeClient.disconnect();
  const secondConnected = new Promise((resolve) => {
    realtimeClient.on('connected', resolve);
  });
  await realtimeClient.connect();
  await secondConnected;

  assert.deepEqual(realtimeClient.transcript, [reconnectedTranscript]);
  assert.deepEqual(realtimeClient.participants, [reconnectedParticipant]);
  assert.deepEqual(realtimeClient.chatMessages, [reconnectedChatMessage]);
  assert.equal(realtimeClient.status, 'recording');

  await realtimeClient.disconnect();
  const legacyConnected = new Promise((resolve) => {
    realtimeClient.on('connected', resolve);
  });
  await realtimeClient.connect();
  await legacyConnected;

  assert.deepEqual(realtimeClient.transcript, [legacyTranscript]);
  assert.deepEqual(realtimeClient.participants, []);
  assert.deepEqual(realtimeClient.chatMessages, []);
  assert.equal(realtimeClient.status, null);
});

test('legacy chat envelopes reach typed and untouched raw listeners', async (t) => {
  const server = new WebSocketServer({ port: 0 });
  t.after(() => server.close());
  await once(server, 'listening');

  const address = server.address();
  assert(address && typeof address === 'object');

  const envelope = {
    event: 'chat-message',
    data: chatMessage,
    relay_metadata: { preserved: true },
  };

  server.once('connection', (socket) => {
    setImmediate(() => socket.send(JSON.stringify(envelope)));
  });

  const realtimeClient = new RealtimeClient(`ws://127.0.0.1:${address.port}`);
  t.after(() => realtimeClient.disconnect());

  const typedMessage = new Promise((resolve) => {
    realtimeClient.on('chat-message', resolve);
  });
  const rawMessage = new Promise((resolve) => {
    realtimeClient.on('raw', resolve);
  });

  await realtimeClient.connect();

  assert.deepEqual(await typedMessage, chatMessage);
  assert.deepEqual(await rawMessage, envelope);
  assert.deepEqual(realtimeClient.chatMessages, [chatMessage]);
});

test('startRecording sends the additive action without changing existing action payloads', async (t) => {
  const server = new WebSocketServer({ port: 0 });
  t.after(() => server.close());
  await once(server, 'listening');

  const address = server.address();
  assert(address && typeof address === 'object');

  const received = [];
  let resolveMessagesReceived;
  const messagesReceived = new Promise((resolve) => {
    resolveMessagesReceived = resolve;
  });
  server.once('connection', (socket) => {
    socket.on('message', (data) => {
      received.push(JSON.parse(data.toString()));
      if (received.length === 3) resolveMessagesReceived();
    });
  });

  const realtimeClient = new RealtimeClient(`ws://127.0.0.1:${address.port}`);
  t.after(() => realtimeClient.disconnect());
  await realtimeClient.connect();

  realtimeClient.startRecording();
  realtimeClient.changeAvatar('https://example.test/avatar.png');
  realtimeClient.send('chat-message', { content: 'Existing action' });
  await messagesReceived;

  assert.deepEqual(received, [
    { action: 'start-recording' },
    {
      action: 'change-avatar',
      data: { avatar_url: 'https://example.test/avatar.png' },
    },
    {
      action: 'chat-message',
      data: { content: 'Existing action' },
    },
  ]);
});

test('bot requests preserve automatic behavior and serialize manual recording controls', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const requestBodies = [];
  globalThis.fetch = async (_url, options) => {
    requestBodies.push(JSON.parse(options.body));
    return new Response(
      JSON.stringify({
        id: `bot-${requestBodies.length}`,
        recording_start_mode:
          requestBodies.at(-1).recording_start_mode ?? 'automatic',
        participants: [],
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  };

  const client = new SkribbyClient({
    api_key: 'test-api-key',
    base_url: 'https://example.test/api/v1',
  });
  const baseOptions = {
    transcription_model: 'none',
    service: 'zoom',
    meeting_url: 'https://example.test/meeting',
    bot_name: 'Skribby',
  };

  await client.createBot(baseOptions);
  await client.createBot({
    ...baseOptions,
    recording_start_mode: 'automatic',
  });
  await client.createBot({
    ...baseOptions,
    recording_start_mode: 'manual',
    stop_options: { recording_start_timeout: 15 },
  });
  await client.updateBot('bot-1', {
    recording_start_mode: 'manual',
    stop_options: { recording_start_timeout: 20 },
  });

  assert.equal('recording_start_mode' in requestBodies[0], false);
  assert.equal(requestBodies[1].recording_start_mode, 'automatic');
  assert.deepEqual(
    {
      recording_start_mode: requestBodies[2].recording_start_mode,
      stop_options: requestBodies[2].stop_options,
    },
    {
      recording_start_mode: 'manual',
      stop_options: { recording_start_timeout: 15 },
    },
  );
  assert.deepEqual(
    {
      recording_start_mode: requestBodies[3].recording_start_mode,
      stop_options: requestBodies[3].stop_options,
    },
    {
      recording_start_mode: 'manual',
      stop_options: { recording_start_timeout: 20 },
    },
  );
});
