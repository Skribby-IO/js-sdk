import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import { WebSocketServer } from 'ws';

import { MeetingBot, RealtimeClient } from '../dist/index.js';

const participantEvents = [
  'participant-tracked',
  'started-speaking',
  'stopped-speaking',
  'participant-left',
  'participant-rejoined',
  'participant-muted',
  'participant-unmuted',
  'participant-camera-on',
  'participant-camera-off',
  'participant-started-screenshare',
  'participant-stopped-screenshare',
];

test('RealtimeClient dispatches every participant event payload', async (t) => {
  const server = new WebSocketServer({ port: 0 });
  t.after(() => server.close());
  await once(server, 'listening');

  const address = server.address();
  assert(address && typeof address === 'object');

  const realtimeClient = new RealtimeClient(`ws://127.0.0.1:${address.port}`);
  t.after(() => realtimeClient.disconnect());

  const received = participantEvents.map(
    (eventName) =>
      new Promise((resolve) => {
        realtimeClient.on(eventName, (payload) =>
          resolve([eventName, payload]),
        );
      }),
  );

  server.once('connection', (socket) => {
    setImmediate(() => {
      participantEvents.forEach((type, index) => {
        socket.send(
          JSON.stringify({
            type,
            data: {
              participantId: `participant-${index}`,
              participantName: `Participant ${index}`,
              timestamp: 1_752_486_400_000 + index,
              state: {
                active: type !== 'participant-left',
                microphone: 'muted',
                camera: 'on',
                screenshare: 'not-sharing',
              },
              lastSeenAt: 1_752_486_400_000 + index,
            },
          }),
        );
      });
    });
  });

  await realtimeClient.connect();

  assert.deepEqual(
    await Promise.all(received),
    participantEvents.map((eventName, index) => [
      eventName,
      {
        participantId: `participant-${index}`,
        participantName: `Participant ${index}`,
        timestamp: 1_752_486_400_000 + index,
        state: {
          active: eventName !== 'participant-left',
          microphone: 'muted',
          camera: 'on',
          screenshare: 'not-sharing',
        },
        lastSeenAt: 1_752_486_400_000 + index,
      },
    ]),
  );
});

test('MeetingBot parses participant timeline epoch milliseconds as Dates', () => {
  const bot = new MeetingBot(
    {},
    {
      id: 'bot-123',
      participants: [
        {
          name: 'Ada Lovelace',
          avatar: null,
          first_seen_at: '1970-01-01T00:00:00.000Z',
          last_seen_at: 1_752_486_400_000,
          left_at: 1_752_486_460_000,
          presence_intervals: [
            {
              joined_at: 0,
              left_at: 1_752_486_460_000,
            },
            {
              joined_at: 1_752_486_520_000,
            },
          ],
          events: [
            { type: 'started-speaking', timestamp: 0 },
            { type: 'muted', timestamp: 1_752_486_400_000 },
          ],
        },
      ],
    },
  );

  assert.deepEqual(
    bot.data.participants[0].events.map((event) => event.timestamp),
    [new Date(0), new Date(1_752_486_400_000)],
  );
  assert.deepEqual(bot.data.participants[0], {
    name: 'Ada Lovelace',
    avatar: null,
    first_seen_at: new Date('1970-01-01T00:00:00.000Z'),
    last_seen_at: new Date(1_752_486_400_000),
    left_at: new Date(1_752_486_460_000),
    presence_intervals: [
      {
        joined_at: new Date(0),
        left_at: new Date(1_752_486_460_000),
      },
      {
        joined_at: new Date(1_752_486_520_000),
      },
    ],
    events: [
      { type: 'started-speaking', timestamp: new Date(0) },
      { type: 'muted', timestamp: new Date(1_752_486_400_000) },
    ],
  });
});

test('MeetingBot accepts historical participant payloads without timeline fields', () => {
  const bot = new MeetingBot(
    {},
    {
      id: 'historical-bot',
      participants: [
        {
          name: 'Grace Hopper',
          avatar: null,
          first_seen_at: '2024-01-01T00:00:00.000Z',
          events: [{ type: 'started-speaking', timestamp: 1_704_067_201_000 }],
        },
      ],
    },
  );

  assert.deepEqual(bot.data.participants[0], {
    name: 'Grace Hopper',
    avatar: null,
    first_seen_at: new Date('2024-01-01T00:00:00.000Z'),
    events: [
      {
        type: 'started-speaking',
        timestamp: new Date(1_704_067_201_000),
      },
    ],
  });
});
