import React, { useEffect, useState } from 'react'

import { CopyButton } from 'uiSrc/components/copy-button'

import * as S from './HoverCopyButton.styles'

export interface HoverCopyButtonProps {
  copy: string
  label: string
  testId: string
}

/** Matches the shared CopyButton's Copied-badge lifetime */
const COPIED_VISIBLE_MS = 3_000

/**
 * Copy control revealed on hover/focus of the enclosing id element. Kept
 * visible while the Copied badge shows - the shared CopyButton unmounts
 * its button on activation, which drops :focus-within.
 */
const HoverCopyButton = ({ copy, label, testId }: HoverCopyButtonProps) => {
  const [isConfirming, setIsConfirming] = useState(false)

  useEffect(() => {
    if (!isConfirming) return undefined
    const timer = setTimeout(() => setIsConfirming(false), COPIED_VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [isConfirming])

  return (
    <S.CopyOnHover $visible={isConfirming}>
      <CopyButton
        copy={copy}
        aria-label={label}
        data-testid={testId}
        onCopy={() => setIsConfirming(true)}
      />
    </S.CopyOnHover>
  )
}

export default HoverCopyButton
