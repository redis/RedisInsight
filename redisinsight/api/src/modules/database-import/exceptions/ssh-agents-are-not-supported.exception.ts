import { HttpException } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class SshAgentsAreNotSupportedException extends HttpException {
  constructor(message: string = ERROR_MESSAGES.SSH_AGENTS_ARE_NOT_SUPPORTED) {
    const response = {
      message,
      statusCode: 400,
      errorCode: CustomErrorCodes.DatabaseImportSshAgentsNotSupported,
      error: 'Ssh Agents Are Not Supported',
    };

    super(response, 400);
  }
}
