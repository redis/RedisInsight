import { HttpException } from '@nestjs/common';

export class UnableToFetchRemoteConfigException extends HttpException {
  constructor(
    response: string | Record<string, any> = {
      message: 'Unable to fetch remote config',
      name: 'UnableToFetchRemoteConfigException',
      statusCode: 500,
    },
    status = 500,
  ) {
    super(response, status);
  }
}
