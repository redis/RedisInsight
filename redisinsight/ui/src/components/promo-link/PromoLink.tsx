import React from 'react'
import { ColorText } from 'uiSrc/components/base/text'

import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import * as S from './PromoLink.styles'

export interface Props {
  title: string
  url: string
  description?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  testId?: string
  styles?: any
}

const PromoLink = (props: Props) => {
  const { title, description, url, onClick, testId, styles: linkStyles } = props

  return (
    <S.Link
      as="a"
      href={url}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      data-testid={testId}
      style={{ ...linkStyles }}
    >
      <S.CloudIcon>
        <RiIcon type="CloudIcon" size="m" />
      </S.CloudIcon>
      <S.Title>
        <ColorText color={linkStyles?.color}>{title}</ColorText>
      </S.Title>
      <S.Description>
        <ColorText color={linkStyles?.color}>{description}</ColorText>
      </S.Description>
    </S.Link>
  )
}

export default PromoLink
