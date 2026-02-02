import React, { useContext } from 'react'
import { truncateText } from 'uiSrc/utils'
import EnablementAreaContext from 'uiSrc/pages/workbench/contexts/enablementAreaContext'
import { Item as ListItem } from 'uiSrc/components/base/layout/list'
import { RiTooltip } from 'uiSrc/components'

import * as S from './InternalLink.styles'

export interface Props {
  testId: string
  label: string
  summary?: string
  children: React.ReactElement[] | string
  path?: string
  size?: 's' | 'xs' | 'm' | 'l'
  iconType?: string
  iconPosition?: 'left' | 'right'
  toolTip?: string
  style?: any
  sourcePath: string
  manifestPath?: string
}
const InternalLink = (props: Props) => {
  const {
    label,
    summary,
    testId,
    children,
    path = '',
    size = 's',
    iconType,
    iconPosition = 'left',
    toolTip,
    sourcePath,
    manifestPath,
    ...rest
  } = props
  const { openPage } = useContext(EnablementAreaContext)
  const handleOpenPage = () => {
    if (path) {
      openPage({ path: sourcePath, manifestPath, label })
    }
  }

  const content = (
    <RiTooltip content={toolTip}>
      <S.Content>
        <S.Title>{children || label}</S.Title>
        {!!summary && <S.Summary>{truncateText(summary, 140)}</S.Summary>}
      </S.Content>
    </RiTooltip>
  )
  return (
    <S.Link $iconRight={iconPosition === 'right'}>
      <ListItem
        data-testid={`internal-link-${testId}`}
        iconType={iconType}
        size={size}
        wrapText
        color="subdued"
        onClick={handleOpenPage}
        label={content}
        {...rest}
      />
    </S.Link>
  )
}

export default InternalLink
