import { unified } from 'unified'
import MarkdownToJsxString from '../../formatter/MarkdownToJsxString'

jest.mock('unified')
describe('MarkdownToJsxString', () => {
  it('should call process', async () => {
    // mock implementation
    const useProcessMock = jest.fn().mockImplementation(() => Promise.resolve())
    function useMock() {
      return { use: useMock, process: useProcessMock }
    }
    ;(unified as jest.Mock).mockImplementation(() => ({
      use: useMock,
    }))

    await new MarkdownToJsxString().format('')
    expect(useProcessMock).toBeCalled()
  })
})
