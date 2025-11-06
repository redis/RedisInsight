import React from 'react'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'

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
      <Row gap="m" justify="end" style={{ flexGrow: 0 }}>
        <FlexItem>
          <SecondaryButton
            size="medium"
            aria-label="Clone database"
            data-testid="clone-db-btn"
            onClick={handleClickClone}
          >
            Clone Connection
          </SecondaryButton>
        </FlexItem>
      </Row>
      <Spacer />
    </>
  )
}

export default CloneConnection
