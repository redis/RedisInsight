import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmptyObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ZSetMemberDto } from './z-set-member.dto';

export class UpdateMemberInZSetDto extends KeyDto {
  @ApiProperty({
    description: 'ZSet member',
    type: ZSetMemberDto,
  })
  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => ZSetMemberDto)
  member: ZSetMemberDto;
}
