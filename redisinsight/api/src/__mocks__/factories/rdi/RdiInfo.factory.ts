import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { RdiInfo } from 'src/modules/rdi/models';

export const RdiInfoFactory = Factory.define<RdiInfo>(() => ({
  version: faker.system.semver(),
}));

// V2 API Info response factory
export const V2RdiInfoApiResponseFactory = Factory.define<{ version: string }>(
  () => ({
    version: faker.system.semver(),
  }),
);
