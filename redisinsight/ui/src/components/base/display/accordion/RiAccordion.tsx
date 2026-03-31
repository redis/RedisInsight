import React, { isValidElement, useCallback, useState } from 'react'
import { Section } from '@redis-ui/components'
import { RiAccordionActionsProps, RiAccordionProps } from './RiAccordion.types'
import { clickableLabelStyle } from './RiAccordion.styles'

interface RiAccordionLabelProps extends Pick<RiAccordionProps, 'label'> {
  onToggle?: () => void
}

// TODO: Remove once @redis-ui/components Section.Header.Label supports JSX labels natively.
const RiAccordionCustomLabel = ({
  children,
  onToggle,
}: {
  children: React.ReactNode
  onToggle?: () => void
}) => {
  const handleClick = useCallback(() => {
    onToggle?.()
  }, [onToggle])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onToggle?.()
      }
    },
    [onToggle],
  )

  return (
    <div
      role="button"
      tabIndex={0}
      style={clickableLabelStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  )
}

const RiAccordionLabel = ({ label, onToggle }: RiAccordionLabelProps) => {
  if (!label) {
    return null
  }
  if (typeof label === 'string') {
    return <Section.Header.Label label={label} />
  }
  return (
    <RiAccordionCustomLabel onToggle={onToggle}>
      {isValidElement(label) ? label : <>{label}</>}
    </RiAccordionCustomLabel>
  )
}

const RiAccordionActions = ({
  actionButtonText,
  actions,
  onAction,
}: RiAccordionActionsProps) => (
  <Section.Header.Group>
    <Section.Header.ActionButton onClick={onAction}>
      {actionButtonText}
    </Section.Header.ActionButton>
    {actions}
    <Section.Header.CollapseButton style={{ flexShrink: 0 }} />
  </Section.Header.Group>
)

export const RiAccordion = ({
  id,
  content,
  label,
  onAction,
  actionButtonText,
  children,
  actions,
  collapsible = true,
  defaultOpen = true,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  ...rest
}: RiAccordionProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)

  const isControlled = openProp !== undefined
  const isOpen = isControlled ? openProp : internalOpen

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!isControlled) {
        setInternalOpen(open)
      }
      onOpenChangeProp?.(open)
    },
    [isControlled, onOpenChangeProp],
  )

  const handleToggle = useCallback(() => {
    handleOpenChange(!isOpen)
  }, [isOpen, handleOpenChange])

  return (
    <Section.Compose
      id={`ri-accordion-${id}`}
      data-testid={`ri-accordion-${id}`}
      {...rest}
      open={isOpen}
      onOpenChange={handleOpenChange}
      collapsible={collapsible}
    >
      <Section.Header.Compose
        id={`ri-accordion-${id}`}
        data-testid={`ri-accordion-header-${id}`}
      >
        <RiAccordionLabel
          label={label}
          onToggle={collapsible ? handleToggle : undefined}
          data-testid={`ri-accordion-label-${id}`}
        />
        <RiAccordionActions
          actions={actions}
          onAction={onAction}
          actionButtonText={actionButtonText}
          data-testid={`ri-accordion-actions-${id}`}
        />
      </Section.Header.Compose>
      <Section.Body data-testid={`ri-accordion-body-${id}`}>
        {children ?? content}
      </Section.Body>
    </Section.Compose>
  )
}
