// import { SessionMetadata } from 'src/common/models';
import { CloudSessionData } from '../models/cloud-session';

export abstract class CloudSessionRepository {
  abstract get(): Promise<CloudSessionData>;
  abstract save(data: Partial<CloudSessionData>): Promise<void>;
}
