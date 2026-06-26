import { EncryptionServiceErrorException } from 'src/modules/encryption/exceptions/encryption-service-error.exception';
import { CustomErrorCodes } from 'src/constants';

export class KeytarEncryptionErrorException extends EncryptionServiceErrorException {
  constructor(message = 'Unable to encrypt data with Keytar') {
    super(
      {
        message,
        name: 'KeytarEncryptionError',
        statusCode: 500,
        errorCode: CustomErrorCodes.KeytarEncryptionError,
      },
      500,
    );
  }
}
