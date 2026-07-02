import { EncryptionServiceErrorException } from 'src/modules/encryption/exceptions/encryption-service-error.exception';
import { CustomErrorCodes } from 'src/constants';

export class KeyEncryptionErrorException extends EncryptionServiceErrorException {
  constructor(message = 'Unable to encrypt data') {
    super(
      {
        message,
        name: 'KeyEncryptionError',
        statusCode: 500,
        errorCode: CustomErrorCodes.KeyEncryptionError,
      },
      500,
    );
  }
}
