export enum AppUpdateStrategy {
  auto = 'auto',
  notify = 'notify',
}

export enum AppUpdateStatus {
  Available = 'available',
  NotAvailable = 'not-available',
  Error = 'error',
}

export interface AppUpdateState {
  status: AppUpdateStatus
  version?: string
  manual?: boolean
}
