import { Feature } from 'src/modules/feature/model/feature';
import { SessionMetadata } from 'src/common/models';

export abstract class FeatureRepository {
  abstract get(
    sessionMetadata: SessionMetadata,
    name: string,
  ): Promise<Feature>;
  abstract upsert(
    sessionMetadata: SessionMetadata,
    feature: Feature,
  ): Promise<Feature>;
  abstract list(sessionMetadata: SessionMetadata): Promise<Feature[]>;
  abstract delete(
    sessionMetadata: SessionMetadata,
    name: string,
  ): Promise<void>;
}
