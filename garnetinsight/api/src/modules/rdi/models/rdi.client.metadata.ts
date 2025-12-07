import { SessionMetadata } from 'src/common/models/session';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class RdiClientMetadata {
  @IsNotEmpty()
  @Type(() => SessionMetadata)
  sessionMetadata: SessionMetadata;

  @IsNotEmpty()
  @IsString()
  id: string;
}
