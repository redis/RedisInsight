import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AiQueryIntermediateStep } from 'src/modules/ai/query/models/ai-query.intermediate-step';
import { Default } from 'src/common/decorators';

export enum AiQueryMessageType {
  HumanMessage = 'HumanMessage',
  AiMessage = 'AIMessage',
}

export class AiQueryMessage {
  @ApiProperty({
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    enum: AiQueryMessageType,
  })
  @Expose()
  @IsEnum(AiQueryMessageType)
  @IsNotEmpty()
  type: AiQueryMessageType;

  @ApiProperty({
    type: String,
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  databaseId: string;

  @ApiProperty({
    type: String,
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  @Expose()
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @ApiProperty({
    type: String,
  })
  @Expose()
  @IsString()
  content: string = '';

  @ApiProperty({
    type: String,
    isArray: true,
  })
  @Expose()
  @Type(() => AiQueryIntermediateStep)
  @Default([])
  steps?: AiQueryIntermediateStep[] = [];

  @ApiProperty({
    type: Date,
  })
  @Expose()
  createdAt: Date;
}
