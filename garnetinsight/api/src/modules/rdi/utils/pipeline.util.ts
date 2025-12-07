import { isArray, unset, set, forEach, isObjectLike, isEmpty } from 'lodash';
import { plainToInstance } from 'class-transformer';
import { RdiPipeline } from 'src/modules/rdi/models';

export const convertApiDataToRdiJobs = (
  jobs?: [Record<string, any>],
): Record<string, any> => {
  const jobsMap = {};

  if (jobs && isArray(jobs)) {
    jobs.forEach((job) => {
      if (job?.name) {
        jobsMap[job.name] = {
          ...job,
          name: undefined, // do not show name in the config area
        };
      }
    });
  }

  return jobsMap;
};

export const convertApiDataToRdiPipeline = (
  data: Record<string, any> = {},
): RdiPipeline => {
  const entries = data;

  // ignore empty root-level entries for pipeline
  forEach(data, (entry, key) => {
    if (entry && isObjectLike(entry) && isEmpty(entry)) {
      entries[key] = undefined;
    }
  });

  const pipeline = {
    config: {
      ...entries,
    },
    jobs: convertApiDataToRdiJobs(data.jobs),
  };

  // do not show jobs in the config area
  unset(pipeline, 'config.jobs');

  return plainToInstance(RdiPipeline, pipeline, {
    excludeExtraneousValues: true,
  });
};

export const convertRdiJobsToApiPayload = (
  jobs: Record<string, any>,
): Record<string, any>[] => {
  const payload = [];

  forEach(jobs, (job, key) => {
    payload.push({
      ...job,
      name: key,
    });
  });

  return payload;
};

export const convertRdiPipelineToApiPayload = (
  pipeline: RdiPipeline,
): Record<string, any> => {
  const payload = {
    ...pipeline.config,
  };

  set(payload, 'jobs', convertRdiJobsToApiPayload(pipeline.jobs));
  return payload;
};
