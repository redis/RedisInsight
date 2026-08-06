import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

const SESSION_EVENT_ROLES = ['user', 'assistant', 'system', 'tool'] as const;

export class AddSessionEventDto {
  @ApiProperty({
    description: 'Message role',
    enum: SESSION_EVENT_ROLES,
  })
  @Expose()
  @IsIn(SESSION_EVENT_ROLES)
  role: string;

  @ApiProperty({
    description: 'Message content',
    type: String,
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  content: string;
}
