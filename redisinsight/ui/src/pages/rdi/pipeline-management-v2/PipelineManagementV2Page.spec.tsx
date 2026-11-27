import React from 'react'
import reactRouterDom, { BrowserRouter, Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { faker } from '@faker-js/faker'

import {
  render,
  screen,
  cleanup,
  fireEvent,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import { FeatureFlags, PageNames, Pages } from 'uiSrc/constants'
import { setLastPageContext } from 'uiSrc/slices/app/context'
import PipelineManagementV2Page from './PipelineManagementV2Page'

const MOCK_RDI_ID = 'rdiInstanceId'
const SUPPORTED_VERSION = '1.19.0'
const MOCK_RDI_NAME = faker.word.noun()

type RdiPipelineMockProps = {
  rdiInstanceId: string
  rdiInstanceAlias: string
  navigation: unknown
  navigationGuard: unknown
}

const mockRdiPipeline = jest.fn()
const mockNavigationGuard = { requestNavigation: jest.fn() }
const mockBreadcrumbExit = jest.fn()
const mockBreadcrumbShowList = jest.fn()
const mockUseRdiPipelinesBreadcrumb = jest.fn()

jest.mock('@rdi-ui/pipeline', () => ({
  createRdiPipelinesNavigationGuard: () => mockNavigationGuard,
  useRdiPipelinesBreadcrumb: (params: unknown) =>
    mockUseRdiPipelinesBreadcrumb(params),
}))

jest.mock('./components/rdi-pipeline', () => ({
  __esModule: true,
  default: (props: RdiPipelineMockProps) => mockRdiPipeline(props),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = mockedStore
  store.getState().app.context.contextRdiInstanceId = MOCK_RDI_ID
  store.getState().rdi.instances.connectedInstance.id = MOCK_RDI_ID
  store.getState().rdi.instances.connectedInstance.name = MOCK_RDI_NAME
  store.getState().rdi.instances.connectedInstance.version = SUPPORTED_VERSION
  store.getState().rdi.instances.connectedInstance.loading = false
  store.getState().rdi.instances.connectedInstance.error = ''
  store.getState().app.features.featureFlags.features[FeatureFlags.devRdiUi] = {
    flag: true,
  }

  reactRouterDom.useParams = jest
    .fn()
    .mockReturnValue({ rdiInstanceId: MOCK_RDI_ID })
  mockUseRdiPipelinesBreadcrumb.mockReturnValue({
    pipelineName: undefined,
    exit: mockBreadcrumbExit,
    showList: mockBreadcrumbShowList,
  })
  mockRdiPipeline.mockImplementation(
    ({ rdiInstanceId }: RdiPipelineMockProps) => (
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

  it('should pass the connected instance name as the rdi instance alias', () => {
    renderPage()

    expect(mockRdiPipeline).toHaveBeenLastCalledWith(
      expect.objectContaining({
        rdiInstanceId: MOCK_RDI_ID,
        rdiInstanceAlias: MOCK_RDI_NAME,
      }),
    )
  })

  it('should render the instance breadcrumb, but not the v1 shell (tabs/status bar)', () => {
    renderPage()

    expect(screen.getByTestId('breadcrumbs-container')).toBeInTheDocument()
    expect(screen.queryByTestId('pipeline-management-page-btn')).toBeNull()
    expect(screen.queryByTestId('pipeline-status-page-btn')).toBeNull()
  })

  it('should share one navigation service and guard between the header breadcrumb and the pipeline', () => {
    renderPage()

    const { navigation, navigationGuard } = mockRdiPipeline.mock.lastCall[0]
    expect(navigationGuard).toBe(mockNavigationGuard)
    expect(mockUseRdiPipelinesBreadcrumb).toHaveBeenLastCalledWith({
      navigation,
      navigationGuard: mockNavigationGuard,
      basePath: Pages.rdiPipelineManagementV2(MOCK_RDI_ID),
    })
  })

  it('should show only the instance in the header breadcrumb while the pipeline list shows', () => {
    renderPage()

    expect(screen.queryByTestId('rdi-pipeline-name')).toBeNull()
    expect(screen.queryByTestId('nav-instance-name-link')).toBeNull()
  })

  it('should add the open pipeline to the header breadcrumb and link the instance back to the list', () => {
    const pipelineName = faker.word.noun()
    mockUseRdiPipelinesBreadcrumb.mockReturnValue({
      pipelineName,
      exit: mockBreadcrumbExit,
      showList: mockBreadcrumbShowList,
    })

    renderPage()

    expect(screen.getByTestId('rdi-pipeline-name')).toHaveTextContent(
      pipelineName,
    )
    fireEvent.click(screen.getByTestId('nav-instance-name-link'))
    expect(mockBreadcrumbShowList).toHaveBeenCalledTimes(1)
  })

  it('should leave through the guarded breadcrumb exit from "Data integration"', () => {
    renderPage()

    fireEvent.click(screen.getByTestId('my-rdi-instances-btn'))

    expect(mockBreadcrumbExit).toHaveBeenCalledTimes(1)
  })

  it('should record itself as the last visited rdi section on unmount', () => {
    const { unmount } = renderPage()

    unmount()

    expect(store.getActions()).toContainEqual(
      setLastPageContext(PageNames.rdiPipelineManagementV2),
    )
  })

  it('should redirect to the v1 pipeline management page when the dev flag is off', () => {
    store.getState().app.features.featureFlags.features[FeatureFlags.devRdiUi] =
      { flag: false }
    const history = createMemoryHistory({
      initialEntries: [Pages.rdiPipelineManagementV2(MOCK_RDI_ID)],
    })

    render(
      <Router history={history}>
        <PipelineManagementV2Page />
      </Router>,
      { store },
    )

    expect(history.location.pathname).toBe(
      Pages.rdiPipelineManagement(MOCK_RDI_ID),
    )
  })

  it('should redirect to the v1 pipeline management page when the connected instance version is unsupported', () => {
    store.getState().rdi.instances.connectedInstance.version = '1.0.0'
    const history = createMemoryHistory({
      initialEntries: [Pages.rdiPipelineManagementV2(MOCK_RDI_ID)],
    })

    render(
      <Router history={history}>
        <PipelineManagementV2Page />
      </Router>,
      { store },
    )

    expect(history.location.pathname).toBe(
      Pages.rdiPipelineManagement(MOCK_RDI_ID),
    )
  })

  it('should show a loader instead of the pipeline while the connected instance is still resolving', () => {
    store.getState().app.context.contextRdiInstanceId = 'anotherInstanceId'

    renderPage()

    expect(screen.queryByTestId('pipeline-management-v2-page')).toBeNull()
    expect(screen.queryByTestId('rdi-pipeline-mock')).toBeNull()
  })
})
