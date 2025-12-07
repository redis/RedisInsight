import { CommandExecution } from 'src/modules/workbench/models/command-execution';
import { ShortCommandExecution } from 'src/modules/workbench/models/short-command-execution';
import { SessionMetadata } from 'src/common/models';
import { CommandExecutionFilter } from 'src/modules/workbench/models/command-executions.filter';

export abstract class CommandExecutionRepository {
  /**
   * Create multiple entities
   *
   * @param sessionMetadata
   * @param commandExecutions
   */
  abstract createMany(
    sessionMetadata: SessionMetadata,
    commandExecutions: Partial<CommandExecution>[],
  ): Promise<CommandExecution[]>;

  /**
   * Fetch only needed fields to show in list to avoid huge decryption work
   *
   * @param sessionMetadata
   * @param databaseId
   * @param filter
   */
  abstract getList(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    filter: CommandExecutionFilter,
  ): Promise<ShortCommandExecution[]>;

  /**
   * Get single command execution entity, decrypt and convert to model
   *
   * @param sessionMetadata
   * @param databaseId
   * @param id
   */
  abstract getOne(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    id: string,
  ): Promise<CommandExecution>;

  /**
   * Delete single item
   *
   * @param sessionMetadata
   * @param databaseId
   * @param id
   */
  abstract delete(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    id: string,
  ): Promise<void>;

  /**
   * Delete all items
   *
   * @param sessionMetadata
   * @param databaseId
   * @param filter
   */
  abstract deleteAll(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    filter: CommandExecutionFilter,
  ): Promise<void>;
}
