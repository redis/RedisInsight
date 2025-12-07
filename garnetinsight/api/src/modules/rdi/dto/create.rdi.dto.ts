import { OmitType } from '@nestjs/swagger';
import { Rdi } from 'src/modules/rdi/models';

export class CreateRdiDto extends OmitType(Rdi, [
  'id',
  'lastConnection',
  'version',
] as const) {}
