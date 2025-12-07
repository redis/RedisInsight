import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { EncryptionServiceErrorException } from 'src/modules/encryption/exceptions';
import { CaCertificateRepository } from 'src/modules/certificate/repositories/ca-certificate.repository';
import { CaCertificate } from 'src/modules/certificate/models/ca-certificate';
import { CreateCaCertificateDto } from 'src/modules/certificate/dto/create.ca-certificate.dto';
import { classToClass } from 'src/utils';
import { RedisClientStorage } from 'src/modules/redis/redis.client.storage';

@Injectable()
export class CaCertificateService {
  private logger = new Logger('CaCertificateService');

  constructor(
    private readonly repository: CaCertificateRepository,
    private redisClientStorage: RedisClientStorage,
  ) {}

  async get(id: string): Promise<CaCertificate> {
    this.logger.debug(`Getting CA certificate with id: ${id}.`);
    const model = await this.repository.get(id);

    if (!model) {
      this.logger.error(`Unable to find CA certificate with id: ${id}`);
      throw new BadRequestException(ERROR_MESSAGES.INVALID_CERTIFICATE_ID); // todo: why BadRequest?
    }

    return model;
  }

  async list(): Promise<CaCertificate[]> {
    this.logger.debug('Getting CA certificate list.');

    return this.repository.list();
  }

  async create(dto: CreateCaCertificateDto): Promise<CaCertificate> {
    this.logger.debug('Creating certificate.');
    try {
      return await this.repository.create(classToClass(CaCertificate, dto));
    } catch (error) {
      this.logger.error('Failed to create certificate.', error);

      // todo: move this logic to the global exception filter
      if (error instanceof EncryptionServiceErrorException) {
        throw error;
      }

      throw new InternalServerErrorException();
    }
  }

  async delete(id: string): Promise<void> {
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
