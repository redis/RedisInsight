import { SessionMetadata } from 'src/common/models';

export abstract class AiQueryContextRepository {
  /**
   * Should return saved db context if exists in particular chat
   * @param sessionMetadata
   * @param databaseId
   * @param accountId
   */
  abstract getFullDbContext(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    accountId: string,
  ): Promise<object>;

  /**
   * Should save db context for particular chat
   * @param sessionMetadata
   * @param databaseId
   * @param accountId
   * @param context
   */
  abstract setFullDbContext(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    accountId: string,
    context: object,
  ): Promise<object>;

  /**
   * Should return saved index context if exists in particular chat
   * @param sessionMetadata
   * @param databaseId
   * @param accountId
   * @param index
   */
  abstract getIndexContext(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    accountId: string,
    index: string,
  ): Promise<object>;

  /**
   * Should save index context for particular chat
   * @param sessionMetadata
   * @param databaseId
   * @param accountId
   * @param index
   * @param context
   */
  abstract setIndexContext(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    accountId: string,
    index: string,
    context: object,
  ): Promise<object>;

  /**
   * Reset all index and db contexts for particular chat
   * @param sessionMetadata
   * @param databaseId
   * @param accountId
   */
  abstract reset(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    accountId: string,
  ): Promise<void>;
}
