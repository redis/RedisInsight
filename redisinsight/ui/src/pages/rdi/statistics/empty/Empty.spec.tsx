import React from 'react'
import reactRouterDom from 'react-router-dom'

import { render, screen, userEvent } from 'uiSrc/utils/test-utils'
import { Pages } from 'uiSrc/constants'
import Empty from './Empty'

describe('Empty', () => {
  test('renders empty pipeline message', () => {
    render(<Empty rdiInstanceId="123" />)
    expect(screen.getByText('No pipeline deployed yet')).toBeInTheDocument()
    expect(
      screen.getByText('Create your first pipeline to get started!'),
    ).toBeInTheDocument()
  })

  test('navigates to the bare rdi instance url when "Add Pipeline" button is clicked, not straight to the legacy config page', async () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({
      push: pushMock,
    })

    render(<Empty rdiInstanceId="123" />)

    const addPipelineButton = screen.getByTestId('add-pipeline-btn')
    await userEvent.click(addPipelineButton)

    expect(pushMock).toHaveBeenCalledWith(Pages.rdiPipeline('123'))
  })
})
