import { IntersectionType } from '@nestjs/swagger';
import { KeyWithExpireDto } from 'src/modules/browser/keys/dto';
import { AddMembersToSetDto } from './add.members-to-set.dto';

export class CreateSetWithExpireDto extends IntersectionType(
  AddMembersToSetDto,
  KeyWithExpireDto,
) {}
