import { IntersectionType } from '@nestjs/swagger';
import { KeyWithExpireDto } from 'src/modules/browser/keys/dto';
import { AddStreamEntriesDto } from './add.stream-entries.dto';

export class CreateStreamDto extends IntersectionType(
  AddStreamEntriesDto,
  KeyWithExpireDto,
) {}
