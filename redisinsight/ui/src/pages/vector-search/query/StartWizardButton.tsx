import React, { useCallback } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Pages } from 'uiSrc/constants'
import { RiCallOut } from 'uiBase/display'

export const StartWizardButton = () => {
  const history = useHistory()
  const { instanceId } = useParams<{ instanceId: string }>()

  const startCreateIndexWizard = useCallback(() => {
    history.push(Pages.vectorSearchCreateIndex(instanceId))
  }, [history, instanceId])

  return (
    <RiCallOut
      variant="success"
      actions={{
        primary: {
          label: 'Get started',
          onClick: startCreateIndexWizard,
        },
      }}
    >
      Power fast, real-time semantic AI search with vector search.
    </RiCallOut>
  )
}
