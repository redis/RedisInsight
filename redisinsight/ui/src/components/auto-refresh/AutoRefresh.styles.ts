import styled from 'styled-components'
import { HTMLAttributes, PropsWithChildren } from 'react'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { RiTooltip } from 'uiSrc/components/base'
import { ColorText } from 'uiSrc/components/base/text'

export const Container = styled(Row)`
  line-height: 1;
`

export const AutoRefreshInterval = styled(ColorText)<
  HTMLAttributes<HTMLSpanElement> & {
    $disabled?: boolean
    $enableAutoRefresh?: boolean
  }
>`
  opacity: ${({ $disabled }) => ($disabled ? '0.5' : 'inherit')};
  color: ${({ theme, $enableAutoRefresh, $disabled }) =>
    $enableAutoRefresh && !$disabled
      ? theme.semantic.color.text.primary400
      : 'inherit'};
`

export const StyledTooltip = styled(RiTooltip)`
  max-width: 372px;
`

export const PopoverWrapper = styled(Col)`
  width: 240px;
  height: 120px;
  padding: ${({ theme }) =>
    `${theme.core.space.space350} ${theme.core.space.space225}`};
`

const INPUT_HEIGHT = '30px'
const LABEL_WIDTH = '80px'

export const InputContainer = styled(Row)`
  height: ${INPUT_HEIGHT};
  line-height: ${INPUT_HEIGHT};
`

export const PencilIcon = styled.span`
  opacity: 0;
  transition: opacity 150ms ease-in-out;
  display: inline-block;
  height: auto;
  & svg {
    margin: auto;
    display: block;
  }
`

export const RefreshRateText = styled(ColorText)`
  display: inline-flex;
  align-items: center;
  justify-content: start;
  width: ${LABEL_WIDTH};
  height: ${INPUT_HEIGHT};
  cursor: pointer;
  padding-left: ${({ theme }) => theme.core.space.space050};
  gap: ${({ theme }) => theme.core.space.space050};

  &:hover {
    border-color: ${({ theme }) => theme.semantic.color.border.neutral500};

    ${PencilIcon} {
      opacity: 1;
    }
  }
`

export const InputWrapper = styled.div<PropsWithChildren>`
  display: inline-block;
  width: ${LABEL_WIDTH};

  input {
    height: ${INPUT_HEIGHT};
    border-radius: 0;
  }
`
