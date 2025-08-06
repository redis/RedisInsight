import React from 'react'
import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiSpacer } from 'uiBase/layout/spacer'
import { RiSecondaryButton } from 'uiBase/forms'
import { CopyIcon } from 'uiBase/icons'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

export interface Props {
  id?: string
  setIsCloneMode: (val: boolean) => void
}

const CloneConnection = (props: Props) => {
  const { id, setIsCloneMode } = props

  const handleClickClone = () => {
    setIsCloneMode(true)
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_CLONE_REQUESTED,
      eventData: {
        databaseId: id,
      },
    })
  }

  return (
    <>
      <RiRow gap="m" justify="end" style={{ flexGrow: 0 }}>
        <RiFlexItem>
          <RiSecondaryButton
            size="small"
            icon={CopyIcon}
            aria-label="Clone database"
            data-testid="clone-db-btn"
            onClick={handleClickClone}
          >
            Clone Connection
          </RiSecondaryButton>
        </RiFlexItem>
      </RiRow>
      <RiSpacer />
    </>
  )
}

export default CloneConnection
