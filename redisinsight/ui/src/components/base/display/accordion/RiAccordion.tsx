import React, { isValidElement } from 'react'
import { Section } from '@redis-ui/components'
import { RiAccordionActionsProps, RiAccordionProps } from './RiAccordion.types'

const RiAccordionLabel = ({ label }: Pick<RiAccordionProps, 'label'>) => {
  if (!label) {
    return null
  }
  if (typeof label === 'string') {
    return <Section.Header.Label label={label} />
  }
  // Ensure we always return a valid JSX element by wrapping non-JSX values
  return isValidElement(label) ? label : <>{label}</>
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
    <Section.Header.CollapseButton />
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
  ...rest
}: RiAccordionProps) => (
  <Section.Compose
    id={`ri-accordion-${id}`}
    data-testid={`ri-accordion-${id}`}
    {...rest}
    collapsible={collapsible}
  >
    <Section.Header.Compose
      id={`ri-accordion-${id}`}
      data-testid={`ri-accordion-header-${id}`}
    >
      <RiAccordionLabel
        label={label}
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
