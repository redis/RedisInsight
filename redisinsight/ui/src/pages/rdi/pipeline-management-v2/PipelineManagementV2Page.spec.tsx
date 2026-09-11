import React from 'react'
import reactRouterDom, { BrowserRouter } from 'react-router-dom'

import { render, screen, cleanup, mockedStore } from 'uiSrc/utils/test-utils'
import { PageNames } from 'uiSrc/constants'
import { setLastPageContext } from 'uiSrc/slices/app/context'
import PipelineManagementV2Page from './PipelineManagementV2Page'

const MOCK_RDI_ID = 'rdiInstanceId'

const mockRdiPipeline = jest.fn()

jest.mock('./components/rdi-pipeline', () => ({
  __esModule: true,
  default: (props: { rdiInstanceId: string }) => mockRdiPipeline(props),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = mockedStore

  reactRouterDom.useParams = jest
    .fn()
    .mockReturnValue({ rdiInstanceId: MOCK_RDI_ID })
  mockRdiPipeline.mockImplementation(
    ({ rdiInstanceId }: { rdiInstanceId: string }) => (
      <div data-testid="rdi-pipeline-mock">{rdiInstanceId}</div>
    ),
  )
})

const renderPage = () =>
  render(
    <BrowserRouter>
      <PipelineManagementV2Page />
    </BrowserRouter>,
    { store },
  )

describe('PipelineManagementV2Page', () => {
  it('should render the pipeline for the current rdi instance', () => {
    renderPage()

    expect(
      screen.getByTestId('pipeline-management-v2-page'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('rdi-pipeline-mock')).toHaveTextContent(
      MOCK_RDI_ID,
    )
  })

  it('should record itself as the last visited rdi section on unmount', () => {
    const { unmount } = renderPage()

    unmount()

    expect(store.getActions()).toContainEqual(
      setLastPageContext(PageNames.rdiPipelineManagement),
    )
  })
})
