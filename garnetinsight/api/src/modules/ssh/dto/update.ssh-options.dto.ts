import { OmitType, PartialType } from '@nestjs/swagger';
import { SshOptions } from 'src/modules/ssh/models/ssh-options';

export class UpdateSshOptionsDto extends PartialType(
  OmitType(SshOptions, ['id'] as const),
) {}
