import { Injectable } from '@nestjs/common';
import { ICloudApiSubscriptionCloudRegion } from 'src/modules/cloud/subscription/models';
import { wrapCloudApiError } from 'src/modules/cloud/common/exceptions';
import { ICloudApiCredentials } from 'src/modules/cloud/common/models';
import { CloudApiProvider } from '../../common/providers/cloud.api.provider';

@Injectable()
export class CloudSubscriptionApiProvider extends CloudApiProvider {
  /**
   * Get cloud regions
   * @param credentials
   */
  async getCloudRegions(
    credentials: ICloudApiCredentials,
  ): Promise<ICloudApiSubscriptionCloudRegion[]> {
    try {
      const { data } = await this.api.get(
        '/plans/cloud_regions',
        CloudApiProvider.getHeaders(credentials),
      );

      return data;
    } catch (e) {
      throw wrapCloudApiError(e);
    }
  }
}
