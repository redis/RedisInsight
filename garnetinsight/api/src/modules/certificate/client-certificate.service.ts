import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { EncryptionServiceErrorException } from 'src/modules/encryption/exceptions';
import { ClientCertificateRepository } from 'src/modules/certificate/repositories/client-certificate.repository';
import { ClientCertificate } from 'src/modules/certificate/models/client-certificate';
import { CreateClientCertificateDto } from 'src/modules/certificate/dto/create.client-certificate.dto';
import { classToClass } from 'src/utils';
import { RedisClientStorage } from 'src/modules/redis/redis.client.storage';

@Injectable()
export class ClientCertificateService {
  private logger = new Logger('ClientCertificateService');

  constructor(
    private readonly repository: ClientCertificateRepository,
    private redisClientStorage: RedisClientStorage,
  ) {}

  /**
   * Get full Client certificate entity by id with decrypted fields
   * @param id
   */
  async get(id: string): Promise<ClientCertificate> {
    this.logger.debug(`Getting client certificate with id: ${id}.`);
    const model = await this.repository.get(id);

    if (!model) {
      this.logger.error(`Unable to find client certificate with id: ${id}`);
      throw new BadRequestException(ERROR_MESSAGES.INVALID_CERTIFICATE_ID); // todo: why BadRequest?
    }

    return model;
  }

  /**
   * Get list of shortened CA certificates (id, name only)
   */
  async list(): Promise<ClientCertificate[]> {
    this.logger.debug('Getting client certificates list.');

    return this.repository.list();
  }

  async create(dto: CreateClientCertificateDto): Promise<ClientCertificate> {
    this.logger.debug('Creating client certificate.');

    try {
      return await this.repository.create(classToClass(ClientCertificate, dto));
    } catch (error) {
      this.logger.error('Failed to create client certificate.', error);

      // todo: move this logic to the global exception filter
      if (error instanceof EncryptionServiceErrorException) {
        throw error;
      }

      throw new InternalServerErrorException();
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.debug(`Deleting client certificate. id: ${id}`);

    try {
      const { affectedDatabases } = await this.repository.delete(id);

      await Promise.all(
        affectedDatabases.map(async (databaseId) => {
          // If the certificate is used by the database, remove the client
          await this.redisClientStorage.removeManyByMetadata({ databaseId });
        }),
      );
    } catch (error) {
      this.logger.error(`Failed to delete certificate ${id}`, error);

      // todo: move this logic to the global exception filter
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException();
    }
  }
}
