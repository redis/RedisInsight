import { EncryptionServiceErrorException } from 'src/modules/encryption/exceptions/encryption-service-error.exception';

export class KeytarUnavailableException extends EncryptionServiceErrorException {
  constructor(message = 'Keytar unavailable') {
    super(
      {
        message,
        name: 'KeytarUnavailable',
        statusCode: 503,
      },
      503,
    );
  }
}
