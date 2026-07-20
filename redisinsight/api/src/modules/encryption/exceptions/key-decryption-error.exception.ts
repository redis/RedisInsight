import { EncryptionServiceErrorException } from 'src/modules/encryption/exceptions/encryption-service-error.exception';
import { CustomErrorCodes } from 'src/constants';

export class KeyDecryptionErrorException extends EncryptionServiceErrorException {
  constructor(message = 'Unable to decrypt data') {
    super(
      {
        message,
        name: 'KeyDecryptionError',
        statusCode: 500,
        errorCode: CustomErrorCodes.KeyDecryptionError,
      },
      500,
    );
  }
}
