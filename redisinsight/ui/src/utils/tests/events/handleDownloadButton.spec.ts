import { handleDownloadButton } from 'uiSrc/utils/events/handleDownloadButton'

describe('handleDownloadButton', () => {
  let createObjectURLMock: jest.SpyInstance
  let revokeObjectURLMock: jest.SpyInstance
  let createElementMock: jest.SpyInstance
  let mockAnchor: HTMLAnchorElement

  beforeEach(() => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    createObjectURLMock = jest
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('mock-url')
    revokeObjectURLMock = jest
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => {})

    // Mock document.createElement
    mockAnchor = {
      href: '',
      download: '',
      click: jest.fn(),
    } as unknown as HTMLAnchorElement

    createElementMock = jest
      .spyOn(document, 'createElement')
      .mockReturnValue(mockAnchor)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should create a blob with the provided data', () => {
    const data = 'test data'
    const filename = 'test.txt'

    handleDownloadButton(data, filename)

    expect(createObjectURLMock).toHaveBeenCalledWith(
      expect.objectContaining({
        size: data.length,
        type: 'text/plain',
      }),
    )
  })

  it('should create an anchor element', () => {
    const data = 'test data'
    const filename = 'test.txt'

    handleDownloadButton(data, filename)

    expect(createElementMock).toHaveBeenCalledWith('a')
  })

  it('should set the href attribute to the blob URL', () => {
    const data = 'test data'
    const filename = 'test.txt'

    handleDownloadButton(data, filename)

    expect(mockAnchor.href).toBe('mock-url')
  })

  it('should set the download attribute to the filename', () => {
    const data = 'test data'
    const filename = 'test-file.txt'

    handleDownloadButton(data, filename)

    expect(mockAnchor.download).toBe(filename)
  })

  it('should trigger click on the anchor element', () => {
    const data = 'test data'
    const filename = 'test.txt'

    handleDownloadButton(data, filename)

    expect(mockAnchor.click).toHaveBeenCalled()
  })

  it('should revoke the object URL after use', () => {
    const data = 'test data'
    const filename = 'test.txt'

    handleDownloadButton(data, filename)

    expect(revokeObjectURLMock).toHaveBeenCalledWith('mock-url')
  })

  it('should call onSuccess callback when provided', () => {
    const data = 'test data'
    const filename = 'test.txt'
    const onSuccess = jest.fn()

    handleDownloadButton(data, filename, onSuccess)

    expect(onSuccess).toHaveBeenCalled()
  })

  it('should not call onSuccess callback when not provided', () => {
    const data = 'test data'
    const filename = 'test.txt'

    expect(() => handleDownloadButton(data, filename)).not.toThrow()
  })

  it('should handle errors gracefully without crashing', () => {
    createObjectURLMock.mockImplementation(() => {
      throw new Error('Test error')
    })

    const data = 'test data'
    const filename = 'test.txt'
    const onSuccess = jest.fn()

    expect(() => handleDownloadButton(data, filename, onSuccess)).not.toThrow()
  })

  it('should not call onSuccess callback if an error occurs', () => {
    createObjectURLMock.mockImplementation(() => {
      throw new Error('Test error')
    })

    const data = 'test data'
    const filename = 'test.txt'
    const onSuccess = jest.fn()

    handleDownloadButton(data, filename, onSuccess)

    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('should handle empty data', () => {
    const data = ''
    const filename = 'empty.txt'

    expect(() => handleDownloadButton(data, filename)).not.toThrow()
    expect(mockAnchor.click).toHaveBeenCalled()
  })

  it('should handle special characters in filename', () => {
    const data = 'test data'
    const filename = 'test-file (1) [copy].txt'

    handleDownloadButton(data, filename)

    expect(mockAnchor.download).toBe(filename)
  })

  it('should handle large data strings', () => {
    const data = 'a'.repeat(10000)
    const filename = 'large.txt'

    handleDownloadButton(data, filename)

    expect(createObjectURLMock).toHaveBeenCalled()
    expect(mockAnchor.click).toHaveBeenCalled()
    expect(revokeObjectURLMock).toHaveBeenCalled()
  })

  it('should handle multiline data', () => {
    const data = 'line1\nline2\nline3'
    const filename = 'multiline.txt'

    handleDownloadButton(data, filename)

    expect(createObjectURLMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'text/plain',
      }),
    )
    expect(mockAnchor.click).toHaveBeenCalled()
  })

  it('should handle data with special characters', () => {
    const data = 'Special chars: ñ, é, ü, 中文, 🎉'
    const filename = 'special.txt'

    handleDownloadButton(data, filename)

    expect(mockAnchor.click).toHaveBeenCalled()
  })
})
