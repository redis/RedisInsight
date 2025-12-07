/* eslint-disable max-len */
import { isRediStack } from 'uiSrc/utils'

const unmapWithName = (arr: any[]) => arr.map((item) => ({ name: item }))

const isRediStackTests = [
  {
    input: [
      unmapWithName(['bf', 'timeseries', 'ReJSON', 'searchlight']),
      '6.2.5',
    ],
    expected: true,
  },
  {
    input: [unmapWithName(['bf', 'timeseries', 'ReJSON', 'search']), '6.2.5'],
    expected: true,
  },
  {
    input: [
      unmapWithName(['bf', 'timeseries', 'ReJSON', 'search', 'searchlight']),
      '6.2.5',
    ],
    expected: false,
  },
  {
    input: [
      unmapWithName(['bf', 'timeseries', 'ReJSON', 'searchlight', 'graph']),
      '6.2.5',
    ],
    expected: true,
  },
  {
    input: [
      unmapWithName(['bf', 'timeseries', 'ReJSON', 'search', 'graph']),
      '6.2.5',
    ],
    expected: true,
  },
  {
    input: [
      unmapWithName(['bf', 'timeseries', 'ReJSON', 'search', 'redisgears']),
      '6.2.5',
    ],
    expected: true,
  },
  {
    input: [
      unmapWithName([
        'bf',
        'timeseries',
        'ReJSON',
        'searchlight',
        'redisgears',
      ]),
      '6.2.5',
    ],
    expected: true,
  },
  {
    input: [
      unmapWithName(['bf', 'timeseries', 'ReJSON', 'search', 'redisgears_2']),
      '6.2.5',
    ],
    expected: true,
  },
  {
    input: [
      unmapWithName([
        'bf',
        'timeseries',
        'ReJSON',
        'searchlight',
        'redisgears_2',
      ]),
      '6.2.5',
    ],
    expected: true,
  },
  {
    input: [
      unmapWithName([
        'bf',
        'timeseries',
        'ReJSON',
        'searchlight',
        'search',
        'redisgears_2',
      ]),
      '6.2.5',
    ],
    expected: false,
  },
  {
    input: [
      unmapWithName([
        'bf',
        'timeseries',
        'ReJSON',
        'searchlight',
        'graph',
        'redisgears_2',
      ]),
      '6.2.5',
    ],
    expected: false,
  },
  {
    input: [
      unmapWithName([
        'bf',
        'timeseries',
        'ReJSON',
        'search',
        'graph',
        'redisgears_2',
      ]),
      '6.2.5',
    ],
    expected: false,
  },
  {
    input: [
      unmapWithName([
        'bf',
        'timeseries',
        'ReJSON',
        'searchlight',
        'graph',
        'redisgears',
      ]),
      '6.2.5',
    ],
    expected: false,
  },
  {
    input: [
      unmapWithName([
        'bf',
        'timeseries',
        'ReJSON',
        'search',
        'graph',
        'redisgears',
      ]),
      '6.2.5',
    ],
    expected: false,
  },
  {
    input: [
      unmapWithName([
        'bf',
        'timeseries',
        'ReJSON',
        'search',
        'graph',
        'redisgears',
        'redisgears_2',
      ]),
      '6.2.5',
    ],
    expected: false,
  },
  {
    input: [
      unmapWithName(['bf', 'timeseries', 'ReJSON', 'searchlight', 'custom']),
      '6.2.5',
    ],
    expected: false,
  },
  {
    input: [
      unmapWithName([
        'bf',
        'timeseries',
        'ReJSON',
        'searchlight',
        'graph',
        'custom',
      ]),
      '6.2.5',
    ],
    expected: false,
  },
  {
    input: [
      unmapWithName([
        'bf',
        'timeseries',
        'ReJSON',
        'searchlight',
        'graph',
        'redisgears',
        'custom',
      ]),
      '6.2.5',
    ],
    expected: false,
  },

  {
    input: [unmapWithName(['bf', 'timeseries', 'ReJSON', 'searchlight']), null],
    expected: true,
  },
  {
    input: [unmapWithName(['bf', 'timeseries', 'ReJSON', 'search']), null],
    expected: true,
  },
  {
    input: [
      unmapWithName(['bf', 'timeseries', 'ReJSON', 'search', 'searchlight']),
      null,
    ],
    expected: false,
  },
  {
    input: [
      unmapWithName(['bf', 'timeseries', 'ReJSON', 'searchlight', 'graph']),
      null,
    ],
    expected: true,
  },
  {
    input: [
      unmapWithName(['bf', 'timeseries', 'ReJSON', 'search', 'graph']),
      null,
    ],
    expected: true,
  },
  {
    input: [
      unmapWithName(['bf', 'timeseries', 'ReJSON', 'search', 'redisgears']),
      null,
    ],
    expected: true,
  },
  {
    input: [
      unmapWithName([
        'bf',
        'timeseries',
        'ReJSON',
        'searchlight',
        'redisgears',
      ]),
      null,
    ],
    expected: true,
  },
  {
    input: [
      unmapWithName(['bf', 'timeseries', 'ReJSON', 'search', 'redisgears_2']),
      null,
    ],
    expected: true,
  },
  {
    input: [
      unmapWithName([
        'bf',
        'timeseries',
        'ReJSON',
        'searchlight',
        'redisgears_2',
      ]),
      null,
    ],
    expected: true,
  },
  {
    input: [
      unmapWithName([
        'bf',
        'timeseries',
        'ReJSON',
        'searchlight',
        'search',
        'redisgears_2',
      ]),
      null,
    ],
    expected: false,
  },
  {
    input: [
      unmapWithName([
        'bf',
        'timeseries',
        'ReJSON',
        'searchlight',
        'graph',
        'redisgears_2',
      ]),
      null,
    ],
    expected: false,
  },
  {
    input: [
      unmapWithName([
        'bf',
        'timeseries',
        'ReJSON',
        'search',
        'graph',
        'redisgears_2',
      ]),
      null,
    ],
    expected: false,
  },
  {
    input: [
      unmapWithName([
        'bf',
        'timeseries',
        'ReJSON',
        'searchlight',
        'graph',
        'redisgears',
      ]),
      null,
    ],
    expected: false,
  },
  {
    input: [
      unmapWithName([
        'bf',
        'timeseries',
        'ReJSON',
        'search',
        'graph',
        'redisgears',
      ]),
      null,
    ],
    expected: false,
  },
  {
    input: [
      unmapWithName([
        'bf',
        'timeseries',
        'ReJSON',
        'search',
        'graph',
        'redisgears',
        'redisgears_2',
      ]),
      null,
    ],
    expected: false,
  },
  {
    input: [
      unmapWithName(['bf', 'timeseries', 'ReJSON', 'searchlight', 'custom']),
      null,
    ],
    expected: false,
  },
  {
    input: [
      unmapWithName([
        'bf',
        'timeseries',
        'ReJSON',
        'searchlight',
        'graph',
        'custom',
      ]),
      null,
    ],
    expected: false,
  },
  {
    input: [
      unmapWithName([
        'bf',
        'timeseries',
        'ReJSON',
        'searchlight',
        'graph',
        'redisgears',
        'custom',
      ]),
      null,
    ],
    expected: false,
  },

  {
    input: [
      unmapWithName(['bf', 'timeseries', 'ReJSON', 'searchlight']),
      '6.2.4',
    ],
    expected: false,
  },
  {
    input: [
      unmapWithName([
        'bf',
        'timeseries',
        'ReJSON',
        'searchlight',
        'redisgears',
      ]),
      '7.9',
    ],
    expected: false,
  },
  {
    input: [
      unmapWithName([
        'bf',
        'timeseries',
        'ReJSON',
        'searchlight',
        'redisgears',
      ]),
      '8.0.0',
    ],
    expected: false,
  },
  {
    input: [
      unmapWithName([
        'bf',
        'timeseries',
        'ReJSON',
        'searchlight',
        'redisgears',
      ]),
      '8.0.0-rc',
    ],
    expected: false,
  },
]

describe('isRediStack', () => {
  test.each(isRediStackTests)('%j', ({ input, expected }) => {
    // @ts-ignore
    const result = isRediStack(...input)
    expect(result).toEqual(expected)
  })
})
