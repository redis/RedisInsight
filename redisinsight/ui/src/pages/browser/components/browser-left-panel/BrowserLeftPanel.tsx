import React from 'react'

import { FeatureFlagComponent } from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants/featureFlags'
import { Nullable } from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

import KeysBrowserPanel from '../keys-browser-panel'
import BrowserLeftPanelLegacy from './BrowserLeftPanelLegacy'

export interface Props {
  selectedKey: Nullable<RedisResponseBuffer>
  selectKey: ({ rowData }: { rowData: any }) => void
  removeSelectedKey: () => void
  handleAddKeyPanel: (value: boolean) => void
  handleBulkActionsPanel: (value: boolean) => void
}

const BrowserLeftPanel = (props: Props) => (
  <FeatureFlagComponent
    name={FeatureFlags.devBrowser}
    otherwise={<BrowserLeftPanelLegacy {...props} />}
  >
    <KeysBrowserPanel {...props} />
  </FeatureFlagComponent>
)

export default React.memo(BrowserLeftPanel)
