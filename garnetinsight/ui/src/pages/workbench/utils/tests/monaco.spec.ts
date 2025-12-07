import { MOCKED_REDIS_COMMANDS } from 'uiSrc/mocks/data/mocked_redis_commands'
import { getRediSearchSignutureProvider } from 'uiSrc/pages/workbench/utils/monaco'

const ftAggregateCommand = MOCKED_REDIS_COMMANDS['FT.AGGREGATE']

const getRediSearchSignatureProviderTests = [
  {
    input: {
      isOpen: false,
      data: {
        currentArg: {},
        parent: {},
      },
    },
    result: null,
  },
  {
    input: {
      isOpen: true,
      data: {
        currentArg: ftAggregateCommand.arguments.find(
          ({ name }) => name === 'groupby',
        ),
        parent: null,
      },
    },
    result: {
      dispose: expect.any(Function),
      value: {
        activeParameter: 0,
        activeSignature: 0,
        signatures: [
          {
            label: '',
            parameters: [{ label: 'nargs' }],
          },
        ],
      },
    },
  },
  {
    input: {
      isOpen: true,
      data: {
        currentArg: { name: 'expression' },
        parent: ftAggregateCommand.arguments.find(
          ({ name }) => name === 'apply',
        ),
      },
    },
    result: {
      dispose: expect.any(Function),
      value: {
        activeParameter: 0,
        activeSignature: 0,
        signatures: [
          {
            label: 'APPLY expression AS name',
            parameters: [{ label: 'expression' }],
          },
        ],
      },
    },
  },
]

describe('getRediSearchSignatureProvider', () => {
  it.each(getRediSearchSignatureProviderTests)(
    'should properly return result',
    ({ input, result }) => {
      const testResult = getRediSearchSignutureProvider(input)

      expect(result).toEqual(testResult)
    },
  )
})
