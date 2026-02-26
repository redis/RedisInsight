import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import {
  IndexField,
  IndexFieldValue,
} from 'uiSrc/pages/vector-search/components/index-details'

export const generateValueForType = (type: FieldTypes): IndexFieldValue => {
  switch (type) {
    case FieldTypes.TEXT:
      return faker.lorem.words({ min: 1, max: 5 })
    case FieldTypes.TAG:
      return faker.lorem.word()
    case FieldTypes.NUMERIC:
      return faker.number.float({ min: 0, max: 1000, fractionDigits: 2 })
    case FieldTypes.VECTOR:
      return `[${Array.from({ length: 4 }, () =>
        faker.number.float({ min: -1, max: 1, fractionDigits: 4 }),
      ).join(', ')}]`
    case FieldTypes.GEO:
      return `${faker.location.latitude()}, ${faker.location.longitude()}`
    case FieldTypes.GEOSHAPE:
      return `POINT(${faker.location.longitude()} ${faker.location.latitude()})`
    default:
      return faker.lorem.words({ min: 1, max: 5 })
  }
}

export const indexFieldFactory = Factory.define<IndexField>(({ params }) => {
  const type = params.type ?? faker.helpers.enumValue(FieldTypes)

  return {
    id: faker.string.uuid(),
    name: faker.database.column(),
    value: generateValueForType(type),
    type,
  }
})
