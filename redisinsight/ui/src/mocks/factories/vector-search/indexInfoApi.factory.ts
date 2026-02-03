import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import {
  IndexInfoDto,
  IndexAttibuteDto,
  IndexDefinitionDto,
  IndexOptionsDto,
} from 'apiSrc/modules/browser/redisearch/dto/index.info.dto'

/**
 * Factory for API attribute response (snake_case, uppercase types).
 */
export const indexInfoApiAttributeFactory = Factory.define<IndexAttibuteDto>(
  ({ transientParams }) => {
    const name = faker.word.noun()
    const { includeWeight = faker.datatype.boolean() } = transientParams as {
      includeWeight?: boolean
    }

    return {
      identifier: `$.${name}`,
      attribute: name,
      // API returns uppercase types
      type: faker.helpers.enumValue(FieldTypes).toUpperCase(),
      ...(includeWeight && {
        WEIGHT: faker.number
          .float({ min: 0.1, max: 10, fractionDigits: 1 })
          .toString(),
      }),
    }
  },
)

/**
 * Factory for API index definition response.
 */
export const indexInfoApiDefinitionFactory = Factory.define<IndexDefinitionDto>(
  () => ({
    key_type: faker.helpers.arrayElement(['HASH', 'JSON']),
    prefixes: [`${faker.word.noun()}:`],
    default_score: '1',
  }),
)

/**
 * Factory for API index options response.
 */
export const indexInfoApiOptionsFactory = Factory.define<IndexOptionsDto>(
  () => ({}),
)

/**
 * Factory for API index info response (snake_case properties).
 * Mimics the actual API response format - num_docs etc. are strings.
 */
export const indexInfoApiResponseFactory = Factory.define<IndexInfoDto>(() => ({
  index_name: `idx:${faker.word.noun()}`,
  index_definition: indexInfoApiDefinitionFactory.build(),
  index_options: indexInfoApiOptionsFactory.build(),
  attributes: indexInfoApiAttributeFactory.buildList(3),
  num_docs: faker.number.int({ min: 0, max: 100 }).toString(),
  max_doc_id: faker.number.int({ min: 101, max: 200 }).toString(),
  num_records: faker.number.int({ min: 301, max: 400 }).toString(),
  num_terms: faker.number.int({ min: 201, max: 300 }).toString(),
}))
