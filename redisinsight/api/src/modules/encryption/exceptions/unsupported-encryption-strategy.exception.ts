import { EncryptionServiceErrorException } from 'src/modules/encryption/exceptions/encryption-service-error.exception';
import { CustomErrorCodes } from 'src/constants';

export class UnsupportedEncryptionStrategyException extends EncryptionServiceErrorException {
  constructor(message = 'Unsupported encryption strategy') {
    super(
      {
        message,
        name: 'UnsupportedEncryptionStrategy',
        statusCode: 500,
        errorCode: CustomErrorCodes.UnsupportedEncryptionStrategy,
      },
      500,
    );
  }
}
