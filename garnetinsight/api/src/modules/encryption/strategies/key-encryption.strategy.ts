import { Injectable, Logger } from '@nestjs/common';
import { createDecipheriv, createCipheriv, createHash } from 'crypto';
import {
  EncryptionResult,
  EncryptionStrategy,
} from 'src/modules/encryption/models';
import { IEncryptionStrategy } from 'src/modules/encryption/strategies/encryption-strategy.interface';
import {
  KeyDecryptionErrorException,
  KeyEncryptionErrorException,
  KeyUnavailableException,
} from 'src/modules/encryption/exceptions';
import config, { Config } from 'src/utils/config';

const HASH_ALGORITHM = 'sha256';
const SERVER_CONFIG = config.get('server') as Config['server'];
const ENCRYPTION_CONFIG = config.get('encryption') as Config['encryption'];

@Injectable()
export class KeyEncryptionStrategy implements IEncryptionStrategy {
  private logger = new Logger('KeyEncryptionStrategy');

  private cipherKey: Buffer;

  private readonly key: string;

  constructor() {
    this.key = SERVER_CONFIG.encryptionKey;
  }

  private getCipherIV(): Buffer {
    return Buffer.from(ENCRYPTION_CONFIG.encryptionIV).slice(0, 16);
  }

  /**
   * Will return existing cipher stored in-memory or
   * create new one using specified key and store it in-memory
   */
  private async getCipherKey(): Promise<Buffer> {
    if (!this.cipherKey) {
      if (!this.key) {
        throw new KeyUnavailableException();
      }

      this.cipherKey = createHash(HASH_ALGORITHM)
        .update(this.key, 'utf8')
        .digest();
    }

    return this.cipherKey;
  }

  /**
   * Checks if secret key was specified
   */
  async isAvailable(): Promise<boolean> {
    return !!this.key;
  }

  async encrypt(data: string): Promise<EncryptionResult> {
    const cipherKey = await this.getCipherKey();
    try {
      const cipher = createCipheriv(
        ENCRYPTION_CONFIG.encryptionAlgorithm,
        cipherKey,
        this.getCipherIV(),
      );
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      return {
        encryption: EncryptionStrategy.KEY,
        data: encrypted,
      };
    } catch (error) {
      this.logger.error('Unable to encrypt data', error);
      throw new KeyEncryptionErrorException();
    }
  }

  async decrypt(data: string, encryptedWith: string): Promise<string | null> {
    if (encryptedWith !== EncryptionStrategy.KEY) {
      return null;
    }

    const cipherKey = await this.getCipherKey();

    try {
      const decipher = createDecipheriv(
        ENCRYPTION_CONFIG.encryptionAlgorithm,
        cipherKey,
        this.getCipherIV(),
      );
      let decrypted = decipher.update(data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      this.logger.error('Unable to decrypt data', error);
      throw new KeyDecryptionErrorException();
    }
  }
}
