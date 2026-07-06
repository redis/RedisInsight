import { HttpException } from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';

export class UnableToFetchRemoteConfigException extends HttpException {
  constructor(
    response: string | Record<string, any> = {
      message: 'Unable to fetch remote config',
      name: 'UnableToFetchRemoteConfigException',
      statusCode: 500,
      errorCode: CustomErrorCodes.UnableToFetchRemoteConfig,
    },
    status = 500,
  ) {
    super(response, status);
  }
}
