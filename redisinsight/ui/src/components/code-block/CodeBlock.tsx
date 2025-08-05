import React, { HTMLAttributes, useMemo } from 'react'
import cx from 'classnames'

import { RiIconButton } from 'uiSrc/components/base/forms'
import { CopyIcon } from 'uiSrc/components/base/icons'
import { useInnerText } from 'uiSrc/components/base/utils/hooks/inner-text'
import styles from './styles.module.scss'

export interface Props extends HTMLAttributes<HTMLPreElement> {
  children: React.ReactNode
  className?: string
  isCopyable?: boolean
}

const CodeBlock = (props: Props) => {
  const { isCopyable, className, children, ...rest } = props
  const [innerTextRef, innerTextString] = useInnerText('')

  const innerText = useMemo(
    () => innerTextString?.replace(/[\r\n?]{2}|\n\n/g, '\n') || '',
    [innerTextString],
  )

  const handleCopyClick = () => {
    navigator?.clipboard?.writeText(innerText)
  }

  return (
    <div className={cx(styles.wrapper, { [styles.isCopyable]: isCopyable })}>
      <pre className={cx(styles.pre, className)} ref={innerTextRef} {...rest}>
        {children}
      </pre>
      {isCopyable && (
        <RiIconButton
          onClick={handleCopyClick}
          className={styles.copyBtn}
          icon={CopyIcon}
          data-testid="copy-code-btn"
          aria-label="copy code"
        />
      )}
    </div>
  )
}

export default CodeBlock
