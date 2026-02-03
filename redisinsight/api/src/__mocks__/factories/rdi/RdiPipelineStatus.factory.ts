import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import {
  ComponentStatus,
  PipelineStatus,
  PipelineState,
  RdiPipelineStatus,
} from 'src/modules/rdi/models';
import { GetStatusResponse as V1GetStatusResponse } from 'src/modules/rdi/client/api/v1/responses';
import { GetStatusResponse as V2GetStatusResponse } from 'src/modules/rdi/client/api/v2/responses';
import { PipelineResponses } from 'src/modules/rdi/client/api/v2/responses';

// ============ Domain Models ============

export const ComponentStatusFactory = Factory.define<ComponentStatus>(() => ({
  name: faker.helpers.arrayElement([
    'processor',
    'collector-source',
    'coordinator',
  ]),
  type: faker.helpers.arrayElement([
    'stream-processor',
    'cdc-collector',
    'coordinator',
  ]),
  status: faker.helpers.arrayElement(['started', 'running', 'stopped']),
  version: faker.system.semver(),
  errors: [],
}));

export const RdiPipelineStatusFactory = Factory.define<RdiPipelineStatus>(
  () => ({
    status: faker.helpers.arrayElement(Object.values(PipelineStatus)),
    state: faker.helpers.arrayElement(Object.values(PipelineState)),
    errors: [],
    components: ComponentStatusFactory.buildList(
      faker.number.int({ min: 1, max: 3 }),
    ),
  }),
);

// ============ V1 API Response ============

export const V1CollectorSourceFactory = Factory.define<
  V1GetStatusResponse['components']['collector-source']
>(() => ({
  status: faker.helpers.arrayElement(['ready', 'running', 'stopped']),
  connected: faker.datatype.boolean(),
  version: faker.system.semver(),
}));

export const V1ProcessorFactory = Factory.define<
  V1GetStatusResponse['components']['processor']
>(() => ({
  status: faker.helpers.arrayElement(['ready', 'running', 'stopped']),
  version: faker.system.semver(),
}));

export const V1PipelineDefaultFactory = Factory.define<
  V1GetStatusResponse['pipelines']['default']
>(() => ({
  status: faker.helpers.arrayElement(['ready', 'not-ready', 'stopped']),
  state: faker.helpers.arrayElement(['cdc', 'initial-sync', 'not-running']),
  tasks: [],
}));

export const V1PipelineStatusApiResponseFactory =
  Factory.define<V1GetStatusResponse>(() => ({
    components: {
      'collector-source': V1CollectorSourceFactory.build(),
      processor: V1ProcessorFactory.build(),
    },
    pipelines: {
      default: V1PipelineDefaultFactory.build(),
    },
  }));

// ============ V2 API Responses ============

export const V2ComponentStatusFactory = Factory.define<
  V2GetStatusResponse['components'][number]
>(() => ({
  name: faker.helpers.arrayElement(['processor', 'coordinator']),
  type: faker.helpers.arrayElement(['stream-processor', 'coordinator']),
  version: faker.system.semver(),
  status: faker.helpers.arrayElement(['running', 'stopped']),
  errors: [],
  metric_collections: [],
}));

export const V2PipelineStatusApiResponseFactory =
  Factory.define<V2GetStatusResponse>(() => ({
    status: faker.helpers.arrayElement(['started', 'stopped', 'error']),
    errors: [],
    components: V2ComponentStatusFactory.buildList(1),
    current: true,
  }));

export const V2PipelineInfoFactory = Factory.define<PipelineResponses>(() => ({
  name: faker.lorem.slug(),
  active: faker.datatype.boolean(),
  config: {},
  status: faker.helpers.arrayElement(['started', 'stopped']),
  errors: [],
  components: [],
  current: true,
}));
