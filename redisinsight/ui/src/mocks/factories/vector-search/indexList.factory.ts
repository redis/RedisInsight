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
  FieldTypes.GEO,
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
 * Uses randomized values via faker.
 */
export const exampleIndexListRows = {
  products: indexListRowFactory.build({
    id: `idx-${faker.string.alphanumeric(5)}`,
    name: `${faker.word.noun()}-idx`,
    prefixes: [`${faker.word.noun()}:`],
    fieldTypes: [FieldTypes.TEXT, FieldTypes.TAG, FieldTypes.NUMERIC],
    numDocs: faker.number.int({ min: 1000, max: 50000 }),
    numRecords: faker.number.int({ min: 10000, max: 100000 }),
    numTerms: faker.number.int({ min: 1000, max: 20000 }),
    numFields: faker.number.int({ min: 1, max: 5 }),
  }),
  users: indexListRowFactory.build({
    id: `idx-${faker.string.alphanumeric(5)}`,
    name: `${faker.word.noun()}-idx`,
    prefixes: [`${faker.word.noun()}:`, `${faker.word.noun()}:`],
    fieldTypes: [FieldTypes.TEXT, FieldTypes.VECTOR],
    numDocs: faker.number.int({ min: 1000, max: 50000 }),
    numRecords: faker.number.int({ min: 10000, max: 100000 }),
    numTerms: faker.number.int({ min: 1000, max: 20000 }),
    numFields: faker.number.int({ min: 1, max: 5 }),
  }),
  locations: indexListRowFactory.build({
    id: `idx-${faker.string.alphanumeric(5)}`,
    name: `${faker.word.noun()}-idx`,
    prefixes: [`${faker.word.noun()}:`],
    fieldTypes: [FieldTypes.GEO, FieldTypes.TEXT],
    numDocs: faker.number.int({ min: 1000, max: 50000 }),
    numRecords: faker.number.int({ min: 10000, max: 100000 }),
    numTerms: faker.number.int({ min: 1000, max: 20000 }),
    numFields: faker.number.int({ min: 1, max: 5 }),
  }),
  allFieldTypes: indexListRowFactory.build({
    id: `idx-${faker.string.alphanumeric(5)}`,
    name: `${faker.word.noun()}-idx`,
    prefixes: [`${faker.word.noun()}:`],
    fieldTypes: [
      FieldTypes.TEXT,
      FieldTypes.TAG,
      FieldTypes.NUMERIC,
      FieldTypes.GEO,
      FieldTypes.VECTOR,
    ],
    numDocs: faker.number.int({ min: 100, max: 1000 }),
    numRecords: faker.number.int({ min: 200, max: 2000 }),
    numTerms: faker.number.int({ min: 50, max: 500 }),
    numFields: faker.number.int({ min: 5, max: 8 }),
  }),
  empty: indexListRowFactory.build({
    id: `idx-${faker.string.alphanumeric(5)}`,
    name: `${faker.word.noun()}-idx`,
    prefixes: [`${faker.word.noun()}:`],
    fieldTypes: [FieldTypes.TEXT],
    numDocs: 0,
    numRecords: 0,
    numTerms: 0,
    numFields: faker.number.int({ min: 1, max: 3 }),
  }),
  noPrefix: indexListRowFactory.build({
    id: `idx-${faker.string.alphanumeric(5)}`,
    name: `${faker.word.noun()}-idx`,
    prefixes: [],
    fieldTypes: [FieldTypes.TEXT],
    numDocs: faker.number.int({ min: 100, max: 1000 }),
    numRecords: faker.number.int({ min: 200, max: 2000 }),
    numTerms: faker.number.int({ min: 50, max: 500 }),
    numFields: faker.number.int({ min: 1, max: 3 }),
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
