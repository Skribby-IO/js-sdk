import type { SkribbyClient } from './SkribbyClient.js';
import type {
  MeetingBotApiData,
  MeetingBotData,
  UpdateMeetingBotOptions,
} from './types.js';
import { RealtimeClient } from './RealtimeClient.js';

export class MeetingBot {
  private readonly client: SkribbyClient;
  private bot_data: MeetingBotData;

  public constructor(client: SkribbyClient, api_data: MeetingBotApiData) {
    this.client = client;
    this.bot_data = this.parseApiData(api_data);
  }

  protected parseApiData(api_data: any): MeetingBotData {
    if (api_data.created_at) {
      api_data.created_at = new Date(api_data.created_at);
    }
    if (api_data.scheduled_for) {
      api_data.scheduled_for = new Date(api_data.scheduled_for);
    }
    if (api_data.finished_at) {
      api_data.finished_at = new Date(api_data.finished_at);
    }
    if (api_data.recording_available_until) {
      api_data.recording_available_until = new Date(
        api_data.recording_available_until,
      );
    }
    if (api_data.participants) {
      api_data.participants.forEach((participant: any) => {
        if (participant.first_seen_at) {
          participant.first_seen_at = new Date(participant.first_seen_at);
        }
        if (participant.events) {
          participant.events.forEach((event: any) => {
            if (event.timestamp) {
              event.timestamp = new Date(event.timestamp);
            }
          });
        }
      });
    }

    return api_data;
  }

  public get id(): string {
    return this.bot_data.id;
  }

  public get data(): MeetingBotData {
    return this.bot_data;
  }

  public async stop(): Promise<void> {
    await this.client.apiRequest(`/bot/${this.id}/stop`, 'POST');
  }

  public async delete(): Promise<void> {
    await this.client.apiRequest(`/bot/${this.id}`, 'DELETE');
  }

  public async update(options: UpdateMeetingBotOptions): Promise<void> {
    const api_data = await this.client.apiRequest<MeetingBotApiData>(
      `/bot/${this.id}`,
      'PATCH',
      {
        ...options,
        scheduled_start_time: options.scheduled_start_time?.getTime(),
      },
    );
    if (!api_data) throw new Error(`Bot with ID ${this.id} not found`);
    this.bot_data = this.parseApiData(api_data);
  }

  public async refresh() {
    const api_data = await this.client.apiRequest<MeetingBotApiData>(
      `/bot/${this.id}`,
      'GET',
    );
    if (!api_data) throw new Error(`Bot with ID ${this.id} not found`);
    this.bot_data = this.parseApiData(api_data);
  }

  public async sendChatMessage(message: string): Promise<void> {
    await this.client.apiRequest(`/bot/${this.id}/chat-message`, 'POST', {
      message,
    });
  }

  public getRealtimeClient(without_audio: boolean = false) {
    if (!this.bot_data.websocket_url) {
      throw new Error(
        `Realtime client is not available for bot with ID ${this.id}.`,
      );
    }

    return new RealtimeClient(
      this.bot_data.websocket_url,
      without_audio
        ? undefined
        : (this.bot_data.websocket_audio_url ?? undefined),
    );
  }
}
