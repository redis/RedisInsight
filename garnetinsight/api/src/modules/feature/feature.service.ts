import { Feature, FeaturesFlags } from 'src/modules/feature/model/feature';
import { SessionMetadata } from 'src/common/models';

export abstract class FeatureService {
  /**
   * Fetches entire feature structure
   * @param sessionMetadata
   * @param name
   */
  abstract getByName(
    sessionMetadata: SessionMetadata,
    name: string,
  ): Promise<Feature>;

  /**
   * Check if feature enabled by feature name
   * @param sessionMetadata
   * @param name
   */
  abstract isFeatureEnabled(
    sessionMetadata: SessionMetadata,
    name: string,
  ): Promise<boolean>;

  /**
   * Get features list with calculated flags and control numbers
   * @param sessionMetadata
   */
  abstract list(sessionMetadata: SessionMetadata): Promise<FeaturesFlags>;

  /**
   * Recalculate all feature flags based on existing config
   * @param sessionMetadata
   */
  abstract recalculateFeatureFlags(
    sessionMetadata: SessionMetadata,
  ): Promise<void>;
}
