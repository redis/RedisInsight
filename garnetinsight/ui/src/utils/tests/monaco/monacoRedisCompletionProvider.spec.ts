import { MOCK_COMMANDS_SPEC } from 'uiSrc/constants'
import {
  createDependencyProposals,
  getCommandMarkdown,
  getDocUrlForCommand,
} from 'uiSrc/utils'

const spec = { GET: MOCK_COMMANDS_SPEC.GET }

describe('createDependencyProposals', () => {
  it('should prepare completion', () => {
    const result = createDependencyProposals(spec)
    expect(result).toEqual({
      GET: {
        label: 'GET',
        kind: 1,
        detail: 'GET key',
        // eslint-disable-next-line no-template-curly-in-string
        insertText: 'GET ${1:key}',
        documentation: {
          value: getCommandMarkdown(
            MOCK_COMMANDS_SPEC.GET,
            getDocUrlForCommand('GET'),
          ),
        },
        insertTextRules: 4,
        range: {
          endColumn: 0,
          endLineNumber: 0,
          startColumn: 0,
          startLineNumber: 0,
        },
      },
    })
  })
})
