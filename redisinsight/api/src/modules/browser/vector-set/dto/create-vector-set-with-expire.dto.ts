import { IntersectionType } from '@nestjs/swagger';
import { KeyWithExpireDto } from 'src/modules/browser/keys/dto';
import { AddElementsToVectorSetDto } from './add-elements-to-vector-set.dto';

export class CreateVectorSetWithExpireDto extends IntersectionType(
  AddElementsToVectorSetDto,
  KeyWithExpireDto,
) {}
