import { ApiRequestError } from './ApiRequestError.js';

export class UnauthorizedError extends ApiRequestError {
  constructor(responseBody: any, url: string, method: string) {
    super(
      'Unauthorized: Invalid or expired API key',
      401,
      'Unauthorized',
      responseBody,
      url,
      method,
    );
    this.name = 'UnauthorizedError';
  }
}
