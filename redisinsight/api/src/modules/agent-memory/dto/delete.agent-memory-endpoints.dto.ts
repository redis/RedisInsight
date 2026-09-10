import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class DeleteAgentMemoryEndpointsDto {
  @ApiProperty({
    description: 'Ids of agent memory endpoints to delete',
    type: String,
    isArray: true,
  })
  @Expose()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids: string[];
}
