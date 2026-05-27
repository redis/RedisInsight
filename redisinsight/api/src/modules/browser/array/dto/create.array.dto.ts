import { IntersectionType } from '@nestjs/swagger';
import { KeyWithExpireDto } from 'src/modules/browser/keys/dto';
import { AddElementsToArrayDto } from './add.elements-to-array.dto';

export class CreateArrayDto extends IntersectionType(
  AddElementsToArrayDto,
  KeyWithExpireDto,
) {}
