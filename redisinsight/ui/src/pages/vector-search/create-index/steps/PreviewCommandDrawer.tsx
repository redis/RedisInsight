import React from 'react'

import { CodeBlock } from 'uiSrc/components'
import {
  Drawer,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from 'uiSrc/components/base/layout/drawer'

import { CodeBlocKWrapper } from './styles'

type PreviewCommandDrawerProps = {
  commandContent: React.ReactNode
  isOpen: boolean
  onOpenChange: (value: boolean) => void
}

export const PreviewCommandDrawer = ({
  commandContent,
  isOpen,
  onOpenChange,
}: PreviewCommandDrawerProps) => (
  <Drawer open={isOpen} onOpenChange={onOpenChange}>
    <DrawerHeader title="Command preview" />
    <DrawerBody>
      <CodeBlocKWrapper>
        <CodeBlock isCopyable>{commandContent}</CodeBlock>
      </CodeBlocKWrapper>
    </DrawerBody>
    <DrawerFooter
      primaryButtonText="Close"
      onPrimaryButtonClick={() => onOpenChange(false)}
    />
  </Drawer>
)
