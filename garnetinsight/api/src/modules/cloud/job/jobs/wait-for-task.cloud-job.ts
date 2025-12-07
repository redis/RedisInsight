import {
  CloudJob,
  CloudJobOptions,
} from 'src/modules/cloud/job/jobs/cloud-job';
import { CloudTask, CloudTaskStatus } from 'src/modules/cloud/task/models';
import { CloudTaskCapiService } from 'src/modules/cloud/task/cloud-task.capi.service';
import { CloudJobStatus } from 'src/modules/cloud/job/models';
import {
  CloudJobUnexpectedErrorException,
  CloudTaskProcessingErrorException,
} from 'src/modules/cloud/job/exceptions';
import { CloudJobName } from 'src/modules/cloud/job/constants';
import { SessionMetadata } from 'src/common/models';

export class WaitForTaskCloudJob extends CloudJob {
  protected name = CloudJobName.WaitForTask;

  constructor(
    readonly options: CloudJobOptions,
    private readonly data: {
      taskId: string;
    },
    protected readonly dependencies: {
      cloudTaskCapiService: CloudTaskCapiService;
    },
  ) {
    super(options);
  }

  async iteration(sessionMetadata: SessionMetadata): Promise<CloudTask> {
    this.logger.debug('Wait for cloud task complete');

    this.checkSignal();

    this.logger.debug('Fetching cloud task');

    const task = await this.dependencies.cloudTaskCapiService.getTask(
      this.options.capiCredentials,
      this.data.taskId,
    );

    switch (task?.status) {
      case CloudTaskStatus.Initialized:
      case CloudTaskStatus.Received:
      case CloudTaskStatus.ProcessingInProgress:
        this.logger.debug(
          'Cloud task processing is in progress. Scheduling new iteration.',
        );
        return await this.runNextIteration(sessionMetadata);
      case CloudTaskStatus.ProcessingCompleted:
        this.logger.debug('Cloud task processing successfully completed.');

        this.changeState({ status: CloudJobStatus.Finished });

        return task;
      case CloudTaskStatus.ProcessingError:
        throw new CloudTaskProcessingErrorException(undefined, {
          cause: task.response?.error,
        });
      default:
        throw new CloudJobUnexpectedErrorException(
          'Something went wrong. Unknown task status or task was not found',
        );
    }
  }
}
