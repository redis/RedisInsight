import { IntersectionType } from '@nestjs/swagger';
import { KeyWithExpireDto } from 'src/modules/browser/keys/dto';
import { AddFieldsToHashDto } from 'src/modules/browser/hash/dto';

export class CreateHashWithExpireDto extends IntersectionType(
  AddFieldsToHashDto,
  KeyWithExpireDto,
) {}
