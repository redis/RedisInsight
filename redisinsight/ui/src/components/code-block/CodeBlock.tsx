import React, { HTMLAttributes, useMemo } from 'react'
import cx from 'classnames'

import { CopyButton } from 'uiSrc/components/copy-button'
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

  return (
    <div className={cx(styles.wrapper, { [styles.isCopyable]: isCopyable })}>
      <pre className={cx(styles.pre, className)} ref={innerTextRef} {...rest}>
        {children}
      </pre>
      {isCopyable && (
        <span className={styles.copyBtn}>
          <CopyButton
            copy={innerText}
            withTooltip={false}
            data-testid="copy-code"
            aria-label="copy code"
          />
        </span>
      )}
    </div>
  )
}

export default CodeBlock
