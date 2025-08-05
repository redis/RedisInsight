import styled from 'styled-components'
import { ComponentProps } from 'react'
import { ColorText } from 'uiSrc/components/base/text'
import { RiSelect } from 'uiSrc/components/base/forms'
import { RiIcon } from 'uiSrc/components/base/icons'

type KeyDetailsSelectProps = ComponentProps<typeof RiSelect> & {
  $fullWidth?: boolean
}

const KeyDetailsSelect = styled(RiSelect)<KeyDetailsSelectProps>`
  border: none !important;
  background-color: inherit !important;
  color: var(--iconsDefaultColor) !important;
  max-width: ${({ $fullWidth }) => ($fullWidth ? '100%' : '92px')};
  padding-right: 18px;
  padding-left: 0;
  height: 28px;

  & ~ div {
    right: 7px;
    top: 4px;

    svg {
      width: 10px !important;
      height: 10px !important;
    }
  }
`

const OptionText = styled(ColorText)`
  padding-left: 6px;
  padding-right: 4px;
  font-size: 13px;
  line-height: 30px;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ControlsIcon = styled(RiIcon)`
  position: relative;
  margin-left: 3px;
  margin-top: 2px;
  width: 20px !important;
  height: 20px !important;

  :global(.insightsOpen) {
    @media only screen and (max-width: 1440px) {
      width: 18px !important;
      height: 18px !important;
    }
  }
`

const Container = styled.div<{
  className?: string
  children: React.ReactNode
}>`
  margin-right: 12px;
  height: 30px;
  border-radius: 4px;
  transition: transform 0.3s ease;
  width: 92px;
  overflow: hidden;

  &:hover {
    transform: translateY(-1px);
    background-color: var(--tableRowSelectedColor);
  }

  &:active {
    transform: translateY(1px);
  }

  [class*='TriggerContainer'] {
    height: 100%;
  }

  .selectWrapper {
    width: 142px;
    position: absolute;

    [class*='TriggerContainer'] {
      width: 92px;
    }
  }

  &:not(.fullWidth) {
    width: 56px;

    [class*='TriggerContainer'] {
      width: 56px;
    }
  }
`

export { Container, KeyDetailsSelect, OptionText, ControlsIcon }
