import { EncryptionServiceErrorException } from 'src/modules/encryption/exceptions/encryption-service-error.exception';
import { CustomErrorCodes } from 'src/constants';

export class KeytarUnavailableException extends EncryptionServiceErrorException {
  constructor(message = 'Keytar unavailable') {
    super(
      {
        message,
        name: 'KeytarUnavailable',
        statusCode: 503,
        errorCode: CustomErrorCodes.KeytarUnavailable,
      },
      503,
    );
  }
}
