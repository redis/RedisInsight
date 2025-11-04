import React from 'react'
import { Meta, StoryObj } from '@storybook/react-vite'
import { PlaygroundPage } from './PlaygroundPage'
import { Theme } from './Theme'
import { Colors } from './Colors'
import { Gallery } from './Gallery'

export default {
  title: 'Playground',
  component: PlaygroundPage,
  tags: ['skip-test', '!autodocs', '!dev'],
} satisfies Meta<typeof PlaygroundPage>

export const ThemeStory: StoryObj = {
  render: () => <Theme />,
}

export const ColorsStory: StoryObj = {
  render: () => <Colors />,
}

export const GalleryStory: StoryObj = {
  render: () => <Gallery />,
}
