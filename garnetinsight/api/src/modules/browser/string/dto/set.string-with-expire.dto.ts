import { IntersectionType } from '@nestjs/swagger';
import { KeyWithExpireDto } from 'src/modules/browser/keys/dto';
import { SetStringDto } from './set.string.dto';

export class SetStringWithExpireDto extends IntersectionType(
  SetStringDto,
  KeyWithExpireDto,
) {}
