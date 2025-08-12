import React from 'react'
import { CallOut } from 'uiSrc/components/base/display/call-out/CallOut'

export const StartWizardButton = () => (
  <CallOut
    variant="success"
    actions={{
      primary: {
        label: 'Get started',
        onClick: () => {},
      },
    }}
  >
    Power fast, real-time semantic AI search with vector search.
  </CallOut>
)
