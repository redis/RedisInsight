import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { RiPopover } from 'uiSrc/components/base'
import { Button, IconButton } from 'uiSrc/components/base/forms/buttons'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import BrowserStorageItem from 'uiSrc/constants/storage'
import { localStorageService } from 'uiSrc/services'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'

import * as S from './SelectKeyOnboardingPopover.styles'

export interface SelectKeyOnboardingPopoverProps {
  children: React.ReactNode
}

interface PopoverContentProps {
  children: React.ReactNode
  onDismiss: () => void
}

const PopoverContent = ({ children, onDismiss }: PopoverContentProps) => {
  const selectedKey = useSelector(selectedKeyDataSelector)

  useEffect(() => {
    if (selectedKey?.name) {
      onDismiss()
    }
  }, [selectedKey?.name, onDismiss])

  return (
    <RiPopover
      isOpen
      anchorPosition="rightCenter"
      data-testid="select-key-onboarding-popover"
      trigger={children}
    >
      <S.Content gap="s" data-testid="select-key-onboarding-content">
        <Row justify="end">
          <IconButton
            icon={CancelSlimIcon}
            onClick={onDismiss}
            size="S"
            aria-label="close-onboarding"
            data-testid="select-key-onboarding-close"
          />
        </Row>

        <Text size="L" variant="semiBold" color="primary">
          Select a key to get started
        </Text>
        <Text size="m" color="secondary">
          We&apos;ll use the selected key to generate a suggested indexing
          schema. Redis will index all keys with the same prefix, not just this
          single key.
          {'\n\n'}
          Indexing available for Hash and JSON data structures.
        </Text>

        <Row justify="end">
          <Button
            size="small"
            onClick={onDismiss}
            data-testid="select-key-onboarding-dismiss"
          >
            Got it
          </Button>
        </Row>
      </S.Content>
    </RiPopover>
  )
}

export const SelectKeyOnboardingPopover = ({
  children,
}: SelectKeyOnboardingPopoverProps) => {
  const [isOpen, setIsOpen] = useState(
    () =>
      localStorageService.get(
        BrowserStorageItem.vectorSearchSelectKeyOnboarding,
      ) !== true,
  )

  const handleDismiss = useCallback(() => {
    localStorageService.set(
      BrowserStorageItem.vectorSearchSelectKeyOnboarding,
      true,
    )
    setIsOpen(false)
  }, [])

  if (!isOpen) {
    return <>{children}</>
  }

  return <PopoverContent onDismiss={handleDismiss}>{children}</PopoverContent>
}
