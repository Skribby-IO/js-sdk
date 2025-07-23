import { ApiRequestError } from './ApiRequestError.js';

export class UnprocessableEntityError extends ApiRequestError {
  constructor(responseBody: any, url: string, method: string) {
    super(
      'Unprocessable Entity: Validation failed or request cannot be processed',
      422,
      'Unprocessable Entity',
      responseBody,
      url,
      method,
    );
    this.name = 'UnprocessableEntityError';
  }
}
