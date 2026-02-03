import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import {
  RdiPipeline,
  RdiStatisticsData,
  RdiStatisticsViewType,
} from 'src/modules/rdi/models';
import { RdiDryRunJobDto } from 'src/modules/rdi/dto';

export const RdiPipelineFactory = Factory.define<RdiPipeline>(() => ({
  jobs: { [faker.lorem.slug()]: {} },
  config: {},
}));

export const RdiDryRunJobFactory = Factory.define<RdiDryRunJobDto>(() => ({
  input_data: {},
  job: {},
}));

export const RdiStatisticsDataFactory = Factory.define<RdiStatisticsData>(
  () => ({
    sections: [
      {
        name: faker.lorem.words(2),
        view: RdiStatisticsViewType.Info,
        data: [{ label: faker.lorem.word(), value: faker.lorem.word() }],
      },
    ],
  }),
);
