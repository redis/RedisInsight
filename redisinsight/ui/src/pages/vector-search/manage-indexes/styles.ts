import styled from 'styled-components'
import { Text } from 'uiSrc/components/base/text'

export const PopoverContent = styled.div`
  padding: ${({ theme }) => theme.core?.space.space200};
`

export const Title = styled(Text)`
  margin-top: ${({ theme }) => theme.core?.space.space100};
  margin-bottom: ${({ theme }) => theme.core?.space.space100};
  font-weight: bold;
  color: ${({ theme }) => theme.semantic.color.text.danger500};
`

export const IconWrapper = styled.div`
  text-align: center;
`
export const ButtonWrapper = styled.div`
  margin-top: ${({ theme }) => theme.core?.space.space100};
  display: flex;
  justify-content: flex-end;
`

export const IconAndTitleWrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.core?.space.space100};
  align-items: center;
`
