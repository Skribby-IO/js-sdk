import { ApiRequestError } from './ApiRequestError.js';

export class NotFoundError extends ApiRequestError {
  constructor(responseBody: any, url: string, method: string) {
    super(
      'Not Found: Resource does not exist',
      404,
      'Not Found',
      responseBody,
      url,
      method,
    );
    this.name = 'NotFoundError';
  }
}
