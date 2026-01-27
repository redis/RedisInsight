import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { ClientCertificate } from 'src/modules/certificate/models/client-certificate';
import { Expose } from 'class-transformer';
import { IsOptional, IsString, ValidateIf } from 'class-validator';

export class CreateClientCertificateDto extends OmitType(ClientCertificate, [
  'id',
] as const) {
  @ApiPropertyOptional({
    description:
      'Certificate body. Required if certificatePath is not provided.',
    type: String,
  })
  @Expose()
  @ValidateIf((o) => !o.certificatePath)
  @IsString({ always: true })
  certificate?: string;

  @ApiPropertyOptional({
    description:
      'File path to the certificate. When specified, the certificate will be read from this path at connection time. Required if certificate is not provided.',
    type: String,
  })
  @Expose()
  @IsOptional()
  @IsString({ always: true })
  certificatePath?: string;

  @ApiPropertyOptional({
    description: 'Key body. Required if keyPath is not provided.',
    type: String,
  })
  @Expose()
  @ValidateIf((o) => !o.keyPath)
  @IsString({ always: true })
  key?: string;

  @ApiPropertyOptional({
    description:
      'File path to the private key. When specified, the key will be read from this path at connection time. Required if key is not provided.',
    type: String,
  })
  @Expose()
  @IsOptional()
  @IsString({ always: true })
  keyPath?: string;
}
