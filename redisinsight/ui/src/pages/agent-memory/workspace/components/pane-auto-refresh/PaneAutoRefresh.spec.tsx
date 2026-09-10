import React from 'react'

import { localStorageService } from 'uiSrc/services'
import { BrowserStorageItem } from 'uiSrc/constants'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  userEvent,
  waitForRiPopoverVisible,
} from 'uiSrc/utils/test-utils'

import PaneAutoRefresh, { PaneAutoRefreshProps } from './PaneAutoRefresh'

const POSTFIX = 'agent-memory-test-pane'
const ENABLED_KEY = BrowserStorageItem.autoRefreshEnabled + POSTFIX

describe('PaneAutoRefresh', () => {
  const defaultProps: PaneAutoRefreshProps = {
    postfix: POSTFIX,
    loading: false,
    lastRefreshTime: null,
    onRefresh: jest.fn(),
    testid: 'pane',
  }

  const renderComponent = (propsOverride?: Partial<PaneAutoRefreshProps>) => {
    const props = { ...defaultProps, ...propsOverride }

    return render(<PaneAutoRefresh {...props} />)
  }

  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
    jest.spyOn(localStorageService, 'get').mockImplementation(() => null)
    jest.spyOn(localStorageService, 'set').mockImplementation(() => {})
  })

  it('should render the shared AutoRefresh with the last-refresh label', () => {
    renderComponent()

    expect(
      screen.getByTestId('pane-auto-refresh-container'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('pane-refresh-btn')).toBeInTheDocument()
    expect(screen.getByTestId('pane-refresh-message-label')).toHaveTextContent(
      'Last refresh:',
    )
  })

  it('should call onRefresh when the refresh button is clicked', () => {
    const onRefresh = jest.fn()
    renderComponent({ onRefresh })

    fireEvent.click(screen.getByTestId('pane-refresh-btn'))

    expect(onRefresh).toHaveBeenCalled()
  })

  it('should persist enablement per pane when auto refresh is switched on', async () => {
    renderComponent()

    await userEvent.click(screen.getByTestId('pane-auto-refresh-config-btn'))
    await waitForRiPopoverVisible()
    await userEvent.click(screen.getByTestId('pane-auto-refresh-switch'))

    expect(localStorageService.set).toHaveBeenCalledWith(ENABLED_KEY, true)
  })

  it('should honor the persisted enablement as the auto refresh default', async () => {
    jest
      .spyOn(localStorageService, 'get')
      .mockImplementation((key?: string) => (key === ENABLED_KEY ? true : null))
    renderComponent()

    await userEvent.click(screen.getByTestId('pane-auto-refresh-config-btn'))
    await waitForRiPopoverVisible()

    expect(screen.getByTestId('pane-auto-refresh-switch')).toBeChecked()
  })
})
