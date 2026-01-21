import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { Expose } from 'class-transformer';

export interface ISessionMetadata {
  userId: string;
  accountId: string;
  sessionId: string;
  uniqueId?: string;
}

export class SessionMetadata implements ISessionMetadata {
  @Expose()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  accountId: string;

  @Expose()
  @IsObject()
  data?: Record<string, any> = {};

  @Expose({ groups: ['security'] })
  @IsObject()
  @IsOptional()
  requestMetadata?: Record<string, any> = {};

  @Expose()
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @Expose()
  @IsOptional()
  @IsString()
  uniqueId?: string;

  @Expose()
  @IsOptional()
  @IsString()
  correlationId?: string;

  /**
   * Validates session metadata required properties to be defined
   * Must be used in all the places that works with clients
   * @param sessionMetadata
   */
  static validate(sessionMetadata: SessionMetadata) {
    if (
      !sessionMetadata?.sessionId ||
      !sessionMetadata?.userId ||
      !sessionMetadata?.accountId
    ) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_SESSION_METADATA);
    }
  }
}

export class Session {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any> = {};
}
