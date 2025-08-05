import React, { forwardRef } from 'react'

import {
  ImperativePanelGroupHandle,
  PanelGroup,
  PanelGroupProps,
} from 'react-resizable-panels'

export const ResizableContainer = forwardRef<
  ImperativePanelGroupHandle,
  PanelGroupProps
>((props, ref) => <PanelGroup ref={ref} {...props} />)
