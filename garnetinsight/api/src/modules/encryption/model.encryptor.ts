import { isUndefined } from 'lodash';
import { Logger } from '@nestjs/common';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { cloneClassInstance } from 'src/utils';

export class ModelEncryptor {
  private readonly logger = new Logger('ModelEncryptor');

  constructor(
    private readonly encryptionService: EncryptionService,
    // list of properties to encrypt/decrypt
    protected readonly fields: string[],
  ) {}

  async encryptEntities<T>(entities: T[]): Promise<T[]> {
    return Promise.all(
      entities.map(async (entity) => {
        return this.encryptEntity(entity);
      }),
    );
  }

  async decryptEntities<T>(
    entities: T[],
    ignoreErrors: boolean = false,
  ): Promise<T[]> {
    return Promise.all(
      entities.map(async (entity) => {
        return this.decryptEntity(entity, ignoreErrors);
      }),
    );
  }

  /**
   * Encrypt required fields based on picked encryption strategy
   * Should always throw an encryption error to determine that something wrong
   * with encryption strategy
   *
   * @param entity
   * @private
   */
  async encryptEntity<T>(entity: T): Promise<T> {
    const encryptedEntity = cloneClassInstance(entity);

    // TODO: implement support depth in field, 'obj.field'
    await Promise.all(
      this.fields.map(async (field) => {
        if (entity[field]) {
          const { data, encryption } = await this.encryptionService.encrypt(
            entity[field],
          );
          encryptedEntity[field] = data;
          encryptedEntity['encryption'] = encryption;
        }
      }),
    );

    return encryptedEntity;
  }

  /**
   * Decrypt required fields
   * This method should optionally not fail (to not block users to navigate across the app
   * on decryption error, for example, to be able change encryption strategy in the future)
   *
   * When ignoreErrors = true will return null for failed fields.
   * It will cause 401 Unauthorized errors when user tries to connect to redis database
   *
   * @param entity
   * @param ignoreErrors
   * @private
   */
  async decryptEntity<T>(entity: T, ignoreErrors: boolean = false): Promise<T> {
    if (!entity) {
      return null;
    }

    const decrypted = cloneClassInstance(entity);

    await Promise.all(
      this.fields.map(async (field) => {
        decrypted[field] = await this.decryptField(entity, field, ignoreErrors);
      }),
    );

    return decrypted;
  }

  /**
   * Decrypt single field if exists
   *
   * @param entity
   * @param field
   * @param ignoreErrors
   * @private
   */
  async decryptField<T>(
    entity: T,
    field: string,
    ignoreErrors: boolean,
  ): Promise<string> {
    if (isUndefined(entity[field])) {
      return undefined;
    }

    try {
      return await this.encryptionService.decrypt(
        entity[field],
        entity['encryption'],
      );
    } catch (error) {
      this.logger.error(`Unable to decrypt entity fields: ${field}`, error);
      if (!ignoreErrors) {
        throw error;
      }
    }

    return null;
  }
}
