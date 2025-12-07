import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SendEventDto {
  @ApiProperty({
    description: 'Telemetry event name.',
    type: String,
    example: 'APPLICATION_UPDATED',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  event: string;

  @ApiPropertyOptional({
    description: 'Telemetry event data.',
    type: Object,
    example: { length: 5 },
  })
  @IsOptional()
  @ValidateNested()
  eventData: Object = {};

  @ApiPropertyOptional({
    description: 'Does not track the specific user in any way?',
    type: Boolean,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  nonTracking: boolean = false;

  @ApiPropertyOptional({
    description: 'User data.',
    type: Object,
    example: { telemetry: true },
  })
  @IsOptional()
  @ValidateNested()
  traits: Object = {};
}
