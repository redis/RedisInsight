import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ClientCertificate {
  @ApiProperty({
    description: 'Certificate id',
    type: String,
  })
  @Expose()
  @IsNotEmpty()
  @IsString({ always: true })
  id: string;

  @ApiProperty({
    description: 'Certificate name',
    type: String,
  })
  @Expose()
  @IsNotEmpty()
  @IsString({ always: true })
  name: string;

  @ApiPropertyOptional({
    description: 'Certificate body',
    type: String,
  })
  @Expose({ groups: ['security'] })
  @IsOptional()
  @IsString({ always: true })
  certificate?: string;

  @ApiPropertyOptional({
    description:
      'File path to the certificate. When specified, the certificate will be read from this path at connection time.',
    type: String,
  })
  @Expose()
  @IsOptional()
  @IsString({ always: true })
  certificatePath?: string;

  @ApiPropertyOptional({
    description: 'Key body',
    type: String,
  })
  @Expose({ groups: ['security'] })
  @IsOptional()
  @IsString({ always: true })
  key?: string;

  @ApiPropertyOptional({
    description:
      'File path to the private key. When specified, the key will be read from this path at connection time.',
    type: String,
  })
  @Expose()
  @IsOptional()
  @IsString({ always: true })
  keyPath?: string;

  @ApiPropertyOptional({
    description:
      'Whether the certificate was created from a file or environment variables at startup',
    type: Boolean,
  })
  @Expose()
  @IsBoolean()
  @IsOptional()
  isPreSetup?: boolean;
}
