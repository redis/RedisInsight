import { IntersectionType } from '@nestjs/swagger';
import { KeyDto } from 'src/modules/browser/keys/dto';
import { ArrayElementDto } from './array-element.dto';

export class SetArrayElementDto extends IntersectionType(
  KeyDto,
  ArrayElementDto,
) {}
