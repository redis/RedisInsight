import { SessionMetadata } from 'src/common/models';
import { AiQueryAuthData } from 'src/modules/ai/query/models/ai-query.auth-data';

export abstract class AiQueryAuthProvider {
  abstract getAuthData(
    sessionMetadata: SessionMetadata,
  ): Promise<AiQueryAuthData>;
  abstract callWithAuthRetry(
    sessionId: SessionMetadata,
    fn: () => Promise<any>,
    retries?: number,
  ): Promise<any>;
}
