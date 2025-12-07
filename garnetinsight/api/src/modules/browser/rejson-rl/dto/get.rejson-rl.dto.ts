import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class GetRejsonRlDto extends KeyDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Path to look for data',
  })
  @IsString()
  @IsNotEmpty()
  path?: string = '$';

  @ApiPropertyOptional({
    type: Boolean,
    description:
      "Don't check for json size and return whole json in path when enabled",
  })
  @IsBoolean()
  forceRetrieve?: boolean;
}
