import { FeatureFlagStrategy } from 'src/modules/feature/providers/feature-flag/strategies/feature.flag.strategy';
import { Feature } from 'src/modules/feature/model/feature';
import { IFeatureFlag } from 'src/modules/feature/constants';
import { SessionMetadata } from 'src/common/models';

export class CommonFlagStrategy extends FeatureFlagStrategy {
  async calculate(
    sessionMetadata: SessionMetadata,
    knownFeature: IFeatureFlag,
    featureConfig: any,
  ): Promise<Feature> {
    const isInRange = await this.isInTargetRange(
      sessionMetadata,
      featureConfig?.perc,
    );

    return {
      name: knownFeature.name,
      flag:
        isInRange && (await this.filter(featureConfig?.filters))
          ? !!featureConfig?.flag
          : !featureConfig?.flag,
    };
  }
}
