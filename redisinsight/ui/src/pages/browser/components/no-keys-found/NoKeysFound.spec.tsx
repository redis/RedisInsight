import React from 'react'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import {
  render,
  screen,
  fireEvent,
  mockedStore,
  cleanup,
  waitForRiPopoverVisible,
  waitForStack,
} from 'uiSrc/utils/test-utils'

import { sendEventTelemetry } from 'uiSrc/telemetry'
import { apiService } from 'uiSrc/services'
import {
  bulkImportDefaultData,
  bulkImportDefaultDataSuccess,
} from 'uiSrc/slices/browser/bulkActions'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { changeKeyViewType, loadKeys } from 'uiSrc/slices/browser/keys'
import { KeyViewType } from 'uiSrc/slices/interfaces/keys'
import {
  changeSelectedTab,
  changeSidePanel,
  resetExplorePanelSearch,
} from 'uiSrc/slices/panels/sidePanels'
import { InsightsPanelTabs, SidePanels } from 'uiSrc/slices/interfaces/insights'
import NoKeysFound, { Props } from './NoKeysFound'

const mockedProps = mock<Props>()

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    provider: 'REDIS_CLOUD',
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('NoKeysFound', () => {
  it('should render', () => {
    expect(render(<NoKeysFound {...mockedProps} />)).toBeTruthy()
  })

  it('should call props on click buttons', () => {
    const onAddMock = jest.fn()

    render(<NoKeysFound {...mockedProps} onAddKeyPanel={onAddMock} />)

    fireEvent.click(screen.getByTestId('add-key-msg-btn'))

    expect(onAddMock).toBeCalled()
  })

  it('should call proper actions after click load sample data', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    apiService.post = jest
      .fn()
      .mockResolvedValueOnce({ status: 200, data: { data: {} } })

    render(<NoKeysFound {...mockedProps} onAddKeyPanel={jest.fn()} />)

    fireEvent.click(screen.getByTestId('load-sample-data-btn'))
    await waitForRiPopoverVisible()

    fireEvent.click(screen.getByTestId('load-sample-data-btn-confirm'))

    await waitForStack()

    const expectedActions = [
      bulkImportDefaultData(),
      bulkImportDefaultDataSuccess(),
      addMessageNotification(successMessages.UPLOAD_DATA_BULK()),
      changeSelectedTab(InsightsPanelTabs.Explore),
      changeSidePanel(SidePanels.Insights),
      resetExplorePanelSearch(),
      changeKeyViewType(KeyViewType.Tree),
      loadKeys(),
    ]

    expect(store.getActions().slice(0, expectedActions.length)).toEqual(
      expectedActions,
    )
  })
})
