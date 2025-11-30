import WebSocket from 'ws';
import type { RealtimeActionMap, RealtimeEventMap } from './types.js';
export class RealtimeClient {
  private readonly url: string;
  private readonly audioUrl: string | undefined;
  private ws: WebSocket | null = null;
  private audioWs: WebSocket | null = null;
  private ws_connected: boolean = false;
  private audio_ws_connected: boolean = false;
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

  public async connect(): Promise<void> {
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

          const eventName = json.type as keyof RealtimeEventMap;
          const eventData = json.data as RealtimeEventMap[typeof eventName];
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
