import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { VectorSearchBox } from 'uiSrc/components/new-index/create-index-step/field-box/types'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

export const vectorSearchBoxFactory = Factory.define<VectorSearchBox>(() => ({
  value: faker.string.alpha({ length: { min: 5, max: 12 } }),
  label: faker.word.noun(),
  text: faker.lorem.sentence(),
  tag: faker.helpers.enumValue(FieldTypes),
  disabled: faker.datatype.boolean(),
}))
