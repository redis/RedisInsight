import React from 'react'
import { CallOut } from 'uiSrc/components/base/display/call-out/CallOut'
import useStartWizard from '../hooks/useStartWizard'

export const StartWizardButton = () => {
  const start = useStartWizard()

  return (
    <CallOut
      variant="success"
      actions={{
        primary: {
          label: 'Get started',
          onClick: start,
        },
      }}
      data-testid="start-wizard-button"
    >
      Power fast, real-time semantic AI search with vector search.
    </CallOut>
  )
}
