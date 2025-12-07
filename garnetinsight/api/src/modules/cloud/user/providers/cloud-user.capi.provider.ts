import { Injectable } from '@nestjs/common';
import { wrapCloudCapiError } from 'src/modules/cloud/common/exceptions';
import { CloudCapiProvider } from 'src/modules/cloud/common/providers/cloud.capi.provider';
import { CloudCapiAuthDto } from 'src/modules/cloud/common/dto';
import { AxiosResponse } from 'axios';
import { ICloudCapiAccount } from 'src/modules/cloud/user/models';

@Injectable()
export class CloudUserCapiProvider extends CloudCapiProvider {
  /**
   * Get cloud account short info
   * @param authDto
   */
  async getCurrentAccount(
    authDto: CloudCapiAuthDto,
  ): Promise<ICloudCapiAccount> {
    try {
      const { data }: AxiosResponse = await this.api.get(
        '/',
        CloudCapiProvider.getHeaders(authDto),
      );

      return data?.account;
    } catch (e) {
      throw wrapCloudCapiError(e);
    }
  }
}
