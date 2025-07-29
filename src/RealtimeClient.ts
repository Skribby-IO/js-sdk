import WebSocket from 'ws';
import type { RealtimeActionMap, RealtimeEventMap } from './types.js';
export class RealtimeClient {
  private readonly url: string;
  private ws: WebSocket | null = null;
  private ws_connected: boolean = false;
  private listeners: {
    [K in keyof RealtimeEventMap]?: Array<(data: RealtimeEventMap[K]) => void>;
  } = {};

  public constructor(url: string) {
    this.url = url;
  }

  public get connected(): boolean {
    return this.ws_connected;
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
    data: RealtimeActionMap[K],
  ): void {
    this.ws?.send(
      JSON.stringify({
        action: action,
        data: data,
      }),
    );
  }

  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
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
  }

  public async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
      this.ws_connected = false;
      resolve();
    });
  }
}
