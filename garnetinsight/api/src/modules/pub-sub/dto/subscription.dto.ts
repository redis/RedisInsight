import { SubscriptionType } from 'src/modules/pub-sub/constants';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class SubscriptionDto {
  @IsNotEmpty()
  @IsString()
  channel: string;

  @IsNotEmpty()
  @IsEnum(SubscriptionType, {
    message: `type must be a valid enum value. Valid values: ${Object.values(
      SubscriptionType,
    )}.`,
  })
  type: SubscriptionType;
}
