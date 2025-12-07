import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { AdditionalRedisModuleName } from 'src/constants';

export class AdditionalRedisModule {
  @ApiProperty({
    description: 'Name of the module.',
    type: String,
    example: AdditionalRedisModuleName.RediSearch,
  })
  @IsString()
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: 'Integer representation of a module version.',
    type: Number,
    example: 20008,
  })
  @IsNumber()
  @Expose()
  version?: number;

  @ApiPropertyOptional({
    description: 'Semantic versioning representation of a module version.',
    type: String,
    example: '2.0.8',
  })
  @IsString()
  @Expose()
  semanticVersion?: string;
}
