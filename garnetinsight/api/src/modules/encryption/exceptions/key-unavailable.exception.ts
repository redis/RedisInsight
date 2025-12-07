import { EncryptionServiceErrorException } from 'src/modules/encryption/exceptions/encryption-service-error.exception';

export class KeyUnavailableException extends EncryptionServiceErrorException {
  constructor(message = 'Encryption key unavailable') {
    super(
      {
        message,
        name: 'KeyUnavailable',
        statusCode: 503,
      },
      503,
    );
  }
}
