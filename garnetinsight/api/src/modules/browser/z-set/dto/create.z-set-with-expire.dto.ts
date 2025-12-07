import { IntersectionType } from '@nestjs/swagger';
import { KeyWithExpireDto } from 'src/modules/browser/keys/dto';
import { AddMembersToZSetDto } from './add.members-to-z-set.dto';

export class CreateZSetWithExpireDto extends IntersectionType(
  AddMembersToZSetDto,
  KeyWithExpireDto,
) {}
