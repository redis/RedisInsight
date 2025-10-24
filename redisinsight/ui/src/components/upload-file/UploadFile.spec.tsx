import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, fireEvent, screen, waitFor } from 'uiSrc/utils/test-utils'

import UploadFile, { Props } from './UploadFile'

const mockedProps = mock<Props>()

describe('UploadFile', () => {
  it('should render', () => {
    expect(render(<UploadFile {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should call onClick', () => {
    const onClick = jest.fn()

    render(<UploadFile {...instance(mockedProps)} onClick={onClick} />)

    fireEvent.click(screen.getByTestId('upload-file-btn'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should read file', async () => {
    const onFileChange = jest.fn()

    const jsonString = JSON.stringify({ a: 12 })
    const blob = new Blob([jsonString])
    const file = new File([blob], 'empty.json', {
      type: 'application/JSON',
    })
    render(
      <UploadFile {...instance(mockedProps)} onFileChange={onFileChange} />,
    )

    const fileInput = screen.getByTestId('upload-input-file')
    fireEvent.change(fileInput, { target: { files: [file] } })
    await waitFor(() => expect(onFileChange).toHaveBeenCalled())
    await waitFor(() =>
      expect(screen.getByTestId('upload-input-file')).toHaveValue(''),
    )
  })

  it('should not call onFileChange', async () => {
    const onFileChange = jest.fn()

    render(
      <UploadFile {...instance(mockedProps)} onFileChange={onFileChange} />,
    )

    const fileInput = screen.getByTestId('upload-input-file')
    fireEvent.change(fileInput, { target: { files: [] } })
    await waitFor(() => expect(onFileChange).not.toBeCalled())
  })
})
