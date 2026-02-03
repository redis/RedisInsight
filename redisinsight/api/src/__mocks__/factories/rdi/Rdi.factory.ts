import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { Rdi, RdiClientMetadata } from 'src/modules/rdi/models';

export const RdiFactory = Factory.define<Rdi>(() => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  url: faker.internet.url(),
  username: faker.internet.userName(),
  password: faker.internet.password(),
  version: faker.system.semver(),
  lastConnection: faker.date.past(),
}));

export const RdiClientMetadataFactory = Factory.define<RdiClientMetadata>(
  () => ({
    sessionMetadata: undefined,
    id: faker.string.uuid(),
  }),
);
