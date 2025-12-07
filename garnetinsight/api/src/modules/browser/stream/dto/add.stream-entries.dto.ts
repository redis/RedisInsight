import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StreamEntryDto } from './stream-entry.dto';

export class AddStreamEntriesDto extends KeyDto {
  @ApiProperty({
    description: 'Entries to push',
    type: StreamEntryDto,
    isArray: true,
    example: [
      {
        id: '*',
        fields: [
          { name: 'field1', value: 'value1' },
          { name: 'field2', value: 'value2' },
        ],
      },
      {
        id: '*',
        fields: [
          { name: 'field1', value: 'value1' },
          { name: 'field2', value: 'value2' },
        ],
      },
    ],
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => StreamEntryDto)
  entries: StreamEntryDto[];
}
