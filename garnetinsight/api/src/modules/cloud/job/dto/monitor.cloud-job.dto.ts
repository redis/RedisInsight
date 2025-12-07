import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MonitorCloudJobDto {
  @ApiProperty({
    description: 'Task id to monitor',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  jobId: string;
}
