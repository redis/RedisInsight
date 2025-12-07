import { ForbiddenException, Injectable } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';
import { CreateCloudJobDto } from 'src/modules/cloud/job/dto/create.cloud-job.dto';
import { MonitorCloudJobDto } from 'src/modules/cloud/job/dto/monitor.cloud-job.dto';
import { wrapHttpError } from 'src/common/utils';
import { CloudJobProvider } from 'src/modules/cloud/job/cloud-job.provider';
import { CloudJobInfo } from 'src/modules/cloud/job/models';
import { Socket } from 'socket.io';
import { CloudJobNotFoundException } from 'src/modules/cloud/job/exceptions';
import { CloudJobEvents } from 'src/modules/cloud/common/constants';
import { CloudJob } from 'src/modules/cloud/job/jobs';
import { CloudRequestUtm } from 'src/modules/cloud/common/models';

@Injectable()
export class CloudJobService {
  constructor(private readonly cloudJobProvider: CloudJobProvider) {}

  /**
   * Create cloud job
   * @param sessionMetadata
   * @param dto
   * @param utm
   */
  async create(
    sessionMetadata: SessionMetadata,
    dto: CreateCloudJobDto,
    utm: CloudRequestUtm,
  ): Promise<CloudJobInfo> {
    try {
      return await this.cloudJobProvider.addJob(sessionMetadata, dto, utm);
    } catch (e) {
      throw wrapHttpError(e);
    }
  }

  /**
   * Get list of current user jobs infos
   * @param sessionMetadata
   */
  async getUserJobsInfo(
    sessionMetadata: SessionMetadata,
  ): Promise<CloudJobInfo[]> {
    try {
      const jobs = await this.cloudJobProvider.findUserJobs(sessionMetadata);

      return jobs.map((job) => job.getState());
    } catch (e) {
      throw wrapHttpError(e);
    }
  }

  /**
   * Get user job
   * @param sessionMetadata
   * @param id
   */
  async get(sessionMetadata: SessionMetadata, id: string): Promise<CloudJob> {
    try {
      const job = await this.cloudJobProvider.get(id);

      if (!job) {
        throw new CloudJobNotFoundException();
      }

      if (job.options?.sessionMetadata?.userId !== sessionMetadata.userId) {
        throw new ForbiddenException("This job doesn't belong to the user");
      }

      return job;
    } catch (e) {
      throw wrapHttpError(e);
    }
  }

  /**
   * Get user job info
   * @param sessionMetadata
   * @param id
   */
  async getJobInfo(
    sessionMetadata: SessionMetadata,
    id: string,
  ): Promise<CloudJobInfo> {
    try {
      const job = await this.get(sessionMetadata, id);

      return job.getState();
    } catch (e) {
      throw wrapHttpError(e);
    }
  }

  async monitorJob(
    sessionMetadata: SessionMetadata,
    dto: MonitorCloudJobDto,
    client: Socket,
  ): Promise<CloudJobInfo> {
    const job = await this.get(sessionMetadata, dto.jobId);

    job.addStateCallback(async (cloudJob) => {
      client.emit(CloudJobEvents.Monitor, cloudJob.getState());
    });

    return job.getState();
  }
}
