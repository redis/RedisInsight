import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ListElementDestination } from './push.element-to-list.dto';

export class DeleteListElementsDto extends KeyDto {
  @ApiProperty({
    description:
      'In order to remove last elements of the list, use the TAIL value, else HEAD value',
    default: ListElementDestination.Tail,
    enum: ListElementDestination,
  })
  @IsDefined()
  @IsEnum(ListElementDestination, {
    message: `destination must be a valid enum value. Valid values: ${Object.values(
      ListElementDestination,
    )}.`,
  })
  destination: ListElementDestination;

  @ApiProperty({
    description: 'Specifying the number of elements to remove from list.',
    type: Number,
    minimum: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsNotEmpty()
  count: number;
}
