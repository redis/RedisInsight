import { v4 as uuidv4 } from 'uuid';
import config from 'src/utils/config';
import {
  CloudJobInfo,
  CloudJobStatus,
  CloudJobStep,
} from 'src/modules/cloud/job/models/cloud-job-info';
import { HttpException, Logger } from '@nestjs/common';
import {
  CloudJobAbortedException,
  wrapCloudJobError,
} from 'src/modules/cloud/job/exceptions';
import { SessionMetadata } from 'src/common/models';
import { CloudJobName } from 'src/modules/cloud/job/constants';
import { CloudRequestUtm } from 'src/modules/cloud/common/models';
import { debounce } from 'lodash';
import { CloudCapiAuthDto } from 'src/modules/cloud/common/dto';
import { ClassConstructor } from 'class-transformer/types/interfaces';

const cloudConfig = config.get('cloud');

export class CloudJobOptions {
  abortController: AbortController;

  sessionMetadata: SessionMetadata;

  capiCredentials?: CloudCapiAuthDto;

  utm?: CloudRequestUtm;

  stateCallbacks?: ((self: CloudJob) => any)[] = [];

  name?: CloudJobName;

  child?: boolean;
}

export abstract class CloudJob {
  protected logger = new Logger(this.constructor.name);

  public id = uuidv4();

  protected name = CloudJobName.Unknown;

  protected status = CloudJobStatus.Initializing;

  protected step = CloudJobStep.Credentials;

  protected error?: HttpException;

  protected child?: CloudJob;

  protected result?: any;

  public options: CloudJobOptions;

  protected dependencies: any;

  private readonly debounce: any;

  protected constructor(options: CloudJobOptions) {
    this.options = options;

    if (!this.options.stateCallbacks) {
      this.options.stateCallbacks = [];
    }

    this.debounce = debounce(
      () => {
        this.triggerChangeStateCallbacks();
      },
      1_000,
      {
        maxWait: 2_000,
      },
    );
  }

  private triggerChangeStateCallbacks() {
    try {
      (this.options?.stateCallbacks || []).forEach((cb) => {
        cb?.(this)?.catch?.(() => {});
      });
    } catch (e) {
      // silently ignore callback
    }
  }

  public async run(sessionMetadata: SessionMetadata): Promise<void> {
    try {
      this.changeState({
        status: CloudJobStatus.Running,
      });

      if (!this.options.capiCredentials) {
        this.logger.debug('Generating capi credentials');

        this.changeState({ step: CloudJobStep.Credentials });

        this.options.capiCredentials =
          await this.dependencies.cloudCapiKeyService.getCapiCredentials(
            this.options.sessionMetadata,
            this.options.utm,
          );
      }

      return await this.iteration(sessionMetadata);
    } catch (e) {
      this.logger.error('Cloud job failed', e);

      const error = wrapCloudJobError(
        await this.dependencies.cloudCapiKeyService.handleCapiKeyUnauthorizedError(
          e,
          this.options.sessionMetadata,
        ),
      );

      this.changeState({
        status: CloudJobStatus.Failed,
        error,
      });

      throw error;
    }
  }

  public abort(reason?: string) {
    // @ts-ignore
    this.options?.abortController?.abort(reason);
  }

  public getState(): CloudJobInfo {
    return {
      id: this.id,
      name: this.options?.name || this.name,
      status: this.status,
      result: this.result,
      error: this.error
        ? wrapCloudJobError(this.error).getResponse()
        : undefined,
      child: this.child?.getState(),
      step: this.step,
    };
  }

  public createChildJob<T>(
    TargetJob: ClassConstructor<T>,
    data: {},
    options = {},
  ): T {
    return new TargetJob(
      {
        ...this.options,
        ...options,
        stateCallbacks: [() => this.changeState()],
        child: true,
      },
      data,
      this.dependencies,
    );
  }

  public async runChildJob(
    sessionMetadata: SessionMetadata,
    TargetJob: ClassConstructor<CloudJob>,
    data: {},
    options: CloudJobOptions,
  ): Promise<any> {
    const child = this.createChildJob(TargetJob, data, options);

    this.changeState({ child });

    const result = await child.run(sessionMetadata);

    this.changeState({ child: null });

    return result;
  }

  public addStateCallback(callback: (self: CloudJob) => any) {
    this.options.stateCallbacks.push(callback);
  }

  protected changeState(state = {}) {
    Object.entries(state).forEach(([key, value]) => {
      this[key] = value;
    });

    if (this.options.child) {
      this.triggerChangeStateCallbacks();
    } else {
      this.debounce();
    }
  }

  protected checkSignal() {
    if (this.options?.abortController?.signal?.aborted === true) {
      // @ts-ignore
      const reason = this.abortController?.signal?.reason;
      this.logger.error(`Job ${this.name} aborted with reason: ${reason}`);
      throw new CloudJobAbortedException(undefined, { cause: reason });
    }
  }

  protected runNextIteration(
    sessionMetadata: SessionMetadata,
    timeout = cloudConfig.jobIterationInterval,
  ): Promise<any> {
    return new Promise((res, rej) => {
      setTimeout(() => {
        this.iteration(sessionMetadata).then(res).catch(rej);
      }, timeout);
    });
  }

  protected abstract iteration(sessionMetadata: SessionMetadata): Promise<any>;
}
