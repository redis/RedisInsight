import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import {
  IStatisticsInfoSection,
  IStatisticsBlocksSection,
  IStatisticsTableSection,
  RdiStatisticsViewType,
  StatisticsCellType,
} from 'uiSrc/slices/interfaces'

export const StatisticsInfoItemFactory = Factory.define<{
  label: string
  value: string
}>(() => ({
  label: faker.lorem.words(2),
  value: faker.lorem.word(),
}))

export const StatisticsInfoSectionFactory =
  Factory.define<IStatisticsInfoSection>(() => ({
    name: faker.lorem.words(2),
    view: RdiStatisticsViewType.Info,
    data: StatisticsInfoItemFactory.buildList(
      faker.number.int({ min: 1, max: 5 }),
    ),
  }))

export const StatisticsBlockItemFactory = Factory.define<{
  label: string
  value: number
  units: string
}>(() => ({
  label: faker.lorem.words(2),
  value: faker.number.float({ min: 0, max: 1000, fractionDigits: 2 }),
  units: faker.helpers.arrayElement(['Total', 'MB', 'ms', 'sec', 'records']),
}))

export const StatisticsBlocksSectionFactory =
  Factory.define<IStatisticsBlocksSection>(() => ({
    name: faker.lorem.words(2),
    view: RdiStatisticsViewType.Blocks,
    data: StatisticsBlockItemFactory.buildList(
      faker.number.int({ min: 1, max: 7 }),
    ),
  }))

export const StatisticsTableSectionFactory =
  Factory.define<IStatisticsTableSection>(() => {
    const columns = [
      { id: 'status', header: 'Status', type: StatisticsCellType.Status },
      { id: 'name', header: 'Name' },
      { id: 'host', header: 'Host' },
    ]

    return {
      name: faker.lorem.words(2),
      view: RdiStatisticsViewType.Table,
      columns,
      data: Array.from(
        { length: faker.number.int({ min: 1, max: 5 }) },
        () => ({
          status: faker.helpers.arrayElement([
            'connected',
            'not yet used',
            'disconnected',
          ]),
          name: faker.lorem.word(),
          host: `${faker.internet.ip()}:${faker.internet.port()}`,
        }),
      ),
    }
  })
