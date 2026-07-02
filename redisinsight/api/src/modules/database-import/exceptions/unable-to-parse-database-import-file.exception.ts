import { HttpException } from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';

export class UnableToParseDatabaseImportFileException extends HttpException {
  constructor(message: string = 'Unable to parse import file') {
    const response = {
      message,
      statusCode: 400,
      errorCode: CustomErrorCodes.DatabaseImportUnableToParseFile,
      error: 'Unable To Parse Database Import File',
    };

    super(response, 400);
  }
}
