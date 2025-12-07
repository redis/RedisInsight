import React from 'react'
import { cloneDeep, set } from 'lodash'
import {
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { FeatureFlags } from 'uiSrc/constants'
import BrowserRightPanel from 'uiSrc/pages/browser/components/browser-right-panel/index'

describe('BrowserRightPanel', () => {
  it('should show feature dependent items when feature flag is off', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: true },
    )

    render(
      <BrowserRightPanel
        selectedKey={null}
        setSelectedKey={jest.fn()}
        arePanelsCollapsed={false}
        isAddKeyPanelOpen={false}
        handleAddKeyPanel={jest.fn()}
        isBulkActionsPanelOpen
        handleBulkActionsPanel={jest.fn()}
        isCreateIndexPanelOpen={false}
        closeRightPanels={jest.fn()}
      />,
      {
        store: mockStore(initialStoreState),
      },
    )
    expect(screen.queryByTestId('bulk-actions-content')).toBeInTheDocument()
  })

  it('should hide feature dependent items when feature flag is on', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: false },
    )

    render(
      <BrowserRightPanel
        selectedKey={null}
        setSelectedKey={jest.fn()}
        arePanelsCollapsed={false}
        isAddKeyPanelOpen={false}
        handleAddKeyPanel={jest.fn()}
        isBulkActionsPanelOpen
        handleBulkActionsPanel={jest.fn()}
        isCreateIndexPanelOpen={false}
        closeRightPanels={jest.fn()}
      />,
      {
        store: mockStore(initialStoreState),
      },
    )
    expect(screen.queryByTestId('bulk-actions-content')).not.toBeInTheDocument()
  })
})
