import { HttpException } from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';

export class UnableToParseDatabaseImportFileException extends HttpException {
  constructor(filename?: string) {
    const response = {
      message: filename
        ? `Unable to parse ${filename}`
        : 'Unable to parse import file',
      statusCode: 400,
      errorCode: CustomErrorCodes.DatabaseImportUnableToParseFile,
      error: 'Unable To Parse Database Import File',
      ...(filename ? { resource: { filename } } : {}),
    };

    super(response, 400);
  }
}
