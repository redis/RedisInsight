import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { QueryLibraryItem } from '../models/query-library';
import { QueryLibraryType } from '../models/query-library-type.enum';
import { QueryLibraryEntity } from '../entities/query-library.entity';
import { CreateQueryLibraryItemDto } from '../dto/create-query-library-item.dto';
import { SeedQueryLibraryItemDto } from '../dto/seed-query-library-item.dto';

export const queryLibraryItemFactory = Factory.define<QueryLibraryItem>(() => ({
  id: faker.string.uuid(),
  databaseId: faker.string.uuid(),
  indexName: `idx:${faker.word.noun()}_vss`,
  type: faker.helpers.enumValue(QueryLibraryType),
  name: faker.lorem.words(3),
  description: faker.lorem.sentence(),
  query: `FT.SEARCH idx:${faker.word.noun()} "*"`,
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
}));

export const queryLibraryEntityFactory = Factory.define<QueryLibraryEntity>(
  () => ({
    ...queryLibraryItemFactory.build(),
    database: undefined,
    encryption: null,
  }),
);

export const createQueryLibraryItemDtoFactory =
  Factory.define<CreateQueryLibraryItemDto>(() => {
    const { indexName, name, query } = queryLibraryItemFactory.build();

    return { indexName, name, query };
  });

export const seedQueryLibraryItemDtoFactory =
  Factory.define<SeedQueryLibraryItemDto>(() => {
    const { indexName, name, description, query } =
      queryLibraryItemFactory.build();

    return { indexName, name, description, query };
  });
