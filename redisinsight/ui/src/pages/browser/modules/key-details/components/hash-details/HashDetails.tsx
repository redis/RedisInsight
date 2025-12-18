import React, { useState } from 'react'
import { useSelector } from 'react-redux'

import { useParams } from 'react-router-dom'
import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { FeatureFlags, KeyTypes } from 'uiSrc/constants'

import {
  KeyDetailsHeader,
  KeyDetailsHeaderProps,
} from 'uiSrc/pages/browser/modules'
import { isVersionHigherOrEquals } from 'uiSrc/utils'
import { CommandsVersions } from 'uiSrc/constants/commandsVersions'
import { connectedInstanceOverviewSelector } from 'uiSrc/slices/instances/instances'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import Divider from 'uiSrc/components/divider/Divider'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import AddHashFields from './add-hash-fields/AddHashFields'
import { HashDetailsTable } from './hash-details-table'
import { KeyDetailsSubheader } from '../key-details-subheader/KeyDetailsSubheader'
import { AddItemsAction } from '../key-details-actions'
import styles from './styles.module.scss'
import { AddKeysContainer } from '../common/AddKeysContainer.styled'

export interface Props extends KeyDetailsHeaderProps {
  onRemoveKey: () => void
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: () => void
}

const HashDetails = (props: Props) => {
  const keyType = KeyTypes.Hash
  const { onRemoveKey, onOpenAddItemPanel, onCloseAddItemPanel } = props

  const { loading } = useSelector(selectedKeySelector)
  const { version } = useSelector(connectedInstanceOverviewSelector)
  const { instanceId } = useParams<{ instanceId: string }>()
  const { [FeatureFlags.hashFieldExpiration]: hashFieldExpirationFeature } =
    useSelector(appFeatureFlagsFeaturesSelector)

  const [isAddItemPanelOpen, setIsAddItemPanelOpen] = useState<boolean>(false)
  const [showTtl, setShowTtl] = useState<boolean>(true)

  const isExpireFieldsAvailable =
    hashFieldExpirationFeature?.flag &&
    isVersionHigherOrEquals(version, CommandsVersions.HASH_TTL.since)

  const openAddItemPanel = () => {
    setIsAddItemPanelOpen(true)
    onOpenAddItemPanel()
  }

  const closeAddItemPanel = (isCancelled?: boolean) => {
    setIsAddItemPanelOpen(false)
    if (isCancelled) {
      onCloseAddItemPanel()
    }
  }
  const handleSelectShow = (show: boolean) => {
    setShowTtl(show)

    sendEventTelemetry({
      event: TelemetryEvent.SHOW_HASH_TTL_CLICKED,
      eventData: {
        databaseId: instanceId,
        action: show ? 'show' : 'hide',
      },
    })
  }

  const Actions = ({ width }: { width: number }) => (
    <>
      {isExpireFieldsAvailable && (
        <>
          <Checkbox
            id="showTtl"
            name="showTtl"
            label="Show TTL"
            checked={showTtl}
            onChange={(e) => handleSelectShow(e.target.checked)}
            data-testid="test-check-ttl"
          />
          <Divider className={styles.divider} orientation="vertical" />
        </>
      )}
      <AddItemsAction
        title="Add Fields"
        width={width}
        openAddItemPanel={openAddItemPanel}
      />
    </>
  )
  return (
    <div className="fluid flex-column relative">
      <KeyDetailsHeader {...props} key="key-details-header" />
      <KeyDetailsSubheader keyType={keyType} Actions={Actions} />
      <div className="key-details-body" key="key-details-body">
        {!loading && (
          <div className="flex-column" style={{ flex: '1', height: '100%' }}>
            <HashDetailsTable
              isExpireFieldsAvailable={isExpireFieldsAvailable && showTtl}
              onRemoveKey={onRemoveKey}
            />
          </div>
        )}
        {isAddItemPanelOpen && (
          <AddKeysContainer>
            <AddHashFields
              isExpireFieldsAvailable={isExpireFieldsAvailable}
              closePanel={closeAddItemPanel}
            />
          </AddKeysContainer>
        )}
      </div>
    </div>
  )
}

export { HashDetails }
