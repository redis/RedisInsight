import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DownloadRejsonRlDto extends KeyDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Path to look for data',
  })
  @IsString()
  @IsNotEmpty()
  path?: string = '$';
}
