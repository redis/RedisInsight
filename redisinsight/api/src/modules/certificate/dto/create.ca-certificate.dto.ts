import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { CaCertificate } from 'src/modules/certificate/models/ca-certificate';
import { Expose } from 'class-transformer';
import { IsOptional, IsString, ValidateIf } from 'class-validator';

export class CreateCaCertificateDto extends OmitType(CaCertificate, [
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
}
