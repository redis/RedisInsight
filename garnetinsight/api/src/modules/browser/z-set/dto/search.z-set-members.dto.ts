import { ApiProperty, PickType } from '@nestjs/swagger';
import { ScanDataTypeDto } from 'src/modules/browser/keys/dto';
import { IsDefined, IsString } from 'class-validator';

export class SearchZSetMembersDto extends PickType(ScanDataTypeDto, [
  'keyName',
  'count',
  'cursor',
] as const) {
  @ApiProperty({
    description: 'Iterate only elements matching a given pattern.',
    type: String,
    default: '*',
  })
  @IsDefined()
  @IsString()
  match: string;
}
