export interface ICloudCapiTask {
  taskId: string;
  commandType: string;
  status: string;
  description?: string;
  timestamp: string;
  response?: any;
}
