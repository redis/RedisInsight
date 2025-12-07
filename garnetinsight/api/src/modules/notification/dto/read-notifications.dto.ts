import { IsEnum, IsInt, NotEquals, ValidateIf } from 'class-validator';
import { NotificationType } from 'src/modules/notification/constants';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReadNotificationsDto {
  @ApiPropertyOptional({
    type: Number,
    example: 1655738357,
    description: 'Timestamp of notification',
  })
  @NotEquals(null)
  @ValidateIf((object, value) => value !== undefined)
  @IsInt()
  timestamp?: number;

  @ApiPropertyOptional({
    enum: NotificationType,
    example: NotificationType.Global,
    description: 'Type of notification',
  })
  @NotEquals(null)
  @ValidateIf((object, value) => value !== undefined)
  @IsEnum(NotificationType)
  type?: NotificationType;

  constructor(dto: Partial<ReadNotificationsDto>) {
    Object.assign(this, dto);
  }
}
