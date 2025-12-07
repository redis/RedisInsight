import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SlowLog {
  @ApiProperty({
    description: 'Unique slowlog Id calculated by Redis',
    example: 12,
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Time when command was executed',
    example: 1652265051,
    type: Number,
  })
  time: number;

  @ApiProperty({
    description: 'Time needed to execute this command in microseconds',
    example: 57000,
    type: Number,
  })
  durationUs: number;

  @ApiProperty({
    description: 'Command with args',
    example: 'SET foo bar',
    type: String,
  })
  args: string;

  @ApiProperty({
    description: 'Client that executed this command',
    example: '127.17.0.1:46922',
    type: String,
  })
  source: string;

  @ApiPropertyOptional({
    description: 'Client name if defined',
    example: 'garnetinsight-common-e25b587e',
    type: String,
  })
  client?: string;
}
