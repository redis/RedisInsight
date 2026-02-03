import { plainToInstance } from 'class-transformer';
import { Logger } from '@nestjs/common';
import { RdiUrlV2 } from 'src/modules/rdi/constants';
import {
  parseErrorMessage,
  RdiPipelineInternalServerErrorException,
  wrapRdiPipelineError,
} from 'src/modules/rdi/exceptions';
import {
  RdiInfo,
  RdiStatisticsResult,
  RdiStatisticsStatus,
} from 'src/modules/rdi/models';

import { ApiRdiClient } from 'src/modules/rdi/client/api/v1/api.rdi.client';
import {
  GetInfoResponse,
  GetMetricsCollectionResponse,
  GetPipelinesResponse,
} from 'src/modules/rdi/client/api/v2/responses';
import { transformMetricsCollectionResponse } from 'src/modules/rdi/client/api/v2/transformers';

export class ApiV2RdiClient extends ApiRdiClient {
  protected readonly logger = new Logger('ApiV2RdiClient');

  protected selectedPipeline = 'default';

  /**
   * Retrieves comprehensive information about the RDI (Redis Data Integration) instance.
   *
   * This method is available starting from RDI API v2 and provides detailed metadata
   * about the RDI instance including version, status, and configuration details.
   *
   * @returns {Promise<RdiInfo>} A promise that resolves to an RdiInfo object containing
   *                             instance metadata such as version, status, and capabilities
   *
   * @example
   * const info = await client.getInfo();
   * console.log(info.version); // e.g., "1.2.0"
   */
  async getInfo(): Promise<RdiInfo> {
    try {
      const { data } = await this.client.get<GetInfoResponse>(RdiUrlV2.GetInfo);

      return plainToInstance(RdiInfo, data);
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  /**
   * Selects the active pipeline for subsequent RDI operations.
   *
   * This method fetches all available pipelines from the RDI instance and automatically
   * selects the first pipeline in the list. The selected pipeline is stored in the
   * `selectedPipeline` property and will be used for all pipeline-specific operations.
   *
   * In RDI v2, multiple pipelines can exist, but this implementation currently defaults
   * to selecting the first available pipeline. If no pipelines exist, an error is thrown.
   *
   * @returns {Promise<void>} A promise that resolves when the pipeline is successfully selected
   *
   * @example
   * await client.selectPipeline();
   * // client.selectedPipeline is now set to the first available pipeline name
   */
  async selectPipeline(): Promise<void> {
    try {
      const { data } = await this.client.get<GetPipelinesResponse>(
        RdiUrlV2.GetPipelines,
      );

      // todo: handle cases when no pipelines differently
      if (!data?.length) {
        throw new RdiPipelineInternalServerErrorException(
          'Unable to select pipeline',
        );
      }

      this.selectedPipeline = data[0].name;
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  /**
   * Retrieves statistics for the selected pipeline.
   *
   * This method fetches statistics for the currently selected pipeline. The statistics
   * include detailed information about the pipeline's performance, data processing,
   * and other relevant metrics.
   *
   * @returns {Promise<RdiStatisticsResult>} A promise that resolves to an RdiStatisticsResult
   *                                        object containing the pipeline statistics
   *
   * @example
   * const stats = await client.getStatistics();
   */
  async getStatistics(): Promise<RdiStatisticsResult> {
    try {
      const { data } = await this.client.get<GetMetricsCollectionResponse>(
        RdiUrlV2.GetMetricsCollections(this.selectedPipeline),
      );

      return plainToInstance(RdiStatisticsResult, {
        status: RdiStatisticsStatus.Success,
        data: {
          sections: transformMetricsCollectionResponse(data),
        },
      });
    } catch (e) {
      const message: string = parseErrorMessage(e);
      return { status: RdiStatisticsStatus.Fail, error: message };
    }
  }
}
