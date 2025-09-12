import styled from 'styled-components'
import { Text } from 'uiSrc/components/base/text'
import DottedArrowIcon from 'uiSrc/assets/img/icons/DottedArrow.svg'
import DottedArrowDarkIcon from 'uiSrc/assets/img/icons/DottedArrowDark.svg'
import { FlexGroup } from 'uiSrc/components/base/layout/flex'

export const Step = styled(FlexGroup)`
  display: inline-flex !important;
`

export const StepBadge = styled(FlexGroup)`
  display: inline-flex !important;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  background-color: ${({ theme }) => theme.color.dusk150};
  color: ${({ theme }) => theme.color.dusk800};
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
`

export const StepLabel = styled(Text)<{ $isCompleted?: boolean }>`
  text-decoration: ${({ $isCompleted }) =>
    $isCompleted ? 'line-through' : 'none'};
`

export const DottedArrow = styled.img`
  width: 2.6rem;
  height: 0.8rem;
  content: url(${({ theme }) =>
    theme.name === 'dark' ? DottedArrowDarkIcon : DottedArrowIcon});
`
