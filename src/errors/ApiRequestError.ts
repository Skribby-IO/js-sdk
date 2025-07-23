export class ApiRequestError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly responseBody: any;
  public readonly url: string;
  public readonly method: string;

  constructor(
    message: string,
    status: number,
    statusText: string,
    responseBody: any,
    url: string,
    method: string,
  ) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.statusText = statusText;
    this.responseBody = responseBody;
    this.url = url;
    this.method = method;
  }
}
