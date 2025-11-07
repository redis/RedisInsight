import React from 'react'
import BulkDeleteSummaryButton from './BulkDeleteSummaryButton'
import { render, screen } from 'uiSrc/utils/test-utils'

const readBlobContent = async (blob: Blob): Promise<string> => {
  return blob.text()
}

const defaultRenderProps = {
  pattern: 'test-pattern',
  deletedKeys: ['key1', 'key2'],
  children: 'Download report',
  keysType: 'Any',
}

const renderComponent = (props: any = {}) =>
  render(<BulkDeleteSummaryButton {...defaultRenderProps} {...props} />)

describe('BulkDeleteSummaryButton', () => {
  beforeEach(() => {
    URL.createObjectURL = jest.fn(() => 'mockFileUrl')
    URL.revokeObjectURL = jest.fn()
  })

  it('should render', () => {
    expect(renderComponent()).toBeTruthy()

    expect(
      screen.getByTestId('download-bulk-delete-report'),
    ).toBeInTheDocument()
  })

  it('should generate correct file content', async () => {
    renderComponent()

    const blob = (URL.createObjectURL as jest.Mock).mock.calls[0][0]
    expect(blob).toBeInstanceOf(Blob)

    const textContent = await readBlobContent(blob)

    // prettier-ignore
    const expectedContent =
     'Pattern: test-pattern\n' +
     'Key type: Any\n\n' +
     'Keys:\n\n' +
     'key1\n' +
     'key2'

    expect(textContent).toBe(expectedContent)
  })

  it('should handle empty deletedKeys array correctly', async () => {
    renderComponent({
      deletedKeys: [],
    })

    const blob = (URL.createObjectURL as jest.Mock).mock.calls[0][0]
    expect(blob).toBeInstanceOf(Blob)

    const textContent = await readBlobContent(blob)

    // prettier-ignore
    const expectedContent =
      'Pattern: test-pattern\n' +
      'Key type: Any\n\n' +
      'Keys:\n\n'

    expect(textContent).toBe(expectedContent)
  })

  it('should clean up the file URL on unmount', () => {
    const { unmount } = renderComponent({
      deletedKeys: ['key1'],
    })

    unmount()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('mockFileUrl')
  })
})
