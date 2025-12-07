import { EncryptionServiceErrorException } from 'src/modules/encryption/exceptions/encryption-service-error.exception';

export class KeyDecryptionErrorException extends EncryptionServiceErrorException {
  constructor(message = 'Unable to decrypt data') {
    super(
      {
        message,
        name: 'KeyDecryptionError',
        statusCode: 500,
      },
      500,
    );
  }
}
