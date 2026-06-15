import React, { useState } from 'react'

import { Environment } from 'apiClient'
import { RiTooltip } from 'uiSrc/components'
import { Row } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import ConfirmationPopover from 'uiSrc/components/confirmation-popover/ConfirmationPopover'
import { useDatabaseEnvironment } from 'uiSrc/components/hooks/useDatabaseEnvironment'

export interface Props {
  onStart: () => void
}

const ProfilerStartButton = ({ onStart }: Props) => {
  const { environment } = useDatabaseEnvironment()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const isProduction = environment === Environment.Production

  const handleClick = () => {
    if (isProduction) {
      setIsConfirmOpen(true)
      return
    }
    onStart()
  }

  const handleConfirm = () => {
    setIsConfirmOpen(false)
    onStart()
  }

  const button = (
    <RiTooltip content="Enable real-time profiling of your Redis database.">
      <PrimaryButton
        onClick={handleClick}
        aria-label="start monitor"
        data-testid="start-monitor"
      >
        Start Profiler
      </PrimaryButton>
    </RiTooltip>
  )

  if (!isProduction) {
    return button
  }

  return (
    <ConfirmationPopover
      isOpen={isConfirmOpen}
      closePopover={() => setIsConfirmOpen(false)}
      anchorPosition="rightCenter"
      trigger={button}
      title="Start Profiler"
      message="You're connected to a production database. Profiler decreases throughput. Are you sure you want to run it now?"
      confirmButton={
        <Row gap="m" justify="end">
          <SecondaryButton
            size="s"
            onClick={() => setIsConfirmOpen(false)}
            data-testid="profiler-start-cancel"
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            size="s"
            onClick={handleConfirm}
            data-testid="profiler-start-confirm"
          >
            Run
          </PrimaryButton>
        </Row>
      }
    />
  )
}

export default ProfilerStartButton
