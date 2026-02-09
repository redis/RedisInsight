import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { IndexListRow } from 'uiSrc/pages/vector-search/components/indexes-list/IndexesList.types'

const FIELD_TYPES = [
  FieldTypes.TEXT,
  FieldTypes.TAG,
  FieldTypes.NUMERIC,
  FieldTypes.GEO,
  FieldTypes.VECTOR,
]

/**
 * Factory for IndexListRow type.
 * Used for component tests and Storybook.
 */
export const indexListRowFactory = Factory.define<IndexListRow>(
  ({ sequence }) => {
    const numFields = faker.number.int({ min: 1, max: 8 })
    const fieldTypes = faker.helpers.arrayElements(
      FIELD_TYPES,
      faker.number.int({
        min: 1,
        max: Math.min(numFields, FIELD_TYPES.length),
      }),
    )

    return {
      id: `idx-${sequence}`,
      name: `${faker.word.noun()}-${faker.word.noun()}-idx`,
      prefixes: faker.helpers.arrayElements(
        [
          `${faker.word.noun()}:`,
          `${faker.word.noun()}:`,
          `${faker.word.noun()}:`,
        ],
        faker.number.int({ min: 0, max: 3 }),
      ),
      fieldTypes,
      numDocs: faker.number.int({ min: 0, max: 1000000 }),
      numRecords: faker.number.int({ min: 0, max: 5000000 }),
      numTerms: faker.number.int({ min: 0, max: 500000 }),
      numFields,
    }
  },
)

/**
 * Pre-defined example rows for consistent test assertions.
 */
export const exampleIndexListRows = {
  products: indexListRowFactory.build({
    id: 'idx-products',
    name: 'products-idx',
    prefixes: ['product:'],
    fieldTypes: [FieldTypes.TEXT, FieldTypes.TAG, FieldTypes.NUMERIC],
    numDocs: 10000,
    numRecords: 50000,
    numTerms: 5000,
    numFields: 3,
  }),
  users: indexListRowFactory.build({
    id: 'idx-users',
    name: 'users-idx',
    prefixes: ['user:', 'account:'],
    fieldTypes: [FieldTypes.TEXT, FieldTypes.VECTOR],
    numDocs: 20000,
    numRecords: 80000,
    numTerms: 10000,
    numFields: 2,
  }),
  locations: indexListRowFactory.build({
    id: 'idx-locations',
    name: 'locations-idx',
    prefixes: ['loc:'],
    fieldTypes: [FieldTypes.GEO, FieldTypes.TEXT],
    numDocs: 5000,
    numRecords: 25000,
    numTerms: 3000,
    numFields: 2,
  }),
  allFieldTypes: indexListRowFactory.build({
    id: 'idx-all',
    name: 'all-types-idx',
    prefixes: ['all:'],
    fieldTypes: [
      FieldTypes.TEXT,
      FieldTypes.TAG,
      FieldTypes.NUMERIC,
      FieldTypes.GEO,
      FieldTypes.VECTOR,
    ],
    numDocs: 500,
    numRecords: 1000,
    numTerms: 200,
    numFields: 5,
  }),
  empty: indexListRowFactory.build({
    id: 'idx-empty',
    name: 'empty-idx',
    prefixes: ['empty:'],
    fieldTypes: [FieldTypes.TEXT],
    numDocs: 0,
    numRecords: 0,
    numTerms: 0,
    numFields: 1,
  }),
  noPrefix: indexListRowFactory.build({
    id: 'idx-noprefix',
    name: 'noprefix-idx',
    prefixes: [],
    fieldTypes: [FieldTypes.TEXT],
    numDocs: 100,
    numRecords: 200,
    numTerms: 50,
    numFields: 1,
  }),
}

/**
 * Default mock data list for tests.
 */
export const mockIndexListData: IndexListRow[] = [
  exampleIndexListRows.products,
  exampleIndexListRows.users,
  exampleIndexListRows.locations,
]
