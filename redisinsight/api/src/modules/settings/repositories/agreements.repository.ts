import { Agreements } from 'src/modules/settings/models/agreements';
import { SessionMetadata } from 'src/common/models';

export interface DefaultAgreementsOptions {
  version?: string;
  data?: Record<string, boolean>;
}

export abstract class AgreementsRepository {
  abstract getOrCreate(
    sessionMetadata: SessionMetadata,
    defaultOptions?: DefaultAgreementsOptions,
  ): Promise<Agreements>;
  abstract update(
    sessionMetadata: SessionMetadata,
    agreements: Agreements,
  ): Promise<Agreements>;
  abstract reset(sessionMetadata: SessionMetadata): Promise<void>;
}
