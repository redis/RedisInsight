import React from 'react'

export type FeaturesHighlightingType =
  | 'plain'
  | 'tooltip'
  | 'popover'
  | 'dialog'
  | 'tooltip-badge'

interface BuildHighlightingFeature {
  type: FeaturesHighlightingType
  title?: string | React.ReactElement
  content?: string | React.ReactElement
  page?: string
  asPageFeature?: boolean
}

export const BUILD_FEATURES: Record<string, BuildHighlightingFeature> = {
  aiChatbot: {
    type: 'dialog',
  },
} as const
