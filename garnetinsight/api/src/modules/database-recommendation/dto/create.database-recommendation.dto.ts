import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRecommendationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  constructor(dto: CreateRecommendationDto) {
    Object.assign(this, dto);
  }
}
