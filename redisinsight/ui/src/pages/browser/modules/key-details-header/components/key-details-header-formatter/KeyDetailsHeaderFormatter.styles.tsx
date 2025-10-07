import styled from 'styled-components'
import { ComponentProps } from 'react'
import { ColorText } from 'uiSrc/components/base/text'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'

type KeyDetailsSelectProps = ComponentProps<typeof RiSelect> & {
  $fullWidth?: boolean
}

const KeyDetailsSelect = styled(RiSelect)<KeyDetailsSelectProps>`
  border: none !important;
  background-color: inherit !important;
  max-width: 100%;
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
  display: flex;
  align-items: center;
  height: 30px;
  border-radius: 4px;
  transition: transform 0.3s ease;
  overflow: hidden;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
  }

  [class*='TriggerContainer'] {
    height: 100%;
  }

  &:not(.fullWidth) {
    width: 56px;

    [class*='TriggerContainer'] {
      width: 56px;
    }
  }
`

export { Container, KeyDetailsSelect, OptionText, ControlsIcon }
