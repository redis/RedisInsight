import React, { useCallback } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { CallOut } from 'uiSrc/components/base/display/call-out/CallOut'
import { Pages } from 'uiSrc/constants'

export const StartWizardButton = () => {
  const history = useHistory()
  const { instanceId } = useParams<{ instanceId: string }>()

  const startCreateIndexWizard = useCallback(() => {
    history.push(Pages.vectorSearchCreateIndex(instanceId))
  }, [history, instanceId])

  return (
    <CallOut
      variant="success"
      actions={{
        primary: {
          label: 'Get started',
          onClick: startCreateIndexWizard,
        },
      }}
    >
      Power fast, real-time semantic AI search with vector search.
    </CallOut>
  )
}
