import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export interface CloudApiMfaFactors {
  totpFactorAvailable?: boolean;
  smsFactorAvailable?: boolean;
  phoneNumber?: string;
}

export class CloudApiMfaRequiredException extends HttpException {
  // JSESSIONID set by the challenge response; not exposed to the client
  apiSessionId?: string;

  constructor(
    message = ERROR_MESSAGES.CLOUD_MFA_REQUIRED,
    options?: HttpExceptionOptions,
    factors?: CloudApiMfaFactors,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.UNAUTHORIZED,
      error: 'CloudApiMfaRequired',
      errorCode: CustomErrorCodes.CloudApiMfaRequired,
      factors,
    };

    super(response, response.statusCode, options);
  }
}
