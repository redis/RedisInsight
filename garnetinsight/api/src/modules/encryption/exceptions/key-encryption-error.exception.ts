import { EncryptionServiceErrorException } from 'src/modules/encryption/exceptions/encryption-service-error.exception';

export class KeyEncryptionErrorException extends EncryptionServiceErrorException {
  constructor(message = 'Unable to encrypt data') {
    super(
      {
        message,
        name: 'KeyEncryptionError',
        statusCode: 500,
      },
      500,
    );
  }
}
