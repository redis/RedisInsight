import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { TransformToMap } from 'src/common/decorators/transform-to-map.decorator';

export enum RdiTestConnectionStatus {
  Success = 'success',
  Fail = 'fail',
}

class ErrorDetails {
  @ApiProperty({
    description: 'Error code',
    type: String,
  })
  @Expose()
  code: string;

  @ApiProperty({
    description: 'Error message',
    type: String,
  })
  @Expose()
  message: string;
}

export class RdiTestTargetConnectionResult {
  @ApiProperty({
    description: 'Connection status',
    enum: RdiTestConnectionStatus,
  })
  @Expose()
  status: RdiTestConnectionStatus;

  @ApiPropertyOptional({
    description: 'Error details if any',
    type: ErrorDetails,
  })
  @Expose()
  @Type(() => ErrorDetails)
  error?: ErrorDetails;
}

export class RdiTestSourceConnectionResult {
  @ApiProperty({ description: 'Indicates if the source is connected' })
  @Expose()
  connected: boolean;

  @ApiProperty({
    description: 'Error message if connection fails',
    required: false,
  })
  @Expose()
  error?: string;
}

export class RdiTestConnectionsResponseDto {
  @ApiProperty({
    description: 'Sources connection results',
  })
  @Expose()
  @TransformToMap(RdiTestSourceConnectionResult)
  sources: Record<string, RdiTestSourceConnectionResult>;

  @ApiProperty({
    description: 'Targets connection results',
  })
  @Expose()
  @TransformToMap(RdiTestTargetConnectionResult)
  targets: Record<string, RdiTestTargetConnectionResult>;
}
