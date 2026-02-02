import React, { HTMLAttributes, useMemo } from 'react'
import cx from 'classnames'

import { CopyButton } from 'uiSrc/components/copy-button'
import { useInnerText } from 'uiSrc/components/base/utils/hooks/inner-text'
import * as S from './CodeBlock.styles'

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
    <S.Wrapper $isCopyable={isCopyable}>
      <S.Pre className={cx(className)} ref={innerTextRef} {...rest}>
        {children}
      </S.Pre>
      {isCopyable && (
        <S.CopyBtn>
          <CopyButton
            copy={innerText}
            withTooltip={false}
            data-testid="copy-code"
            aria-label="copy code"
          />
        </S.CopyBtn>
      )}
    </S.Wrapper>
  )
}

export default CodeBlock
