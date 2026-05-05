import { IntersectionType } from '@nestjs/swagger';
import { KeyWithExpireDto } from 'src/modules/browser/keys/dto';
import { AddArrayElementsDto } from './add.array-elements.dto';

export class CreateArrayWithExpireDto extends IntersectionType(
  AddArrayElementsDto,
  KeyWithExpireDto,
) {}
