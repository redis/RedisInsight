import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsDefined, IsString } from 'class-validator';
import { RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class GetNamespaceSearchableDto {
  @ApiProperty({
    description: 'List of namespace prefixes to check for searchable keys',
    type: [String],
    example: ['user:', 'session:'],
  })
  @IsDefined()
  @IsString({ each: true })
  @ArrayNotEmpty()
  prefixes: string[];
}

export class NamespaceSearchableKeyResponse {
  @ApiProperty({
    description: 'Key name',
    type: String,
  })
  @RedisStringType()
  name: RedisString;

  @ApiProperty({
    description: 'Key type (hash or ReJSON-RL)',
    type: String,
  })
  type: string;
}

export class NamespaceSearchableResponse {
  @ApiProperty({
    description: 'Namespace prefix',
    type: String,
  })
  prefix: string;

  @ApiPropertyOptional({
    description: 'First searchable key found in the namespace, if any',
    type: NamespaceSearchableKeyResponse,
  })
  key?: NamespaceSearchableKeyResponse;
}
