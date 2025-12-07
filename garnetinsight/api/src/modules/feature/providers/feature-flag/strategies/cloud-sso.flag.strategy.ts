import { Feature } from 'src/modules/feature/model/feature';
import { IFeatureFlag } from 'src/modules/feature/constants';
import { SwitchableFlagStrategy } from 'src/modules/feature/providers/feature-flag/strategies/switchable.flag.strategy';
import { SessionMetadata } from 'src/common/models';

export class CloudSsoFlagStrategy extends SwitchableFlagStrategy {
  async calculate(
    sessionMetadata: SessionMetadata,
    knownFeature: IFeatureFlag,
    featureConfig: any,
  ): Promise<Feature> {
    const feature = await super.calculate(
      sessionMetadata,
      knownFeature,
      featureConfig,
    );

    if (knownFeature.factory) {
      return {
        ...feature,
        ...(await knownFeature.factory()),
      };
    }

    return feature;
  }
}
