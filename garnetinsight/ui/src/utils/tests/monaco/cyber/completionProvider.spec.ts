import { getCompletionProvider } from 'uiSrc/utils/monaco/completionProvider'

describe('getCypherCompletionProvider', () => {
  it('should call getWordUntilPosition and getValueInRange', () => {
    const provider = getCompletionProvider()

    const positionMock = {}
    const contextMock = {}
    const tokenMock = {}

    const modelMock = {
      getWordUntilPosition: jest.fn().mockImplementation(() => ({})),
      getValueInRange: jest.fn().mockImplementation(() => ''),
    }

    provider.provideCompletionItems(
      modelMock,
      positionMock,
      contextMock,
      tokenMock,
    )

    expect(modelMock.getWordUntilPosition).toBeCalled()
    expect(modelMock.getValueInRange).toBeCalled()
  })
})
