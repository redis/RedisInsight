import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsInt()
  timestamp: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  categoryColor?: string;

  @IsNotEmpty()
  @IsString()
  body: string;

  constructor(dto: Partial<CreateNotificationDto>) {
    Object.assign(this, dto);
  }
}
