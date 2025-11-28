import type {
  CreateMeetingBotOptions,
  MeetingBotApiData,
  UpdateMeetingBotOptions,
  CreateRecordingOptions,
  RecordingApiData,
} from './types.js';
import { MeetingBot } from './MeetingBot.js';
import { Recording } from './Recording.js';
import { UnauthorizedError } from './errors/UnauthorizedError.js';
import { NotFoundError } from './errors/NotFoundError.js';
import { UnprocessableEntityError } from './errors/UnprocessableEntityError.js';
import { ApiRequestError } from './errors/ApiRequestError.js';

export type SkribbyClientOptions = {
  api_key: string;
};
export class SkribbyClient {
  private readonly api_url: string = 'https://platform.skribby.io/api/v1';
  private readonly api_key: string;

  public constructor({ api_key }: SkribbyClientOptions) {
    this.api_key = api_key;
  }

  public async apiRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    body?: Record<string, unknown>,
  ): Promise<T> {
    endpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.api_url}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${this.api_key}`,
    };
    const options: RequestInit = {
      method,
      headers,
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    return fetch(url, options)
      .then(async (response) => {
        if (!response.ok) {
          const responseBody = await response.text();
          let parsedBody: any;

          try {
            parsedBody = JSON.parse(responseBody);
          } catch {
            parsedBody = responseBody;
          }

          // Throw specific errors based on status code
          switch (response.status) {
            case 401:
              throw new UnauthorizedError(parsedBody, url, method);
            case 404:
              throw new NotFoundError(parsedBody, url, method);
            case 422:
              throw new UnprocessableEntityError(parsedBody, url, method);
            default:
              throw new ApiRequestError(
                `API request failed: ${response.status} - ${response.statusText}`,
                response.status,
                response.statusText,
                parsedBody,
                url,
                method,
              );
          }
        }
        return (await response.json()) as Promise<T>;
      })
      .catch((error) => {
        throw error;
      });
  }

  public async getScheduledBots(): Promise<MeetingBot[]> {
    const api_datas = await this.apiRequest<MeetingBotApiData[]>(
      '/bot/scheduled',
      'GET',
    );
    return api_datas.map((api_data) => new MeetingBot(this, api_data));
  }

  public async getBotById(botId: string) {
    const api_data = await this.apiRequest<MeetingBotApiData>(
      `/bot/${botId}`,
      'GET',
    );
    if (!api_data) return null;
    return new MeetingBot(this, api_data);
  }

  public async createBot(options: CreateMeetingBotOptions) {
    const api_data = await this.apiRequest<MeetingBotApiData | null>(
      `/bot`,
      'POST',
      {
        ...options,
        scheduled_start_time: options.scheduled_start_time?.getTime(),
      },
    );
    if (!api_data) return null;
    return new MeetingBot(this, api_data);
  }

  public async scheduleBot(
    options: CreateMeetingBotOptions & { scheduled_for: string },
  ) {
    const api_data = await this.apiRequest<MeetingBotApiData | null>(
      `/bot`,
      'POST',
      {
        ...options,
        scheduled_start_time: options.scheduled_start_time?.getTime(),
      },
    );
    if (!api_data) return null;
    return new MeetingBot(this, api_data);
  }

  public async updateBot(botId: string, options: UpdateMeetingBotOptions) {
    const api_data = await this.apiRequest<MeetingBotApiData | null>(
      `/bot/${botId}`,
      'PATCH',
      {
        ...options,
        scheduled_start_time: options.scheduled_start_time?.getTime(),
      },
    );
    if (!api_data) return null;
    return new MeetingBot(this, api_data);
  }

  public async createRecording(options: CreateRecordingOptions) {
    const api_data = await this.apiRequest<RecordingApiData | null>(
      `/recording`,
      'POST',
      {
        ...options,
      },
    );
    if (!api_data) return null;
    return new Recording(this, api_data);
  }

  public async getRecordingById(recordingId: string) {
    const api_data = await this.apiRequest<RecordingApiData>(
      `/recording/${recordingId}`,
      'GET',
    );
    if (!api_data) return null;
    return new Recording(this, api_data);
  }
}
