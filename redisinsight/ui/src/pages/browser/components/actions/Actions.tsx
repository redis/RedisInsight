import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RiPrimaryButton, RiSecondaryButton } from 'uiBase/forms'
import { BulkActionsIcon } from 'uiBase/icons'
import { RiRow } from 'uiBase/layout'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import styles from 'uiSrc/pages/browser/components/browser-search-panel/styles.module.scss'
import { setBulkActionType } from 'uiSrc/slices/browser/bulkActions'
import { BulkActionsType, FeatureFlags } from 'uiSrc/constants'
import { FeatureFlagComponent } from 'uiSrc/components'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { keysSelector } from 'uiSrc/slices/browser/keys'

export interface Props {
  handleAddKeyPanel: (value: boolean) => void
  handleBulkActionsPanel: (value: boolean) => void
}
const Actions = ({ handleAddKeyPanel, handleBulkActionsPanel }: Props) => {
  const dispatch = useDispatch()
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)
  const openAddKeyPanel = () => {
    handleAddKeyPanel(true)
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_ADD_BUTTON_CLICKED,
        TelemetryEvent.TREE_VIEW_KEY_ADD_BUTTON_CLICKED,
      ),
      eventData: {
        databaseId: instanceId,
      },
    })
  }

  const AddKeyBtn = (
    <RiPrimaryButton
      onClick={openAddKeyPanel}
      className={styles.addKey}
      data-testid="btn-add-key"
    >
      + <span className={styles.addKeyText}>Key</span>
    </RiPrimaryButton>
  )
  const openBulkActions = () => {
    dispatch(setBulkActionType(BulkActionsType.Delete))
    handleBulkActionsPanel(true)
  }
  const BulkActionsBtn = (
    <RiSecondaryButton
      color="secondary"
      icon={BulkActionsIcon}
      onClick={openBulkActions}
      className={styles.bulkActions}
      data-testid="btn-bulk-actions"
      aria-label="bulk actions"
    >
      <span className={styles.bulkActionsText}>Bulk Actions</span>
    </RiSecondaryButton>
  )
  return (
    <RiRow
      grow={false}
      gap="m"
      style={{
        flexShrink: 0,
        marginLeft: 12,
      }}
    >
      <FeatureFlagComponent name={FeatureFlags.envDependent}>
        {BulkActionsBtn}
      </FeatureFlagComponent>
      {AddKeyBtn}
    </RiRow>
  )
}

export default Actions
