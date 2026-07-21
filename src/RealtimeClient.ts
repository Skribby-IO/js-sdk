import WebSocket from 'ws';
import type {
  BotStatus,
  RealtimeActionMap,
  RealtimeChatMessage,
  RealtimeEventMap,
  RealtimeParticipant,
  RealtimeParticipantEvent,
  RealtimeTranscriptSegment,
} from './types.js';

const participantEventNames = new Set<keyof RealtimeEventMap>([
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
]);

export class RealtimeClient {
  private readonly url: string;
  private readonly audioUrl: string | undefined;
  private ws: WebSocket | null = null;
  private audioWs: WebSocket | null = null;
  private ws_connected: boolean = false;
  private audio_ws_connected: boolean = false;
  private transcriptSegments: RealtimeTranscriptSegment[] = [];
  private participantContexts: RealtimeParticipant[] = [];
  private observedChatMessages: RealtimeChatMessage[] = [];
  private currentStatus: BotStatus | null = null;
  private listeners: {
    [K in keyof RealtimeEventMap]?: Array<(data: RealtimeEventMap[K]) => void>;
  } = {};

  public constructor(url: string, audio_url?: string) {
    this.url = url;
    this.audioUrl = audio_url;
  }

  public get connected(): boolean {
    return this.ws_connected;
  }

  public get audioConnected(): boolean {
    return this.audio_ws_connected;
  }

  public get transcript(): ReadonlyArray<RealtimeTranscriptSegment> {
    // Return a copy so external callers can't mutate our internal buffer.
    return [...this.transcriptSegments];
  }

  public get participants(): ReadonlyArray<RealtimeParticipant> {
    return this.participantContexts.map((participant) => ({
      ...participant,
      state: { ...participant.state },
    }));
  }

  public get chatMessages(): ReadonlyArray<RealtimeChatMessage> {
    return this.observedChatMessages.map((message) => ({ ...message }));
  }

  public get status(): BotStatus | null {
    return this.currentStatus;
  }

  public on<K extends keyof RealtimeEventMap>(
    eventName: K,
    callback: (data: RealtimeEventMap[K]) => void,
  ): void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName]!.push(callback);
  }

  public send<K extends keyof RealtimeActionMap>(
    action: K,
    data?: RealtimeActionMap[K],
  ): void {
    this.ws?.send(
      JSON.stringify({
        action: action,
        data: data,
      }),
    );
  }

  /**
   * Change the bot's avatar during a realtime session.
   * @param avatarUrl - URL of the new avatar image
   */
  public changeAvatar(avatarUrl: string): void {
    this.send('change-avatar', { avatar_url: avatarUrl });
  }

  /** Start recording for a bot configured with manual recording start. */
  public startRecording(): void {
    this.send('start-recording');
  }

  private resetContext(): void {
    this.transcriptSegments = [];
    this.participantContexts = [];
    this.observedChatMessages = [];
    this.currentStatus = null;
  }

  private hydrateConnectedContext(
    context: RealtimeEventMap['connected'],
  ): void {
    this.transcriptSegments = Array.isArray(context?.transcripts)
      ? [...context.transcripts]
      : [];
    this.participantContexts = Array.isArray(context?.participants)
      ? context.participants.map((participant) => ({
          ...participant,
          state: { ...participant.state },
        }))
      : [];
    this.observedChatMessages = Array.isArray(context?.chat_messages)
      ? context.chat_messages.map((message) => ({ ...message }))
      : [];
    this.currentStatus = context?.status ?? null;
  }

  private updateParticipantContext(event: RealtimeParticipantEvent): void {
    const existingIndex = this.participantContexts.findIndex(
      (participant) => participant.participantId === event.participantId,
    );

    if (existingIndex === -1) {
      if (event.state) {
        this.participantContexts.push({
          ...event,
          state: { ...event.state },
        });
      }
      return;
    }

    const existing = this.participantContexts[existingIndex];
    if (!existing) return;

    this.participantContexts[existingIndex] = {
      ...existing,
      ...event,
      state: event.state ? { ...event.state } : existing.state,
    };
  }

  public async connect(): Promise<void> {
    // Reset all locally materialized context on (re)connect.
    this.resetContext();

    const mainConnection = new Promise<void>((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.on('open', () => {
        this.ws_connected = true;
        resolve();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const json = JSON.parse(data.toString());
          if (this.listeners.raw) {
            this.listeners.raw!.forEach((callback) => callback(json));
          }

          const eventName = (json.type ?? json.event) as
            | keyof RealtimeEventMap
            | undefined;
          if (!eventName) return;
          const eventData = json.data as RealtimeEventMap[typeof eventName];

          if (eventName === 'connected') {
            this.hydrateConnectedContext(
              eventData as RealtimeEventMap['connected'],
            );
          } else if (eventName === 'ts') {
            this.transcriptSegments.push(eventData as RealtimeEventMap['ts']);
          } else if (eventName === 'chat-message') {
            this.observedChatMessages.push({
              ...(eventData as RealtimeEventMap['chat-message']),
            });
          } else if (eventName === 'status-update') {
            this.currentStatus = (
              eventData as RealtimeEventMap['status-update']
            ).new_status;
          } else if (participantEventNames.has(eventName)) {
            this.updateParticipantContext(
              eventData as RealtimeParticipantEvent,
            );
          }

          if (this.listeners[eventName]) {
            this.listeners[eventName]!.forEach((callback) =>
              (callback as any)(eventData),
            );
          }
        } catch (error) {}
      });

      this.ws.on('error', (error) => {
        this.ws_connected = false;
        reject(error);
      });

      this.ws.on('close', () => {
        this.ws_connected = false;
      });
    });

    const audioConnection = this.audioUrl
      ? new Promise<void>((resolve, reject) => {
          this.audioWs = new WebSocket(this.audioUrl!);

          this.audioWs.on('open', () => {
            this.audio_ws_connected = true;
            resolve();
          });

          this.audioWs.on('message', (data: WebSocket.Data) => {
            if (this.listeners.audio) {
              const buffer = Buffer.isBuffer(data)
                ? data
                : Buffer.from(data as ArrayBuffer);
              this.listeners.audio.forEach((callback) => callback(buffer));
            }
          });

          this.audioWs.on('error', (error) => {
            this.audio_ws_connected = false;
            reject(error);
          });

          this.audioWs.on('close', () => {
            this.audio_ws_connected = false;
          });
        })
      : Promise.resolve();

    await Promise.all([mainConnection, audioConnection]);
  }

  public async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.ws_connected = false;

    if (this.audioWs) {
      this.audioWs.close();
      this.audioWs = null;
    }
    this.audio_ws_connected = false;
  }
}
