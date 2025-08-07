import styled from 'styled-components'
import { Text } from 'uiSrc/components/base/text'

export const PopoverContent = styled.div`
  padding: ${({ theme }) => theme.core?.space.space300};
`

export const Title = styled(Text)`
  margin-top: ${({ theme }) => theme.core?.space.space100};
  margin-bottom: ${({ theme }) => theme.core?.space.space100};
  font-weight: bold;
  color: ${({ theme }) => theme.color.danger500};
`

export const IconWrapper = styled.div`
  text-align: center;
`
export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`

export const IconAndTitleWrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.core?.space.space100};
  align-items: center;
`
