import React from 'react'
import { BrowserRouter, Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { QueryClient } from '@tanstack/react-query'

import { act, render, screen } from 'uiSrc/utils/test-utils'
import { Pages } from 'uiSrc/constants'
import RdiPipeline from './RdiPipeline'

const MOCK_RDI_ID = 'rdiInstanceId'
const OTHER_RDI_ID = 'otherRdiInstanceId'

const mockPipelineManagement = jest.fn()
const mockQueryClientProvider = jest.fn()

jest.mock('@rdi-ui/pipeline', () => ({
  PipelineManagement: (props: Record<string, unknown>) =>
    mockPipelineManagement(props),
}))

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  QueryClientProvider: (props: {
    client: unknown
    children: React.ReactNode
  }) => {
    mockQueryClientProvider(props)
    return props.children
  },
}))

describe('RdiPipeline', () => {
  let capturedProps: Record<string, unknown> = {}
  let capturedQueryClients: unknown[] = []

  beforeEach(() => {
    capturedProps = {}
    capturedQueryClients = []
    mockPipelineManagement.mockImplementation(
      (props: Record<string, unknown>) => {
        capturedProps = props
        return <div data-testid="pipeline-management-mock" />
      },
    )
    mockQueryClientProvider.mockImplementation((props: { client: unknown }) => {
      capturedQueryClients.push(props.client)
    })
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
    })
    expect(capturedProps.rdiClient).not.toHaveProperty('withCredentials')
  })

  it('should keep prop identities stable across a wizard-step navigation', () => {
    const history = createMemoryHistory({
      initialEntries: [Pages.rdiPipelineManagementV2(MOCK_RDI_ID)],
    })

    render(
      <Router history={history}>
        <RdiPipeline rdiInstanceId={MOCK_RDI_ID} />
      </Router>,
    )
    const initialProps = capturedProps

    act(() => {
      history.push(`${Pages.rdiPipelineManagementV2(MOCK_RDI_ID)}/create`)
    })

    expect(capturedProps.rdiClient).toBe(initialProps.rdiClient)
    expect(capturedProps.targetDatabase).toBe(initialProps.targetDatabase)
    expect(capturedProps.sourceSecrets).toBe(initialProps.sourceSecrets)
    expect(capturedProps.multiSource).toBe(initialProps.multiSource)
    expect(capturedProps.pipelineSecrets).toBe(initialProps.pipelineSecrets)
    expect(capturedProps.configTranslate).toBe(initialProps.configTranslate)
  })

  it('should use a fresh query client for a different rdi instance, not reuse the previous one', () => {
    const { rerender } = render(
      <BrowserRouter>
        <RdiPipeline rdiInstanceId={MOCK_RDI_ID} />
      </BrowserRouter>,
    )

    rerender(
      <BrowserRouter>
        <RdiPipeline rdiInstanceId={OTHER_RDI_ID} />
      </BrowserRouter>,
    )

    expect(capturedQueryClients).toHaveLength(2)
    expect(capturedQueryClients[0]).toBeInstanceOf(QueryClient)
    expect(capturedQueryClients[1]).toBeInstanceOf(QueryClient)
    expect(capturedQueryClients[0]).not.toBe(capturedQueryClients[1])
  })

  it('should keep the same query client across a rerender for the same rdi instance', () => {
    const { rerender } = render(
      <BrowserRouter>
        <RdiPipeline rdiInstanceId={MOCK_RDI_ID} />
      </BrowserRouter>,
    )

    rerender(
      <BrowserRouter>
        <RdiPipeline rdiInstanceId={MOCK_RDI_ID} />
      </BrowserRouter>,
    )

    expect(capturedQueryClients).toHaveLength(2)
    expect(capturedQueryClients[0]).toBe(capturedQueryClients[1])
  })
})
