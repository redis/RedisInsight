import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { NotificationType } from 'src/modules/notification/constants';

export class Notification {
  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.Global,
    description: 'Notification type',
  })
  @Expose()
  type: NotificationType;

  @ApiProperty({
    type: Number,
    example: 1655738357,
    description: 'Unix timestamp (seconds) when the notification was created',
  })
  @Expose()
  timestamp: number;

  @ApiProperty({
    type: String,
    description: 'Notification title',
  })
  @Expose()
  title: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Optional category label shown alongside the notification',
  })
  @Expose()
  category?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Hex color used to render the category label',
  })
  @Expose()
  categoryColor?: string;

  @ApiProperty({
    type: String,
    description: 'Notification body (markdown)',
  })
  @Expose()
  body: string;

  @ApiPropertyOptional({
    type: Boolean,
    default: false,
    description: 'Whether the user has marked this notification as read',
  })
  @Expose()
  read?: boolean = false;
}
