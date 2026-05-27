import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsDefined, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { KeyDto } from 'src/modules/browser/keys/dto';

export class DeleteArrayElementsDto extends KeyDto {
  @ApiProperty({
    description: 'Indices of the elements to delete.',
    type: Number,
    isArray: true,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Type(() => Number)
  indices: number[];
}
