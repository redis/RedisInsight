import styled from 'styled-components'

import { ColorText } from './ColorText'
import { theme } from '@redis-ui/styles'

export const lineHeightSizes = ['xs', 's', 'm', 'l'] as const
export type LineHeightType = (typeof lineHeightSizes)[number]

export const paddingBlockSizes = ['none', 'xs', 's', 'm'] as const
export type PaddingBlockType = (typeof paddingBlockSizes)[number]

const multiLineEllipsisStyles = {
  lineHeight: {
    xs: theme.core.space.space100,
    s: theme.core.space.space150,
    m: theme.core.space.space200,
    l: theme.core.space.space250,
  },
  paddingBlock: {
    none: theme.core.space.space000,
    xs: theme.core.space.space010,
    s: theme.core.space.space025,
    m: theme.core.space.space050,
  },
}

const MultilineEllipsisText = styled(ColorText) <{
  lineCount?: number
  lineHeight?: LineHeightType
  paddingBlock?: PaddingBlockType
}>`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${({ lineCount = 5 }) => lineCount};
  line-height: ${({ lineHeight = 'l' }) =>
    multiLineEllipsisStyles.lineHeight[lineHeight]};
  text-overflow: ellipsis;
  overflow: hidden;
  padding-block: ${({ paddingBlock = 'none' }) =>
    multiLineEllipsisStyles.paddingBlock[paddingBlock]};
`

export default MultilineEllipsisText
