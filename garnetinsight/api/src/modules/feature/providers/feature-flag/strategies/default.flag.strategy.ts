import { FeatureFlagStrategy } from 'src/modules/feature/providers/feature-flag/strategies/feature.flag.strategy';
import { Feature } from 'src/modules/feature/model/feature';
import { IFeatureFlag } from 'src/modules/feature/constants';
import { SessionMetadata } from 'src/common/models';

export class DefaultFlagStrategy extends FeatureFlagStrategy {
  async calculate(
    _sessionMetadata: SessionMetadata,
    knownFeature: IFeatureFlag,
  ): Promise<Feature> {
    return {
      name: knownFeature.name,
      flag: false,
    };
  }
}
