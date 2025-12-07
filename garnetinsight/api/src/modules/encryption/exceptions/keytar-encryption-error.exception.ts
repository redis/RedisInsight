import { EncryptionServiceErrorException } from 'src/modules/encryption/exceptions/encryption-service-error.exception';

export class KeytarEncryptionErrorException extends EncryptionServiceErrorException {
  constructor(message = 'Unable to encrypt data with Keytar') {
    super(
      {
        message,
        name: 'KeytarEncryptionError',
        statusCode: 500,
      },
      500,
    );
  }
}
