import { waitFor } from 'uiSrc/utils/test-utils'

const BROTLI_INIT_ERROR = 'brotli wasm init failed'

const mockInit = jest.fn()

jest.mock('brotli-dec-wasm/pkg/brotli_dec_wasm', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockInit(...args),
  decompress: jest.fn(),
}))

describe('decompressors brotli init', () => {
  const unhandledRejections: unknown[] = []
  const onUnhandledRejection = (reason: unknown) => {
    unhandledRejections.push(reason)
  }

  beforeEach(() => {
    unhandledRejections.length = 0
    process.on('unhandledRejection', onUnhandledRejection)
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    process.off('unhandledRejection', onUnhandledRejection)
    jest.restoreAllMocks()
    mockInit.mockReset()
    jest.resetModules()
  })

  it('should not leave an unhandled rejection when wasm init fails', async () => {
    mockInit.mockRejectedValue(new Error(BROTLI_INIT_ERROR))

    await jest.isolateModulesAsync(async () => {
      await import('uiSrc/utils/decompressors/decompressors')
    })

    await waitFor(() =>
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to initialize brotli decompressor',
        expect.objectContaining({ message: BROTLI_INIT_ERROR }),
      ),
    )

    expect(mockInit).toHaveBeenCalledTimes(1)
    expect(unhandledRejections).toEqual([])
  })

  it('should not warn when wasm init succeeds', async () => {
    mockInit.mockResolvedValue(undefined)

    await jest.isolateModulesAsync(async () => {
      await import('uiSrc/utils/decompressors/decompressors')
    })

    await waitFor(() => expect(mockInit).toHaveBeenCalledTimes(1))

    expect(unhandledRejections).toEqual([])
    expect(console.warn).not.toHaveBeenCalled()
  })
})
