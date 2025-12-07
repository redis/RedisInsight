import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Default } from 'src/common/decorators';

export class CloudRequestUtm {
  @ApiPropertyOptional({
    type: String,
    default: 'garnetinsight',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Default('garnetinsight')
  source? = 'garnetinsight';

  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Default('sso')
  medium? = 'sso';

  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  campaign?: string;

  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  amp?: string;

  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  package?: string;
}
