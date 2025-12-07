import { useFormikContext } from 'formik'
import React from 'react'

import { render, screen, userEvent, waitFor } from 'uiSrc/utils/test-utils'
import RdiConfigFileActionMenu from './RdiConfigFileActionMenu'

jest.mock('formik')

describe('RdiConfigFileActionMenu', () => {
  beforeEach(() => {
    const mockUseFormikContext = {
      handleSubmit: jest.fn(),
      resetForm: jest.fn(),
      // values: MOCK_RDI_PIPELINE_DATA,
    }
    ;(useFormikContext as jest.Mock).mockReturnValue(mockUseFormikContext)
  })

  it('should render', () => {
    expect(render(<RdiConfigFileActionMenu />)).toBeTruthy()
  })

  it('should show menu with file actions when clicked', async () => {
    render(<RdiConfigFileActionMenu />)
    const actionBtn = screen.getByTestId(
      'rdi-config-file-action-menu-trigger',
    ) as HTMLElement
    expect(actionBtn).toBeInTheDocument()

    await userEvent.click(
      screen.getByTestId('rdi-config-file-action-menu-trigger'),
    )

    await waitFor(() => screen.getByTestId('upload-file-btn'))
    expect(screen.getByTestId('upload-file-btn')).toBeInTheDocument()
    expect(screen.getByTestId('upload-pipeline-btn')).toBeInTheDocument()
    expect(screen.getByTestId('download-pipeline-btn')).toBeInTheDocument()
  })
})
