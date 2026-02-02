import React, { Ref, useEffect, useRef } from 'react'

import { ColorText } from 'uiSrc/components/base/text'
import { scrollIntoView } from 'uiSrc/utils'
import { AllIconsType, RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import * as S from './FieldMessage.styles'

type Colors =
  | 'default'
  | 'secondary'
  | 'accent'
  | 'warning'
  | 'danger'
  | 'subdued'
  | 'ghost'
export interface Props {
  children: React.ReactElement | string
  color?: Colors
  scrollViewOnAppear?: boolean
  icon?: AllIconsType
  testID?: string
}

const FieldMessage = ({
  children,
  color,
  testID,
  icon,
  scrollViewOnAppear,
}: Props) => {
  const divRef: Ref<HTMLDivElement> = useRef(null)

  useEffect(() => {
    // componentDidMount
    if (scrollViewOnAppear) {
      scrollIntoView(divRef?.current, {
        behavior: 'smooth',
        block: 'nearest',
        inline: 'end',
      })
    }
  }, [])

  return (
    <S.Container ref={divRef}>
      {icon && (
        <S.Icon>
          <RiIcon type={icon} color={color || 'danger'} />
        </S.Icon>
      )}
      <S.Message as={ColorText} data-testid={testID} color={color || 'danger'}>
        {children}
      </S.Message>
    </S.Container>
  )
}

export default FieldMessage
