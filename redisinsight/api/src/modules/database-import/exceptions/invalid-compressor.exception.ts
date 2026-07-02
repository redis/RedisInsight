import { HttpException } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class InvalidCompressorException extends HttpException {
  constructor(message: string = ERROR_MESSAGES.INVALID_COMPRESSOR) {
    const response = {
      message,
      statusCode: 400,
      errorCode: CustomErrorCodes.DatabaseImportInvalidCompressor,
      error: 'Invalid compressor',
    };

    super(response, 400);
  }
}
