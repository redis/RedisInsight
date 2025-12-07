import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { classToClass } from 'src/utils';
import { SessionMetadata } from 'src/common/models';
import { FeatureRepository } from './feature.repository';
import { FeatureEntity } from '../entities/feature.entity';
import { Feature } from '../model/feature';

@Injectable()
export class LocalFeatureRepository extends FeatureRepository {
  constructor(
    @InjectRepository(FeatureEntity)
    private readonly repository: Repository<FeatureEntity>,
  ) {
    super();
  }

  /**
   * @inheritDoc
   */
  async get(_sessionMetadata: SessionMetadata, name: string): Promise<Feature> {
    const entity = await this.repository.findOneBy({ name });
    return classToClass(Feature, entity);
  }

  /**
   * @inheritDoc
   */
  async list(): Promise<Feature[]> {
    return (await this.repository.find()).map((entity) =>
      classToClass(Feature, entity),
    );
  }

  /**
   * @inheritDoc
   */
  async upsert(
    sessionMetadata: SessionMetadata,
    feature: Feature,
  ): Promise<Feature> {
    await this.repository.upsert(classToClass(FeatureEntity, feature), {
      skipUpdateIfNoValuesChanged: true,
      conflictPaths: ['name'],
    });

    return this.get(sessionMetadata, feature.name);
  }

  /**
   * @inheritDoc
   */
  async delete(_sessionMetadata: SessionMetadata, name: string): Promise<void> {
    await this.repository.delete({ name });
  }
}
