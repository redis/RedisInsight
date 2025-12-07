import { SessionMetadata } from 'src/common/models';
import { AiQueryMessage } from 'src/modules/ai/query/models';

export abstract class AiQueryMessageRepository {
  abstract list(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    accountId: string,
  ): Promise<AiQueryMessage[]>;
  abstract createMany(
    sessionMetadata: SessionMetadata,
    messages: AiQueryMessage[],
  ): Promise<void>;
  abstract clearHistory(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    accountId: string,
  ): Promise<void>;
}
