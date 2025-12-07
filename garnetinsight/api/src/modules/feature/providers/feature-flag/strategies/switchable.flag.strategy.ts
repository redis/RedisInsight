import { FeatureFlagStrategy } from 'src/modules/feature/providers/feature-flag/strategies/feature.flag.strategy';
import { Feature } from 'src/modules/feature/model/feature';
import { IFeatureFlag } from 'src/modules/feature/constants';
import { SessionMetadata } from 'src/common/models';

export class SwitchableFlagStrategy extends FeatureFlagStrategy {
  async calculate(
    sessionMetadata: SessionMetadata,
    knownFeature: IFeatureFlag,
    featureConfig: any,
  ): Promise<Feature> {
    const isInRange = await this.isInTargetRange(
      sessionMetadata,
      featureConfig?.perc,
    );
    const isInFilter = await this.filter(featureConfig?.filters);
    const originalFlag = !!featureConfig?.flag;

    let flag = isInRange && isInFilter ? originalFlag : !originalFlag;

    const force = (await FeatureFlagStrategy.getCustomConfig())?.[
      knownFeature.name
    ];

    if (isInFilter && originalFlag && force === true) {
      flag = true;
    } else if (isInFilter && originalFlag && force === false) {
      flag = false;
    }

    return {
      name: knownFeature.name,
      flag,
      data: featureConfig?.data,
    };
  }
}
