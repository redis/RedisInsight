import { Injectable, Logger } from '@nestjs/common';
import {
  createDecipheriv,
  createCipheriv,
  randomBytes,
  createHash,
} from 'crypto';
import {
  EncryptionResult,
  EncryptionStrategy,
} from 'src/modules/encryption/models';
import { IEncryptionStrategy } from 'src/modules/encryption/strategies/encryption-strategy.interface';
import {
  KeytarDecryptionErrorException,
  KeytarEncryptionErrorException,
  KeytarUnavailableException,
} from 'src/modules/encryption/exceptions';
import config, { Config } from 'src/utils/config';

const ACCOUNT = 'app';
const SERVER_CONFIG = config.get('server') as Config['server'];
const ENCRYPTION_CONFIG = config.get('encryption') as Config['encryption'];

@Injectable()
export class KeytarEncryptionStrategy implements IEncryptionStrategy {
  private logger = new Logger('KeytarEncryptionStrategy');

  private readonly keytar;

  private cipherKey;

  constructor() {
    try {
      if (!ENCRYPTION_CONFIG.keytar) {
        return;
      }

      // Have to require keytar here since during tests of keytar module
      // at some point it threw an error when OS secure storage was unavailable
      // Since it is difficult to reproduce we keep module require here to be
      // ready for such cases
      // eslint-disable-next-line global-require
      this.keytar = require('keytar');
    } catch (e) {
      this.logger.error('Failed to initialize keytar module', e);
    }
  }

  /**
   * Generates random password
   */
  private generatePassword(): string {
    return (
      SERVER_CONFIG.secretStoragePassword || randomBytes(20).toString('base64')
    );
  }

  /**
   * Get password from the OS secret storage
   * @private
   */
  private async getPassword(): Promise<string | null> {
    try {
      return await this.keytar.getPassword(
        ENCRYPTION_CONFIG.keytarService,
        ACCOUNT,
      );
    } catch (error) {
      this.logger.error('Unable to get password');
      throw new KeytarUnavailableException();
    }
  }

  /**
   * Save password in the OS secret storage
   * @param password
   * @private
   */
  private async setPassword(password: string): Promise<void> {
    try {
      await this.keytar.setPassword(
        ENCRYPTION_CONFIG.keytarService,
        ACCOUNT,
        password,
      );
    } catch (error) {
      this.logger.error('Unable to set password');
      throw new KeytarUnavailableException();
    }
  }

  private getCipherIV(): Buffer {
    return Buffer.from(ENCRYPTION_CONFIG.encryptionIV).slice(0, 16);
  }

  /**
   * Get password from storage and create cipher key
   * Note: Will generate new password if it doesn't exists yet
   */
  private async getCipherKey(): Promise<Buffer> {
    if (!this.cipherKey) {
      let password = await this.getPassword();
      if (!password) {
        await this.setPassword(this.generatePassword());
        password = await this.getPassword();
      }

      this.cipherKey = await createHash('sha256')
        .update(password, 'utf8') // lgtm[js/insufficient-password-hash]
        .digest();
    }

    return this.cipherKey;
  }

  /**
   * Checks if Keytar functionality is available
   * Basically just try to get a password and checks if this call fails
   */
  async isAvailable(): Promise<boolean> {
    if (!ENCRYPTION_CONFIG.keytar) {
      return false;
    }

    try {
      await this.keytar.getPassword(ENCRYPTION_CONFIG.keytarService, ACCOUNT);
      return true;
    } catch (e) {
      return false;
    }
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
        encryption: EncryptionStrategy.KEYTAR,
        data: encrypted,
      };
    } catch (error) {
      this.logger.error('Unable to encrypt data', error);
      throw new KeytarEncryptionErrorException();
    }
  }

  async decrypt(data: string, encryptedWith: string): Promise<string | null> {
    if (encryptedWith !== EncryptionStrategy.KEYTAR) {
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
      throw new KeytarDecryptionErrorException();
    }
  }
}
