import { IPipelineStatus, PipelineStatus } from 'uiSrc/slices/interfaces'

export const MOCK_RDI_PIPELINE_CONFIG = `connections:
  target:
    type: redis
`

export const MOCK_RDI_PIPELINE_JOB2 = {
  name: 'job2',
  value: `job2:
  transform:
    type: redis
`,
}

export const MOCK_RDI_PIPELINE_JOB1 = {
  name: 'jobName',
  value: `job:
  transform:
    type: sql
`,
}

export const MOCK_RDI_PIPELINE_DATA = {
  config: MOCK_RDI_PIPELINE_CONFIG,
  jobs: [MOCK_RDI_PIPELINE_JOB1, MOCK_RDI_PIPELINE_JOB2],
}

export const MOCK_RDI_PIPELINE_JSON_DATA = {
  config: {
    connections: {
      target: {
        type: 'redis',
      },
    },
  },
  jobs: {
    jobName: {
      job: {
        transform: {
          type: 'sql',
        },
      },
    },
    job2: {
      job2: {
        transform: {
          type: 'redis',
        },
      },
    },
  },
}

export const MOCK_RDI_PIPELINE_STATUS_DATA: IPipelineStatus = {
  components: { processor: 'ready' },
  pipelines: {
    defaults: {
      status: PipelineStatus.Starting,
      state: 'some',
      tasks: 'none',
    },
  },
}
