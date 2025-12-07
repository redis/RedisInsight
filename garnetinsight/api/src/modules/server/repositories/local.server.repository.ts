import { Server } from 'src/modules/server/models/server';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServerEntity } from 'src/modules/server/entities/server.entity';
import { ServerRepository } from 'src/modules/server/repositories/server.repository';
import { classToClass } from 'src/utils';

export class LocalServerRepository extends ServerRepository {
  constructor(
    @InjectRepository(ServerEntity)
    private readonly repository: Repository<ServerEntity>,
  ) {
    super();
  }

  /**
   * @inheritDoc
   */
  public async exists(): Promise<boolean> {
    return !!(await this.repository.findOneBy({}));
  }

  /**
   * @inheritDoc
   */
  public async getOrCreate(): Promise<Server> {
    let entity = await this.repository.findOneBy({});

    if (!entity) {
      entity = await this.repository.save(this.repository.create());
    }

    return classToClass(Server, entity);
  }
}
