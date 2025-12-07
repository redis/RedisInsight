import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

export class DeleteStreamEntriesDto extends KeyDto {
  @ApiProperty({
    description: 'Entries IDs',
    type: String,
    isArray: true,
    example: ['1650985323741-0', '1650985323770-0'],
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => String)
  entries: string[];
}
