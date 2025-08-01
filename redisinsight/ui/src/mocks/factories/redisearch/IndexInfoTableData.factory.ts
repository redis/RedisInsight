import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { IndexInfoTableData } from 'uiSrc/pages/vector-search/manage-indexes/IndexAttributesList'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

export const INDEX_INFO_SEPARATORS: string[] = [',', ';', '|', ':']

type IndexInfoTableDataFactoryTransientParams = {
  includeWeight?: boolean
  includeSeparator?: boolean
}

export const indexInfoTableDataFactory = Factory.define<
  IndexInfoTableData,
  IndexInfoTableDataFactoryTransientParams
>(({ transientParams }) => {
  const {
    includeWeight = faker.datatype.boolean(),
    includeSeparator = faker.datatype.boolean(),
  } = transientParams

  return {
    attribute: faker.word.sample(),
    type: faker.helpers.enumValue(FieldTypes).toString(),

    // Optional fields
    ...(includeWeight && {
      weight: faker.number
        .float({ min: 0.1, max: 10, fractionDigits: 1 })
        .toString(),
    }),
    ...(includeSeparator && {
      separator: faker.helpers.arrayElement(INDEX_INFO_SEPARATORS),
    }),
  }
})
