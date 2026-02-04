import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class ImportAzureDatabaseDto {
  @ApiProperty({
    description: 'Azure resource ID of the database',
    type: String,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  id: string;
}
