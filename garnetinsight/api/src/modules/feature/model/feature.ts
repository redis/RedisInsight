import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class Feature {
  @Expose()
  name: string;

  @Expose()
  flag: boolean;

  @Expose()
  strategy?: string;

  @Expose()
  data?: any;
}

export class FeaturesFlags {
  @ApiProperty({
    description: 'Control number for A/B testing',
    type: Number,
  })
  @Expose()
  controlNumber: number;

  @ApiProperty({
    description: 'Control group (bucket)',
    type: String,
  })
  @Expose()
  controlGroup: string;

  @ApiProperty({
    description: 'Features map',
    type: Object,
    example: {
      flagName: {
        name: 'flagName',
        flag: true,
        strategy: 'strategyName',
        data: { any: 'data' },
      },
    },
  })
  @Expose()
  features: Record<string, Feature>;
}
