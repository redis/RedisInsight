import React from 'react'

import reactRouterDom, { BrowserRouter } from 'react-router-dom'
import { instance, mock } from 'ts-mockito'
import { useFormikContext } from 'formik'
import {
  render,
  cleanup,
  mockedStore,
  createMockedStore,
  expectActionsToContain,
  expectActionsToNotContain,
} from 'uiSrc/utils/test-utils'
import {
  appContextPipelineManagement,
  setLastPageContext,
  setLastPipelineManagementPage,
} from 'uiSrc/slices/app/context'
import { PageNames, Pages } from 'uiSrc/constants'
import { MOCK_RDI_PIPELINE_DATA } from 'uiSrc/mocks/data/rdi'
import { getPipeline } from 'uiSrc/slices/rdi/pipeline'
import PipelineManagementPage, { Props } from './PipelineManagementPage'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/app/context', () => ({
  ...jest.requireActual('uiSrc/slices/app/context'),
  appContextPipelineManagement: jest.fn().mockReturnValue({
    lastViewedPage: '',
  }),
}))

jest.mock('formik')

const MOCK_RDI_ID = 'id1'
const MOCK_RDI_ID2 = 'id2'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = createMockedStore()
  store.clearActions()
})

const renderPipelineManagement = (props: Props) =>
  render(
    <BrowserRouter>
      <PipelineManagementPage {...props} />
    </BrowserRouter>,
    { store },
  )

describe('PipelineManagementPage', () => {
  beforeEach(() => {
    const mockUseFormikContext = {
      setFieldValue: jest.fn,
      values: MOCK_RDI_PIPELINE_DATA,
    }
    ;(useFormikContext as jest.Mock).mockReturnValue(mockUseFormikContext)
  })

  it('should render', () => {
    expect(renderPipelineManagement(instance(mockedProps))).toBeTruthy()
  })

  it('should redirect to the config tab by default', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })
    reactRouterDom.useLocation = jest.fn().mockReturnValue({
      pathname: Pages.rdiPipelineManagement('rdiInstanceId'),
    })

    renderPipelineManagement(instance(mockedProps))

    expect(pushMock).toBeCalledWith(Pages.rdiPipelineConfig('rdiInstanceId'))
  })

  it('should redirect to the prev page from context', () => {
    ;(appContextPipelineManagement as jest.Mock).mockReturnValueOnce({
      lastViewedPage: Pages.rdiPipelineConfig('rdiInstanceId'),
    })
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })
    reactRouterDom.useLocation = jest.fn().mockReturnValue({
      pathname: Pages.rdiPipelineManagement('rdiInstanceId'),
    })

    renderPipelineManagement(instance(mockedProps))

    expect(pushMock).toBeCalledWith(Pages.rdiPipelineConfig('rdiInstanceId'))
  })

  it('should save proper page on unmount', () => {
    reactRouterDom.useLocation = jest
      .fn()
      .mockReturnValue({ pathname: Pages.rdiPipelineConfig('rdiInstanceId') })

    const { unmount } = renderPipelineManagement(instance(mockedProps))

    unmount()
    const expectedActions = [
      getPipeline(),
      setLastPageContext(PageNames.rdiPipelineManagement),
      setLastPipelineManagementPage(Pages.rdiPipelineConfig('rdiInstanceId')),
    ]

    expect(store.getActions().slice(0, expectedActions.length)).toEqual(
      expectedActions,
    )
  })

  describe('pipeline state', () => {
    it('should fetch pipeline when context is empty', () => {
      ;(appContextPipelineManagement as jest.Mock).mockReturnValueOnce({
        lastViewedPage: '',
      })
      reactRouterDom.useParams = jest.fn().mockReturnValue({
        rdiInstanceId: MOCK_RDI_ID,
      })

      renderPipelineManagement(instance(mockedProps))

      expectActionsToContain(store.getActions(), [getPipeline()])
    })

    it('should fetch pipeline when context stores different visited RDI instance', () => {
      ;(appContextPipelineManagement as jest.Mock).mockReturnValueOnce({
        lastViewedPage: '',
      })
      reactRouterDom.useParams = jest.fn().mockReturnValue({
        rdiInstanceId: MOCK_RDI_ID2,
      })

      renderPipelineManagement(instance(mockedProps))

      expectActionsToContain(store.getActions(), [getPipeline()])
    })

    it('should not fetch pipeline when context stores the same visited RDI instance', () => {
      ;(appContextPipelineManagement as jest.Mock).mockReturnValueOnce({
        lastViewedPage: Pages.rdiPipelineConfig(MOCK_RDI_ID),
      })
      reactRouterDom.useParams = jest.fn().mockReturnValue({
        rdiInstanceId: MOCK_RDI_ID,
      })

      renderPipelineManagement(instance(mockedProps))

      expectActionsToNotContain(store.getActions(), [getPipeline()])
    })
  })
})
