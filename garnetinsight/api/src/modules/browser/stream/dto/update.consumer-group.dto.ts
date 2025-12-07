import { IntersectionType } from '@nestjs/swagger';
import { KeyDto } from 'src/modules/browser/keys/dto';
import { CreateConsumerGroupDto } from './create.consumer-groups.dto';

export class UpdateConsumerGroupDto extends IntersectionType(
  KeyDto,
  CreateConsumerGroupDto,
) {}
