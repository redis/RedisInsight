import { FeaturesConfig } from 'src/modules/feature/model/features-config';
import { SessionMetadata } from 'src/common/models';

export abstract class FeaturesConfigRepository {
  abstract getOrCreate(
    sessionMetadata: SessionMetadata,
  ): Promise<FeaturesConfig>;
  abstract update(
    sessionMetadata: SessionMetadata,
    config: Record<string, any>,
  ): Promise<FeaturesConfig>;
}
