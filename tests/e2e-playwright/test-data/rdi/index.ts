import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { RdiInstanceData, RdiPipelineData } from 'e2eSrc/types';

/**
 * Test prefix for RDI resources
 */
export const TEST_RDI_PREFIX = 'test-rdi-';

/**
 * RDI version the faked instance reports. 2.2.0 is the first version with
 * multiple pipelines per instance, and is above the v2 page's 1.16.0 minimum.
 */
export const RDI_MULTI_PIPELINE_VERSION = '2.2.0';

/**
 * Feature flags that put an RDI instance on the v2 pipeline page:
 * `redisDataIntegration` shows the RDI tab, `dev-rdiUi` turns on the v2 page.
 * Use with test.use({ featureFlags: RDI_V2_FEATURE_FLAGS }).
 */
export const RDI_V2_FEATURE_FLAGS = {
  redisDataIntegration: true,
  'dev-rdiUi': true,
};

const lowerAlpha = (length: number): string => faker.string.alpha({ length, casing: 'lower' });

/**
 * RDI instance factory.
 *
 * Each build gets its own id, so rdi-ui's per-instance UI drafts (kept in
 * localStorage) never leak between tests that share a browser.
 */
export const RdiInstanceFactory = Factory.define<RdiInstanceData>(() => ({
  id: faker.string.uuid(),
  name: `${TEST_RDI_PREFIX}${lowerAlpha(8)}`,
  url: `https://${faker.internet.domainWord()}.example.test`,
  username: 'default',
  version: RDI_MULTI_PIPELINE_VERSION,
  lastConnection: faker.date.recent().toISOString(),
}));

/**
 * RDI pipeline factory: a deployed pipeline with one PostgreSQL source and a
 * Redis target
 */
export const RdiPipelineFactory = Factory.define<RdiPipelineData>(() => ({
  name: `test-${lowerAlpha(8)}`,
  status: 'started',
  source: {
    name: `pg-${lowerAlpha(6)}`,
    type: 'postgresql',
    host: `${faker.internet.domainWord()}.example.test`,
    port: 5432,
    database: lowerAlpha(8),
  },
  target: {
    host: `${faker.internet.domainWord()}.example.test`,
    port: faker.internet.port(),
  },
}));
