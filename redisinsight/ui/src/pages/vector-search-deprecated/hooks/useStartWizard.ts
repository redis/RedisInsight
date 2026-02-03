import { useCallback } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Pages } from 'uiSrc/constants'

const useStartWizard = () => {
  const history = useHistory()
  const { instanceId } = useParams<{ instanceId: string }>()

  return useCallback(() => {
    history.push(Pages.vectorSearchCreateIndex(instanceId))
  }, [history, instanceId])
}

export default useStartWizard
