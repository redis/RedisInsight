import React, { ComponentProps, isValidElement, ReactNode } from 'react'
import { Section, SectionProps } from '@redis-ui/components'

export type RiAccordionProps = Omit<ComponentProps<typeof Section>, 'label'> & {
  label: ReactNode
  actions?: ReactNode
  collapsible?: SectionProps['collapsible']
  actionButtonText?: SectionProps['actionButtonText']
  collapsedInfo?: SectionProps['collapsedInfo']
  content?: SectionProps['content']
  children?: SectionProps['content']
  onAction?: SectionProps['onAction']
}

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

type RiAccordionActionsProps = Pick<
  RiAccordionProps,
  'actionButtonText' | 'actions' | 'onAction'
>

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
    <Section.Header.CollapseIndicator />
  </Section.Header.Group>
)

export const RiAccordion = ({
  id,
  content,
  label,
  onAction,
  actionButtonText,
  collapsedInfo,
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
      collapsedInfo={collapsedInfo}
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
    <Section.Body
      content={children ?? content}
      data-testid={`ri-accordion-body-${id}`}
    />
  </Section.Compose>
)
