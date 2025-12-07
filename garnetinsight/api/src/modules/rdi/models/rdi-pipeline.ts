import { IsObject, IsOptional } from 'class-validator';
import { Expose } from 'class-transformer';

export class RdiPipeline {
  @Expose()
  @IsOptional()
  @IsObject()
  // todo add validation
  jobs: { [key: string]: object };

  @Expose()
  @IsOptional()
  @IsObject()
  config: object;
}
