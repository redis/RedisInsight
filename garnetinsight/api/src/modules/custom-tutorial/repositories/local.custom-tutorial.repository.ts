import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { classToClass } from 'src/utils';
import { CustomTutorialEntity } from 'src/modules/custom-tutorial/entities/custom-tutorial.entity';
import { CustomTutorial } from 'src/modules/custom-tutorial/models/custom-tutorial';
import { CustomTutorialRepository } from 'src/modules/custom-tutorial/repositories/custom-tutorial.repository';

export class LocalCustomTutorialRepository extends CustomTutorialRepository {
  constructor(
    @InjectRepository(CustomTutorialEntity)
    private readonly repository: Repository<CustomTutorialEntity>,
  ) {
    super();
  }

  /**
   * @inheritDoc
   */
  public async create(model: CustomTutorial): Promise<CustomTutorial> {
    const entity = classToClass(CustomTutorialEntity, model);

    entity.createdAt = new Date();

    return classToClass(CustomTutorial, await this.repository.save(entity));
  }

  /**
   * @inheritDoc
   */
  public async list(): Promise<CustomTutorial[]> {
    const entities = await this.repository
      .createQueryBuilder('t')
      .orderBy('t.createdAt', 'DESC')
      .getMany();

    return entities.map((entity) => classToClass(CustomTutorial, entity));
  }

  /**
   * @inheritDoc
   */
  public async get(id: string): Promise<CustomTutorial> {
    return classToClass(
      CustomTutorial,
      await this.repository.findOneBy({ id }),
    );
  }

  /**
   * @inheritDoc
   */
  public async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
