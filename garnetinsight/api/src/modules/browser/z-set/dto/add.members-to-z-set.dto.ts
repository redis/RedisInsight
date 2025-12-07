import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ZSetMemberDto } from './z-set-member.dto';

export class AddMembersToZSetDto extends KeyDto {
  @ApiProperty({
    description: 'ZSet members',
    isArray: true,
    type: ZSetMemberDto,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => ZSetMemberDto)
  members: ZSetMemberDto[];
}
