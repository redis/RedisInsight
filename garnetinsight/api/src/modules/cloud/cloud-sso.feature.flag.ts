import { BuildType } from 'src/modules/server/models/server';
import config, { Config } from 'src/utils/config';
import { Feature } from 'src/modules/feature/model/feature';

const serverConfig = config.get('server') as Config['server'];

export enum CloudSsoFeatureStrategy {
  DeepLink = 'deepLink',
  Web = 'web',
}

export class CloudSsoFeatureFlag {
  static getFeature(): Partial<Feature> {
    if (serverConfig.buildType === BuildType.Electron) {
      return {
        strategy: CloudSsoFeatureStrategy.DeepLink,
      };
    }

    return {};
  }
}
