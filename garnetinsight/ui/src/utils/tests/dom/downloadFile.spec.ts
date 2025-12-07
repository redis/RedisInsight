import { saveAs } from 'file-saver'
import { DEFAULT_FILE_NAME, downloadFile } from 'uiSrc/utils/dom/downloadFile'

jest.mock('file-saver', () => ({
  ...jest.requireActual('file-saver'),
  saveAs: jest.fn(),
}))

const getDownloadFileTests: any[] = [
  ['5123123123', { 'content-disposition': '123"123"123' }, '123'],
  [
    'test\ntest123',
    { 'content-disposition': '123"filename.txt"123' },
    'filename.txt',
  ],
  [
    '5123 uoeu aoue ao123123',
    { 'content-disposition': '123"1uaoeutaoeu"123' },
    '1uaoeutaoeu',
  ],
  [null, { 'content-disposition': '123"123"123' }, '123'],
  ['5123 3', {}, DEFAULT_FILE_NAME],
]

describe('downloadFile', () => {
  it.each(getDownloadFileTests)(
    'saveAs should be called with: %s (data), %s (headers), ',
    (data: string, headers, fileName: string) => {
      const saveAsMock = jest.fn()
      ;(saveAs as jest.Mock).mockImplementation(() => saveAsMock)

      downloadFile(data, headers)
      expect(saveAs).toBeCalledWith(
        new Blob([data], { type: 'text/plain;charset=utf-8' }),
        fileName,
      )
    },
  )
})
