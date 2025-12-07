import { OmitType } from '@nestjs/swagger';
import { SshOptions } from 'src/modules/ssh/models/ssh-options';

export class CreateCertSshOptionsDto extends OmitType(SshOptions, [
  'password',
  'id',
] as const) {}
