import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CloudSubscriptionRegion {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: Number,
  })
  regionId: number;

  @ApiProperty({
    type: String,
  })
  name: string;

  @ApiProperty({
    type: Number,
  })
  displayOrder: number;

  @ApiPropertyOptional({
    type: String,
  })
  region?: string;

  @ApiPropertyOptional({
    type: String,
  })
  provider?: string;

  @ApiPropertyOptional({
    type: String,
  })
  cloud?: string;

  @ApiPropertyOptional({
    type: String,
  })
  countryName?: string;

  @ApiPropertyOptional({
    type: String,
  })
  cityName?: string;

  @ApiPropertyOptional({
    type: String,
  })
  flag?: string;
}
