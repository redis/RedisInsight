import { Injectable } from '@nestjs/common';
import { ICloudApiCapiKey } from 'src/modules/cloud/capi-key/model';
import { wrapCloudApiError } from 'src/modules/cloud/common/exceptions';
import { ICloudApiCredentials } from 'src/modules/cloud/common/models';
import { CloudApiProvider } from 'src/modules/cloud/common/providers/cloud.api.provider';

@Injectable()
export class CloudCapiKeyApiProvider extends CloudApiProvider {
  /**
   * Get list of CApi keys
   * @param credentials
   */
  async enableCapi(credentials: ICloudApiCredentials): Promise<string> {
    try {
      const { data } = await this.api.post(
        '/accounts/cloud-api/cloudApiAccessKey',
        {},
        CloudApiProvider.getHeaders(credentials),
      );

      return data?.cloudApiAccessKey?.accessKey;
    } catch (e) {
      throw wrapCloudApiError(e);
    }
  }

  /**
   * Create new CApi key
   * @param credentials
   * @param userId
   * @param name
   */
  async createCapiKey(
    credentials: ICloudApiCredentials,
    userId: number,
    name: string,
  ): Promise<ICloudApiCapiKey> {
    try {
      const { data } = await this.api.post(
        '/accounts/cloud-api/cloudApiKeys',
        {
          cloudApiKey: {
            name,
            user_account: userId,
            ip_whitelist: [],
          },
        },
        CloudApiProvider.getHeaders(credentials),
      );

      return data?.cloudApiKey;
    } catch (e) {
      throw wrapCloudApiError(e);
    }
  }
}
