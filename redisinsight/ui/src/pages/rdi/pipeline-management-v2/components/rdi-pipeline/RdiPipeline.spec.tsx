import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import { render, screen } from 'uiSrc/utils/test-utils'
import { Pages } from 'uiSrc/constants'
import RdiPipeline from './RdiPipeline'

const MOCK_RDI_ID = 'rdiInstanceId'

const mockPipelineManagement = jest.fn()

jest.mock('@rdi-ui/pipeline', () => ({
  PipelineManagement: (props: Record<string, unknown>) =>
    mockPipelineManagement(props),
}))

describe('RdiPipeline', () => {
  let capturedProps: Record<string, unknown> = {}

  beforeEach(() => {
    capturedProps = {}
    mockPipelineManagement.mockImplementation(
      (props: Record<string, unknown>) => {
        capturedProps = props
        return <div data-testid="pipeline-management-mock" />
      },
    )
  })

  it('should render the pipeline management package', () => {
    render(
      <BrowserRouter>
        <RdiPipeline rdiInstanceId={MOCK_RDI_ID} />
      </BrowserRouter>,
    )

    expect(screen.getByTestId('pipeline-management-mock')).toBeInTheDocument()
  })

  it('should point the rdi client at the proxy endpoint for this instance', () => {
    render(
      <BrowserRouter>
        <RdiPipeline rdiInstanceId={MOCK_RDI_ID} />
      </BrowserRouter>,
    )

    expect(capturedProps.basePath).toBe(
      Pages.rdiPipelineManagementV2(MOCK_RDI_ID),
    )
    expect(capturedProps.rdiClient).toMatchObject({
      baseUrl: expect.stringContaining(`rdi/${MOCK_RDI_ID}/proxy`),
      withCredentials: true,
    })
  })
})
