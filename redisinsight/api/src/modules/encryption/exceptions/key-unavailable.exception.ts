import { EncryptionServiceErrorException } from 'src/modules/encryption/exceptions/encryption-service-error.exception';
import { CustomErrorCodes } from 'src/constants';

export class KeyUnavailableException extends EncryptionServiceErrorException {
  constructor(message = 'Encryption key unavailable') {
    super(
      {
        message,
        name: 'KeyUnavailable',
        statusCode: 503,
        errorCode: CustomErrorCodes.KeyUnavailable,
      },
      503,
    );
  }
}
