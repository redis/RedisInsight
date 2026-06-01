import { useEffect } from 'react'
import { useAppDispatch } from 'uiSrc/slices/hooks'
import { setCapability } from 'uiSrc/slices/app/context'

export const useCapability = (source = '') => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setCapability({ source, tutorialPopoverShown: false }))
  }, [source])
}
