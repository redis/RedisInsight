import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateDatabaseCloudJobDataDto {
  @ApiProperty({
    description: 'Subscription id for create a database.',
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  subscriptionId: number;
}
