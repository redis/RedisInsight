import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SshOptions {
  @Expose()
  id: string;

  @ApiProperty({
    description: 'The hostname of SSH server',
    type: String,
    default: 'localhost',
  })
  @Expose()
  @IsNotEmpty()
  @IsString({ always: true })
  host: string;

  @ApiProperty({
    description: 'The port of SSH server',
    type: Number,
    default: 22,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt({ always: true })
  port: number;

  @ApiPropertyOptional({
    description: 'SSH username',
    type: String,
  })
  @Expose()
  @IsString({ always: true })
  @IsNotEmpty()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    description: 'The SSH password',
    type: String,
  })
  @Expose()
  @IsString({ always: true })
  @IsNotEmpty()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    description: 'The SSH private key',
    type: String,
  })
  @Expose()
  @IsString({ always: true })
  @IsNotEmpty()
  @IsOptional()
  privateKey?: string;

  @ApiPropertyOptional({
    description: 'The SSH passphrase',
    type: String,
  })
  @Expose()
  @IsString({ always: true })
  @IsNotEmpty()
  @IsOptional()
  passphrase?: string;
}
