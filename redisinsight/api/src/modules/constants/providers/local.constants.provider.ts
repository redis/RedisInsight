import { ConstantsProvider } from 'src/modules/constants/providers/constants.provider';
import { SessionMetadata } from 'src/common/models';
import {
  DEFAULT_ACCOUNT_ID,
  DEFAULT_SESSION_ID,
  DEFAULT_USER_ID,
} from 'src/common/constants';

export class LocalConstantsProvider extends ConstantsProvider {
  /**
   * @inheritDoc
   */
  getSystemSessionMetadata(): SessionMetadata {
    return {
      userId: DEFAULT_USER_ID,
      accountId: DEFAULT_ACCOUNT_ID,
      sessionId: DEFAULT_SESSION_ID,
    };
  }

  /**
   * @inheritDoc
   */
  getAnonymousId(sessionMetadata?: SessionMetadata): string {
    return sessionMetadata?.userId ?? 'unknown';
  }
}
