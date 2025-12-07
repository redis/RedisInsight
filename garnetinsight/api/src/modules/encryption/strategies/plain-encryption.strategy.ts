import { Injectable } from '@nestjs/common';
import {
  EncryptionResult,
  EncryptionStrategy,
} from 'src/modules/encryption/models';
import { IEncryptionStrategy } from 'src/modules/encryption/strategies/encryption-strategy.interface';

@Injectable()
export class PlainEncryptionStrategy implements IEncryptionStrategy {
  async encrypt(data: string): Promise<EncryptionResult> {
    return {
      encryption: EncryptionStrategy.PLAIN,
      data,
    };
  }

  async decrypt(data: string, encryptedWith: string): Promise<string | null> {
    if (encryptedWith !== EncryptionStrategy.PLAIN) {
      return null;
    }

    return data;
  }
}
