import { Server } from 'src/modules/server/models/server';
import { SessionMetadata } from 'src/common/models';

export abstract class ServerRepository {
  /**
   * Fast check if server model exists by id
   * No need to retrieve any fields should return boolean only
   * @param sessionMetadata
   * @return boolean
   */
  abstract exists(sessionMetadata: SessionMetadata): Promise<boolean>;

  /**
   * Get Server model or create and return new one
   * @param sessionMetadata
   */
  abstract getOrCreate(sessionMetadata: SessionMetadata): Promise<Server>;
}
