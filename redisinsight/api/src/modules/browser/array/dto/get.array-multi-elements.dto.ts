import { ApiProperty } from '@nestjs/swagger';
import { KeyDto } from 'src/modules/browser/keys/dto';
import { IsArrayIndex } from 'src/common/decorators';
import { ArrayMinSize, IsArray } from 'class-validator';

export class GetArrayMultiElementsDto extends KeyDto {
  @ApiProperty({
    description:
      'Indexes to read. Each index is an unsigned 64-bit integer as string.',
    type: String,
    isArray: true,
    example: ['0', '5', '42'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsArrayIndex({ each: true })
  indexes: string[];
}
