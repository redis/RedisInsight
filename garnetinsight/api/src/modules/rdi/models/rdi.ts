import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class Rdi {
  @ApiProperty({
    description: 'RDI id.',
    type: String,
  })
  @Expose()
  id: string;

  @ApiPropertyOptional({
    description: 'Base url of API to connect to (for API type only)',
    example: 'https://example.com',
    type: String,
  })
  @Expose()
  @IsNotEmpty()
  @IsString()
  url: string;

  @ApiProperty({
    description: 'A name to associate with RDI',
    type: String,
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  name: string;

  @ApiPropertyOptional({
    description: 'RDI or API username',
    type: String,
  })
  @IsOptional()
  @Expose()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: 'RDI or API password',
    type: String,
  })
  @IsOptional()
  @Expose()
  @IsString()
  password?: string;

  @ApiProperty({
    description: 'Time of the last connection to RDI.',
    type: String,
    format: 'date-time',
    example: '2021-01-06T12:44:39.000Z',
  })
  @Expose()
  lastConnection?: Date;

  @ApiPropertyOptional({
    description: 'The version of RDI being used',
    type: String,
  })
  @IsOptional()
  @Expose()
  @IsNotEmpty()
  @IsString()
  version?: string;
}
