import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import {
  IndexInfo,
  IndexAttribute,
  IndexDefinition,
  IndexOptions,
} from 'uiSrc/pages/vector-search/hooks/useIndexInfo'

/**
 * Factory for frontend IndexAttribute type.
 * Field types are already normalized (lowercase).
 */
export const indexAttributeFactory = Factory.define<IndexAttribute>(
  ({ transientParams }) => {
    const name = faker.word.noun()
    const { includeWeight = faker.datatype.boolean() } = transientParams as {
      includeWeight?: boolean
    }

    return {
      identifier: `$.${name}`,
      attribute: name,
      type: faker.helpers.enumValue(FieldTypes),
      ...(includeWeight && {
        weight: faker.number
          .float({ min: 0.1, max: 10, fractionDigits: 1 })
          .toString(),
      }),
    }
  },
)

/**
 * Factory for frontend IndexDefinition type.
 */
export const indexDefinitionFactory = Factory.define<IndexDefinition>(() => ({
  keyType: faker.helpers.arrayElement(['HASH', 'JSON']),
  prefixes: [`${faker.word.noun()}:`],
}))

/**
 * Factory for frontend IndexOptions type.
 */
export const indexOptionsFactory = Factory.define<IndexOptions>(() => ({
  filter: faker.datatype.boolean()
    ? `@status == "${faker.word.noun()}"`
    : undefined,
  defaultLang: faker.datatype.boolean()
    ? faker.helpers.arrayElement(['english', 'german', 'french', 'spanish'])
    : undefined,
}))

/**
 * Factory for frontend IndexInfo type (decoupled from backend DTO).
 * Used for component tests and Storybook.
 */
export const indexInfoFactory = Factory.define<IndexInfo>(() => ({
  indexDefinition: indexDefinitionFactory.build(),
  indexOptions: indexOptionsFactory.build(),
  attributes: indexAttributeFactory.buildList(3),
  numDocs: faker.number.int({ min: 0, max: 100 }),
  maxDocId: faker.number.int({ min: 101, max: 200 }),
  numRecords: faker.number.int({ min: 301, max: 400 }),
  numTerms: faker.number.int({ min: 201, max: 300 }),
}))
