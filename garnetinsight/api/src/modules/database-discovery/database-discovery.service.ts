import { SessionMetadata } from 'src/common/models';

export abstract class DatabaseDiscoveryService {
  abstract discover(
    sessionMetadata: SessionMetadata,
    firstRun?: boolean,
  ): Promise<void>;
}
