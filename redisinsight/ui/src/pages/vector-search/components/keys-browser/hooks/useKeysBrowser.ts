import { useContext } from 'react'

import { KeysBrowserContextValue } from '../KeysBrowser.types'
import { KeysBrowserContext } from '../contexts/Context'

export const useKeysBrowser = (): KeysBrowserContextValue => {
  const ctx = useContext(KeysBrowserContext)
  if (!ctx) {
    throw new Error('useKeysBrowser must be used within keys-browser Provider')
  }
  return ctx
}
