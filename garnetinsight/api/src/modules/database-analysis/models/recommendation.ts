import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Recommendation {
  @ApiProperty({
    description: 'Recommendation name',
    type: String,
    example: 'luaScript',
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: 'Additional recommendation params',
    example: 'luaScript',
  })
  @Expose()
  params?: any;

  @ApiPropertyOptional({
    description: 'User vote',
    example: 'useful',
  })
  @Expose()
  vote?: string;
}
