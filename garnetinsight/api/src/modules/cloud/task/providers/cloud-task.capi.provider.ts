import { Injectable } from '@nestjs/common';
import { CloudCapiProvider } from 'src/modules/cloud/common/providers/cloud.capi.provider';
import { ICloudCapiTask } from 'src/modules/cloud/task/models';
import { ICloudCapiCredentials } from 'src/modules/cloud/common/models';
import { wrapCloudApiError } from 'src/modules/cloud/common/exceptions';

@Injectable()
export class CloudTaskCapiProvider extends CloudCapiProvider {
  /**
   * Get task details by id
   * @param credentials
   * @param id
   */
  async getTask(
    credentials: ICloudCapiCredentials,
    id: string,
  ): Promise<ICloudCapiTask> {
    try {
      const { data } = await this.api.get(
        `/tasks/${id}`,
        CloudCapiProvider.getHeaders(credentials),
      );

      return data;
    } catch (error) {
      throw wrapCloudApiError(error);
    }
  }
}
