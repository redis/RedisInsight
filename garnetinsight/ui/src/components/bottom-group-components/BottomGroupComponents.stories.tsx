import type { Meta, StoryObj } from '@storybook/react-vite'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import BottomGroupComponents from './BottomGroupComponents'
import {
  openCliHelper,
  openCli,
  resetCliHelperSettings,
} from 'uiSrc/slices/cli/cli-settings'
import { showMonitor } from 'uiSrc/slices/cli/monitor'

import { StyledContainer } from '../../../../../.storybook/helpers/styles'

const meta = {
  component: BottomGroupComponents,
} satisfies Meta<typeof BottomGroupComponents>

export default meta

type Story = StoryObj<typeof meta>

export const CLI: Story = {
  decorators: [
    (Story) => {
      const dispatch = useDispatch()

      useEffect(() => {
        dispatch(resetCliHelperSettings())
        dispatch(openCli())
      }, [dispatch])

      return (
        <StyledContainer>
          <Story />
        </StyledContainer>
      )
    },
  ],
}
export const CLIHelper: Story = {
  decorators: [
    (Story) => {
      const dispatch = useDispatch()

      useEffect(() => {
        dispatch(resetCliHelperSettings())
        dispatch(openCliHelper())
      }, [dispatch])

      return (
        <StyledContainer>
          <Story />
        </StyledContainer>
      )
    },
  ],
}

export const Monitor: Story = {
  decorators: [
    (Story) => {
      const dispatch = useDispatch()

      useEffect(() => {
        dispatch(resetCliHelperSettings())
        dispatch(showMonitor())
      }, [dispatch])

      return (
        <StyledContainer>
          <Story />
        </StyledContainer>
      )
    },
  ],
}
