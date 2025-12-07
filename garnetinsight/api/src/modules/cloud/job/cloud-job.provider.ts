import { filter } from 'lodash';
import { CloudJob } from 'src/modules/cloud/job/jobs';
import { SessionMetadata } from 'src/common/models';
import { CreateCloudJobDto } from 'src/modules/cloud/job/dto/create.cloud-job.dto';
import { CloudJobInfo, CloudJobRunMode } from 'src/modules/cloud/job/models';
import { CloudJobFactory } from 'src/modules/cloud/job/cloud-job.factory';
import { wrapHttpError } from 'src/common/utils';
import { Injectable } from '@nestjs/common';
import { CloudRequestUtm } from 'src/modules/cloud/common/models';

@Injectable()
export class CloudJobProvider {
  private jobs: Map<string, CloudJob> = new Map();

  constructor(private readonly cloudJobFactory: CloudJobFactory) {}

  async addJob(
    sessionMetadata: SessionMetadata,
    dto: CreateCloudJobDto,
    utm: CloudRequestUtm,
  ): Promise<CloudJobInfo> {
    try {
      const job = await this.cloudJobFactory.create(dto.name, dto.data || {}, {
        sessionMetadata,
        utm,
      });

      // tmp: clear all jobs due to current requirements (1 at time)
      if (this.jobs.size) {
        this.jobs.forEach((ongoingJob) => {
          ongoingJob.abort('Another job was added');
        });
        this.jobs.clear();
      }

      this.jobs.set(job.id, job);

      if (dto.runMode === CloudJobRunMode.Async) {
        job.run(sessionMetadata).catch(() => {});

        return job.getState();
      }

      await job.run(sessionMetadata);
      return job.getState();
    } catch (e) {
      throw wrapHttpError(e);
    }
  }

  async get(id: string): Promise<CloudJob> {
    return this.jobs.get(id);
  }

  async findUserJobs(sessionMetadata: SessionMetadata): Promise<CloudJob[]> {
    return filter(
      [...this.jobs.values()],
      (job: CloudJob) =>
        job.options?.sessionMetadata?.userId === sessionMetadata.userId,
    );
  }
}
