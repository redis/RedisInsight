import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { classToClass } from 'src/utils';
import { FeaturesConfigRepository } from 'src/modules/feature/repositories/features-config.repository';
import { FeaturesConfigEntity } from 'src/modules/feature/entities/features-config.entity';
import { FeaturesConfig } from 'src/modules/feature/model/features-config';
import { SessionMetadata } from 'src/common/models';
import * as defaultConfig from '../../../../config/features-config.json';

@Injectable()
export class LocalFeaturesConfigRepository extends FeaturesConfigRepository {
  private readonly logger = new Logger('LocalFeaturesConfigRepository');

  private readonly id = '1';

  constructor(
    @InjectRepository(FeaturesConfigEntity)
    private readonly repository: Repository<FeaturesConfigEntity>,
  ) {
    super();
  }

  /**
   * Generate control number which should never be updated
   * @private
   */
  private generateControlNumber(): number {
    const controlNumber = Number(
      (parseInt((Math.random() * 10_000).toString(), 10) / 100).toFixed(2),
    );
    this.logger.debug(`Control number is generated: ${controlNumber}`);

    return controlNumber;
  }

  /**
   * @inheritDoc
   */
  async getOrCreate(): Promise<FeaturesConfig> {
    this.logger.debug('Getting features config entity');

    let entity = await this.repository.findOneBy({ id: this.id });

    if (!entity) {
      try {
        this.logger.debug('Creating features config entity');

        entity = await this.repository.save(
          plainToInstance(FeaturesConfigEntity, {
            id: this.id,
            data: defaultConfig,
            controlNumber: this.generateControlNumber(),
          }),
        );
      } catch (e) {
        if (e.code === 'SQLITE_CONSTRAINT') {
          return this.getOrCreate();
        }

        throw e;
      }
    }

    return classToClass(FeaturesConfig, entity);
  }

  /**
   * @inheritDoc
   */
  async update(
    _sessionMetadata: SessionMetadata,
    data: Record<string, any>,
  ): Promise<FeaturesConfig> {
    await this.repository.update(
      { id: this.id },
      plainToInstance(FeaturesConfigEntity, { data, id: this.id }),
    );

    return this.getOrCreate();
  }
}
