import axios from 'axios';
import { ICloudCapiCredentials } from 'src/modules/cloud/common/models';
import { CloudSubscriptionType } from 'src/modules/cloud/subscription/models';
import config, { Config } from 'src/utils/config';

const cloudConfig = config.get('cloud');
const serverConfig = config.get('server') as Config['server'];

export class CloudCapiProvider {
  protected api = axios.create({
    baseURL: cloudConfig.capiUrl,
  });

  /**
   * Get api base for fixed subscriptions
   * @param type
   * @private
   */
  static getPrefix(type?: CloudSubscriptionType): string {
    return `${type === CloudSubscriptionType.Fixed ? '/fixed' : ''}`;
  }

  /**
   * Generates auth headers to attach to the request
   * @param credentials
   * @private
   */
  static getHeaders(credentials: ICloudCapiCredentials): {
    headers: Record<string, string>;
  } {
    return {
      headers: {
        'x-api-key': credentials?.capiKey,
        'x-api-secret-key': credentials?.capiSecret,
        'User-Agent': `Garnetinsight/${serverConfig.version}`,
      },
    };
  }
}
