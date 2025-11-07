import { sign } from 'jsonwebtoken';
import axios, { AxiosInstance } from 'axios';
import { plainToInstance } from 'class-transformer';
import { HttpStatus, Logger } from '@nestjs/common';

import { RdiClient } from 'src/modules/rdi/client/rdi.client';
import {
  RdiUrl,
  RDI_TIMEOUT,
  TOKEN_THRESHOLD,
  POLLING_INTERVAL,
  MAX_POLLING_TIME,
  WAIT_BEFORE_POLLING,
  PipelineActions,
} from 'src/modules/rdi/constants';
import {
  RdiDryRunJobDto,
  RdiDryRunJobResponseDto,
  RdiTestSourceConnectionResult,
  RdiTemplateResponseDto,
  RdiTestTargetConnectionResult,
  RdiTestConnectionsResponseDto,
} from 'src/modules/rdi/dto';
import {
  RdiPipelineDeployFailedException,
  RdiPipelineInternalServerErrorException,
  parseErrorMessage,
  wrapRdiPipelineError,
} from 'src/modules/rdi/exceptions';
import {
  RdiPipeline,
  RdiStatisticsResult,
  RdiStatisticsStatus,
  RdiStatisticsData,
  RdiClientMetadata,
  Rdi,
} from 'src/modules/rdi/models';
import { convertKeysToCamelCase } from 'src/utils/base.helper';
import { RdiPipelineTimeoutException } from 'src/modules/rdi/exceptions/rdi-pipeline.timeout-error.exception';
import * as https from 'https';
import {
  convertApiDataToRdiPipeline,
  convertRdiPipelineToApiPayload,
} from 'src/modules/rdi/utils/pipeline.util';
import { RdiResetPipelineFailedException } from '../exceptions/rdi-reset-pipeline-failed.exception';
import { RdiStartPipelineFailedException } from '../exceptions/rdi-start-pipeline-failed.exception';
import { RdiStopPipelineFailedException } from '../exceptions/rdi-stop-pipeline-failed.exception';

interface ConnectionsConfig {
  sources: Record<string, Record<string, unknown>>;
}

export class ApiRdiClient extends RdiClient {
  protected readonly client: AxiosInstance;

  private readonly logger = new Logger('ApiRdiClient');

  private auth: { jwt: string; exp: number };

  constructor(clientMetadata: RdiClientMetadata, rdi: Rdi) {
    super(clientMetadata, rdi);
    this.client = axios.create({
      baseURL: rdi.url,
      timeout: RDI_TIMEOUT,
      httpsAgent: new https.Agent({
        // we might work with self-signed certificates for local builds
        rejectUnauthorized: false, // lgtm[js/disabling-certificate-validation]
      }),
    });
  }

  private async loginDev(): Promise<string> {
    return sign({}, 'dev', { expiresIn: '1h' });
  }

  private async login(): Promise<string> {
    try {
      const response = await this.client.post(RdiUrl.Login, {
        username: this.rdi.username,
        password: this.rdi.password,
      });

      return response.data.access_token;
    } catch (e) {
      // If /login endpoint is not found we assume that RDI is in dev mode
      if (e.status === HttpStatus.NOT_FOUND) {
        return this.loginDev();
      }

      throw e;
    }
  }

  async getSchema(): Promise<object> {
    try {
      const [config, jobs] = await Promise.all([
        this.client.get(RdiUrl.GetConfigSchema).then(({ data }) => data),
        this.client.get(RdiUrl.GetJobsSchema).then(({ data }) => data),
      ]);

      return {
        config,
        jobs,
      };
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  async getPipeline(): Promise<RdiPipeline> {
    try {
      const { data } = await this.client.get(RdiUrl.GetPipeline);

      return convertApiDataToRdiPipeline(data);
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  async getStrategies(): Promise<object> {
    try {
      const response = await this.client.get(RdiUrl.GetStrategies);
      return response.data;
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  async getConfigTemplate(
    pipelineType: string,
    dbType: string,
  ): Promise<RdiTemplateResponseDto> {
    try {
      const response = await this.client.get(
        `${RdiUrl.GetConfigTemplate}/${pipelineType}/${dbType}`,
      );
      return response.data;
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  async getJobTemplate(pipelineType: string): Promise<RdiTemplateResponseDto> {
    try {
      const response = await this.client.get(
        `${RdiUrl.GetJobTemplate}/${pipelineType}`,
      );
      return response.data;
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  async deploy(pipeline: RdiPipeline): Promise<void> {
    try {
      const response = await this.client.post(
        RdiUrl.Deploy,
        convertRdiPipelineToApiPayload(pipeline),
      );

      const actionId = response.data.action_id;

      return await this.pollActionStatus(actionId, PipelineActions.Deploy);
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  async stopPipeline(): Promise<void> {
    try {
      const response = await this.client.post(RdiUrl.StopPipeline, {});
      const actionId = response.data.action_id;

      return await this.pollActionStatus(actionId, PipelineActions.Stop);
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  async startPipeline(): Promise<void> {
    try {
      const response = await this.client.post(RdiUrl.StartPipeline, {});
      const actionId = response.data.action_id;

      return await this.pollActionStatus(actionId, PipelineActions.Start);
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  async resetPipeline(): Promise<void> {
    try {
      const response = await this.client.post(RdiUrl.ResetPipeline, {});
      const actionId = response.data.action_id;

      return await this.pollActionStatus(actionId, PipelineActions.Reset);
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  async dryRunJob(dto: RdiDryRunJobDto): Promise<RdiDryRunJobResponseDto> {
    try {
      const { data } = await this.client.post(RdiUrl.DryRunJob, dto);

      return data;
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  async testConnections(
    config: ConnectionsConfig,
  ): Promise<RdiTestConnectionsResponseDto> {
    let targets: Record<string, RdiTestTargetConnectionResult> = {};
    const sources: Record<string, RdiTestSourceConnectionResult> = {};

    try {
      const targetsResponse = await this.client.post(
        RdiUrl.TestTargetsConnections,
        config,
      );
      targets = targetsResponse.data.targets;
    } catch (error) {
      throw wrapRdiPipelineError(error);
    }

    const sourceConfigs = Object.keys(config.sources || {});

    if (sourceConfigs.length === 0) {
      return { targets, sources };
    }

    await Promise.all(
      sourceConfigs.map(async (source) => {
        try {
          const response = await this.client.post(
            RdiUrl.TestSourcesConnections,
            { ...config.sources[source] },
          );
          sources[source] = response.data;
        } catch (error: any) {
          // Older versions of RDI (below 1.6.0) don't support testing sources connections
          // RDI returns 405 Method Not Allowed for non existing endpoints
          const status = error?.status;
          if (status === 405) {
            sources[source] = {
              connected: false,
              error:
                'Testing source connections is not supported in your RDI version. Please upgrade to version 1.6.0 or later.',
            };
          } else {
            // Something went wrong with testing source connection
            sources[source] = {
              connected: false,
              error: 'Failed to test source connection.',
            };
          }
        }
      }),
    );

    return { targets, sources };
  }

  async getPipelineStatus(): Promise<any> {
    try {
      const { data } = await this.client.get(RdiUrl.GetPipelineStatus);

      return data;
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  async getStatistics(sections?: string): Promise<RdiStatisticsResult> {
    try {
      const { data } = await this.client.get(RdiUrl.GetStatistics, {
        params: { sections },
      });

      return {
        status: RdiStatisticsStatus.Success,
        data: plainToInstance(RdiStatisticsData, convertKeysToCamelCase(data)),
      };
    } catch (e) {
      const message: string = parseErrorMessage(e);
      return { status: RdiStatisticsStatus.Fail, error: message };
    }
  }

  async getJobFunctions(): Promise<object> {
    try {
      const response = await this.client.get(RdiUrl.JobFunctions);
      return response.data;
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  async connect(): Promise<void> {
    try {
      const accessToken = await this.login();

      const { exp } = JSON.parse(
        Buffer.from(accessToken.split('.')[1], 'base64').toString(),
      );

      this.auth = {
        jwt: accessToken,
        exp,
      };
      this.client.defaults.headers.common['Authorization'] =
        `Bearer ${accessToken}`;
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  async ensureAuth(): Promise<void> {
    const expiresIn = this.auth.exp * 1_000 - Date.now();

    if (expiresIn < TOKEN_THRESHOLD) {
      await this.connect();
    }
  }

  private async pollActionStatus(
    actionId: string,
    action: PipelineActions,
    abortSignal?: AbortSignal,
  ): Promise<any> {
    await new Promise((resolve) => setTimeout(resolve, WAIT_BEFORE_POLLING));

    const startTime = Date.now();

    while (true) {
      if (abortSignal?.aborted) {
        throw new RdiPipelineInternalServerErrorException(
          'Operation is aborted',
        );
      }
      if (Date.now() - startTime > MAX_POLLING_TIME) {
        throw new RdiPipelineTimeoutException();
      }

      try {
        const response = await this.client.get(`${RdiUrl.Action}/${actionId}`, {
          signal: abortSignal,
        });
        const { status, data, error } = response.data;

        if (status === 'failed') {
          switch (action) {
            case PipelineActions.Deploy:
              throw new RdiPipelineDeployFailedException(error?.message);
            case PipelineActions.Reset:
              throw new RdiResetPipelineFailedException(error?.message);
            case PipelineActions.Start:
              throw new RdiStartPipelineFailedException(error?.message);
            case PipelineActions.Stop:
              throw new RdiStopPipelineFailedException(error?.message);
            default:
              throw new RdiPipelineDeployFailedException(error?.message);
          }
        }

        if (status === 'completed') {
          return data;
        }
      } catch (e) {
        throw wrapRdiPipelineError(e);
      }

      await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
    }
  }
}
