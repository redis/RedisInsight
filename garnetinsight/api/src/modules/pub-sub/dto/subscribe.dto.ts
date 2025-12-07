import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionDto } from './subscription.dto';

export class SubscribeDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SubscriptionDto)
  subscriptions: SubscriptionDto[];
}
