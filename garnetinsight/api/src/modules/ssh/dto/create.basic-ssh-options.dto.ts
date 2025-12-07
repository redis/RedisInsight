import { OmitType } from '@nestjs/swagger';
import { SshOptions } from 'src/modules/ssh/models/ssh-options';

export class CreateBasicSshOptionsDto extends OmitType(SshOptions, [
  'privateKey',
  'passphrase',
  'id',
] as const) {}
