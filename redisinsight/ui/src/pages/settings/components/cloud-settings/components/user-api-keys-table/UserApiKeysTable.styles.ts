import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { Text } from 'uiSrc/components/base/text'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const NameField = styled(Row).attrs({
  align: 'center',
})`
  width: 100%;
`

export const InvalidIconAnchor = styled.span`
  flex-shrink: 0;
`

export const InvalidIcon = styled(RiIcon)`
  width: 14px;
  height: 14px;
  margin-right: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
  margin-bottom: 1px;
`

export const NoKeysMessage = styled.div`
  padding: ${({ theme }: { theme: Theme }) =>
    `${theme.core.space.space200} ${theme.core.space.space300}`};
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral200};
  border-radius: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
`

export const StarsIcon = styled(RiIcon)`
  width: 24px;
  height: 24px;
  margin-right: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
`

export const SmallText = styled(Text).attrs({
  size: 's',
  color: 'primary',
})``

export const Actions = styled(Row).attrs({
  align: 'center',
  justify: 'end',
})``

export const AutodiscoverBtn = styled(EmptyButton)`
  font-size: 13px;
  margin-right: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
`
