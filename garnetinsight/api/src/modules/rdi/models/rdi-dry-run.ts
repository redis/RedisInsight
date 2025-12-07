export enum RdiDyRunJobStatus {
  Success = 'success',
  Fail = 'failed',
}

export class RdiDryRunJobResult {
  status: RdiDyRunJobStatus;

  // TODO validate with RDI team
  data?: any;

  error?: string;
}
