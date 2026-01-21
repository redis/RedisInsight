export enum RdiUrl {
  GetConfigSchema = 'api/v1/pipelines/config/schemas',
  GetJobsSchema = 'api/v1/pipelines/jobs/schemas',
  GetPipeline = 'api/v1/pipelines',
  GetStrategies = 'api/v1/pipelines/strategies',
  GetConfigTemplate = 'api/v1/pipelines/config/templates',
  GetJobTemplate = 'api/v1/pipelines/jobs/templates',
  DryRunJob = 'api/v1/pipelines/jobs/dry-run',
  JobFunctions = '/api/v1/pipelines/jobs/functions',
  Deploy = 'api/v1/pipelines',
  StopPipeline = 'api/v1/pipelines/stop',
  StartPipeline = 'api/v1/pipelines/start',
  ResetPipeline = 'api/v1/pipelines/reset',
  TestTargetsConnections = 'api/v1/pipelines/targets/dry-run',
  TestSourcesConnections = 'api/v1/pipelines/sources/dry-run',
  GetStatistics = 'api/v1/monitoring/statistics',
  GetPipelineStatus = 'api/v1/status',
  Login = 'api/v1/login',
  Action = 'api/v1/actions',
}

export const RdiUrlV2 = {
  GetInfo: 'api/v2/info',
  GetPipelines: 'api/v2/pipelines',
};

export const IDLE_THRESHOLD = 10 * 60 * 1000; // 10 min
export const RDI_TIMEOUT = 30_000; // 30 sec
export const TOKEN_THRESHOLD = 2 * 60 * 1000; // 2 min
export const RDI_SYNC_INTERVAL = 5 * 60 * 1_000; // 5 min
export const POLLING_INTERVAL = 1_000;
export const MAX_POLLING_TIME = 2 * 60 * 1000; // 2 min
export const WAIT_BEFORE_POLLING = 1_000;

export enum PipelineActions {
  Deploy = 'Deploy',
  Reset = 'Reset',
  Start = 'Start',
  Stop = 'Stop',
}
