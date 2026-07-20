import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadImportFileByPathDto {
  @ApiProperty({
    type: 'string',
    description: 'Internal path to data file',
  })
  @IsString()
  @IsNotEmpty()
  path: string;
}

export class ImportVectorCollectionDto {
  @ApiProperty({
    type: 'string',
    description: 'Collection name to load vector data',
    example: 'bikes',
  })
  @IsString()
  @IsNotEmpty()
  collectionName: string;
}

export class ImportArrayCollectionDto {
  @ApiProperty({
    type: 'string',
    description: 'Collection name to load array data',
    example: 'temperature-readings',
  })
  @IsString()
  @IsNotEmpty()
  collectionName: string;
}
