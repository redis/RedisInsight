import { ApiPropertyOptional, getSchemaPath, PickType } from '@nestjs/swagger';
import { Database } from 'src/modules/database/models/database';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { NoDuplicatesByKey } from 'src/common/decorators';
import { caCertTransformer } from 'src/modules/certificate/transformers/ca-cert.transformer';
import { CreateCaCertificateDto } from 'src/modules/certificate/dto/create.ca-certificate.dto';
import { UseCaCertificateDto } from 'src/modules/certificate/dto/use.ca-certificate.dto';
import { CreateClientCertificateDto } from 'src/modules/certificate/dto/create.client-certificate.dto';
import { clientCertTransformer } from 'src/modules/certificate/transformers/client-cert.transformer';
import { UseClientCertificateDto } from 'src/modules/certificate/dto/use.client-certificate.dto';
import { Tag } from 'src/modules/tag/models/tag';

export class ImportDatabaseDto extends PickType(Database, [
  'host',
  'port',
  'name',
  'db',
  'username',
  'password',
  'connectionType',
  'tls',
  'verifyServerCert',
  'sentinelMaster',
  'nodes',
  'new',
  'ssh',
  'sshOptions',
  'provider',
  'providerDetails',
  'compressor',
  'modules',
  'tlsServername',
  'forceStandalone',
  'tags',
] as const) {
  @Expose()
  @IsNotEmpty()
  @IsInt({ always: true })
  @Type(() => Number)
  @Min(0)
  @Max(65535)
  port: number;

  @Expose()
  @IsOptional()
  @IsNotEmptyObject()
  @Type(caCertTransformer)
  @ValidateNested()
  caCert?: CreateCaCertificateDto | UseCaCertificateDto;

  @ApiPropertyOptional({
    description: 'Client Certificate',
    oneOf: [
      { $ref: getSchemaPath(CreateClientCertificateDto) },
      { $ref: getSchemaPath(UseCaCertificateDto) },
    ],
  })
  @Expose()
  @IsOptional()
  @IsNotEmptyObject()
  @Type(clientCertTransformer)
  @ValidateNested()
  clientCert?: CreateClientCertificateDto | UseClientCertificateDto;

  @ApiPropertyOptional({
    description: 'Tags associated with the database.',
    type: Tag,
    isArray: true,
  })
  @Expose()
  @IsOptional()
  @IsArray()
  @NoDuplicatesByKey('key', {
    message: 'Tags must not contain duplicates by key.',
  })
  @Type(() => Tag)
  tags?: Tag[];
}
