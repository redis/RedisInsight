import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, Validate } from 'class-validator';
import { KeyDto } from 'src/modules/browser/keys/dto';
import { IsArrayIndexConstraint } from './array-index.validation';

export class GetArrayElementDto extends KeyDto {
  @ApiProperty({
    description: 'Array element index as an unsigned 64-bit decimal string.',
    type: String,
    example: '0',
  })
  @IsDefined()
  @Validate(IsArrayIndexConstraint)
  index: string;
}
