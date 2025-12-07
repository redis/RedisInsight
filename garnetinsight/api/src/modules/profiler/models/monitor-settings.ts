import { IsString } from 'class-validator';

export class MonitorSettings {
  @IsString()
  logFileId: string;
}
