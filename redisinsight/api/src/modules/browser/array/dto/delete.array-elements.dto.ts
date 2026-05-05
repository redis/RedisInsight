import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsDefined, Validate } from 'class-validator';
import { KeyDto } from 'src/modules/browser/keys/dto';
import { IsArrayIndexConstraint } from './array-index.validation';

export class DeleteArrayElementsDto extends KeyDto {
  @ApiProperty({
    description: 'Array element indexes to remove.',
    type: String,
    isArray: true,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @Validate(IsArrayIndexConstraint, { each: true })
  indexes: string[];
}
