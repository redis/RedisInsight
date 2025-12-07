import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateNotificationDto } from 'src/modules/notification/dto/create-notification.dto';

export class CreateNotificationsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateNotificationDto)
  notifications: CreateNotificationDto[];

  constructor(dto: Partial<CreateNotificationsDto>) {
    Object.assign(this, dto);
  }
}
