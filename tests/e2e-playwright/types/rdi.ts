/**
 * RDI (Redis Data Integration) test data types.
 *
 * These describe what a test wants the faked RDI instance to hold. The RDI
 * mock (helpers/rdiMock.ts) turns them into the RedisInsight and RDI API
 * response shapes, so tests never deal with the wire format.
 */

/**
 * An RDI instance as RedisInsight's `/api/rdi` endpoints return it
 */
export interface RdiInstanceData {
  id: string;
  name: string;
  url: string;
  username: string;
  /** RDI server version. The v2 pipeline page needs 1.16.0 or later. */
  version: string;
  lastConnection: string;
}

/**
 * RDI pipeline status, as the RDI v2 API reports it
 */
export type RdiPipelineStatus = 'started' | 'stopped' | 'error' | 'pending';

/**
 * Source database types the pipeline UI supports
 */
export type RdiSourceType = 'postgresql' | 'mysql' | 'mariadb' | 'oracle' | 'sqlserver' | 'mongodb';

/**
 * A deployed pipeline with one source and a Redis target
 */
export interface RdiPipelineData {
  name: string;
  status: RdiPipelineStatus;
  source: {
    name: string;
    type: RdiSourceType;
    host: string;
    port: number;
    database: string;
  };
  target: {
    host: string;
    port: number;
  };
}
