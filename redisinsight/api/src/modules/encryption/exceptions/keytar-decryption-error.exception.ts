import { EncryptionServiceErrorException } from 'src/modules/encryption/exceptions/encryption-service-error.exception';
import { CustomErrorCodes } from 'src/constants';

export class KeytarDecryptionErrorException extends EncryptionServiceErrorException {
  constructor(message = 'Unable to decrypt data with Keytar') {
    super(
      {
        message,
        name: 'KeytarDecryptionError',
        statusCode: 500,
        errorCode: CustomErrorCodes.KeytarDecryptionError,
      },
      500,
    );
  }
}
