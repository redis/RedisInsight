import { useSelector } from 'react-redux'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { appContextSelector } from 'uiSrc/slices/app/context'

export const useStateWithContext = <T>(value: T, initialValue: T) => {
  const { instanceId } = useParams<{ instanceId: string }>()
  const { contextInstanceId } = useSelector(appContextSelector)

  return useState<T>(instanceId === contextInstanceId ? value : initialValue)
}
