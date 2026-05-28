import React from 'react'

import { Banner } from 'uiSrc/components/base/display/banner'

export type MessageVariant = React.ComponentProps<
  typeof Banner.Compose
>['variant']

export interface MessageProps {
  title?: string
  children: React.ReactNode
  variant?: MessageVariant
}
