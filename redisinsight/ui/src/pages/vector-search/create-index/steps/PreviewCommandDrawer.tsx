import React from 'react'

import { CodeBlock } from 'uiSrc/components'
import {
  RiDrawer,
  RiDrawerBody,
  RiDrawerFooter,
  RiDrawerHeader,
} from 'uiBase/layout'

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
  <RiDrawer open={isOpen} onOpenChange={onOpenChange}>
    <RiDrawerHeader title="Command preview" />
    <RiDrawerBody>
      <CodeBlocKWrapper>
        <CodeBlock isCopyable>{commandContent}</CodeBlock>
      </CodeBlocKWrapper>
    </RiDrawerBody>
    <RiDrawerFooter
      primaryButtonText="Close"
      onPrimaryButtonClick={() => onOpenChange(false)}
    />
  </RiDrawer>
)
