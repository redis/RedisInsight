import { IntersectionType } from '@nestjs/swagger';
import { KeyWithExpireDto } from 'src/modules/browser/keys/dto';
import { PushElementToListDto } from './push.element-to-list.dto';

export class CreateListWithExpireDto extends IntersectionType(
  PushElementToListDto,
  KeyWithExpireDto,
) {}
