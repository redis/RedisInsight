import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum AgentMemoryBackendType {
  Oss = 'oss',
  Cloud = 'cloud',
}

export class AgentMemoryEndpoint {
  @ApiProperty({
    description: 'Agent memory endpoint id.',
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'A name to associate with the agent memory endpoint',
    type: String,
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  name: string;

  @ApiProperty({
    description: 'Base url of the agent memory server to connect to',
    example: 'http://localhost:8000',
    type: String,
  })
  @Expose()
  @IsNotEmpty()
  @IsString()
  url: string;

  @ApiProperty({
    description: 'Type of the agent memory backend',
    enum: AgentMemoryBackendType,
    default: AgentMemoryBackendType.Oss,
  })
  @Expose()
  @IsEnum(AgentMemoryBackendType)
  @IsNotEmpty()
  backendType: AgentMemoryBackendType = AgentMemoryBackendType.Oss;

  @ApiPropertyOptional({
    description: 'Store id (Redis Cloud agent memory only)',
    type: String,
  })
  @IsOptional()
  @Expose()
  @IsString()
  storeId?: string;

  @ApiPropertyOptional({
    description: 'API key (bearer token), if the server requires auth',
    type: String,
  })
  @IsOptional()
  @Expose({ groups: ['security'] })
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional({
    description: 'Time of the last connection to the agent memory endpoint.',
    type: String,
    format: 'date-time',
    example: '2021-01-06T12:44:39.000Z',
  })
  @Expose()
  lastConnection?: Date;
}
