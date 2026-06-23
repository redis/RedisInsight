import { RefObject, useEffect, useRef, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import { EditDatabaseField } from 'uiSrc/slices/interfaces'
import { FOCUS_FIELD_QUERY_PARAM } from 'uiSrc/constants'

export interface UseEnvironmentPromotionResult {
  wrapperRef: RefObject<HTMLDivElement>
  isDropdownOpen: boolean
  onDropdownOpenChange: (open: boolean) => void
}

/**
 * When the edit form is deep-linked with `?focusField=environment`, scrolls the
 * Environment field into view and opens its dropdown. Applied once (guarded by
 * appliedRef), then strips the param so re-mounts don't reopen it.
 */
export const useEnvironmentPromotion = (): UseEnvironmentPromotionResult => {
  const { search } = useLocation()
  const history = useHistory()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const appliedRef = useRef(false)

  const isEnvironmentRequest =
    new URLSearchParams(search).get(FOCUS_FIELD_QUERY_PARAM) ===
    EditDatabaseField.Environment

  useEffect(() => {
    if (appliedRef.current || !isEnvironmentRequest) {
      return
    }

    appliedRef.current = true
    wrapperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setIsDropdownOpen(true)

    const params = new URLSearchParams(search)
    params.delete(FOCUS_FIELD_QUERY_PARAM)
    history.replace({ search: params.toString() })
  }, [isEnvironmentRequest, search, history])

  return {
    wrapperRef,
    isDropdownOpen,
    onDropdownOpenChange: setIsDropdownOpen,
  }
}
