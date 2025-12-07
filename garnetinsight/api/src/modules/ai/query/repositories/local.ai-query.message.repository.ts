import { SessionMetadata } from 'src/common/models';
import { AiQueryMessage } from 'src/modules/ai/query/models';
import { AiQueryMessageRepository } from 'src/modules/ai/query/repositories/ai-query.message.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiQueryMessageEntity } from 'src/modules/ai/query/entities/ai-query.message.entity';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { filter, isNull } from 'lodash';
import { classToClass, Config } from 'src/utils';
import { ModelEncryptor } from 'src/modules/encryption/model.encryptor';
import config from 'src/utils/config';
import { Logger } from '@nestjs/common';

const aiConfig = config.get('ai') as Config['ai'];

export class LocalAiQueryMessageRepository extends AiQueryMessageRepository {
  private logger = new Logger('LocalAiQueryMessageRepository');

  private readonly modelEncryptor: ModelEncryptor;

  constructor(
    @InjectRepository(AiQueryMessageEntity)
    private readonly repository: Repository<AiQueryMessageEntity>,
    private readonly encryptionService: EncryptionService,
  ) {
    super();
    this.modelEncryptor = new ModelEncryptor(encryptionService, [
      'content',
      'steps',
    ]);
  }

  /**
   * Clean history for particular database to fit N items limitation
   * @param databaseId
   * @param accountId
   */
  private async cleanupDatabaseHistory(
    databaseId: string,
    accountId: string,
  ): Promise<void> {
    // todo: investigate why delete with sub-query doesn't works
    const idsToDelete = (
      await this.repository
        .createQueryBuilder()
        .where({ databaseId, accountId })
        .select('id')
        .orderBy('createdAt', 'DESC')
        .offset(aiConfig.queryHistoryLimit)
        .getRawMany()
    ).map((item) => item.id);

    await this.repository
      .createQueryBuilder()
      .delete()
      .whereInIds(idsToDelete)
      .execute();
  }

  async list(
    _sessionMetadata: SessionMetadata,
    databaseId: string,
    accountId: string,
  ): Promise<AiQueryMessage[]> {
    const entities = await this.repository
      .createQueryBuilder('e')
      .where({ databaseId, accountId })
      .orderBy('e.createdAt', 'ASC')
      .limit(aiConfig.queryHistoryLimit)
      .getMany();

    const decryptedEntities = await Promise.all(
      entities.map<Promise<AiQueryMessageEntity>>(async (entity) => {
        try {
          return await this.modelEncryptor.decryptEntity(entity);
        } catch (e) {
          return null;
        }
      }),
    );

    return filter(decryptedEntities, (entity) => !isNull(entity)).map(
      (entity) => classToClass(AiQueryMessage, entity),
    );
  }

  async createMany(
    sessionMetadata: SessionMetadata,
    messages: AiQueryMessage[],
  ): Promise<void> {
    const entities = await Promise.all(
      messages.map(async (message) => {
        const entity = classToClass(AiQueryMessageEntity, message);

        return this.modelEncryptor.encryptEntity(entity);
      }),
    );

    await this.repository.save(entities);

    // cleanup history and ignore error if any
    try {
      await this.cleanupDatabaseHistory(
        entities[0].databaseId,
        entities[0].accountId,
      );
    } catch (e) {
      this.logger.error(
        'Error when trying to cleanup history after insert',
        e,
        sessionMetadata,
      );
    }
  }

  async clearHistory(
    _sessionMetadata: SessionMetadata,
    databaseId: string,
    accountId: string,
  ): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .delete()
      .where({ databaseId, accountId })
      .execute();
  }
}
