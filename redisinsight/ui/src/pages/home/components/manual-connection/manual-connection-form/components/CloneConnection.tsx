import React from 'react'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { useTranslation } from 'uiSrc/i18n'

export interface Props {
  id?: string
  setIsCloneMode: (val: boolean) => void
}

const CloneConnection = (props: Props) => {
  const { t } = useTranslation()
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
            aria-label={t('home.form.manual.ariaLabel.cloneDatabase')}
            data-testid="clone-db-btn"
            onClick={handleClickClone}
          >
            {t('home.form.manual.button.cloneConnection')}
          </SecondaryButton>
        </FlexItem>
      </Row>
      <Spacer />
    </>
  )
}

export default CloneConnection
