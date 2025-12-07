import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { SshOptions } from 'src/modules/ssh/models/ssh-options';
import { Expose } from 'class-transformer';
import { HiddenField } from 'src/common/decorators/hidden-field.decorator';

export class SshOptionsResponse extends OmitType(SshOptions, [
  'password',
  'passphrase',
  'privateKey',
] as const) {
  @ApiPropertyOptional({
    description: 'The SSH password flag (true if password was set)',
    type: Boolean,
  })
  @Expose()
  @HiddenField(true)
  password?: boolean;

  @ApiPropertyOptional({
    description: 'The SSH passphrase flag (true if password was set)',
    type: Boolean,
  })
  @Expose()
  @HiddenField(true)
  passphrase?: boolean;

  @ApiPropertyOptional({
    description: 'The SSH private key',
    type: Boolean,
  })
  @Expose()
  @HiddenField(true)
  privateKey?: boolean;
}
