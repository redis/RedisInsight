import { createMemoryHistory } from 'history'
import React from 'react'
import { Router } from 'react-router-dom'

import { fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'
import Empty from './Empty'

describe('Empty', () => {
  test('renders empty pipeline message', () => {
    render(<Empty rdiInstanceId="123" />)
    expect(screen.getByText('No pipeline deployed yet')).toBeInTheDocument()
    expect(
      screen.getByText('Create your first pipeline to get started!'),
    ).toBeInTheDocument()
  })

  test('navigates to pipeline config page when "Add Pipeline" button is clicked', () => {
    const history = createMemoryHistory()
    render(
      <Router history={history}>
        <Empty rdiInstanceId="123" />
      </Router>,
    )

    const addPipelineButton = screen.getByTestId('add-pipeline-btn')
    fireEvent.click(addPipelineButton)

    waitFor(() => {
      expect(history.location.pathname).toBe('/rdi/pipeline-config/123')
    })
  })
})
