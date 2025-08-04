import {
  convertApiDataToRdiJobs,
  convertApiDataToRdiPipeline,
  convertRdiJobsToApiPayload,
  convertRdiPipelineToApiPayload,
} from 'src/modules/rdi/utils/pipeline.util';
import { RdiPipeline } from '../models';

const job1 = {
  name: 'job1',
  source: {
    redis: {},
  },
  transform: [],
  output: [],
};
const job2 = {
  name: 'job2',
  source: {
    redis: {},
  },
  transform: [],
  output: [],
};

describe('convertApiDataToRdiJobs', () => {
  it('should return an empty object when no jobs are provided', () => {
    const result = convertApiDataToRdiJobs();
    expect(result).toEqual({});
  });

  it('should return an empty object when an empty array is provided', () => {
    const result = convertApiDataToRdiJobs(
      [] as unknown as [Record<string, any>],
    );
    expect(result).toEqual({});
  });

  it('should return a map of jobs with their names as keys', () => {
    const jobs = [job1, job2] as unknown as [Record<string, any>];
    const result = convertApiDataToRdiJobs(jobs);
    expect(result).toEqual({
      [job1.name]: job1,
      [job2.name]: job2,
    });
  });

  it('should ignore jobs without a name property', () => {
    const jobWithoutName = {
      source: {
        redis: {},
      },
      transform: [],
      output: [],
    };
    const jobs = [jobWithoutName, job2] as unknown as [Record<string, any>];
    const result = convertApiDataToRdiJobs(jobs);
    expect(result).toEqual({
      [job2.name]: job2,
    });
  });
});

describe('convertApiDataToRdiPipeline', () => {
  it('should return an RdiPipeline object with jobs converted from API data', () => {
    const apiData = {
      targets: {
        target: {},
      },
      jobs: [job1, job2],
      sources: { psql: {} },
      processors: {},
    };

    const expectedPipeline: RdiPipeline = Object.assign(new RdiPipeline(), {
      config: {
        targets: {
          target: {},
        },
        sources: { psql: {} },
        processors: undefined,
      },
      jobs: {
        [job1.name]: job1,
        [job2.name]: job2,
      },
    });

    const actualPipeline = convertApiDataToRdiPipeline(apiData);

    expect(actualPipeline).toEqual(expectedPipeline);
  });

  it('should return an RdiPipeline object with empty jobs array if no jobs in API data', () => {
    const apiData = {
      targets: {
        target: {},
      },
      sources: { psql: {} },
      processors: {},
    };

    const expectedPipeline: RdiPipeline = Object.assign(new RdiPipeline(), {
      jobs: {},
      config: {
        targets: {
          target: {},
        },
        sources: { psql: {} },
        processors: undefined,
      },
    });

    const actualPipeline = convertApiDataToRdiPipeline(apiData);

    expect(actualPipeline).toEqual(expectedPipeline);
  });

  it('should return an RdiPipeline object with additional data from API data', () => {
    const apiData = {
      targets: {
        target: {},
      },
      jobs: [job1, job2],
      sources: { psql: {} },
      processors: {},
    };

    const expectedPipeline: RdiPipeline = Object.assign(new RdiPipeline(), {
      config: {
        targets: {
          target: {},
        },
        sources: { psql: {} },
        processors: undefined,
      },
      jobs: {
        job1: job1,
        job2: job2,
      },
    });

    const actualPipeline = convertApiDataToRdiPipeline(apiData);

    expect(actualPipeline).toBeInstanceOf(RdiPipeline);
    expect(actualPipeline.config).toBeTruthy();
    expect(actualPipeline.jobs.job1).toBeTruthy();
    expect(Object.keys(actualPipeline.jobs)).toStrictEqual([
      job1.name,
      job2.name,
    ]);
    expect(actualPipeline).toEqual(expectedPipeline);
  });
});

describe('convertRdiJobsToApiPayload', () => {
  it('should convert an object of jobs to an array of payloads', () => {
    const jobs = {
      job1: {
        id: 1,
        title: 'Job 1',
        description: 'This is job 1',
      },
      job2: {
        id: 2,
        title: 'Job 2',
        description: 'This is job 2',
      },
    };

    const expectedPayload = [
      {
        id: 1,
        title: 'Job 1',
        description: 'This is job 1',
        name: 'job1',
      },
      {
        id: 2,
        title: 'Job 2',
        description: 'This is job 2',
        name: 'job2',
      },
    ];

    const result = convertRdiJobsToApiPayload(jobs);

    expect(result).toEqual(expectedPayload);
  });

  it('should return an empty array if no jobs are provided', () => {
    const jobs = {};

    const expectedPayload = [];

    const result = convertRdiJobsToApiPayload(jobs);

    expect(result).toEqual(expectedPayload);
  });
});

describe('convertRdiPipelineToApiPayload', () => {
  it('should convert RdiPipeline to API payload', () => {
    const pipeline: RdiPipeline = Object.assign(new RdiPipeline(), {
      config: {
        name: 'my-pipeline',
        description: 'This is my pipeline',
      },
      jobs: {
        job1: { ...job1, name: undefined },
        job2: { ...job2, name: undefined },
      },
    });

    const expectedPayload = {
      name: 'my-pipeline',
      description: 'This is my pipeline',
      jobs: [job1, job2],
    };

    const result = convertRdiPipelineToApiPayload(pipeline);

    expect(result).toEqual(expectedPayload);
  });
});
