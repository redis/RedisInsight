import { parseSearchRawResponse, parseAggregateRawResponse } from '..'

const resultFTSearch: any[] = [
  'red:2',
  [
    'title',
    'Redis Labs',
    'body',
    'Primary and caching',
    'url',
    '<https://redis.com/primary-caching>',
    'visits',
    '108',
  ],
  'red:1',
  [
    'title',
    'Redis Labs',
    'body',
    'Primary and caching',
    'url',
    '<https://redis.com/primary-caching>',
    'visits',
    '108',
  ],
]

const resultFTSearchNoContent: any[] = [
  'red:2',
  'red:3',
  'red:4',
  'red:5',
  'red:6',
]

describe('parseSearchRawResponse', () => {
  it('command "get" should return result is not modified 1', () => {
    const command = 'get'
    const result: any[] = []

    expect(parseSearchRawResponse(command, result)).toEqual(result)
  })

  it('command "get" should return result is not modified 2', () => {
    const command = 'get'
    const result: any = []

    expect(parseSearchRawResponse(command, result)).toEqual(result)
  })

  it('command "ft.search" should return array with parsed object', () => {
    const command = 'ft.search'
    const parsedResultFTSearch = [
      {
        Doc: 'red:2',
        body: 'Primary and caching',
        title: 'Redis Labs',
        url: '<https://redis.com/primary-caching>',
        visits: '108',
      },
      {
        Doc: 'red:1',
        body: 'Primary and caching',
        title: 'Redis Labs',
        url: '<https://redis.com/primary-caching>',
        visits: '108',
      },
    ]

    expect(parseSearchRawResponse(command, resultFTSearch)).toEqual(
      parsedResultFTSearch,
    )
  })

  it('command "ft.search" with attr NOCONTENT should return array of doc names', () => {
    const command = 'ft.search NOCONTENT'
    const parsedResultFTSearch = [
      {
        Doc: 'red:2',
      },
      {
        Doc: 'red:3',
      },
      {
        Doc: 'red:4',
      },
      {
        Doc: 'red:5',
      },
      {
        Doc: 'red:6',
      },
    ]

    expect(parseSearchRawResponse(command, resultFTSearchNoContent)).toEqual(
      parsedResultFTSearch,
    )
  })
})

describe('parseAggregateRawResponse', () => {
  it('command "ft.aggregate" should return array of array with objects count of docs ', () => {
    const resultFTAggregate = [[], [], [], [], []]

    expect(parseAggregateRawResponse(resultFTAggregate)).toEqual(
      resultFTAggregate,
    )
  })
})
