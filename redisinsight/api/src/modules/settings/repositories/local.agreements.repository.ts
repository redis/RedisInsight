import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { classToClass } from 'src/utils';
import {
  AgreementsRepository,
  DefaultAgreementsOptions,
} from 'src/modules/settings/repositories/agreements.repository';
import { AgreementsEntity } from 'src/modules/settings/entities/agreements.entity';
import { Agreements } from 'src/modules/settings/models/agreements';
import { SessionMetadata } from 'src/common/models';
import { plainToInstance } from 'class-transformer';

export class LocalAgreementsRepository extends AgreementsRepository {
  constructor(
    @InjectRepository(AgreementsEntity)
    private readonly repository: Repository<AgreementsEntity>,
  ) {
    super();
  }

  async getOrCreate(
    sessionMetadata: SessionMetadata,
    defaultOptions: DefaultAgreementsOptions = {},
  ): Promise<Agreements> {
    let entity = await this.repository.findOneBy({});
    if (!entity?.data) {
      try {
        entity = await this.repository.save(
          classToClass(
            AgreementsEntity,
            plainToInstance(Agreements, {
              ...defaultOptions,
              id: 1,
            }),
          ),
        );
      } catch (e) {
        if (e.code === 'SQLITE_CONSTRAINT') {
          return this.getOrCreate(sessionMetadata, defaultOptions);
        }

        throw e;
      }
    }

    return classToClass(Agreements, entity);
  }

  async update(
    sessionMetadata: SessionMetadata,
    agreements: Agreements,
  ): Promise<Agreements> {
    const entity = classToClass(AgreementsEntity, agreements);

    await this.repository.save(entity);

    return this.getOrCreate(sessionMetadata);
  }

  async reset(sessionMetadata: SessionMetadata): Promise<void> {
    const entity = await this.repository.findOneBy({});
    if (entity) {
      entity.version = null;
      entity.data = null;
      await this.repository.save(entity);
    }
  }
}
