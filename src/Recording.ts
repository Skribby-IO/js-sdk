import type { SkribbyClient } from './SkribbyClient.js';
import type { RecordingApiData, RecordingData } from './types.js';

export class Recording {
  private readonly client: SkribbyClient;
  private recording_data: RecordingData;

  public constructor(client: SkribbyClient, api_data: RecordingApiData) {
    this.client = client;
    this.recording_data = this.parseApiData(api_data);
  }

  protected parseApiData(api_data: any): RecordingData {
    if (api_data.created_at) {
      api_data.created_at = new Date(api_data.created_at);
    }
    if (api_data.finished_at) {
      api_data.finished_at = new Date(api_data.finished_at);
    }
    if (api_data.recording_available_until) {
      api_data.recording_available_until = new Date(
        api_data.recording_available_until,
      );
    }

    return api_data;
  }

  public get id(): string {
    return this.recording_data.id;
  }

  public get data(): RecordingData {
    return this.recording_data;
  }

  public async delete(): Promise<void> {
    await this.client.apiRequest(`/recording/${this.id}`, 'DELETE');
  }

  public async refresh() {
    const api_data = await this.client.apiRequest<RecordingApiData>(
      `/recording/${this.id}`,
      'GET',
    );
    if (!api_data) throw new Error(`Recording with ID ${this.id} not found`);
    this.recording_data = this.parseApiData(api_data);
  }
}

