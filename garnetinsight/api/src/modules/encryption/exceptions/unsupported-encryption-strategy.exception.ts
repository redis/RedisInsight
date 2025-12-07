import { EncryptionServiceErrorException } from 'src/modules/encryption/exceptions/encryption-service-error.exception';

export class UnsupportedEncryptionStrategyException extends EncryptionServiceErrorException {
  constructor(message = 'Unsupported encryption strategy') {
    super(
      {
        message,
        name: 'UnsupportedEncryptionStrategy',
        statusCode: 500,
      },
      500,
    );
  }
}
