import { IsNotEmpty, IsString } from 'class-validator';

export class BulkActionIdDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
