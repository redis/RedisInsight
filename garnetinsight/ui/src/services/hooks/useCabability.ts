import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setCapability } from 'uiSrc/slices/app/context'

export const useCapability = (source = '') => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setCapability({ source, tutorialPopoverShown: false }))
  }, [source])
}
