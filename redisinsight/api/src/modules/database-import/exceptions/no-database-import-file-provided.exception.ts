import { HttpException } from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';

export class NoDatabaseImportFileProvidedException extends HttpException {
  constructor(message: string = 'No import file provided') {
    const response = {
      message,
      statusCode: 400,
      errorCode: CustomErrorCodes.DatabaseImportNoFileProvided,
      error: 'No Database Import File Provided',
    };

    super(response, 400);
  }
}
