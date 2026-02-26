import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import {
  QueryLibraryItem,
  QueryLibraryType,
  CreateQueryLibraryItem,
  SeedQueryLibraryItem,
} from 'uiSrc/services/query-library/types'

export const queryLibraryItemFactory = Factory.define<QueryLibraryItem>(() => ({
  id: faker.string.uuid(),
  databaseId: faker.string.uuid(),
  indexName: `idx:${faker.word.noun()}`,
  type: faker.helpers.enumValue(QueryLibraryType),
  name: faker.lorem.words(3),
  description: faker.lorem.sentence(),
  query: `FT.SEARCH ${faker.word.noun()} "*"`,
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
}))

export const createQueryLibraryItemFactory =
  Factory.define<CreateQueryLibraryItem>(() => {
    const { indexName, name, query } = queryLibraryItemFactory.build()
    return { indexName, name, query }
  })

export const seedQueryLibraryItemFactory = Factory.define<SeedQueryLibraryItem>(
  () => {
    const { indexName, name, description, query } =
      queryLibraryItemFactory.build()
    return { indexName, name, description, query }
  },
)
