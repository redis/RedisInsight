export enum CloudAuthStatus {
  Succeed = 'succeed',
  Failed = 'failed',
}

export class CloudAuthResponse {
  status: CloudAuthStatus;

  message?: string;

  error?: object | string;
}
